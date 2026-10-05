import {
  CreatePropertyInput,
  IPropertyService,
  PropertyImageRow,
  PropertyQueryFilters,
  ServiceError,
  UpdatePropertyInput,
  UpdatePropertyVerificationInput
} from '../types/api';
import {
  AdvertiserType,
  ListingStatus,
  PersistedPropertyImage,
  Property,
  User
} from '../types/property';
import { mockStorage } from '../mocks/mockStorage';
import { slugify } from '../utils/formatters';
import { generateUuid, isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  isBlobUrl,
  isValidPersistedImageUrl,
  mapRowToPersistedImage,
  storageService
} from './storageService';

function mapUserRoleToAdvertiserType(role?: User['role']): AdvertiserType {
  if (role === 'agent') return 'Agent';
  if (role === 'developer') return 'Developer';
  return 'Owner';
}

function normalizePropertyImages(property: Property): Property {
  const safeImages = (property.images || []).filter((url) =>
    isValidPersistedImageUrl(url)
  );

  if (property.propertyImages && property.propertyImages.length > 0) {
    const ordered = [...property.propertyImages]
      .filter((img) => isValidPersistedImageUrl(img.url))
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img, idx) => ({
        ...img,
        displayOrder: idx
      }));

    return {
      ...property,
      images: ordered.map((img) => img.url),
      propertyImages: ordered
    };
  }

  const synthesized: PersistedPropertyImage[] = safeImages.map((url, idx) => ({
    id: `${property.id}-img-${idx}`,
    propertyId: property.id,
    url,
    displayOrder: idx
  }));

  return {
    ...property,
    images: safeImages,
    propertyImages: synthesized
  };
}

class PropertyService implements IPropertyService {
  public validatePropertyImageFile(file: File): void {
    storageService.validatePropertyImageFile(file);
  }

  /**
   * Hydrates persisted `property_images` records from Supabase PostgreSQL when configured,
   * making the `property_images` table the source of truth for persisted property photos.
   */
  private async hydrateDatabaseImages(properties: Property[]): Promise<Property[]> {
    const normalized = properties.map(normalizePropertyImages);
    if (!isSupabaseConfigured() || !supabase || normalized.length === 0) {
      return normalized;
    }

    try {
      const propertyIds = normalized.map((p) => p.id);
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .in('property_id', propertyIds);

      if (error || !data || data.length === 0) {
        return normalized;
      }

      const groupedByProperty = new Map<string, PersistedPropertyImage[]>();
      for (const rawRow of data as PropertyImageRow[]) {
        const mapped = mapRowToPersistedImage(rawRow, (p) =>
          storageService.getPropertyImageUrl(p)
        );
        if (!isValidPersistedImageUrl(mapped.url)) continue;
        const list = groupedByProperty.get(mapped.propertyId) || [];
        list.push(mapped);
        groupedByProperty.set(mapped.propertyId, list);
      }

      if (groupedByProperty.size === 0) {
        return normalized;
      }

      return normalized.map((prop) => {
        const dbImages = groupedByProperty.get(prop.id);
        if (!dbImages || dbImages.length === 0) {
          return prop;
        }
        const ordered = [...dbImages]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((img, idx) => ({
            ...img,
            displayOrder: idx
          }));

        return {
          ...prop,
          images: ordered.map((img) => img.url),
          propertyImages: ordered
        };
      });
    } catch {
      return normalized;
    }
  }

  public async getProperties(filters?: PropertyQueryFilters): Promise<Property[]> {
    const all = await this.hydrateDatabaseImages(mockStorage.getProperties());
    if (!filters) return all;

    return all.filter((item) => {
      if (!filters.includeUnpublished && item.listingStatus === 'draft') {
        return false;
      }
      if (filters.advertiserId && item.advertiser?.id !== filters.advertiserId) {
        return false;
      }
      if (
        filters.transaction &&
        filters.transaction !== 'all' &&
        item.transaction !== filters.transaction
      ) {
        return false;
      }
      if (
        filters.propertyType &&
        filters.propertyType !== 'all' &&
        item.propertyType !== filters.propertyType
      ) {
        return false;
      }
      if (
        filters.district &&
        filters.district !== 'All Districts' &&
        filters.district !== 'All Locations'
      ) {
        const queryDist = filters.district.toLowerCase();
        const matchesDistrict =
          item.district.toLowerCase() === queryDist ||
          item.district.toLowerCase().includes(queryDist);
        if (!matchesDistrict) return false;
      }
      if (
        filters.location &&
        filters.location !== 'All Locations' &&
        filters.location.trim() !== ''
      ) {
        const queryLoc = filters.location.toLowerCase().trim();
        const matchesLoc =
          item.location.toLowerCase().includes(queryLoc) ||
          item.district.toLowerCase().includes(queryLoc) ||
          item.address.toLowerCase().includes(queryLoc);
        if (!matchesLoc) return false;
      }
      if (
        typeof filters.minPrice === 'number' &&
        filters.minPrice > 0 &&
        item.price < filters.minPrice
      ) {
        return false;
      }
      if (
        typeof filters.maxPrice === 'number' &&
        filters.maxPrice < 3000000000 &&
        item.price > filters.maxPrice
      ) {
        return false;
      }
      if (
        filters.verification === 'verified_only' &&
        item.verificationStatus !== 'verified'
      ) {
        return false;
      }
      return true;
    });
  }

  public async getPropertyById(id: string): Promise<Property | null> {
    if (!id) return null;
    const all = mockStorage.getProperties();
    const found = all.find((p) => p.id === id);
    if (!found) return null;
    const [hydrated] = await this.hydrateDatabaseImages([found]);
    return hydrated;
  }

  public async getPropertyBySlug(slug: string): Promise<Property | null> {
    if (!slug) return null;
    const all = mockStorage.getProperties();
    const found = all.find((p) => p.slug === slug || p.id === slug);
    if (!found) return null;
    const [hydrated] = await this.hydrateDatabaseImages([found]);
    return hydrated;
  }

  /**
   * Creates a new property listing.
   *
   * Workflow Security & Storage Rules:
   * - Generates a proper UUID for the new property (`id`).
   * - Rejects any browser-local `blob:` URLs from being saved as permanent images.
   * - Normal advertisers can save as 'draft' or submit as 'pending' (never self-publish or self-verify).
   */
  public async createProperty(
    input: CreatePropertyInput,
    currentUser?: User | null
  ): Promise<Property> {
    const title = (input.title || '').trim();
    if (!title) {
      throw new ServiceError('Property title is required.', 'VALIDATION_ERROR', 400, {
        title: 'Please provide a descriptive listing title'
      });
    }

    const numericPrice = Number(input.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      throw new ServiceError(
        'A valid positive property price is required.',
        'VALIDATION_ERROR',
        400,
        { price: 'Price must be greater than zero' }
      );
    }

    const location = (input.location || '').trim();
    const district = (input.district || '').trim();
    if (!location || !district) {
      throw new ServiceError(
        'District and neighborhood/location are required.',
        'VALIDATION_ERROR',
        400,
        { location: 'Location and district are required' }
      );
    }

    const lat = Number(input.coordinates?.lat ?? 0.3476);
    const lng = Number(input.coordinates?.lng ?? 32.5825);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -2 ||
      lat > 5 ||
      lng < 29 ||
      lng > 36
    ) {
      throw new ServiceError(
        'Please provide valid Ugandan GPS coordinates (Latitude between -2° and 5°, Longitude between 29° and 36°).',
        'VALIDATION_ERROR',
        400,
        { coordinates: 'Coordinates out of Ugandan bounds' }
      );
    }

    // Never allow blob: URLs to be saved as permanent property images
    const rawUrls = input.images || [];
    if (rawUrls.some((u) => isBlobUrl(u))) {
      throw new ServiceError(
        'Browser-local blob preview URLs cannot be saved as permanent property images. Upload files via storageService after creating the property.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (input.propertyImages && input.propertyImages.some((img) => isBlobUrl(img.url))) {
      throw new ServiceError(
        'Browser-local blob preview URLs cannot be saved in propertyImages.',
        'VALIDATION_ERROR',
        400
      );
    }

    const propertyId = (input.id || '').trim() || generateUuid();
    const requestedStatus: ListingStatus =
      input.listingStatus === 'draft' ? 'draft' : 'pending';

    const uniqueSuffix = propertyId.slice(0, 6);
    const slug = `${slugify(title)}-${uniqueSuffix}`;

    const sanitizedUrls = rawUrls
      .map((url) => url.trim())
      .filter((url) => isValidPersistedImageUrl(url));

    const initialPropertyImages: PersistedPropertyImage[] =
      input.propertyImages && input.propertyImages.length > 0
        ? input.propertyImages
            .filter((img) => isValidPersistedImageUrl(img.url))
            .map((img, idx) => ({
              ...img,
              id: img.id || generateUuid(),
              propertyId,
              displayOrder: idx
            }))
        : sanitizedUrls.map((url, idx) => ({
            id: generateUuid(),
            propertyId,
            url,
            displayOrder: idx,
            altText: `${title} - Photo ${idx + 1}`
          }));

    const persistedRecords = await storageService.savePropertyImageRecords(
      propertyId,
      initialPropertyImages
    );

    const advertiserPhone = (
      input.advertiser?.phone ||
      currentUser?.phone ||
      '+256 700 000 000'
    ).trim();

    const newProperty: Property = {
      id: propertyId,
      slug,
      title,
      transaction: input.transaction || 'buy',
      propertyType: input.propertyType || 'House',
      price: numericPrice,
      currency: input.currency || 'UGX',
      pricePeriod:
        input.pricePeriod || (input.transaction === 'rent' ? 'month' : 'total'),
      location,
      district,
      address: (input.address || '').trim() || `${location}, ${district}`,
      bedrooms: Math.max(0, Number(input.bedrooms) || 0),
      bathrooms: Math.max(0, Number(input.bathrooms) || 0),
      parking: Math.max(0, Number(input.parking) || 0),
      landSizeDecimals:
        input.landSizeDecimals !== undefined && Number(input.landSizeDecimals) > 0
          ? Number(input.landSizeDecimals)
          : undefined,
      buildingSizeSqm:
        input.buildingSizeSqm !== undefined && Number(input.buildingSizeSqm) > 0
          ? Number(input.buildingSizeSqm)
          : undefined,
      tenure: input.tenure || 'Mailo',
      furnished: Boolean(input.furnished),
      availability: 'Available',
      verificationStatus: 'pending',
      listingStatus: requestedStatus,
      description:
        (input.description || '').trim() ||
        `Property listing located in ${location}, ${district}.`,
      features: Array.isArray(input.features) ? input.features : [],
      images: persistedRecords.map((img) => img.url),
      propertyImages: persistedRecords,
      floorPlanUrl: input.floorPlanUrl?.trim() || undefined,
      videoUrl: input.videoUrl?.trim() || undefined,
      advertiser: {
        id: input.advertiser?.id || currentUser?.id || `adv-${uniqueSuffix}`,
        name: (
          input.advertiser?.name ||
          currentUser?.name ||
          'Property Representative'
        ).trim(),
        type: input.advertiser?.type || mapUserRoleToAdvertiserType(currentUser?.role),
        phone: advertiserPhone,
        whatsapp: (input.advertiser?.whatsapp || advertiserPhone).replace(/\s+/g, ''),
        email: (
          input.advertiser?.email ||
          currentUser?.email ||
          'listings@realityestates.ug'
        ).trim(),
        agencyName:
          input.advertiser?.agencyName?.trim() || currentUser?.company || undefined,
        verified: Boolean(currentUser?.verifiedIdentity),
        responseRate: input.advertiser?.responseRate || 'New listing'
      },
      verificationDetails: {
        advertiserVerified: false,
        locationConfirmed: false,
        priceConfirmed: false,
        availabilityConfirmed: false,
        notes:
          requestedStatus === 'draft'
            ? 'Saved as draft. Submit for inspection when ready.'
            : 'Submitted for Pearl Prime verification inspection and publication review.'
      },
      coordinates: {
        lat,
        lng
      },
      featured: false,
      dateAdded: new Date().toISOString().split('T')[0],
      neighborhoodHighlights: input.neighborhoodHighlights
    };

    const existing = mockStorage.getProperties();
    const updated = [newProperty, ...existing];
    mockStorage.setProperties(updated);

    return newProperty;
  }

  public async updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
    const existing = mockStorage.getProperties();
    const index = existing.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new ServiceError(`Property with ID "${id}" not found.`, 'NOT_FOUND', 404);
    }

    if (input.images && input.images.some((u) => isBlobUrl(u))) {
      throw new ServiceError(
        'Cannot persist browser-local blob URLs in property images.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (input.propertyImages && input.propertyImages.some((img) => isBlobUrl(img.url))) {
      throw new ServiceError(
        'Cannot persist browser-local blob URLs in propertyImages.',
        'VALIDATION_ERROR',
        400
      );
    }

    const current = normalizePropertyImages(existing[index]);

    let nextPropertyImages = current.propertyImages || [];
    if (input.propertyImages) {
      nextPropertyImages = input.propertyImages
        .filter((img) => isValidPersistedImageUrl(img.url))
        .map((img, idx) => ({
          ...img,
          propertyId: id,
          displayOrder: idx
        }));
    } else if (input.images) {
      const cleanUrls = input.images.filter((url) => isValidPersistedImageUrl(url));
      nextPropertyImages = cleanUrls.map((url, idx) => {
        const existingMatch = (current.propertyImages || []).find((p) => p.url === url);
        return existingMatch
          ? { ...existingMatch, displayOrder: idx }
          : {
              id: generateUuid(),
              propertyId: id,
              url,
              displayOrder: idx
            };
      });
    }

    const updatedProperty: Property = {
      ...current,
      title: input.title !== undefined ? input.title.trim() : current.title,
      transaction: input.transaction ?? current.transaction,
      propertyType: input.propertyType ?? current.propertyType,
      price: input.price !== undefined ? Number(input.price) : current.price,
      currency: input.currency ?? current.currency,
      pricePeriod: input.pricePeriod ?? current.pricePeriod,
      location: input.location !== undefined ? input.location.trim() : current.location,
      district: input.district !== undefined ? input.district.trim() : current.district,
      address: input.address !== undefined ? input.address.trim() : current.address,
      bedrooms:
        input.bedrooms !== undefined
          ? Math.max(0, Number(input.bedrooms))
          : current.bedrooms,
      bathrooms:
        input.bathrooms !== undefined
          ? Math.max(0, Number(input.bathrooms))
          : current.bathrooms,
      parking:
        input.parking !== undefined
          ? Math.max(0, Number(input.parking))
          : current.parking,
      landSizeDecimals:
        input.landSizeDecimals !== undefined
          ? input.landSizeDecimals
          : current.landSizeDecimals,
      buildingSizeSqm:
        input.buildingSizeSqm !== undefined
          ? input.buildingSizeSqm
          : current.buildingSizeSqm,
      tenure: input.tenure ?? current.tenure,
      furnished: input.furnished !== undefined ? input.furnished : current.furnished,
      availability: input.availability ?? current.availability,
      description:
        input.description !== undefined ? input.description.trim() : current.description,
      features: input.features ?? current.features,
      images: nextPropertyImages.map((img) => img.url),
      propertyImages: nextPropertyImages,
      coordinates: input.coordinates ?? current.coordinates,
      advertiser: input.advertiser
        ? {
            ...current.advertiser,
            ...input.advertiser
          }
        : current.advertiser,
      listingStatus: input.listingStatus ?? current.listingStatus
    };

    const nextList = [...existing];
    nextList[index] = updatedProperty;
    mockStorage.setProperties(nextList);

    return updatedProperty;
  }

  /**
   * Uploads image files for an existing property via `storageService`, creates
   * `property_images` records, and appends the persisted images to the property in order.
   */
  public async uploadPropertyImages(
    propertyId: string,
    files: File[],
    startOrder?: number,
    onFileProgress?: (fileIndex: number, progressPercent: number) => void
  ): Promise<PersistedPropertyImage[]> {
    if (!propertyId) {
      throw new ServiceError(
        'Property must be saved before uploading images.',
        'VALIDATION_ERROR',
        400
      );
    }

    const existing = mockStorage.getProperties();
    const index = existing.findIndex((p) => p.id === propertyId);
    if (index === -1) {
      throw new ServiceError(
        `Property with ID "${propertyId}" not found.`,
        'NOT_FOUND',
        404
      );
    }

    const current = normalizePropertyImages(existing[index]);
    const currentImages = current.propertyImages || [];
    const baseOrder = startOrder !== undefined ? startOrder : currentImages.length;

    const uploadedRecords = await storageService.uploadPropertyImages(
      files,
      propertyId,
      baseOrder,
      onFileProgress
    );

    const mergedImages = [...currentImages, ...uploadedRecords]
      .filter((img) => isValidPersistedImageUrl(img.url))
      .map((img, idx) => ({
        ...img,
        displayOrder: idx
      }));

    const updatedProperty: Property = {
      ...current,
      images: mergedImages.map((img) => img.url),
      propertyImages: mergedImages
    };

    const nextList = [...existing];
    nextList[index] = updatedProperty;
    mockStorage.setProperties(nextList);

    return uploadedRecords;
  }

  /**
   * Deletes a persisted property image from Supabase Storage + `property_images`
   * and updates the property's persisted image ordering.
   */
  public async removePropertyImage(
    propertyId: string,
    image: Pick<PersistedPropertyImage, 'id' | 'storagePath' | 'url'>
  ): Promise<Property> {
    const existing = mockStorage.getProperties();
    const index = existing.findIndex((p) => p.id === propertyId);
    if (index === -1) {
      throw new ServiceError(
        `Property with ID "${propertyId}" not found.`,
        'NOT_FOUND',
        404
      );
    }

    await storageService.deletePropertyImage(
      image.storagePath || '',
      image.id,
      propertyId
    );

    const current = normalizePropertyImages(existing[index]);
    const remaining = (current.propertyImages || [])
      .filter((item) => item.id !== image.id && item.url !== image.url)
      .map((item, idx) => ({
        ...item,
        displayOrder: idx
      }));

    if (isSupabaseConfigured() && remaining.length > 0) {
      await storageService.reorderPropertyImages(
        propertyId,
        remaining.map((img) => img.id)
      );
    }

    const updatedProperty: Property = {
      ...current,
      images: remaining.map((img) => img.url),
      propertyImages: remaining
    };

    const nextList = [...existing];
    nextList[index] = updatedProperty;
    mockStorage.setProperties(nextList);

    return updatedProperty;
  }

  /**
   * Reorders a property's persisted images and updates `display_order` in `property_images`.
   */
  public async reorderPropertyImages(
    propertyId: string,
    orderedImages: PersistedPropertyImage[]
  ): Promise<Property> {
    const existing = mockStorage.getProperties();
    const index = existing.findIndex((p) => p.id === propertyId);
    if (index === -1) {
      throw new ServiceError(
        `Property with ID "${propertyId}" not found.`,
        'NOT_FOUND',
        404
      );
    }

    const normalized = orderedImages
      .filter((img) => isValidPersistedImageUrl(img.url))
      .map((img, idx) => ({
        ...img,
        propertyId,
        displayOrder: idx
      }));

    await storageService.reorderPropertyImages(
      propertyId,
      normalized.map((img) => img.id)
    );

    const current = normalizePropertyImages(existing[index]);
    const updatedProperty: Property = {
      ...current,
      images: normalized.map((img) => img.url),
      propertyImages: normalized
    };

    const nextList = [...existing];
    nextList[index] = updatedProperty;
    mockStorage.setProperties(nextList);

    return updatedProperty;
  }

  public async submitPropertyForVerification(id: string): Promise<Property> {
    const existing = mockStorage.getProperties();
    const index = existing.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new ServiceError(`Property with ID "${id}" not found.`, 'NOT_FOUND', 404);
    }

    const current = normalizePropertyImages(existing[index]);
    const updatedProperty: Property = {
      ...current,
      listingStatus: 'pending',
      verificationStatus: 'pending',
      verificationDetails: {
        ...current.verificationDetails,
        notes:
          'Submitted by advertiser for Pearl Prime verification and publication review.'
      }
    };

    const nextList = [...existing];
    nextList[index] = updatedProperty;
    mockStorage.setProperties(nextList);

    return updatedProperty;
  }

  public async updatePropertyVerification(
    input: UpdatePropertyVerificationInput
  ): Promise<Property> {
    const existing = mockStorage.getProperties();
    const index = existing.findIndex((p) => p.id === input.propertyId);
    if (index === -1) {
      throw new ServiceError(
        `Property with ID "${input.propertyId}" not found.`,
        'NOT_FOUND',
        404
      );
    }

    const current = normalizePropertyImages(existing[index]);
    const isVerified = input.status === 'verified';

    const nextVerificationDetails = {
      advertiserVerified:
        input.checklist?.advertiserVerified ?? (isVerified ? true : false),
      locationConfirmed:
        input.checklist?.locationConfirmed ?? (isVerified ? true : false),
      priceConfirmed:
        input.checklist?.priceConfirmed ?? (isVerified ? true : false),
      availabilityConfirmed:
        input.checklist?.availabilityConfirmed ?? (isVerified ? true : false),
      verifiedAt: isVerified ? new Date().toISOString().split('T')[0] : undefined,
      notes: input.notes?.trim() || current.verificationDetails.notes
    };

    let nextListingStatus: ListingStatus = current.listingStatus;
    if (input.publishListing !== undefined) {
      nextListingStatus = input.publishListing ? 'published' : 'pending';
    } else if (isVerified) {
      nextListingStatus = 'published';
    }

    const updatedProperty: Property = {
      ...current,
      verificationStatus: input.status,
      listingStatus: nextListingStatus,
      verificationDetails: nextVerificationDetails
    };

    const nextList = [...existing];
    nextList[index] = updatedProperty;
    mockStorage.setProperties(nextList);

    return updatedProperty;
  }
}

export const propertyService: IPropertyService = new PropertyService();

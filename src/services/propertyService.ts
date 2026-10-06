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
  CurrencyCode,
  LandTenure,
  ListingStatus,
  PersistedPropertyImage,
  PricePeriod,
  Property,
  PropertyAvailability,
  PropertyType,
  TransactionType,
  User,
  VerificationStatus
} from '../types/property';
import {
  generateUuid,
  getRequiredSupabaseClient
} from '../lib/supabase';
import {
  filterPermanentImageUrls,
  mapRowToPersistedImage,
  storageService
} from './storageService';

const PROPERTY_RELATIONAL_SELECT =
  '*, property_images(*), property_verifications(*), advertiser:profiles!properties_advertiser_id_fkey(*)';

function generateSlug(title: string, location: string): string {
  const base = `${title}-${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base || 'uganda-property'}-${suffix}`;
}

function mapSupabaseError(err: unknown, fallbackMessage: string): ServiceError {
  if (err instanceof ServiceError) return err;

  const rawMsg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message?: unknown }).message || '')
      : err instanceof Error
      ? err.message
      : '';
  const lower = rawMsg.toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed')
  ) {
    return new ServiceError(
      'Reality Estates could not connect to the server. Please check your internet connection and try again.',
      'NETWORK_ERROR',
      503
    );
  }

  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return new ServiceError(
      'You do not have permission to perform this action.',
      'FORBIDDEN',
      403
    );
  }

  return new ServiceError(fallbackMessage, 'UNKNOWN_ERROR', 500);
}

/**
 * Maps a Supabase `properties` row (with embedded `property_images`, `property_verifications`,
 * and `advertiser` profile) into the domain `Property` object.
 * Never invents fake images or demo fallback fields.
 */
function mapSupabaseRowToProperty(row: Record<string, unknown>): Property {
  const propertyId = String(row.id || '');

  // 1. Map persisted property images ordered by sort_order / display_order
  const rawImageRows = Array.isArray(row.property_images)
    ? (row.property_images as PropertyImageRow[])
    : [];

  const persistedImages: PersistedPropertyImage[] = rawImageRows
    .map((imgRow) =>
      mapRowToPersistedImage(imgRow, (p) => storageService.getPropertyImageUrl(p))
    )
    .filter((img) => Boolean(img.url))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const orderedUrls = filterPermanentImageUrls(persistedImages.map((img) => img.url));

  // 2. Map advertiser profile
  const rawAdvertiser =
    row.advertiser && typeof row.advertiser === 'object' && !Array.isArray(row.advertiser)
      ? (row.advertiser as Record<string, unknown>)
      : Array.isArray(row.advertiser) && row.advertiser[0]
      ? (row.advertiser[0] as Record<string, unknown>)
      : null;

  const advertiserType = ((row.advertiser_type as AdvertiserType) || 'Agent') as AdvertiserType;
  const advertiserPhone = String(rawAdvertiser?.phone || '');

  const advertiser: Property['advertiser'] = {
    id: String(rawAdvertiser?.id || row.advertiser_id || ''),
    name: String(rawAdvertiser?.name || 'Property Representative'),
    type: advertiserType,
    phone: advertiserPhone,
    whatsapp: advertiserPhone,
    email: String(rawAdvertiser?.email || ''),
    agencyName: rawAdvertiser?.company ? String(rawAdvertiser.company) : undefined,
    verified: Boolean(rawAdvertiser?.verified_identity)
  };

  // 3. Map verification details (`property_verifications` relation)
  const rawVerif = Array.isArray(row.property_verifications)
    ? (row.property_verifications[0] as Record<string, unknown> | undefined)
    : row.property_verifications && typeof row.property_verifications === 'object'
    ? (row.property_verifications as Record<string, unknown>)
    : undefined;

  const verificationStatus = ((row.verification_status as VerificationStatus) ||
    'pending') as VerificationStatus;

  const verificationDetails: Property['verificationDetails'] = {
    advertiserVerified: Boolean(rawVerif?.advertiser_verified ?? advertiser.verified),
    locationConfirmed: Boolean(
      rawVerif?.location_confirmed ?? verificationStatus === 'verified'
    ),
    priceConfirmed: Boolean(
      rawVerif?.price_confirmed ?? verificationStatus === 'verified'
    ),
    availabilityConfirmed: Boolean(
      rawVerif?.availability_confirmed ?? verificationStatus === 'verified'
    ),
    verifiedAt: rawVerif?.verified_at
      ? String(rawVerif.verified_at).split('T')[0]
      : undefined,
    notes: rawVerif?.notes ? String(rawVerif.notes) : undefined
  };

  const transaction = ((row.transaction as TransactionType) || 'buy') as TransactionType;
  const price = Number(row.price ?? 0);
  const landSizeDecimals =
    row.land_size_decimals !== null && row.land_size_decimals !== undefined
      ? Number(row.land_size_decimals)
      : undefined;
  const buildingSizeSqm =
    row.building_size_sqm !== null && row.building_size_sqm !== undefined
      ? Number(row.building_size_sqm)
      : undefined;

  // Derived objective metrics (only when real numeric dimensions exist on the record)
  const insights: Property['insights'] =
    buildingSizeSqm || landSizeDecimals
      ? {
          pricePerSqm:
            buildingSizeSqm && buildingSizeSqm > 0
              ? Math.round(price / buildingSizeSqm)
              : undefined,
          pricePerDecimal:
            landSizeDecimals && landSizeDecimals > 0
              ? Math.round(price / landSizeDecimals)
              : undefined
        }
      : undefined;

  return {
    id: propertyId,
    slug: String(row.slug || propertyId),
    title: String(row.title || ''),
    transaction,
    propertyType: ((row.property_type as PropertyType) || 'House') as PropertyType,
    price,
    currency: ((row.currency as CurrencyCode) || 'UGX') as CurrencyCode,
    pricePeriod: ((row.price_period as PricePeriod) ||
      (transaction === 'rent' ? 'month' : 'total')) as PricePeriod,
    location: String(row.location || ''),
    district: String(row.district || 'Kampala'),
    address: String(
      row.address || `${String(row.location || '')}, ${String(row.district || 'Kampala')}`
    ),
    bedrooms: Number(row.bedrooms ?? 0),
    bathrooms: Number(row.bathrooms ?? 0),
    parking: Number(row.parking ?? 0),
    landSizeDecimals,
    buildingSizeSqm,
    tenure: (row.tenure as LandTenure) || undefined,
    furnished: Boolean(row.furnished),
    availability: ((row.availability as PropertyAvailability) ||
      'Available') as PropertyAvailability,
    verificationStatus,
    listingStatus: ((row.listing_status as ListingStatus) || 'pending') as ListingStatus,
    description: String(row.description || ''),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    images: orderedUrls,
    propertyImages: persistedImages,
    floorPlanUrl: row.floor_plan_url ? String(row.floor_plan_url) : undefined,
    videoUrl: row.video_url ? String(row.video_url) : undefined,
    advertiser,
    verificationDetails,
    insights,
    coordinates: {
      lat: Number(row.latitude ?? 0.3136),
      lng: Number(row.longitude ?? 32.5811)
    },
    featured: Boolean(row.featured),
    dateAdded: String(
      row.date_added || row.created_at || new Date().toISOString()
    ).split('T')[0],
    neighborhoodHighlights: Array.isArray(row.neighborhood_highlights)
      ? (row.neighborhood_highlights as string[])
      : undefined
  };
}

class PropertyService implements IPropertyService {
  /**
   * Fetches properties from Supabase PostgreSQL (`public.properties`)
   * with optional server-side and client-side filtering.
   * Never falls back to mock or hardcoded property arrays.
   */
  public async getProperties(filters?: PropertyQueryFilters): Promise<Property[]> {
    const client = getRequiredSupabaseClient();

    try {
      let query = client
        .from('properties')
        .select(PROPERTY_RELATIONAL_SELECT)
        .order('created_at', { ascending: false });

      if (filters?.listingStatus && filters.listingStatus !== 'all') {
        query = query.eq('listing_status', filters.listingStatus);
      }

      if (filters?.transaction && filters.transaction !== 'all') {
        query = query.eq('transaction', filters.transaction);
      }

      if (filters?.propertyType && filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters?.district && filters.district !== 'All Districts') {
        query = query.ilike('district', filters.district);
      }

      if (filters?.minPrice && filters.minPrice > 0) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice && filters.maxPrice < 3000000000) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.verification === 'verified_only') {
        query = query.eq('verification_status', 'verified');
      }

      const { data, error } = await query;

      if (error) {
        throw mapSupabaseError(
          error,
          'Unable to load properties. Please refresh the page.'
        );
      }

      const mapped = ((data || []) as Record<string, unknown>[]).map(
        mapSupabaseRowToProperty
      );

      if (!filters) {
        return mapped;
      }

      // Apply remaining granular filters (search text, bedrooms, bathrooms, features, sort)
      return mapped
        .filter((p) => {
          if (filters.location && filters.location.trim() !== '') {
            const q = filters.location.toLowerCase().trim();
            const matches =
              p.location.toLowerCase().includes(q) ||
              p.district.toLowerCase().includes(q) ||
              p.address.toLowerCase().includes(q) ||
              p.title.toLowerCase().includes(q);
            if (!matches) return false;
          }
          if (filters.bedrooms && filters.bedrooms !== 'any') {
            const minBeds =
              filters.bedrooms === '5+' ? 5 : Number(filters.bedrooms);
            if (p.bedrooms < minBeds) return false;
          }
          if (filters.bathrooms && filters.bathrooms !== 'any') {
            const minBaths = parseInt(filters.bathrooms, 10);
            if (p.bathrooms < minBaths) return false;
          }
          if (filters.features && filters.features.length > 0) {
            const hasAll = filters.features.every((f) => p.features.includes(f));
            if (!hasAll) return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (filters.sortBy === 'price_asc') return a.price - b.price;
          if (filters.sortBy === 'price_desc') return b.price - a.price;
          if (filters.sortBy === 'newest') {
            return (
              new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
            );
          }
          const scoreA =
            (a.verificationStatus === 'verified' ? 2 : 0) + (a.featured ? 1 : 0);
          const scoreB =
            (b.verificationStatus === 'verified' ? 2 : 0) + (b.featured ? 1 : 0);
          return scoreB - scoreA;
        });
    } catch (err) {
      throw mapSupabaseError(
        err,
        'Unable to load properties. Please refresh the page.'
      );
    }
  }

  public async getPropertyById(id: string): Promise<Property | null> {
    if (!id) return null;
    const client = getRequiredSupabaseClient();

    try {
      const { data, error } = await client
        .from('properties')
        .select(PROPERTY_RELATIONAL_SELECT)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw mapSupabaseError(
          error,
          'Unable to load the requested property. Please refresh the page.'
        );
      }

      if (!data) return null;
      return mapSupabaseRowToProperty(data as Record<string, unknown>);
    } catch (err) {
      throw mapSupabaseError(
        err,
        'Unable to load the requested property. Please refresh the page.'
      );
    }
  }

  public async getPropertyBySlug(slug: string): Promise<Property | null> {
    if (!slug) return null;
    const client = getRequiredSupabaseClient();

    try {
      const { data, error } = await client
        .from('properties')
        .select(PROPERTY_RELATIONAL_SELECT)
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        throw mapSupabaseError(
          error,
          'Unable to load the requested property. Please refresh the page.'
        );
      }

      if (!data) return null;
      return mapSupabaseRowToProperty(data as Record<string, unknown>);
    } catch (err) {
      throw mapSupabaseError(
        err,
        'Unable to load the requested property. Please refresh the page.'
      );
    }
  }

  /**
   * Validates property input before database creation.
   */
  private validateCreatePropertyInput(input: CreatePropertyInput): void {
    const fieldErrors: Record<string, string> = {};

    if (!input.title || input.title.trim().length < 5) {
      fieldErrors.title = 'Property title must be at least 5 characters.';
    }
    if (!Number.isFinite(input.price) || input.price <= 0) {
      fieldErrors.price = 'Price must be a valid positive number.';
    }
    if (!input.district || !input.district.trim()) {
      fieldErrors.district = 'District is required.';
    }
    if (!input.location || !input.location.trim()) {
      fieldErrors.location = 'Neighborhood / area is required.';
    }
    if (
      !input.coordinates ||
      !Number.isFinite(input.coordinates.lat) ||
      !Number.isFinite(input.coordinates.lng)
    ) {
      fieldErrors.coordinates = 'Valid GPS coordinates are required.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new ServiceError(
        Object.values(fieldErrors)[0],
        'VALIDATION_ERROR',
        400,
        fieldErrors
      );
    }
  }

  /**
   * Creates a real property record in `public.properties` and returns the created `Property`.
   * New listings default to `listing_status = 'pending'` and `verification_status = 'pending'`.
   */
  public async createProperty(
    input: CreatePropertyInput,
    currentUser?: User | null
  ): Promise<Property> {
    this.validateCreatePropertyInput(input);

    const client = getRequiredSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    const authenticatedUserId = sessionData.session?.user?.id || currentUser?.id;

    if (!authenticatedUserId) {
      throw new ServiceError(
        'Please sign in to continue.',
        'UNAUTHORIZED',
        401
      );
    }

    const sanitizedPermanentUrls = filterPermanentImageUrls(input.images || []);
    const propertyId = generateUuid();
    const slug = generateSlug(input.title, input.location);
    const desiredListingStatus: ListingStatus =
      input.listingStatus === 'draft' ? 'draft' : 'pending';

    const insertPayload: Record<string, unknown> = {
      id: propertyId,
      slug,
      title: input.title.trim(),
      transaction: input.transaction,
      property_type: input.propertyType,
      price: Number(input.price),
      currency: input.currency || 'UGX',
      price_period:
        input.pricePeriod || (input.transaction === 'rent' ? 'month' : 'total'),
      location: input.location.trim(),
      district: input.district.trim(),
      address:
        input.address?.trim() ||
        `${input.location.trim()}, ${input.district.trim()}`,
      latitude: Number(input.coordinates?.lat ?? 0.3136),
      longitude: Number(input.coordinates?.lng ?? 32.5811),
      bedrooms: input.propertyType === 'Land' ? 0 : Math.max(0, Number(input.bedrooms || 0)),
      bathrooms: input.propertyType === 'Land' ? 0 : Math.max(0, Number(input.bathrooms || 0)),
      parking: input.propertyType === 'Land' ? 0 : Math.max(0, Number(input.parking || 0)),
      land_size_decimals:
        input.landSizeDecimals !== undefined ? Number(input.landSizeDecimals) : null,
      building_size_sqm:
        input.buildingSizeSqm !== undefined ? Number(input.buildingSizeSqm) : null,
      tenure: input.tenure || 'Mailo',
      furnished: Boolean(input.furnished),
      availability: 'Available',
      verification_status: 'pending',
      listing_status: desiredListingStatus,
      description: (input.description || '').trim(),
      features: Array.isArray(input.features) ? input.features : [],
      floor_plan_url: input.floorPlanUrl?.trim() || null,
      video_url: input.videoUrl?.trim() || null,
      neighborhood_highlights: Array.isArray(input.neighborhoodHighlights)
        ? input.neighborhoodHighlights
        : [],
      featured: false,
      advertiser_id: authenticatedUserId,
      advertiser_type: input.advertiser?.type || 'Agent',
      date_added: new Date().toISOString().split('T')[0]
    };

    try {
      const { error: insertError } = await client
        .from('properties')
        .insert(insertPayload);

      if (insertError) {
        throw mapSupabaseError(
          insertError,
          'Unable to save this property. Please try again.'
        );
      }

      // Persist any initial external permanent image URLs into `property_images`
      if (sanitizedPermanentUrls.length > 0) {
        const initialImageRecords: PersistedPropertyImage[] =
          sanitizedPermanentUrls.map((url, idx) => ({
            id: generateUuid(),
            propertyId,
            url,
            displayOrder: idx,
            altText: `${input.title.trim()} — Photo ${idx + 1}`
          }));
        await storageService.savePropertyImageRecords(propertyId, initialImageRecords);
      }

      const created = await this.getPropertyById(propertyId);
      if (!created) {
        throw new ServiceError(
          'Unable to load the created property record. Please refresh the page.',
          'UNKNOWN_ERROR',
          500
        );
      }

      return created;
    } catch (err) {
      throw mapSupabaseError(
        err,
        'Unable to save this property. Please try again.'
      );
    }
  }

  /**
   * Updates an existing property record in `public.properties`.
   */
  public async updateProperty(
    id: string,
    input: UpdatePropertyInput
  ): Promise<Property> {
    if (!id) {
      throw new ServiceError('Property ID is required for update.', 'VALIDATION_ERROR', 400);
    }

    const client = getRequiredSupabaseClient();
    const updatePayload: Record<string, unknown> = {};

    if (input.title !== undefined) updatePayload.title = input.title.trim();
    if (input.transaction !== undefined) updatePayload.transaction = input.transaction;
    if (input.propertyType !== undefined) updatePayload.property_type = input.propertyType;
    if (input.price !== undefined) updatePayload.price = Number(input.price);
    if (input.currency !== undefined) updatePayload.currency = input.currency;
    if (input.pricePeriod !== undefined) updatePayload.price_period = input.pricePeriod;
    if (input.location !== undefined) updatePayload.location = input.location.trim();
    if (input.district !== undefined) updatePayload.district = input.district.trim();
    if (input.address !== undefined) updatePayload.address = input.address.trim();
    if (input.coordinates !== undefined) {
      updatePayload.latitude = Number(input.coordinates.lat);
      updatePayload.longitude = Number(input.coordinates.lng);
    }
    if (input.bedrooms !== undefined) updatePayload.bedrooms = Number(input.bedrooms);
    if (input.bathrooms !== undefined) updatePayload.bathrooms = Number(input.bathrooms);
    if (input.parking !== undefined) updatePayload.parking = Number(input.parking);
    if (input.landSizeDecimals !== undefined) {
      updatePayload.land_size_decimals = input.landSizeDecimals;
    }
    if (input.buildingSizeSqm !== undefined) {
      updatePayload.building_size_sqm = input.buildingSizeSqm;
    }
    if (input.tenure !== undefined) updatePayload.tenure = input.tenure;
    if (input.furnished !== undefined) updatePayload.furnished = Boolean(input.furnished);
    if (input.availability !== undefined) updatePayload.availability = input.availability;
    if (input.listingStatus !== undefined) {
      updatePayload.listing_status = input.listingStatus;
    }
    if (input.description !== undefined) updatePayload.description = input.description.trim();
    if (input.features !== undefined) updatePayload.features = input.features;
    if (input.floorPlanUrl !== undefined) {
      updatePayload.floor_plan_url = input.floorPlanUrl?.trim() || null;
    }
    if (input.videoUrl !== undefined) {
      updatePayload.video_url = input.videoUrl?.trim() || null;
    }
    if (input.neighborhoodHighlights !== undefined) {
      updatePayload.neighborhood_highlights = input.neighborhoodHighlights;
    }
    if (input.advertiser?.type !== undefined) {
      updatePayload.advertiser_type = input.advertiser.type;
    }

    try {
      if (Object.keys(updatePayload).length > 0) {
        const { error } = await client
          .from('properties')
          .update(updatePayload)
          .eq('id', id);

        if (error) {
          throw mapSupabaseError(
            error,
            'Unable to save this property. Please try again.'
          );
        }
      }

      const updated = await this.getPropertyById(id);
      if (!updated) {
        throw new ServiceError(
          `Property with ID "${id}" was not found.`,
          'NOT_FOUND',
          404
        );
      }

      return updated;
    } catch (err) {
      throw mapSupabaseError(
        err,
        'Unable to save this property. Please try again.'
      );
    }
  }

  public validatePropertyImageFile(file: File): void {
    storageService.validatePropertyImageFile(file);
  }

  /**
   * Uploads selected `File` objects to Supabase Storage (`property-images` bucket)
   * and creates `property_images` records in PostgreSQL.
   */
  public async uploadPropertyImages(
    propertyId: string,
    files: File[],
    startOrder?: number,
    onFileProgress?: (fileIndex: number, progressPercent: number) => void
  ): Promise<PersistedPropertyImage[]> {
    if (!propertyId) {
      throw new ServiceError(
        'A saved property ID is required before uploading images.',
        'VALIDATION_ERROR',
        400
      );
    }
    if (!files || files.length === 0) return [];

    const existingImages = await storageService.getPropertyImages(propertyId);
    const baseOrder = startOrder ?? existingImages.length;

    return storageService.uploadPropertyImages(
      files,
      propertyId,
      baseOrder,
      onFileProgress
    );
  }

  /**
   * Removes a persisted image from Supabase Storage and deletes its `property_images` row,
   * then re-indexes remaining images.
   */
  public async removePropertyImage(
    propertyId: string,
    image: Pick<PersistedPropertyImage, 'id' | 'storagePath' | 'url'>
  ): Promise<Property> {
    if (!propertyId) {
      throw new ServiceError('Property ID is required.', 'VALIDATION_ERROR', 400);
    }

    await storageService.deletePropertyImage(
      image.storagePath || '',
      image.id,
      propertyId
    );

    const remaining = await storageService.getPropertyImages(propertyId);
    if (remaining.length > 0) {
      await storageService.reorderPropertyImages(
        propertyId,
        remaining.map((r) => r.id)
      );
    }

    const refreshed = await this.getPropertyById(propertyId);
    if (!refreshed) {
      throw new ServiceError('Property not found after image removal.', 'NOT_FOUND', 404);
    }
    return refreshed;
  }

  /**
   * Updates display order in `property_images`.
   */
  public async reorderPropertyImages(
    propertyId: string,
    orderedImages: PersistedPropertyImage[]
  ): Promise<Property> {
    if (!propertyId) {
      throw new ServiceError('Property ID is required.', 'VALIDATION_ERROR', 400);
    }

    const sanitizedOrder = orderedImages
      .filter((img) => Boolean(img.id) && !img.url.startsWith('blob:'))
      .map((img) => img.id);

    await storageService.reorderPropertyImages(propertyId, sanitizedOrder);

    const refreshed = await this.getPropertyById(propertyId);
    if (!refreshed) {
      throw new ServiceError('Property not found after reordering images.', 'NOT_FOUND', 404);
    }
    return refreshed;
  }

  /**
   * Submits a draft listing for admin verification (`listing_status = 'pending'`, `verification_status = 'pending'`).
   */
  public async submitPropertyForVerification(id: string): Promise<Property> {
    const client = getRequiredSupabaseClient();

    try {
      const { error } = await client
        .from('properties')
        .update({
          listing_status: 'pending',
          verification_status: 'pending'
        })
        .eq('id', id);

      if (error) {
        throw mapSupabaseError(
          error,
          'Unable to submit this listing for verification. Please try again.'
        );
      }

      const updated = await this.getPropertyById(id);
      if (!updated) {
        throw new ServiceError(
          `Property with ID "${id}" not found.`,
          'NOT_FOUND',
          404
        );
      }
      return updated;
    } catch (err) {
      throw mapSupabaseError(
        err,
        'Unable to submit this listing for verification. Please try again.'
      );
    }
  }

  /**
   * Admin / authorized verification update: updates `properties` status columns and
   * upserts the audit record in `property_verifications`.
   */
  public async updatePropertyVerification(
    input: UpdatePropertyVerificationInput
  ): Promise<Property> {
    const client = getRequiredSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    const adminUserId = sessionData.session?.user?.id || null;

    const current = await this.getPropertyById(input.propertyId);
    if (!current) {
      throw new ServiceError(
        `Property with ID "${input.propertyId}" not found.`,
        'NOT_FOUND',
        404
      );
    }

    const targetStatus: VerificationStatus =
      input.verificationStatus || input.status || current.verificationStatus;

    const nextDetails = {
      advertiser_verified:
        input.advertiserVerified ??
        input.checklist?.advertiserVerified ??
        current.verificationDetails.advertiserVerified ??
        false,
      location_confirmed:
        input.locationConfirmed ??
        input.checklist?.locationConfirmed ??
        current.verificationDetails.locationConfirmed ??
        false,
      price_confirmed:
        input.priceConfirmed ??
        input.checklist?.priceConfirmed ??
        current.verificationDetails.priceConfirmed ??
        false,
      availability_confirmed:
        input.availabilityConfirmed ??
        input.checklist?.availabilityConfirmed ??
        current.verificationDetails.availabilityConfirmed ??
        false,
      notes: input.notes ?? current.verificationDetails.notes ?? null,
      verified_at:
        targetStatus === 'verified' ? new Date().toISOString() : null,
      verified_by: adminUserId
    };

    const nextListingStatus: ListingStatus =
      input.publishListing !== undefined
        ? input.publishListing
          ? 'published'
          : 'pending'
        : targetStatus === 'verified'
        ? 'published'
        : current.listingStatus;

    try {
      const { error: propError } = await client
        .from('properties')
        .update({
          verification_status: targetStatus,
          listing_status: nextListingStatus
        })
        .eq('id', input.propertyId);

      if (propError) {
        throw mapSupabaseError(
          propError,
          'Unable to update property verification status.'
        );
      }

      // Check if a `property_verifications` row already exists for this property
      const { data: existingVerif } = await client
        .from('property_verifications')
        .select('id')
        .eq('property_id', input.propertyId)
        .maybeSingle();

      if (existingVerif?.id) {
        await client
          .from('property_verifications')
          .update(nextDetails)
          .eq('id', existingVerif.id);
      } else {
        await client.from('property_verifications').insert({
          id: generateUuid(),
          property_id: input.propertyId,
          ...nextDetails
        });
      }

      const refreshed = await this.getPropertyById(input.propertyId);
      if (!refreshed) {
        throw new ServiceError('Property not found after verification update.', 'NOT_FOUND', 404);
      }

      return refreshed;
    } catch (err) {
      throw mapSupabaseError(
        err,
        'Unable to update property verification status.'
      );
    }
  }
}

export const propertyService = new PropertyService();

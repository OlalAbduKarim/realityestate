import {
  IStorageService,
  PropertyImageRow,
  ServiceError,
  UploadPropertyImageOptions
} from '../types/api';
import { PersistedPropertyImage } from '../types/property';
import {
  generateUuid,
  getRequiredSupabaseClient,
  isSupabaseConfigured,
  PROPERTY_IMAGES_BUCKET,
  supabase
} from '../lib/supabase';

/**
 * Accepted MIME types and canonical file extensions for property photographs.
 */
export const ALLOWED_IMAGE_MIME_TYPES: Record<string, 'jpg' | 'png' | 'webp'> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

/**
 * Maximum client-side property photograph size: 5 MB (5,242,880 bytes).
 */
export const MAX_PROPERTY_IMAGE_BYTES = 5 * 1024 * 1024;

export function isBlobUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.trim().toLowerCase().startsWith('blob:');
}

export function isValidPersistedImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (isBlobUrl(trimmed) || trimmed.toLowerCase().startsWith('data:')) {
    return false;
  }
  return /^https?:\/\/.+/i.test(trimmed) || trimmed.startsWith('/');
}

function sanitizePathSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9_-]/g, '').trim() || generateUuid();
}

export function mapRowToPersistedImage(
  row: PropertyImageRow,
  fallbackUrlResolver: (path: string) => string
): PersistedPropertyImage {
  const storagePath = row.storage_path || undefined;
  const resolvedUrl =
    row.public_url ||
    row.image_url ||
    row.url ||
    (storagePath ? fallbackUrlResolver(storagePath) : '');

  return {
    id: String(row.id),
    propertyId: String(row.property_id),
    storagePath,
    url: resolvedUrl,
    displayOrder:
      typeof row.display_order === 'number'
        ? row.display_order
        : typeof row.sort_order === 'number'
        ? row.sort_order
        : 0,
    altText: row.alt_text || row.caption || undefined,
    createdAt: row.created_at
  };
}

class StorageService implements IStorageService {
  public isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Validates a local File before preview or upload:
   * - Accepts only JPEG, PNG, and WebP
   * - Rejects unsupported MIME types
   * - Enforces 5 MB maximum file size
   */
  public validatePropertyImageFile(file: File): void {
    if (!file) {
      throw new ServiceError('No image file provided.', 'VALIDATION_ERROR', 400);
    }

    const normalizedMime = (file.type || '').toLowerCase();
    if (!ALLOWED_IMAGE_MIME_TYPES[normalizedMime]) {
      throw new ServiceError(
        `Unsupported file format for "${file.name}" (${file.type || 'unknown'}). Only JPEG, PNG, and WebP images are accepted.`,
        'VALIDATION_ERROR',
        400,
        { file: 'Accepted formats: JPEG (.jpg), PNG (.png), WebP (.webp)' }
      );
    }

    if (file.size <= 0) {
      throw new ServiceError(
        `Image file "${file.name}" is empty.`,
        'VALIDATION_ERROR',
        400
      );
    }

    if (file.size > MAX_PROPERTY_IMAGE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      throw new ServiceError(
        `Image "${file.name}" (${sizeMb} MB) exceeds the 5 MB maximum file size limit.`,
        'VALIDATION_ERROR',
        400,
        { file: 'Maximum allowed file size is 5 MB per photo' }
      );
    }
  }

  /**
   * Generates a collision-resistant Supabase Storage object path:
   * `properties/{propertyId}/{uuid}.{extension}`
   * Never uses the original user filename as the storage path.
   */
  public buildPropertyImageStoragePath(propertyId: string, file: File): string {
    this.validatePropertyImageFile(file);
    const safePropertyId = sanitizePathSegment(propertyId);
    const extension = ALLOWED_IMAGE_MIME_TYPES[file.type.toLowerCase()] || 'jpg';
    const imageUuid = generateUuid();
    return `properties/${safePropertyId}/${imageUuid}.${extension}`;
  }

  /**
   * Resolves a Supabase Storage path into a permanent public URL.
   */
  public getPropertyImageUrl(path: string): string {
    const trimmed = (path || '').trim();
    if (!trimmed || isBlobUrl(trimmed)) return '';
    if (/^https?:\/\/.+/i.test(trimmed)) {
      return trimmed;
    }

    if (supabase) {
      const { data } = supabase.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .getPublicUrl(trimmed);
      return data.publicUrl;
    }

    return '';
  }

  /**
   * Inserts a row into `property_images`, adapting resiliently to standard column
   * naming conventions (`url` vs `image_url` vs `public_url`, `display_order` vs `sort_order`).
   */
  private async insertPropertyImageRow(params: {
    id: string;
    propertyId: string;
    storagePath: string | null;
    publicUrl: string;
    displayOrder: number;
    altText?: string;
  }): Promise<PropertyImageRow | null> {
    const client = getRequiredSupabaseClient();

    const candidatePayloads: Record<string, unknown>[] = [
      {
        id: params.id,
        property_id: params.propertyId,
        storage_path: params.storagePath,
        url: params.publicUrl,
        display_order: params.displayOrder,
        alt_text: params.altText ?? null
      },
      {
        id: params.id,
        property_id: params.propertyId,
        storage_path: params.storagePath,
        image_url: params.publicUrl,
        display_order: params.displayOrder,
        alt_text: params.altText ?? null
      },
      {
        id: params.id,
        property_id: params.propertyId,
        storage_path: params.storagePath,
        public_url: params.publicUrl,
        sort_order: params.displayOrder,
        caption: params.altText ?? null
      },
      {
        id: params.id,
        property_id: params.propertyId,
        storage_path: params.storagePath,
        display_order: params.displayOrder
      }
    ];

    let lastError: { message: string; code?: string } | null = null;

    for (const payload of candidatePayloads) {
      const { data, error } = await client
        .from('property_images')
        .insert(payload)
        .select('*')
        .maybeSingle();

      if (!error) {
        return (data as PropertyImageRow) || null;
      }

      lastError = error;
      const isColumnMismatch =
        error.code === 'PGRST204' ||
        error.code === '42703' ||
        /column .* does not exist|Could not find the .* column/i.test(error.message);

      if (!isColumnMismatch) {
        break;
      }
    }

    throw new ServiceError(
      `Image uploaded to storage, but saving the property_images database record failed: ${
        lastError?.message || 'Unknown database error'
      }`,
      'STORAGE_ERROR',
      500
    );
  }

  /**
   * Uploads a single validated property image to Supabase Storage at
   * `properties/{propertyId}/{uuid}.{extension}` and creates the corresponding
   * `property_images` row in PostgreSQL.
   */
  public async uploadPropertyImage(
    file: File,
    propertyId: string,
    options?: UploadPropertyImageOptions
  ): Promise<PersistedPropertyImage> {
    if (!propertyId || !propertyId.trim()) {
      throw new ServiceError(
        'A valid property ID is required before uploading property photographs.',
        'VALIDATION_ERROR',
        400
      );
    }

    this.validatePropertyImageFile(file);

    const client = getRequiredSupabaseClient();
    const storagePath = this.buildPropertyImageStoragePath(propertyId, file);
    const displayOrder = options?.displayOrder ?? 0;
    const altText = options?.altText?.trim() || undefined;

    options?.onProgress?.(20);

    const { error: uploadError } = await client.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw new ServiceError(
        `Failed to upload "${file.name}" to Supabase Storage: ${uploadError.message}`,
        'STORAGE_ERROR',
        500
      );
    }

    options?.onProgress?.(70);

    const publicUrl = this.getPropertyImageUrl(storagePath);
    if (!publicUrl || isBlobUrl(publicUrl)) {
      await client.storage.from(PROPERTY_IMAGES_BUCKET).remove([storagePath]);
      throw new ServiceError(
        `Could not resolve a permanent public URL for "${file.name}".`,
        'STORAGE_ERROR',
        500
      );
    }

    const imageId = generateUuid();
    const createdAt = new Date().toISOString();

    try {
      const insertedRow = await this.insertPropertyImageRow({
        id: imageId,
        propertyId,
        storagePath,
        publicUrl,
        displayOrder,
        altText
      });

      options?.onProgress?.(100);

      if (insertedRow) {
        return mapRowToPersistedImage(insertedRow, (p) => this.getPropertyImageUrl(p));
      }

      return {
        id: imageId,
        propertyId,
        storagePath,
        url: publicUrl,
        displayOrder,
        altText,
        createdAt
      };
    } catch (dbErr) {
      // Clean up orphaned object from Storage if database insert failed
      await client.storage.from(PROPERTY_IMAGES_BUCKET).remove([storagePath]);
      throw dbErr;
    }
  }

  /**
   * Sequentially uploads multiple files for a property while preserving display ordering.
   */
  public async uploadPropertyImages(
    files: File[],
    propertyId: string,
    startOrder = 0,
    onFileProgress?: (fileIndex: number, progressPercent: number) => void
  ): Promise<PersistedPropertyImage[]> {
    if (!files || files.length === 0) return [];

    // Validate all files upfront before starting network transfers
    files.forEach((file) => this.validatePropertyImageFile(file));

    const uploaded: PersistedPropertyImage[] = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const result = await this.uploadPropertyImage(file, propertyId, {
        displayOrder: startOrder + index,
        onProgress: (pct) => onFileProgress?.(index, pct)
      });
      uploaded.push(result);
    }

    return uploaded;
  }

  /**
   * Deletes a property image from Supabase Storage and removes its `property_images` row.
   */
  public async deletePropertyImage(
    path: string,
    imageRecordId?: string,
    propertyId?: string
  ): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      return;
    }

    const trimmedPath = (path || '').trim();
    if (trimmedPath && !/^https?:\/\/.+/i.test(trimmedPath)) {
      const { error: storageError } = await supabase.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .remove([trimmedPath]);

      if (storageError) {
        throw new ServiceError(
          `Failed to delete image from Supabase Storage: ${storageError.message}`,
          'STORAGE_ERROR',
          500
        );
      }
    }

    if (imageRecordId) {
      let query = supabase.from('property_images').delete().eq('id', imageRecordId);
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      const { error: dbError } = await query;
      if (dbError) {
        throw new ServiceError(
          `Failed to delete property_images database record: ${dbError.message}`,
          'STORAGE_ERROR',
          500
        );
      }
    } else if (trimmedPath) {
      let query = supabase
        .from('property_images')
        .delete()
        .eq('storage_path', trimmedPath);
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      const { error: dbError } = await query;
      if (dbError) {
        throw new ServiceError(
          `Failed to delete property_images database record by path: ${dbError.message}`,
          'STORAGE_ERROR',
          500
        );
      }
    }
  }

  /**
   * Fetches persisted images for a property from `property_images` ordered by `displayOrder`.
   */
  public async getPropertyImages(propertyId: string): Promise<PersistedPropertyImage[]> {
    if (!propertyId || !isSupabaseConfigured() || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId);

    if (error) {
      throw new ServiceError(
        `Failed to load property images: ${error.message}`,
        'STORAGE_ERROR',
        500
      );
    }

    return (data || [])
      .map((row) =>
        mapRowToPersistedImage(row as PropertyImageRow, (p) =>
          this.getPropertyImageUrl(p)
        )
      )
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Persists external/preset image records into `property_images` when Supabase is configured.
   */
  public async savePropertyImageRecords(
    propertyId: string,
    images: PersistedPropertyImage[]
  ): Promise<PersistedPropertyImage[]> {
    const validImages = images
      .filter((img) => isValidPersistedImageUrl(img.url))
      .map((img, idx) => ({
        ...img,
        id: img.id || generateUuid(),
        propertyId,
        displayOrder: idx
      }));

    if (!isSupabaseConfigured() || !supabase || validImages.length === 0) {
      return validImages;
    }

    const saved: PersistedPropertyImage[] = [];
    for (const img of validImages) {
      try {
        const inserted = await this.insertPropertyImageRow({
          id: img.id,
          propertyId,
          storagePath: img.storagePath ?? null,
          publicUrl: img.url,
          displayOrder: img.displayOrder,
          altText: img.altText
        });
        if (inserted) {
          saved.push(
            mapRowToPersistedImage(inserted, (p) => this.getPropertyImageUrl(p))
          );
        } else {
          saved.push(img);
        }
      } catch {
        // If the record already exists or external URL insert is skipped by RLS in demo hybrid, keep valid URL reference
        saved.push(img);
      }
    }

    return saved;
  }

  /**
   * Updates `display_order` (or `sort_order`) for a property's persisted images in `property_images`.
   */
  public async reorderPropertyImages(
    propertyId: string,
    orderedImageIds: string[]
  ): Promise<PersistedPropertyImage[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return [];
    }

    for (let order = 0; order < orderedImageIds.length; order++) {
      const imageId = orderedImageIds[order];
      const { error } = await supabase
        .from('property_images')
        .update({ display_order: order })
        .eq('id', imageId)
        .eq('property_id', propertyId);

      if (error) {
        const isColumnMismatch =
          error.code === 'PGRST204' ||
          error.code === '42703' ||
          /display_order/i.test(error.message);

        if (isColumnMismatch) {
          const { error: fallbackError } = await supabase
            .from('property_images')
            .update({ sort_order: order })
            .eq('id', imageId)
            .eq('property_id', propertyId);

          if (fallbackError) {
            throw new ServiceError(
              `Failed to update image display order: ${fallbackError.message}`,
              'STORAGE_ERROR',
              500
            );
          }
        } else {
          throw new ServiceError(
            `Failed to update image display order: ${error.message}`,
            'STORAGE_ERROR',
            500
          );
        }
      }
    }

    return this.getPropertyImages(propertyId);
  }
}

export const storageService: IStorageService = new StorageService();

/**
 * Clean named function exports for direct service consumption.
 */
export const validatePropertyImageFile = (file: File): void =>
  storageService.validatePropertyImageFile(file);

export const uploadPropertyImage = (
  file: File,
  propertyId: string,
  options?: UploadPropertyImageOptions
): Promise<PersistedPropertyImage> =>
  storageService.uploadPropertyImage(file, propertyId, options);

export const uploadPropertyImages = (
  files: File[],
  propertyId: string,
  startOrder?: number,
  onFileProgress?: (fileIndex: number, progressPercent: number) => void
): Promise<PersistedPropertyImage[]> =>
  storageService.uploadPropertyImages(files, propertyId, startOrder, onFileProgress);

export const deletePropertyImage = (
  path: string,
  imageRecordId?: string,
  propertyId?: string
): Promise<void> =>
  storageService.deletePropertyImage(path, imageRecordId, propertyId);

export const getPropertyImageUrl = (path: string): string =>
  storageService.getPropertyImageUrl(path);

export const getPropertyImages = (
  propertyId: string
): Promise<PersistedPropertyImage[]> => storageService.getPropertyImages(propertyId);

export const reorderPropertyImages = (
  propertyId: string,
  orderedImageIds: string[]
): Promise<PersistedPropertyImage[]> =>
  storageService.reorderPropertyImages(propertyId, orderedImageIds);

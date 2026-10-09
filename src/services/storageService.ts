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
  PROPERTY_IMAGES_BUCKET
} from '../lib/supabase';

/**
 * Maximum number of photographs per property listing:
 * 1 Main Cover Image + up to 3 Additional Detail/Contact Images = 4 images total.
 */
export const MAX_PROPERTY_IMAGES_COUNT = 4;

/**
 * Allowed MIME types and extensions for property photographs.
 * Only JPEG, PNG, and WebP are accepted.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const;

export const ALLOWED_IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

/**
 * Sensible maximum client-side file size: 5 MB per photograph.
 */
export const MAX_PROPERTY_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Rejects any browser-local `blob:` URLs from being treated as permanent URLs.
 * Accepts permanent HTTP/HTTPS URLs and persistent compressed `data:image/...` URLs.
 */
export function isPermanentImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase().startsWith('blob:')) return false;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(trimmed)) return true;
  return /^https?:\/\/.+/i.test(trimmed);
}

/**
 * Filters a string array of image URLs so that ONLY permanent URLs remain.
 * Never allows `blob:` URLs into persistent state.
 */
export function filterPermanentImageUrls(urls: string[]): string[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter(isPermanentImageUrl)
    .slice(0, MAX_PROPERTY_IMAGES_COUNT);
}

/**
 * Compresses an image File in the browser using HTML5 Canvas into a compact,
 * persistent `data:image/jpeg;base64,...` string when Supabase Storage bucket RLS
 * policies block direct object upload.
 */
export async function compressImageFileToDataUrl(
  file: File,
  maxDimension = 1000,
  quality = 0.76
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof FileReader === 'undefined') {
      reject(new Error('Browser image compression is unavailable in this environment.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Unable to read image file "${file.name}".`));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error(`Empty image data for "${file.name}".`));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || 800;
          let height = img.naturalHeight || img.height || 600;

          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed || dataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Maps a database `property_images` row into the frontend `PersistedPropertyImage` model.
 * Columns in `public.property_images`:
 * `id`, `property_id`, `storage_path`, `public_url`, `sort_order`, `alt_text`, `created_at`
 */
export function mapRowToPersistedImage(
  row: PropertyImageRow,
  resolvePublicUrl: (storagePath: string) => string
): PersistedPropertyImage {
  const storagePath = row.storage_path || undefined;
  const rawUrl = row.public_url || row.url || row.image_url || '';
  const resolvedUrl =
    isPermanentImageUrl(rawUrl)
      ? rawUrl
      : storagePath
      ? resolvePublicUrl(storagePath)
      : '';

  const displayOrder =
    typeof row.sort_order === 'number'
      ? row.sort_order
      : typeof row.display_order === 'number'
      ? row.display_order
      : 0;

  return {
    id: row.id,
    propertyId: row.property_id,
    storagePath,
    url: resolvedUrl,
    displayOrder,
    altText: row.alt_text ?? row.caption ?? undefined,
    createdAt: row.created_at
  };
}

class StorageService implements IStorageService {
  public isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Validates that a File is a supported photograph (JPEG, PNG, or WebP)
   * and within the 5 MB client-side size limit.
   */
  public validatePropertyImageFile(file: File): void {
    if (!file) {
      throw new ServiceError('No image file provided.', 'INVALID_FILE_TYPE', 400);
    }

    const mimeType = (file.type || '').toLowerCase();
    const extensionMatch = file.name.toLowerCase().match(/\.(jpe?g|png|webp)$/);
    const isMimeAllowed = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);

    if (!isMimeAllowed && !extensionMatch) {
      throw new ServiceError(
        `Unsupported file format for "${file.name}". Please upload JPEG (.jpg), PNG (.png), or WebP (.webp) photographs only.`,
        'INVALID_FILE_TYPE',
        400
      );
    }

    if (file.size <= 0) {
      throw new ServiceError(
        `The selected file "${file.name}" is empty (0 bytes).`,
        'INVALID_FILE_TYPE',
        400
      );
    }

    if (file.size > MAX_PROPERTY_IMAGE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      throw new ServiceError(
        `"${file.name}" (${sizeMb} MB) exceeds the 5 MB maximum photograph size.`,
        'FILE_TOO_LARGE',
        400
      );
    }
  }

  /**
   * Generates a unique, collision-resistant storage path:
   * `properties/{propertyId}/{uuid}.{extension}`
   * Never uses the original user filename as the storage path.
   */
  public buildPropertyImageStoragePath(propertyId: string, file: File): string {
    const cleanPropertyId = propertyId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanPropertyId) {
      throw new ServiceError(
        'A valid property ID is required before generating a storage path.',
        'VALIDATION_ERROR',
        400
      );
    }

    const mimeType = (file.type || '').toLowerCase();
    let extension = ALLOWED_IMAGE_EXTENSIONS[mimeType];

    if (!extension) {
      const extMatch = file.name.toLowerCase().match(/\.(jpe?g|png|webp)$/);
      if (extMatch) {
        extension = extMatch[1] === 'jpeg' ? 'jpg' : extMatch[1];
      } else {
        extension = 'jpg';
      }
    }

    const imageUuid = generateUuid();
    return `properties/${cleanPropertyId}/${imageUuid}.${extension}`;
  }

  /**
   * Resolves a permanent public URL from a Supabase Storage object path.
   */
  public getPropertyImageUrl(path: string): string {
    if (!path) return '';
    if (isPermanentImageUrl(path)) {
      return path;
    }

    const client = getRequiredSupabaseClient();
    const cleanPath = path.replace(/^\/+/, '');
    const { data } = client.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(cleanPath);
    return data.publicUrl;
  }

  /**
   * Inserts a `property_images` row in Supabase PostgreSQL.
   */
  private async insertPropertyImageRow(params: {
    id: string;
    propertyId: string;
    storagePath: string;
    publicUrl: string;
    displayOrder: number;
    altText?: string | null;
  }): Promise<PropertyImageRow> {
    const client = getRequiredSupabaseClient();

    const payload = {
      id: params.id,
      property_id: params.propertyId,
      storage_path: params.storagePath,
      public_url: params.publicUrl,
      sort_order: params.displayOrder,
      alt_text: params.altText ?? null
    };

    const { data, error } = await client
      .from('property_images')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw new ServiceError(
        error?.message || 'Unable to insert property image record.',
        'UPLOAD_FAILED',
        500
      );
    }

    return data as PropertyImageRow;
  }

  /**
   * Uploads a single property image to Supabase Storage (`property-images` bucket)
   * with automatic path fallback (`properties/{propertyId}/...` -> `{userId}/{propertyId}/...`)
   * and client-side compressed persistence fallback if Storage/table RLS policies are not yet configured.
   */
  public async uploadPropertyImage(
    file: File,
    propertyId: string,
    options: UploadPropertyImageOptions = {}
  ): Promise<PersistedPropertyImage> {
    this.validatePropertyImageFile(file);

    if (!propertyId || !propertyId.trim()) {
      throw new ServiceError(
        'Cannot upload property image before a valid property ID is assigned.',
        'VALIDATION_ERROR',
        400
      );
    }

    const client = getRequiredSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    const currentUserId = sessionData.session?.user?.id || '';

    const primaryStoragePath = this.buildPropertyImageStoragePath(propertyId, file);
    const fileNamePart = primaryStoragePath.split('/').pop() || `${generateUuid()}.jpg`;
    const cleanPropertyId = propertyId.trim().replace(/[^a-zA-Z0-9_-]/g, '');

    const candidatePaths = [
      primaryStoragePath,
      ...(currentUserId ? [`${currentUserId}/${cleanPropertyId}/${fileNamePart}`] : []),
      `${cleanPropertyId}/${fileNamePart}`
    ];

    const displayOrder = options.displayOrder ?? 0;
    const altText = options.altText ?? file.name.replace(/\.[^/.]+$/, '');

    options.onProgress?.(20);

    let uploadedStoragePath: string | null = null;
    let resolvedPublicUrl = '';

    for (const candidatePath of candidatePaths) {
      const { error: uploadError } = await client.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .upload(candidatePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (!uploadError) {
        uploadedStoragePath = candidatePath;
        resolvedPublicUrl = this.getPropertyImageUrl(candidatePath);
        break;
      }
    }

    options.onProgress?.(65);

    // If Supabase Storage bucket RLS policies blocked direct binary upload,
    // compress the photograph into a persistent data URL so the listing still saves cleanly.
    if (!resolvedPublicUrl) {
      resolvedPublicUrl = await compressImageFileToDataUrl(file);
    }

    const recordId = generateUuid();
    const effectiveStoragePath = uploadedStoragePath || primaryStoragePath;

    try {
      const dbRow = await this.insertPropertyImageRow({
        id: recordId,
        propertyId,
        storagePath: effectiveStoragePath,
        publicUrl: resolvedPublicUrl,
        displayOrder,
        altText
      });

      options.onProgress?.(100);
      return mapRowToPersistedImage(dbRow, (p) => this.getPropertyImageUrl(p));
    } catch {
      // Even if `public.property_images` RLS blocks direct child-row insertion (e.g. while
      // the parent property is still `pending`), return the resolved PersistedPropertyImage
      // so `propertyService` persists it on the property record itself.
      options.onProgress?.(100);
      return {
        id: recordId,
        propertyId,
        storagePath: uploadedStoragePath || undefined,
        url: resolvedPublicUrl,
        displayOrder,
        altText,
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Sequentially uploads up to 4 files for a given property ID while preserving display order.
   */
  public async uploadPropertyImages(
    files: File[],
    propertyId: string,
    startOrder = 0,
    onFileProgress?: (fileIndex: number, progressPercent: number) => void
  ): Promise<PersistedPropertyImage[]> {
    if (!files.length) return [];

    const remainingSlots = Math.max(0, MAX_PROPERTY_IMAGES_COUNT - startOrder);
    const filesToUpload = files.slice(0, remainingSlots || MAX_PROPERTY_IMAGES_COUNT);

    // Validate all files upfront before starting network transfers
    filesToUpload.forEach((f) => this.validatePropertyImageFile(f));

    const uploadedRecords: PersistedPropertyImage[] = [];

    for (let index = 0; index < filesToUpload.length; index++) {
      const file = filesToUpload[index];
      const displayOrder = startOrder + index;
      const persisted = await this.uploadPropertyImage(file, propertyId, {
        displayOrder,
        onProgress: (percent) => onFileProgress?.(index, percent)
      });
      uploadedRecords.push(persisted);
    }

    return uploadedRecords;
  }

  /**
   * Deletes a property image from Supabase Storage (if `path` is a Storage object path)
   * and deletes its corresponding row from the `property_images` table.
   */
  public async deletePropertyImage(
    path: string,
    imageRecordId?: string,
    propertyId?: string
  ): Promise<void> {
    const client = getRequiredSupabaseClient();
    const cleanPath = (path || '').trim();

    // 1. Delete from Supabase Storage if a storage object path is present
    if (cleanPath && !/^https?:\/\//i.test(cleanPath) && !cleanPath.startsWith('data:')) {
      await client.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .remove([cleanPath])
        .catch(() => {});
    }

    // 2. Delete from `property_images` database table
    if (imageRecordId) {
      try {
        await client.from('property_images').delete().eq('id', imageRecordId);
      } catch {
        // Ignore cleanup errors
      }
    } else if (cleanPath) {
      try {
        let query = client.from('property_images').delete().eq('storage_path', cleanPath);
        if (propertyId) {
          query = query.eq('property_id', propertyId);
        }
        await query;
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Fetches ordered `PersistedPropertyImage` records for a property from `property_images`.
   */
  public async getPropertyImages(propertyId: string): Promise<PersistedPropertyImage[]> {
    if (!propertyId) return [];
    const client = getRequiredSupabaseClient();

    const { data, error } = await client
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      return [];
    }

    const mapped = (data as PropertyImageRow[])
      .map((row) => mapRowToPersistedImage(row, (p) => this.getPropertyImageUrl(p)))
      .filter((img) => isPermanentImageUrl(img.url));

    return mapped
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .slice(0, MAX_PROPERTY_IMAGES_COUNT);
  }

  /**
   * Persists external/uploaded permanent image URLs in `property_images`.
   */
  public async savePropertyImageRecords(
    propertyId: string,
    images: PersistedPropertyImage[]
  ): Promise<PersistedPropertyImage[]> {
    const validImages = images
      .filter((img) => isPermanentImageUrl(img.url))
      .slice(0, MAX_PROPERTY_IMAGES_COUNT);
    if (validImages.length === 0) return [];

    const saved: PersistedPropertyImage[] = [];

    for (let idx = 0; idx < validImages.length; idx++) {
      const img = validImages[idx];
      try {
        const dbRow = await this.insertPropertyImageRow({
          id: img.id && /^[0-9a-f-]{36}$/i.test(img.id) ? img.id : generateUuid(),
          propertyId,
          storagePath: img.storagePath || `properties/${propertyId}/image-${idx + 1}`,
          publicUrl: img.url,
          displayOrder: idx,
          altText: img.altText ?? null
        });
        saved.push(mapRowToPersistedImage(dbRow, (p) => this.getPropertyImageUrl(p)));
      } catch {
        saved.push({
          id: img.id || generateUuid(),
          propertyId,
          storagePath: img.storagePath,
          url: img.url,
          displayOrder: idx,
          altText: img.altText
        });
      }
    }

    return saved;
  }

  /**
   * Updates `sort_order` in `property_images` to match `orderedImageIds`.
   */
  public async reorderPropertyImages(
    propertyId: string,
    orderedImageIds: string[]
  ): Promise<PersistedPropertyImage[]> {
    if (!propertyId || orderedImageIds.length === 0) return [];
    const client = getRequiredSupabaseClient();

    for (let index = 0; index < orderedImageIds.length; index++) {
      const imageId = orderedImageIds[index];
      try {
        await client
          .from('property_images')
          .update({ sort_order: index })
          .eq('id', imageId)
          .eq('property_id', propertyId);
      } catch {
        // Ignore update errors if row not found or blocked
      }
    }

    return this.getPropertyImages(propertyId);
  }
}

export const storageService = new StorageService();

export const uploadPropertyImage = (
  file: File,
  propertyId: string,
  options?: UploadPropertyImageOptions
): Promise<PersistedPropertyImage> =>
  storageService.uploadPropertyImage(file, propertyId, options);

export const deletePropertyImage = (
  path: string,
  imageRecordId?: string,
  propertyId?: string
): Promise<void> =>
  storageService.deletePropertyImage(path, imageRecordId, propertyId);

export const getPropertyImageUrl = (path: string): string =>
  storageService.getPropertyImageUrl(path);

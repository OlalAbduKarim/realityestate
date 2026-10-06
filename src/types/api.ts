import {
  CurrencyCode,
  Enquiry,
  EnquiryStatus,
  FilterState,
  LandTenure,
  ListingStatus,
  PersistedPropertyImage,
  PricePeriod,
  Property,
  PropertyAdvertiser,
  PropertyType,
  PropertyVerificationDetails,
  TransactionRecord,
  TransactionStage,
  TransactionType,
  User,
  UserRole,
  VerificationStatus,
  ViewingRequest,
  ViewingStatus,
  PaymentStatus
} from './property';

/**
 * Standardized service/API error structure so UI and context layers can
 * handle validation, network, storage, and authorization failures consistently.
 */
export type ServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'UPLOAD_FAILED'
  | 'DELETE_FAILED'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'EMAIL_NOT_CONFIRMED'
  | 'WEAK_PASSWORD'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'STORAGE_ERROR'
  | 'STORAGE_NOT_CONFIGURED'
  | 'CONFLICT'
  | 'UNKNOWN_ERROR';

export class ServiceError extends Error {
  public readonly code: ServiceErrorCode;
  public readonly status?: number;
  public readonly details?: Record<string, string>;

  constructor(
    message: string,
    code: ServiceErrorCode = 'UNKNOWN_ERROR',
    status?: number,
    details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * A. Local Selected File (Temporary Browser Preview Before Upload)
 *
 * Represents a file chosen from the user's device. Its `previewUrl` is created via
 * `URL.createObjectURL(file)` strictly for immediate UI feedback and must NEVER be
 * persisted to PostgreSQL or saved as a permanent property image URL.
 */
export type LocalImageUploadState =
  | 'selected'
  | 'uploading'
  | 'uploaded'
  | 'upload_failed';

export interface LocalSelectedImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadState: LocalImageUploadState;
  uploadProgress: number;
  altText?: string;
  errorMessage?: string;
  persistedImage?: PersistedPropertyImage;
}

/**
 * Legacy alias preserved for compatibility.
 */
export type LocalImagePreview = LocalSelectedImage;

/**
 * B. Persisted Property Image UI State (for editing existing properties)
 *
 * Wraps a `PersistedPropertyImage` with UI deletion status so the form can distinguish
 * idle, deleting, and delete_failed states without losing the record on error.
 */
export type PersistedImageDeleteState = 'idle' | 'deleting' | 'delete_failed';

export interface ManagedPersistedImage extends PersistedPropertyImage {
  deleteState?: PersistedImageDeleteState;
  deleteError?: string;
}

/**
 * Database row mapping for the `property_images` table in Supabase PostgreSQL.
 */
export interface PropertyImageRow {
  id: string;
  property_id: string;
  storage_path: string | null;
  url?: string | null;
  image_url?: string | null;
  public_url?: string | null;
  display_order?: number | null;
  sort_order?: number | null;
  alt_text?: string | null;
  caption?: string | null;
  created_at?: string;
}

export interface UploadPropertyImageOptions {
  displayOrder?: number;
  altText?: string;
  onProgress?: (progressPercent: number) => void;
}

export interface UploadPropertyImageResult {
  image: PersistedPropertyImage;
  hostedUrl: string;
  storagePath?: string;
}

/**
 * Property Input DTOs
 */
export interface CreatePropertyInput {
  id?: string;
  title: string;
  transaction: TransactionType;
  propertyType: PropertyType;
  price: number;
  currency?: CurrencyCode;
  pricePeriod?: PricePeriod;
  location: string;
  district: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  landSizeDecimals?: number;
  buildingSizeSqm?: number;
  tenure?: LandTenure;
  furnished?: boolean;
  description?: string;
  features?: string[];
  /**
   * Only permanent HTTP/HTTPS URLs are accepted here. Browser `blob:` URLs are rejected/filtered.
   */
  images?: string[];
  propertyImages?: PersistedPropertyImage[];
  floorPlanUrl?: string;
  videoUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  advertiser?: Partial<PropertyAdvertiser>;
  /**
   * Advertiser may save as 'draft' or submit for review ('pending').
   * Advertisers cannot self-publish ('published') or self-verify ('verified').
   */
  listingStatus?: Extract<ListingStatus, 'draft' | 'pending'>;
  neighborhoodHighlights?: string[];
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  availability?: Property['availability'];
}

export interface UpdatePropertyVerificationInput {
  propertyId: string;
  status?: VerificationStatus;
  verificationStatus?: VerificationStatus;
  notes?: string;
  advertiserVerified?: boolean;
  locationConfirmed?: boolean;
  priceConfirmed?: boolean;
  availabilityConfirmed?: boolean;
  checklist?: Partial<
    Pick<
      PropertyVerificationDetails,
      | 'advertiserVerified'
      | 'locationConfirmed'
      | 'priceConfirmed'
      | 'availabilityConfirmed'
    >
  >;
  publishListing?: boolean;
}

export interface PropertyQueryFilters extends Partial<FilterState> {
  listingStatus?: ListingStatus | 'all';
  includeUnpublished?: boolean;
  advertiserId?: string;
}

/**
 * Enquiry DTOs
 */
export interface CreateEnquiryInput {
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  propertyPrice: number;
  propertyLocation: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  subject?: string;
  message: string;
}

export interface UpdateEnquiryStatusInput {
  enquiryId: string;
  status: EnquiryStatus;
  notes?: string;
}

/**
 * Viewing Request DTOs
 */
export interface CreateViewingRequestInput {
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage: string;
  propertyPrice: number;
  propertyTransaction: TransactionType;
  propertyPricePeriod?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
}

export interface UpdateViewingStatusInput {
  requestId: string;
  status: ViewingStatus;
  assignedAgentName?: string;
}

/**
 * Transaction DTOs
 */
export interface UpdateTransactionStageInput {
  transactionId: string;
  stage: TransactionStage;
  paymentStatus?: PaymentStatus;
}

/**
 * Authentication DTOs & Profile Schema Mapping
 * Note: Public registration explicitly excludes 'admin' to prevent privilege escalation.
 */
export type PublicRegistrableRole = Exclude<UserRole, 'admin'>;

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface ProfileRow {
  id: string;
  email?: string | null;
  full_name?: string | null;
  name?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  avatar?: string | null;
  company?: string | null;
  agency_name?: string | null;
  verified_identity?: boolean | null;
  is_verified?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginInput {
  identifier: string; // email or Ugandan phone number
  password?: string;
  method?: 'phone' | 'email';
}

export interface RegisterInput {
  name: string;
  phone: string;
  email: string;
  password?: string;
  role?: PublicRegistrableRole;
  company?: string;
}

export interface AuthSessionResponse {
  user: User;
  requiresEmailConfirmation?: boolean;
}

/**
 * Service Contracts (Repository Interfaces)
 */
export interface IStorageService {
  isConfigured(): boolean;
  validatePropertyImageFile(file: File): void;
  buildPropertyImageStoragePath(propertyId: string, file: File): string;
  getPropertyImageUrl(path: string): string;
  uploadPropertyImage(
    file: File,
    propertyId: string,
    options?: UploadPropertyImageOptions
  ): Promise<PersistedPropertyImage>;
  uploadPropertyImages(
    files: File[],
    propertyId: string,
    startOrder?: number,
    onFileProgress?: (fileIndex: number, progressPercent: number) => void
  ): Promise<PersistedPropertyImage[]>;
  deletePropertyImage(
    path: string,
    imageRecordId?: string,
    propertyId?: string
  ): Promise<void>;
  getPropertyImages(propertyId: string): Promise<PersistedPropertyImage[]>;
  savePropertyImageRecords(
    propertyId: string,
    images: PersistedPropertyImage[]
  ): Promise<PersistedPropertyImage[]>;
  reorderPropertyImages(
    propertyId: string,
    orderedImageIds: string[]
  ): Promise<PersistedPropertyImage[]>;
}

export interface IPropertyService {
  getProperties(filters?: PropertyQueryFilters): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | null>;
  getPropertyBySlug(slug: string): Promise<Property | null>;
  createProperty(input: CreatePropertyInput, currentUser?: User | null): Promise<Property>;
  updateProperty(id: string, input: UpdatePropertyInput): Promise<Property>;
  submitPropertyForVerification(id: string): Promise<Property>;
  updatePropertyVerification(input: UpdatePropertyVerificationInput): Promise<Property>;
  validatePropertyImageFile(file: File): void;
  uploadPropertyImages(
    propertyId: string,
    files: File[],
    startOrder?: number,
    onFileProgress?: (fileIndex: number, progressPercent: number) => void
  ): Promise<PersistedPropertyImage[]>;
  removePropertyImage(
    propertyId: string,
    image: Pick<PersistedPropertyImage, 'id' | 'storagePath' | 'url'>
  ): Promise<Property>;
  reorderPropertyImages(
    propertyId: string,
    orderedImages: PersistedPropertyImage[]
  ): Promise<Property>;
}

export interface ISavedPropertyService {
  getSavedPropertyIds(userId?: string): Promise<string[]>;
  getSavedProperties(userId?: string): Promise<Property[]>;
  saveProperty(propertyId: string, userId?: string): Promise<string[]>;
  removeSavedProperty(propertyId: string, userId?: string): Promise<string[]>;
  toggleSavedProperty(propertyId: string, userId?: string): Promise<{ savedIds: string[]; isSaved: boolean }>;
  clearSavedProperties(userId?: string): Promise<string[]>;
}

export interface IEnquiryService {
  getEnquiries(userId?: string): Promise<Enquiry[]>;
  createEnquiry(input: CreateEnquiryInput): Promise<Enquiry>;
  updateEnquiryStatus(input: UpdateEnquiryStatusInput): Promise<Enquiry>;
}

export interface IViewingService {
  getViewingRequests(userId?: string): Promise<ViewingRequest[]>;
  createViewingRequest(input: CreateViewingRequestInput): Promise<ViewingRequest>;
  updateViewingRequestStatus(input: UpdateViewingStatusInput): Promise<ViewingRequest>;
}

export interface ITransactionService {
  getTransactions(): Promise<TransactionRecord[]>;
  updateTransactionStage(input: UpdateTransactionStageInput): Promise<TransactionRecord>;
}

export interface IAuthService {
  isSupabaseAuthEnabled(): boolean;
  signUp(input: RegisterInput): Promise<AuthSessionResponse>;
  signIn(input: LoginInput): Promise<AuthSessionResponse>;
  signOut(): Promise<void>;
  getCurrentSession(): Promise<unknown | null>;
  getCurrentUser(): Promise<User | null>;
  getCurrentProfile(): Promise<User | null>;
  requestPasswordReset(email: string): Promise<void>;
  onAuthStateChange(
    callback: (event: string, user: User | null) => void
  ): () => void;
  // Aliases preserved for existing caller compatibility
  login(input: LoginInput): Promise<AuthSessionResponse>;
  register(input: RegisterInput): Promise<AuthSessionResponse>;
  logout(): Promise<void>;
}

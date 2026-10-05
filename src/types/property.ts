export type TransactionType = 'buy' | 'rent';

export type PropertyType = 
  | 'House' 
  | 'Apartment' 
  | 'Land' 
  | 'Office' 
  | 'Shop' 
  | 'Warehouse' 
  | 'Commercial' 
  | 'Other';

export type UserRole = 'buyer' | 'agent' | 'owner' | 'developer' | 'admin';

export type CurrencyCode = 'UGX' | 'USD';

export type PricePeriod = 'month' | 'year' | 'total';

export type LandTenure = 'Mailo' | 'Freehold' | 'Leasehold' | 'Customary';

export type PropertyAvailability = 'Available' | 'Under Offer' | 'Sold' | 'Rented';

export type VerificationStatus = 'verified' | 'unverified' | 'pending';

export type ListingStatus = 'published' | 'pending' | 'draft';

export type AdvertiserType = 'Owner' | 'Agent' | 'Developer';

export type ViewingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

/**
 * Preserves both the core enquiry lifecycle statuses ('New' | 'Replied' | 'Archived')
 * and extended CRM inquiry audit statuses used in existing seed data and admin views.
 */
export type EnquiryStatus = 
  | 'New' 
  | 'Replied' 
  | 'Archived' 
  | 'Contacted' 
  | 'Viewing Scheduled' 
  | 'Offer Made' 
  | 'Closed' 
  | 'Lost';

export type TransactionStage = 
  | 'Enquiry' 
  | 'Contacted' 
  | 'Viewing' 
  | 'Negotiation' 
  | 'Offer' 
  | 'Closed';

export type PaymentStatus = 'Pending' | 'Invoiced' | 'Received';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  verifiedIdentity?: boolean;
}

export interface PropertyAdvertiser {
  id: string;
  name: string;
  type: AdvertiserType;
  phone: string;
  whatsapp: string;
  email: string;
  agencyName?: string;
  verified: boolean;
  responseRate?: string;
}

export interface PropertyVerificationDetails {
  advertiserVerified: boolean;
  locationConfirmed: boolean;
  priceConfirmed: boolean;
  availabilityConfirmed: boolean;
  verifiedAt?: string;
  notes?: string;
}

export interface PropertyInsightsData {
  estimatedMonthlyRent?: number;
  grossRentalYield?: number; // e.g. 7.8%
  pricePerSqm?: number;
  pricePerDecimal?: number;
  capitalGrowthForecast?: string; // e.g. +8.5% YoY
}

/**
 * Persisted property image record corresponding to the `property_images` table
 * in Supabase PostgreSQL and objects stored in Supabase Storage.
 * Never contains browser-local `blob:` URLs.
 */
export interface PersistedPropertyImage {
  id: string;
  propertyId: string;
  storagePath?: string;
  url: string;
  displayOrder: number;
  altText?: string;
  createdAt?: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  transaction: TransactionType;
  propertyType: PropertyType;
  price: number;
  currency: CurrencyCode;
  pricePeriod?: PricePeriod;
  location: string; // e.g. "Kololo", "Kira", "Naguru"
  district: string; // e.g. "Kampala", "Wakiso"
  address: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  landSizeDecimals?: number; // Standard Ugandan land decimal (100 decimals = 1 acre)
  buildingSizeSqm?: number;
  tenure?: LandTenure;
  furnished?: boolean;
  availability: PropertyAvailability;
  verificationStatus: VerificationStatus;
  listingStatus: ListingStatus;
  description: string;
  features: string[]; // e.g. ["Solar Backup", "Swimming Pool", "Water Reservoir", "Security Guards"]
  images: string[]; // Ordered permanent public URLs (never blob: URLs)
  propertyImages?: PersistedPropertyImage[]; // Rich persisted image metadata & ordering
  floorPlanUrl?: string;
  videoUrl?: string;
  advertiser: PropertyAdvertiser;
  verificationDetails: PropertyVerificationDetails;
  insights?: PropertyInsightsData;
  coordinates: {
    lat: number;
    lng: number;
  };
  featured?: boolean;
  dateAdded: string; // ISO 8601 date string (YYYY-MM-DD or full ISO timestamp)
  neighborhoodHighlights?: string[];
}

export interface ViewingRequest {
  id: string;
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
  preferredDate: string; // ISO date string YYYY-MM-DD
  preferredTime: string;
  message?: string;
  status: ViewingStatus;
  dateRequested: string; // ISO date string YYYY-MM-DD
  assignedAgentName?: string;
}

export interface Enquiry {
  id: string;
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
  date: string; // ISO date string YYYY-MM-DD
  status: EnquiryStatus;
  notes?: string;
  assignedRep?: string;
}

export interface TransactionRecord {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  agentName: string;
  transactionType: TransactionType;
  transactionValue: number;
  agreedCommissionPercent: number; // Display-only on client; authoritative calculation belongs on backend
  platformRevenue: number; // Display-only on client; authoritative calculation belongs on backend
  stage: TransactionStage;
  paymentStatus: PaymentStatus;
  dateInitiated: string;
  dateClosed?: string;
}

export interface FilterState {
  transaction: 'all' | 'buy' | 'rent';
  propertyType: 'all' | PropertyType;
  district?: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: 'any' | '1' | '2' | '3' | '4' | '5+';
  bathrooms: 'any' | '1+' | '2+' | '3+';
  features: string[];
  verification: 'all' | 'verified_only';
  sortBy: 'recommended' | 'newest' | 'price_asc' | 'price_desc';
}

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
  type: 'Owner' | 'Agent' | 'Developer';
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

export interface Property {
  id: string;
  slug: string;
  title: string;
  transaction: TransactionType;
  propertyType: PropertyType;
  price: number;
  currency: 'UGX' | 'USD';
  pricePeriod?: 'month' | 'year' | 'total';
  location: string; // e.g. "Kololo", "Kira", "Naguru"
  district: string; // e.g. "Kampala", "Wakiso"
  address: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  landSizeDecimals?: number; // Standard Ugandan land decimal (100 decimals = 1 acre)
  buildingSizeSqm?: number;
  tenure?: 'Mailo' | 'Freehold' | 'Leasehold' | 'Customary';
  furnished?: boolean;
  availability: 'Available' | 'Under Offer' | 'Sold' | 'Rented';
  verificationStatus: 'verified' | 'unverified' | 'pending';
  listingStatus: 'published' | 'pending' | 'draft';
  description: string;
  features: string[]; // e.g. ["Solar Backup", "Swimming Pool", "Water Reservoir", "Security Guards"]
  images: string[];
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
  dateAdded: string;
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
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  dateRequested: string;
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
  date: string;
  status: 'New' | 'Contacted' | 'Viewing Scheduled' | 'Offer Made' | 'Closed' | 'Lost';
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
  agreedCommissionPercent: number; // e.g. 3% for sale, 100% for rent
  platformRevenue: number;
  stage: 'Enquiry' | 'Contacted' | 'Viewing' | 'Negotiation' | 'Offer' | 'Closed';
  paymentStatus: 'Pending' | 'Invoiced' | 'Received';
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

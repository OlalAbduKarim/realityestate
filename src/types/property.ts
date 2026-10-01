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
  title?: string;
  createdAt: string;
}

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type ListingStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'published' 
  | 'suspended' 
  | 'rejected' 
  | 'sold' 
  | 'rented';

export interface PropertyAdvertiser {
  id: string;
  name: string;
  type: 'Owner' | 'Agent' | 'Developer';
  phone: string;
  whatsapp: string;
  email: string;
  verified: boolean;
  agencyName?: string;
  responseRate: string;
  experienceYears?: number;
}

export interface VerificationChecklist {
  advertiserVerified: boolean;
  locationConfirmed: boolean;
  priceConfirmed: boolean;
  availabilityConfirmed: boolean;
  verifiedDate?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface PropertyInsights {
  estimatedMonthlyRent?: number;
  grossRentalYield?: number;
  pricePerDecimal?: number;
  pricePerSqm?: number;
  capitalGrowthForecast?: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  transaction: TransactionType;
  propertyType: PropertyType;
  price: number;
  currency: 'UGX';
  pricePeriod?: 'month' | 'total';
  location: string;
  district: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  landSizeDecimals?: number;
  buildingSizeSqm?: number;
  tenure?: 'Mailo' | 'Freehold' | 'Leasehold' | 'Customary' | 'N/A';
  furnished: boolean;
  availability: 'Available' | 'Under Offer' | 'Sold' | 'Rented';
  verificationStatus: VerificationStatus;
  listingStatus: ListingStatus;
  description: string;
  features: string[];
  images: string[];
  floorPlanUrl?: string;
  videoUrl?: string;
  advertiser: PropertyAdvertiser;
  verificationDetails: VerificationChecklist;
  insights?: PropertyInsights;
  coordinates: {
    lat: number;
    lng: number;
  };
  featured: boolean;
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
  propertyPricePeriod?: 'month' | 'total';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Rescheduled' | 'Cancelled';
  dateRequested: string;
  assignedAgentName: string;
}

export interface Enquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyPrice: number;
  propertyLocation: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  date: string;
  status: 'New' | 'Contacted' | 'Viewing Scheduled' | 'Offer Made' | 'Closed' | 'Lost';
  assignedRep: string;
  notes?: string;
}

export interface TransactionRecord {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  transactionType: 'Sale' | 'Rent';
  transactionValue: number;
  agreedCommissionPercent: number;
  platformRevenue: number;
  paymentStatus: 'Invoiced' | 'Received' | 'Pending';
  stage: 'Enquiry' | 'Contacted' | 'Viewing' | 'Negotiation' | 'Offer' | 'Closed';
  date: string;
  agentName: string;
}

export interface FinancingEnquiry {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  employmentStatus: 'Employed' | 'Self-Employed' | 'Diaspora' | 'Business Owner';
  loanAmountUGX: number;
  preferredBank: string;
  tenureYears: number;
  status: 'Submitted' | 'In Review' | 'Forwarded to Partner';
  date: string;
}

export interface FilterState {
  transaction: 'all' | TransactionType;
  propertyType: 'all' | PropertyType;
  location: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  features: string[];
  verification: 'all' | 'verified_only';
  sortBy: 'recommended' | 'newest' | 'price_asc' | 'price_desc';
}

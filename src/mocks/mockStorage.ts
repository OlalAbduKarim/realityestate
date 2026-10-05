import {
  DEMO_USERS,
  INITIAL_ENQUIRIES,
  INITIAL_PROPERTIES,
  INITIAL_TRANSACTIONS,
  INITIAL_VIEWING_REQUESTS
} from '../data/mockProperties';
import {
  Enquiry,
  Property,
  TransactionRecord,
  User,
  ViewingRequest
} from '../types/property';
import { isValidPersistedImageUrl } from '../services/storageService';

/**
 * DEVELOPMENT / DEMO MOCK STORAGE ADAPTER
 *
 * Centralizes seed data access for offline Demo Mode when Supabase environment
 * variables are not configured.
 *
 * SECURITY & AUTHENTICATION GUARANTEES:
 * 1. Authentication state, user profiles, roles, passwords, access tokens, and
 *    refresh tokens are NEVER stored in application localStorage here.
 *    Supabase Auth (`supabase.auth`) and the PostgreSQL `profiles` table are the
 *    authoritative source of truth for authentication and user roles.
 * 2. Browser-local object URLs (`blob:...`) and base64 (`data:...`) strings are
 *    strictly stripped before writing demo properties so temporary file previews
 *    are never persisted as permanent property images.
 */

const STORAGE_KEYS = {
  THEME: 'reality_estates_theme',
  PROPERTIES: 'reality_estates_properties',
  SAVED_IDS: 'reality_estates_saved',
  VIEWINGS: 'reality_estates_viewings',
  ENQUIRIES: 'reality_estates_enquiries',
  TRANSACTIONS: 'reality_estates_transactions'
} as const;

const DEFAULT_SAVED_PROPERTY_IDS = ['prop-1'];

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or private-browsing storage errors in demo mode
  }
}

function sanitizePersistedProperty(property: Property): Property {
  const cleanImages = (property.images || []).filter((url) =>
    isValidPersistedImageUrl(url)
  );
  const cleanPropertyImages = property.propertyImages
    ? property.propertyImages
        .filter((img) => isValidPersistedImageUrl(img.url))
        .map((img, idx) => ({
          ...img,
          displayOrder: typeof img.displayOrder === 'number' ? img.displayOrder : idx
        }))
    : undefined;

  return {
    ...property,
    images: cleanImages,
    propertyImages: cleanPropertyImages
  };
}

export const mockStorage = {
  // Theme preference (UI appearance only)
  getTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEYS.THEME);
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch {
        return 'light';
      }
    }
    return 'light';
  },

  setTheme(theme: 'light' | 'dark'): void {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
      } catch {
        // Ignore
      }
    }
  },

  // Seeded Demo Personas (In-memory reference only for offline Demo Mode)
  getDemoUsers(): User[] {
    return DEMO_USERS.map((u) => ({ ...u }));
  },

  // Properties (never persists blob: or data: URLs)
  getProperties(): Property[] {
    const stored = safeReadJson<Property[] | null>(STORAGE_KEYS.PROPERTIES, null);
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map(sanitizePersistedProperty);
    }
    const sanitizedInitial = INITIAL_PROPERTIES.map(sanitizePersistedProperty);
    safeWriteJson(STORAGE_KEYS.PROPERTIES, sanitizedInitial);
    return sanitizedInitial;
  },

  setProperties(properties: Property[]): void {
    const sanitized = properties.map(sanitizePersistedProperty);
    safeWriteJson(STORAGE_KEYS.PROPERTIES, sanitized);
  },

  // Saved Property IDs
  getSavedPropertyIds(): string[] {
    const stored = safeReadJson<string[] | null>(STORAGE_KEYS.SAVED_IDS, null);
    if (Array.isArray(stored)) {
      return stored.map((id) => String(id));
    }
    safeWriteJson(STORAGE_KEYS.SAVED_IDS, DEFAULT_SAVED_PROPERTY_IDS);
    return [...DEFAULT_SAVED_PROPERTY_IDS];
  },

  setSavedPropertyIds(ids: string[]): void {
    safeWriteJson(STORAGE_KEYS.SAVED_IDS, ids);
  },

  // Viewing Requests
  getViewingRequests(): ViewingRequest[] {
    const stored = safeReadJson<ViewingRequest[] | null>(STORAGE_KEYS.VIEWINGS, null);
    if (Array.isArray(stored)) {
      return stored;
    }
    safeWriteJson(STORAGE_KEYS.VIEWINGS, INITIAL_VIEWING_REQUESTS);
    return INITIAL_VIEWING_REQUESTS;
  },

  setViewingRequests(requests: ViewingRequest[]): void {
    safeWriteJson(STORAGE_KEYS.VIEWINGS, requests);
  },

  // Enquiries
  getEnquiries(): Enquiry[] {
    const stored = safeReadJson<Enquiry[] | null>(STORAGE_KEYS.ENQUIRIES, null);
    if (Array.isArray(stored)) {
      return stored;
    }
    safeWriteJson(STORAGE_KEYS.ENQUIRIES, INITIAL_ENQUIRIES);
    return INITIAL_ENQUIRIES;
  },

  setEnquiries(enquiries: Enquiry[]): void {
    safeWriteJson(STORAGE_KEYS.ENQUIRIES, enquiries);
  },

  // Transactions
  getTransactions(): TransactionRecord[] {
    const stored = safeReadJson<TransactionRecord[] | null>(STORAGE_KEYS.TRANSACTIONS, null);
    if (Array.isArray(stored)) {
      return stored;
    }
    safeWriteJson(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    return INITIAL_TRANSACTIONS;
  },

  setTransactions(transactions: TransactionRecord[]): void {
    safeWriteJson(STORAGE_KEYS.TRANSACTIONS, transactions);
  }
};

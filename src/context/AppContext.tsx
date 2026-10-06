import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Property,
  PersistedPropertyImage,
  ViewingRequest,
  Enquiry,
  TransactionRecord,
  FilterState,
  PropertyVerificationDetails
} from '../types/property';
import {
  AuthSessionResponse,
  AuthStatus,
  CreateEnquiryInput,
  CreatePropertyInput,
  CreateViewingRequestInput,
  LoginInput,
  PublicRegistrableRole,
  ServiceError,
  UpdatePropertyInput
} from '../types/api';
import { authService } from '../services/authService';
import { propertyService } from '../services/propertyService';
import { savedPropertyService } from '../services/savedPropertyService';
import { enquiryService } from '../services/enquiryService';
import { viewingService } from '../services/viewingService';
import { transactionService } from '../services/transactionService';
import {
  getSupabaseConfigurationError,
  isSupabaseConfigured
} from '../lib/supabase';

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

export interface VerificationChecklistUpdate {
  advertiserVerified?: boolean;
  locationConfirmed?: boolean;
  priceConfirmed?: boolean;
  availabilityConfirmed?: boolean;
  publishListing?: boolean;
}

export interface AppContextType {
  // Centralized Authentication State & Actions
  authStatus: AuthStatus; // 'loading' | 'authenticated' | 'unauthenticated'
  currentUser: User | null;
  currentProfile: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  login: (input: LoginInput) => Promise<User>;
  registerUser: (
    name: string,
    phone: string,
    email: string,
    role?: User['role'],
    password?: string
  ) => Promise<AuthSessionResponse>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<User | null>;

  // Global loading, storage & error state
  isDataLoading: boolean;
  isUserDashboardLoading: boolean;
  isStorageConfigured: boolean;
  configurationError: string | null;
  serviceError: string | null;
  clearServiceError: () => void;
  refreshProperties: () => Promise<void>;

  // Auth modal
  isAuthModalOpen: boolean;
  authModalMessage: string;
  openAuthModal: (message?: string, onSuccessAction?: () => void) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, promptMessage?: string) => void;

  // Navigation & Routing
  currentPath: string;
  navigateTo: (path: string) => void;

  // Properties & Favorites
  properties: Property[];
  savedPropertyIds: string[];
  getPropertyById: (id: string) => Property | undefined;
  getPropertyBySlug: (slug: string) => Property | undefined;
  toggleSaveProperty: (propertyId: string) => Promise<void>;
  clearSavedProperties: () => Promise<void>;
  isPropertySaved: (propertyId: string) => boolean;
  createProperty: (input: CreatePropertyInput) => Promise<Property>;
  updateProperty: (id: string, input: UpdatePropertyInput) => Promise<Property>;
  addProperty: (property: Partial<Property>) => Promise<Property>;
  submitPropertyForVerification: (propertyId: string) => Promise<Property>;
  updatePropertyVerification: (
    propertyId: string,
    status: Property['verificationStatus'],
    notes?: string,
    checklist?: VerificationChecklistUpdate
  ) => Promise<Property>;

  // Property Image Operations (Service Layer)
  validatePropertyImageFile: (file: File) => void;
  uploadPropertyImages: (
    propertyId: string,
    files: File[],
    startOrder?: number,
    onFileProgress?: (fileIndex: number, progressPercent: number) => void
  ) => Promise<PersistedPropertyImage[]>;
  removePropertyImage: (
    propertyId: string,
    image: Pick<PersistedPropertyImage, 'id' | 'storagePath' | 'url'>
  ) => Promise<Property>;
  reorderPropertyImages: (
    propertyId: string,
    orderedImages: PersistedPropertyImage[]
  ) => Promise<Property>;

  // Theme (Dark / Light)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Viewings & Enquiries
  viewingRequests: ViewingRequest[];
  addViewingRequest: (
    req: CreateViewingRequestInput
  ) => Promise<ViewingRequest>;
  updateViewingStatus: (
    requestId: string,
    status: ViewingRequest['status']
  ) => Promise<ViewingRequest>;
  cancelViewingRequest: (requestId: string) => Promise<ViewingRequest>;

  enquiries: Enquiry[];
  addEnquiry: (enq: CreateEnquiryInput) => Promise<Enquiry>;
  updateEnquiryStatus: (
    enquiryId: string,
    status: Enquiry['status'],
    notes?: string
  ) => Promise<Enquiry>;

  // Transactions
  transactions: TransactionRecord[];
  updateTransactionStage: (
    txId: string,
    stage: TransactionRecord['stage']
  ) => Promise<TransactionRecord>;

  // Filters
  filters: FilterState;
  setFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Contact Agent Modal
  contactAgentProperty: Property | null;
  openContactAgentModal: (property: Property) => void;
  closeContactAgentModal: () => void;

  // Toast Notifications
  toasts: Toast[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  transaction: 'all',
  propertyType: 'all',
  district: 'All Districts',
  location: '',
  minPrice: 0,
  maxPrice: 3000000000,
  bedrooms: 'any',
  bathrooms: 'any',
  features: [],
  verification: 'all',
  sortBy: 'recommended'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ServiceError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state (initialized from system preference)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPath(hash || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = useCallback((path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isStorageConfigured = isSupabaseConfigured();
  const configurationError = getSupabaseConfigurationError();

  // Centralized Authentication State
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() =>
    isStorageConfigured ? 'loading' : 'unauthenticated'
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Domain Data State (strictly sourced from Supabase — never initialized with fake/mock data)
  const [isDataLoading, setIsDataLoading] = useState<boolean>(isStorageConfigured);
  const [isUserDashboardLoading, setIsUserDashboardLoading] = useState<boolean>(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  // Auth Modal State & Post-Login Continuation Callback
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const pendingAuthActionRef = React.useRef<(() => void) | null>(null);

  // Contact Agent Modal State
  const [contactAgentProperty, setContactAgentProperty] = useState<Property | null>(null);

  // Filters State
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);

  // Toasts State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (text: string, type: 'success' | 'info' | 'error' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearServiceError = useCallback(() => {
    setServiceError(null);
  }, []);

  const openAuthModal = useCallback(
    (message = 'Create an account or sign in to continue.', onSuccessAction?: () => void) => {
      setAuthError(null);
      setAuthModalMessage(message);
      pendingAuthActionRef.current = onSuccessAction || null;
      setIsAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalMessage('');
    setAuthError(null);
    pendingAuthActionRef.current = null;
  }, []);

  const requireAuth = useCallback(
    (
      action: () => void,
      promptMessage = 'Create an account or sign in to continue.'
    ) => {
      if (authStatus === 'authenticated' && currentUser) {
        action();
        return;
      }
      openAuthModal(promptMessage, action);
    },
    [authStatus, currentUser, openAuthModal]
  );

  /**
   * Loads user-scoped protected data (saved properties, enquiries, viewing requests, transactions)
   * when an authenticated user is present, or clears user-scoped data on sign-out.
   */
  const syncUserScopedData = useCallback(async (user: User | null) => {
    if (!user || !isSupabaseConfigured()) {
      setSavedPropertyIds([]);
      setViewingRequests([]);
      setEnquiries([]);
      setTransactions([]);
      return;
    }

    setIsUserDashboardLoading(true);
    try {
      const [loadedSavedIds, loadedViewings, loadedEnquiries, loadedTransactions] =
        await Promise.all([
          savedPropertyService.getSavedPropertyIds(user.id).catch(() => []),
          viewingService.getViewingRequests(user.id).catch(() => []),
          enquiryService.getEnquiries(user.id).catch(() => []),
          transactionService.getTransactions().catch(() => [])
        ]);

      setSavedPropertyIds(loadedSavedIds);
      setViewingRequests(loadedViewings);
      setEnquiries(loadedEnquiries);
      setTransactions(loadedTransactions);
    } finally {
      setIsUserDashboardLoading(false);
    }
  }, []);

  /**
   * Fetches the property catalogue from Supabase PostgreSQL.
   */
  const refreshProperties = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    setServiceError(null);
    try {
      const loadedProperties = await propertyService.getProperties();
      setProperties(loadedProperties);
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Unable to load properties. Please refresh the page.'
      );
      setServiceError(msg);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Initial session restoration + real-time auth state listener + initial property fetch
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthStatus('unauthenticated');
      setIsDataLoading(false);
      return;
    }

    let isMounted = true;

    const initializeAppAndAuth = async () => {
      setIsDataLoading(true);
      setAuthStatus('loading');

      // 1. Load public properties from Supabase in parallel with session restoration
      const propertiesPromise = propertyService
        .getProperties()
        .then((loadedProps) => {
          if (isMounted) {
            setProperties(loadedProps);
            setServiceError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setServiceError(
              extractErrorMessage(
                err,
                'Unable to load properties. Please refresh the page.'
              )
            );
          }
        });

      // 2. Restore authenticated session & profile from Supabase Auth
      try {
        const restoredProfile = await authService.getCurrentProfile();
        if (!isMounted) return;

        if (restoredProfile) {
          setCurrentUser(restoredProfile);
          setAuthStatus('authenticated');
          await syncUserScopedData(restoredProfile);
        } else {
          setCurrentUser(null);
          setAuthStatus('unauthenticated');
          await syncUserScopedData(null);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
          setAuthStatus('unauthenticated');
        }
      } finally {
        await propertiesPromise;
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    };

    void initializeAppAndAuth();

    // 3. Subscribe to Supabase Auth state changes
    const unsubscribe = authService.onAuthStateChange((event, user) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !user) {
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        void syncUserScopedData(null);
        return;
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED' ||
        event === 'INITIAL_SESSION'
      ) {
        setCurrentUser(user);
        setAuthStatus('authenticated');
        void syncUserScopedData(user);
        void propertyService
          .getProperties()
          .then((loaded) => {
            if (isMounted) setProperties(loaded);
          })
          .catch(() => {});
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [syncUserScopedData]);

  // Property Lookups & Mutations
  const getPropertyById = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties]
  );

  const getPropertyBySlug = useCallback(
    (slug: string) => properties.find((p) => p.slug === slug),
    [properties]
  );

  const toggleSaveProperty = useCallback(
    async (propertyId: string) => {
      if (authStatus !== 'authenticated' || !currentUser) {
        openAuthModal('Create an account or sign in to continue.', () => {
          void toggleSaveProperty(propertyId);
        });
        return;
      }

      try {
        const result = await savedPropertyService.toggleSavedProperty(
          propertyId,
          currentUser.id
        );
        setSavedPropertyIds(result.savedIds);
        showToast(
          result.isSaved
            ? 'Property saved to your shortlist'
            : 'Property removed from saved list',
          result.isSaved ? 'success' : 'info'
        );
      } catch (err) {
        const msg = extractErrorMessage(err, 'Unable to update saved properties.');
        showToast(msg, 'error');
      }
    },
    [authStatus, currentUser, openAuthModal, showToast]
  );

  const clearSavedProperties = useCallback(async () => {
    if (authStatus !== 'authenticated' || !currentUser) {
      openAuthModal('Create an account or sign in to continue.');
      return;
    }

    try {
      const next = await savedPropertyService.clearSavedProperties(currentUser.id);
      setSavedPropertyIds(next);
      showToast('Cleared all saved properties', 'info');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Unable to clear saved properties.');
      showToast(msg, 'error');
    }
  }, [authStatus, currentUser, openAuthModal, showToast]);

  const isPropertySaved = useCallback(
    (propertyId: string) => savedPropertyIds.includes(propertyId),
    [savedPropertyIds]
  );

  const createProperty = useCallback(
    async (input: CreatePropertyInput): Promise<Property> => {
      if (authStatus !== 'authenticated' || !currentUser) {
        openAuthModal('Create an account or sign in to continue.');
        throw new ServiceError(
          'Please sign in to continue.',
          'UNAUTHORIZED',
          401
        );
      }

      try {
        setServiceError(null);
        const created = await propertyService.createProperty(input, currentUser);
        setProperties((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        return created;
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          'Unable to save this property. Please try again.'
        );
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [authStatus, currentUser, openAuthModal, showToast]
  );

  const updateProperty = useCallback(
    async (id: string, input: UpdatePropertyInput): Promise<Property> => {
      if (authStatus !== 'authenticated' || !currentUser) {
        openAuthModal('Create an account or sign in to continue.');
        throw new ServiceError(
          'Please sign in to continue.',
          'UNAUTHORIZED',
          401
        );
      }

      try {
        setServiceError(null);
        const updated = await propertyService.updateProperty(id, input);
        setProperties((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          'Unable to save this property. Please try again.'
        );
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [authStatus, currentUser, openAuthModal, showToast]
  );

  const validatePropertyImageFile = useCallback((file: File): void => {
    propertyService.validatePropertyImageFile(file);
  }, []);

  const uploadPropertyImages = useCallback(
    async (
      propertyId: string,
      files: File[],
      startOrder?: number,
      onFileProgress?: (fileIndex: number, progressPercent: number) => void
    ): Promise<PersistedPropertyImage[]> => {
      try {
        setServiceError(null);
        const uploadedRecords = await propertyService.uploadPropertyImages(
          propertyId,
          files,
          startOrder,
          onFileProgress
        );
        const refreshedProperty = await propertyService.getPropertyById(propertyId);
        if (refreshedProperty) {
          setProperties((prev) =>
            prev.some((p) => p.id === propertyId)
              ? prev.map((p) => (p.id === propertyId ? refreshedProperty : p))
              : [refreshedProperty, ...prev]
          );
        }
        return uploadedRecords;
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          'Unable to upload property images. Please try again.'
        );
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const removePropertyImage = useCallback(
    async (
      propertyId: string,
      image: Pick<PersistedPropertyImage, 'id' | 'storagePath' | 'url'>
    ): Promise<Property> => {
      try {
        setServiceError(null);
        const updated = await propertyService.removePropertyImage(propertyId, image);
        setProperties((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          'Unable to remove the property image. Please try again.'
        );
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const reorderPropertyImages = useCallback(
    async (
      propertyId: string,
      orderedImages: PersistedPropertyImage[]
    ): Promise<Property> => {
      try {
        setServiceError(null);
        const updated = await propertyService.reorderPropertyImages(
          propertyId,
          orderedImages
        );
        setProperties((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          'Unable to reorder property images. Please try again.'
        );
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const addProperty = useCallback(
    async (newProp: Partial<Property>): Promise<Property> => {
      const input: CreatePropertyInput = {
        title: newProp.title || 'Untitled Property',
        transaction: newProp.transaction || 'buy',
        propertyType: newProp.propertyType || 'House',
        price: Number(newProp.price) || 0,
        currency: newProp.currency || 'UGX',
        pricePeriod: newProp.pricePeriod,
        location: newProp.location || 'Kampala',
        district: newProp.district || 'Kampala',
        address:
          newProp.address ||
          `${newProp.location || 'Kampala'}, ${newProp.district || 'Kampala'}`,
        bedrooms: newProp.bedrooms ?? 0,
        bathrooms: newProp.bathrooms ?? 0,
        parking: newProp.parking ?? 0,
        landSizeDecimals: newProp.landSizeDecimals,
        buildingSizeSqm: newProp.buildingSizeSqm,
        tenure: newProp.tenure,
        furnished: newProp.furnished,
        description: newProp.description || '',
        features: newProp.features || [],
        images: newProp.images || [],
        floorPlanUrl: newProp.floorPlanUrl,
        videoUrl: newProp.videoUrl,
        coordinates: newProp.coordinates || { lat: 0.3136, lng: 32.5811 },
        neighborhoodHighlights: newProp.neighborhoodHighlights,
        listingStatus: newProp.listingStatus === 'draft' ? 'draft' : 'pending',
        advertiser: {
          name:
            newProp.advertiser?.name ||
            currentUser?.name ||
            'Property Representative',
          type: newProp.advertiser?.type || 'Owner',
          phone:
            newProp.advertiser?.phone || currentUser?.phone || '',
          whatsapp:
            newProp.advertiser?.whatsapp ||
            newProp.advertiser?.phone ||
            currentUser?.phone ||
            '',
          email:
            newProp.advertiser?.email || currentUser?.email || '',
          agencyName: newProp.advertiser?.agencyName || currentUser?.company
        }
      };

      return createProperty(input);
    },
    [createProperty, currentUser]
  );

  const submitPropertyForVerification = useCallback(
    async (propertyId: string): Promise<Property> => {
      if (authStatus !== 'authenticated' || !currentUser) {
        openAuthModal('Create an account or sign in to continue.');
        throw new ServiceError(
          'Please sign in to continue.',
          'UNAUTHORIZED',
          401
        );
      }

      try {
        setServiceError(null);
        const updated = await propertyService.submitPropertyForVerification(
          propertyId
        );
        setProperties((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        showToast(
          'Listing submitted to Reality Estates Verification Desk for review.',
          'success'
        );
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          'Unable to submit listing for verification.'
        );
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [authStatus, currentUser, openAuthModal, showToast]
  );

  const updatePropertyVerification = useCallback(
    async (
      propertyId: string,
      status: Property['verificationStatus'],
      notes?: string,
      checklist?: VerificationChecklistUpdate
    ): Promise<Property> => {
      if (
        authStatus !== 'authenticated' ||
        !currentUser ||
        currentUser.role !== 'admin'
      ) {
        throw new ServiceError(
          'Only authorized Admin accounts can modify property verification status.',
          'FORBIDDEN',
          403
        );
      }

      try {
        setServiceError(null);
        const updated = await propertyService.updatePropertyVerification({
          propertyId,
          verificationStatus: status,
          notes,
          advertiserVerified: checklist?.advertiserVerified,
          locationConfirmed: checklist?.locationConfirmed,
          priceConfirmed: checklist?.priceConfirmed,
          availabilityConfirmed: checklist?.availabilityConfirmed,
          publishListing: checklist?.publishListing
        });
        setProperties((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        showToast(`Property verification status updated to ${status}`, 'success');
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          'Unable to update property verification.'
        );
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [authStatus, currentUser, showToast]
  );

  // Viewing Requests
  const addViewingRequest = useCallback(
    async (req: CreateViewingRequestInput): Promise<ViewingRequest> => {
      if (authStatus !== 'authenticated' || !currentUser) {
        openAuthModal('Create an account or sign in to continue.');
        throw new ServiceError(
          'Create an account or sign in to continue.',
          'UNAUTHORIZED',
          401
        );
      }

      try {
        setServiceError(null);
        const created = await viewingService.createViewingRequest(req);
        setViewingRequests((prev) => [created, ...prev]);
        showToast(
          'Viewing request submitted. The property representative will confirm shortly.',
          'success'
        );
        return created;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Unable to submit viewing request.');
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [authStatus, currentUser, openAuthModal, showToast]
  );

  const updateViewingStatus = useCallback(
    async (
      requestId: string,
      status: ViewingRequest['status']
    ): Promise<ViewingRequest> => {
      try {
        setServiceError(null);
        const updated = await viewingService.updateViewingRequestStatus({
          requestId,
          status
        });
        setViewingRequests((prev) =>
          prev.map((v) => (v.id === updated.id ? updated : v))
        );
        showToast(`Viewing status updated to ${status}`, 'info');
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Unable to update viewing status.');
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  const cancelViewingRequest = useCallback(
    async (requestId: string): Promise<ViewingRequest> => {
      return updateViewingStatus(requestId, 'Cancelled');
    },
    [updateViewingStatus]
  );

  // Enquiries
  const addEnquiry = useCallback(
    async (enq: CreateEnquiryInput): Promise<Enquiry> => {
      if (authStatus !== 'authenticated' || !currentUser) {
        openAuthModal('Create an account or sign in to continue.');
        throw new ServiceError(
          'Create an account or sign in to continue.',
          'UNAUTHORIZED',
          401
        );
      }

      try {
        setServiceError(null);
        const created = await enquiryService.createEnquiry(enq);
        setEnquiries((prev) => [created, ...prev]);
        showToast(
          'Enquiry sent directly to the property representative!',
          'success'
        );
        return created;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Unable to send enquiry.');
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [authStatus, currentUser, openAuthModal, showToast]
  );

  const updateEnquiryStatus = useCallback(
    async (
      enquiryId: string,
      status: Enquiry['status'],
      notes?: string
    ): Promise<Enquiry> => {
      try {
        setServiceError(null);
        const updated = await enquiryService.updateEnquiryStatus({
          enquiryId,
          status,
          notes
        });
        setEnquiries((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        );
        showToast(`Enquiry marked as ${status}`, 'info');
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Unable to update enquiry status.');
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  // Transactions
  const updateTransactionStage = useCallback(
    async (
      txId: string,
      stage: TransactionRecord['stage']
    ): Promise<TransactionRecord> => {
      try {
        setServiceError(null);
        const updated = await transactionService.updateTransactionStage({
          transactionId: txId,
          stage
        });
        setTransactions((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        showToast(`Transaction moved to ${stage} stage`, 'success');
        return updated;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Unable to update transaction stage.');
        setServiceError(msg);
        showToast(msg, 'error');
        throw err;
      }
    },
    [showToast]
  );

  // Filters
  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Contact Agent Modal (Protected Action)
  const openContactAgentModal = useCallback(
    (property: Property) => {
      if (authStatus !== 'authenticated' || !currentUser) {
        openAuthModal('Create an account or sign in to continue.', () => {
          setContactAgentProperty(property);
        });
        return;
      }
      setContactAgentProperty(property);
    },
    [authStatus, currentUser, openAuthModal]
  );

  const closeContactAgentModal = useCallback(() => {
    setContactAgentProperty(null);
  }, []);

  // Authentication Actions
  const refreshCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const profile = await authService.getCurrentProfile();
      if (profile) {
        setCurrentUser(profile);
        setAuthStatus('authenticated');
        await syncUserScopedData(profile);
      } else {
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        await syncUserScopedData(null);
      }
      return profile;
    } catch {
      return null;
    }
  }, [syncUserScopedData]);

  const login = useCallback(
    async (input: LoginInput): Promise<User> => {
      try {
        setAuthError(null);
        setServiceError(null);
        const session = await authService.signIn(input);
        setCurrentUser(session.user);
        setAuthStatus('authenticated');
        await syncUserScopedData(session.user);
        showToast(`Welcome back, ${session.user.name}!`, 'success');

        const pendingAction = pendingAuthActionRef.current;
        pendingAuthActionRef.current = null;
        if (pendingAction) {
          setTimeout(() => pendingAction(), 50);
        }

        return session.user;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Unable to sign in.');
        setAuthError(msg);
        setServiceError(msg);
        throw err;
      }
    },
    [showToast, syncUserScopedData]
  );

  const registerUser = useCallback(
    async (
      name: string,
      phone: string,
      email: string,
      role: User['role'] = 'buyer',
      password?: string
    ): Promise<AuthSessionResponse> => {
      if (role === 'admin') {
        const forbiddenMsg =
          'Public registration cannot create an Admin account. Please select Buyer, Owner, Agent, or Developer.';
        setAuthError(forbiddenMsg);
        showToast(forbiddenMsg, 'error');
        throw new ServiceError(forbiddenMsg, 'FORBIDDEN', 403);
      }

      const publicRole: PublicRegistrableRole = role;

      try {
        setAuthError(null);
        setServiceError(null);
        const session = await authService.signUp({
          name,
          phone,
          email,
          role: publicRole,
          password
        });

        if (session.requiresEmailConfirmation) {
          showToast(
            `Account created for ${email}. Please check your email inbox to confirm your address before signing in.`,
            'info'
          );
          return session;
        }

        setCurrentUser(session.user);
        setAuthStatus('authenticated');
        await syncUserScopedData(session.user);
        showToast(
          `Welcome to Reality Estates, ${session.user.name}!`,
          'success'
        );

        const pendingAction = pendingAuthActionRef.current;
        pendingAuthActionRef.current = null;
        if (pendingAction) {
          setTimeout(() => pendingAction(), 50);
        }

        return session;
      } catch (err) {
        const msg = extractErrorMessage(err, 'Unable to register account.');
        setAuthError(msg);
        setServiceError(msg);
        throw err;
      }
    },
    [showToast, syncUserScopedData]
  );

  const requestPasswordReset = useCallback(
    async (email: string): Promise<void> => {
      try {
        setAuthError(null);
        await authService.requestPasswordReset(email);
        showToast(
          `Password reset instructions have been sent to ${email}.`,
          'success'
        );
      } catch (err) {
        const msg = extractErrorMessage(
          err,
          'Unable to send password reset instructions.'
        );
        setAuthError(msg);
        throw err;
      }
    },
    [showToast]
  );

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setAuthStatus('unauthenticated');
      await syncUserScopedData(null);
      showToast('You have signed out of your account.', 'info');
      if (
        currentPath === '/admin' ||
        currentPath === '/dashboard' ||
        currentPath === '/list-property' ||
        currentPath.startsWith('/edit-property/')
      ) {
        navigateTo('/');
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Unable to sign out.');
      showToast(msg, 'error');
    }
  }, [currentPath, navigateTo, showToast, syncUserScopedData]);

  return (
    <AppContext.Provider
      value={{
        authStatus,
        currentUser,
        currentProfile: currentUser,
        isAuthenticated: authStatus === 'authenticated' && Boolean(currentUser),
        isAuthLoading: authStatus === 'loading',
        authError,
        login,
        registerUser,
        requestPasswordReset,
        logout,
        refreshCurrentUser,
        isDataLoading,
        isUserDashboardLoading,
        isStorageConfigured,
        configurationError,
        serviceError,
        clearServiceError,
        refreshProperties,
        isAuthModalOpen,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        currentPath,
        navigateTo,
        properties,
        savedPropertyIds,
        getPropertyById,
        getPropertyBySlug,
        toggleSaveProperty,
        clearSavedProperties,
        isPropertySaved,
        createProperty,
        updateProperty,
        addProperty,
        submitPropertyForVerification,
        updatePropertyVerification,
        validatePropertyImageFile,
        uploadPropertyImages,
        removePropertyImage,
        reorderPropertyImages,
        theme,
        toggleTheme,
        viewingRequests,
        addViewingRequest,
        updateViewingStatus,
        cancelViewingRequest,
        enquiries,
        addEnquiry,
        updateEnquiryStatus,
        transactions,
        updateTransactionStage,
        filters,
        setFilters,
        resetFilters,
        contactAgentProperty,
        openContactAgentModal,
        closeContactAgentModal,
        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

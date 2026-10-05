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
import { isSupabaseConfigured } from '../lib/supabase';
import { mockStorage } from '../mocks/mockStorage';

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
  isDemoMode: boolean;
  authError: string | null;
  demoUsers: User[];
  login: (input: LoginInput) => Promise<User>;
  loginAs: (user: User) => Promise<void>;
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
  isStorageConfigured: boolean;
  serviceError: string | null;
  clearServiceError: () => void;

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

  // Toast notifications
  toasts: Toast[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

export const DEFAULT_FILTERS: FilterState = {
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

function extractErrorMessage(err: unknown, fallbackMessage: string): string {
  if (err instanceof ServiceError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallbackMessage;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state (UI preference only)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => mockStorage.getTheme());

  useEffect(() => {
    mockStorage.setTheme(theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (text: string, type: 'success' | 'info' | 'error' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, text, type }]);
      setTimeout(() => {
        dismissToast(id);
      }, 4500);
    },
    [dismissToast]
  );

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
      return next;
    });
  };

  // Centralized Authentication State
  // Starts as 'loading' with currentUser = null (NEVER initialized from localStorage)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const isStorageConfigured = isSupabaseConfigured();
  const isDemoMode = !isStorageConfigured;
  const demoUsers = authService.getDemoUsers();

  const clearServiceError = useCallback(() => {
    setServiceError(null);
    setAuthError(null);
  }, []);

  // Domain state
  const [properties, setProperties] = useState<Property[]>(() => mockStorage.getProperties());
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>(() =>
    mockStorage.getViewingRequests()
  );
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => mockStorage.getEnquiries());
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() =>
    mockStorage.getTransactions()
  );

  // Restore initial Supabase Auth session and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    const initializeAppState = async () => {
      setAuthStatus('loading');
      setIsDataLoading(true);
      try {
        const [
          restoredProfile,
          loadedProps,
          loadedViewings,
          loadedEnquiries,
          loadedTxs
        ] = await Promise.all([
          authService.getCurrentProfile(),
          propertyService.getProperties({ includeUnpublished: true }),
          viewingService.getViewingRequests(),
          enquiryService.getEnquiries(),
          transactionService.getTransactions()
        ]);

        if (!isMounted) return;

        setCurrentUser(restoredProfile);
        setAuthStatus(restoredProfile ? 'authenticated' : 'unauthenticated');
        setProperties(loadedProps);
        setViewingRequests(loadedViewings);
        setEnquiries(loadedEnquiries);
        setTransactions(loadedTxs);

        if (restoredProfile) {
          const loadedSavedIds = await savedPropertyService.getSavedPropertyIds(
            restoredProfile.id
          );
          if (isMounted) {
            setSavedPropertyIds(loadedSavedIds);
          }
        } else {
          setSavedPropertyIds([]);
        }
      } catch (err) {
        if (!isMounted) return;
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        const msg = extractErrorMessage(err, 'Failed to initialize application data.');
        setServiceError(msg);
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    };

    void initializeAppState();

    // Subscribe to Supabase Auth state transitions (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED)
    const unsubscribeAuth = authService.onAuthStateChange((event, profile) => {
      if (!isMounted) return;
      if (profile) {
        setCurrentUser(profile);
        setAuthStatus('authenticated');
        void savedPropertyService
          .getSavedPropertyIds(profile.id)
          .then((ids) => {
            if (isMounted) setSavedPropertyIds(ids);
          })
          .catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        setSavedPropertyIds([]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState(
    'Create a free account or sign in to contact this property representative and request a viewing.'
  );
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  // Path routing
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auth Modal triggers
  const openAuthModal = (message?: string, onSuccessAction?: () => void) => {
    setAuthError(null);
    if (message) setAuthModalMessage(message);
    if (onSuccessAction) setPendingAuthAction(() => onSuccessAction);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setPendingAuthAction(null);
  };

  const requireAuth = (action: () => void, promptMessage?: string) => {
    if (currentUser) {
      action();
    } else {
      openAuthModal(
        promptMessage || 'Please sign in to your Reality Estates account to continue.',
        action
      );
    }
  };

  // Property Lookup Helpers
  const getPropertyById = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties]
  );

  const getPropertyBySlug = useCallback(
    (slug: string) => properties.find((p) => p.slug === slug || p.id === slug),
    [properties]
  );

  // Protected Action: Saved Properties
  const performToggleSaveProperty = async (propertyId: string, userId: string) => {
    try {
      const { savedIds, isSaved } = await savedPropertyService.toggleSavedProperty(
        propertyId,
        userId
      );
      setSavedPropertyIds(savedIds);
      if (isSaved) {
        showToast('Property added to saved listings', 'success');
      } else {
        showToast('Property removed from saved listings', 'info');
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not update saved properties.');
      setServiceError(msg);
      showToast(msg, 'error');
    }
  };

  const toggleSaveProperty = async (propertyId: string) => {
    if (!currentUser) {
      openAuthModal('Sign in to save properties to your personal shortlist.');
      return;
    }
    await performToggleSaveProperty(propertyId, currentUser.id);
  };

  const clearSavedProperties = async () => {
    if (!currentUser) {
      openAuthModal('Sign in to manage your saved properties.');
      return;
    }
    try {
      const cleared = await savedPropertyService.clearSavedProperties(currentUser.id);
      setSavedPropertyIds(cleared);
      showToast('All saved properties cleared', 'info');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not clear saved properties.');
      setServiceError(msg);
      showToast(msg, 'error');
    }
  };

  const isPropertySaved = (propertyId: string) =>
    Boolean(currentUser) && savedPropertyIds.includes(propertyId);

  // Protected Action: Viewing Requests
  const addViewingRequest = async (
    req: CreateViewingRequestInput
  ): Promise<ViewingRequest> => {
    if (!currentUser) {
      openAuthModal('Sign in to schedule an on-site or virtual property viewing.');
      throw new ServiceError(
        'Please sign in to schedule a property viewing.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const created = await viewingService.createViewingRequest(req);
      setViewingRequests((prev) => [created, ...prev]);
      showToast(
        'Viewing request submitted successfully! Representative notified.',
        'success'
      );
      return created;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not submit viewing request.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateViewingStatus = async (
    requestId: string,
    status: ViewingRequest['status']
  ): Promise<ViewingRequest> => {
    if (!currentUser) {
      throw new ServiceError(
        'Please sign in to update viewing status.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const updated = await viewingService.updateViewingRequestStatus({
        requestId,
        status
      });
      setViewingRequests((prev) => prev.map((v) => (v.id === requestId ? updated : v)));
      showToast(`Viewing request status updated to: ${status}`, 'info');
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not update viewing status.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const cancelViewingRequest = async (requestId: string): Promise<ViewingRequest> => {
    return updateViewingStatus(requestId, 'Cancelled');
  };

  // Protected Action: Enquiries
  const addEnquiry = async (enq: CreateEnquiryInput): Promise<Enquiry> => {
    if (!currentUser) {
      openAuthModal(
        'Sign in to send an enquiry and connect directly with the property representative.'
      );
      throw new ServiceError(
        'Please sign in to submit an enquiry.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const created = await enquiryService.createEnquiry(enq);
      setEnquiries((prev) => [created, ...prev]);
      showToast('Enquiry sent directly to property representative.', 'success');
      return created;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not send enquiry.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateEnquiryStatus = async (
    enquiryId: string,
    status: Enquiry['status'],
    notes?: string
  ): Promise<Enquiry> => {
    if (!currentUser) {
      throw new ServiceError(
        'Please sign in to update enquiry status.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const updated = await enquiryService.updateEnquiryStatus({
        enquiryId,
        status,
        notes
      });
      setEnquiries((prev) => prev.map((e) => (e.id === enquiryId ? updated : e)));
      showToast(`Enquiry updated to: ${status}`, 'info');
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not update enquiry status.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  // Protected Action: Transactions
  const updateTransactionStage = async (
    txId: string,
    stage: TransactionRecord['stage']
  ): Promise<TransactionRecord> => {
    if (!currentUser) {
      throw new ServiceError(
        'Authentication is required to manage transactions.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const updated = await transactionService.updateTransactionStage({
        transactionId: txId,
        stage
      });
      setTransactions((prev) => prev.map((t) => (t.id === txId ? updated : t)));
      showToast(`Transaction advanced to: ${stage}`, 'success');
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not update transaction stage.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  // Protected Action: Advertiser Property Management & Admin Verification
  const createProperty = async (input: CreatePropertyInput): Promise<Property> => {
    if (!currentUser) {
      openAuthModal('Sign in to list and manage properties on Reality Estates.');
      throw new ServiceError(
        'Please sign in before creating a property listing.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const newProperty = await propertyService.createProperty(input, currentUser);
      setProperties((prev) => [
        newProperty,
        ...prev.filter((p) => p.id !== newProperty.id)
      ]);
      if (newProperty.listingStatus === 'draft') {
        showToast('Draft listing saved! You can submit it for verification when ready.', 'info');
      } else {
        showToast(
          'Listing submitted! Sent to verification queue for on-site inspection.',
          'success'
        );
      }
      return newProperty;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to create property listing.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateProperty = async (
    id: string,
    input: UpdatePropertyInput
  ): Promise<Property> => {
    if (!currentUser) {
      openAuthModal('Sign in to edit your property listing.');
      throw new ServiceError(
        'Please sign in before editing a property listing.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const updated = await propertyService.updateProperty(id, input);
      setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Property listing updated successfully.', 'success');
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to update property listing.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const addProperty = async (newPropData: Partial<Property>): Promise<Property> => {
    const requestedListingStatus: 'draft' | 'pending' =
      newPropData.listingStatus === 'draft' ? 'draft' : 'pending';

    return createProperty({
      title: newPropData.title || 'Newly Listed Ugandan Property',
      transaction: newPropData.transaction || 'buy',
      propertyType: newPropData.propertyType || 'House',
      price: newPropData.price || 500000000,
      currency: newPropData.currency || 'UGX',
      pricePeriod: newPropData.pricePeriod,
      location: newPropData.location || 'Kira',
      district: newPropData.district || 'Wakiso',
      address: newPropData.address,
      bedrooms: newPropData.bedrooms,
      bathrooms: newPropData.bathrooms,
      parking: newPropData.parking,
      landSizeDecimals: newPropData.landSizeDecimals,
      buildingSizeSqm: newPropData.buildingSizeSqm,
      tenure: newPropData.tenure,
      furnished: newPropData.furnished,
      description: newPropData.description,
      features: newPropData.features,
      images: newPropData.images,
      propertyImages: newPropData.propertyImages,
      floorPlanUrl: newPropData.floorPlanUrl,
      videoUrl: newPropData.videoUrl,
      coordinates: newPropData.coordinates,
      advertiser: newPropData.advertiser,
      listingStatus: requestedListingStatus,
      neighborhoodHighlights: newPropData.neighborhoodHighlights
    });
  };

  const submitPropertyForVerification = async (propertyId: string): Promise<Property> => {
    if (!currentUser) {
      throw new ServiceError(
        'Please sign in to submit a property for verification.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const updated = await propertyService.submitPropertyForVerification(propertyId);
      setProperties((prev) => prev.map((p) => (p.id === propertyId ? updated : p)));
      showToast('Draft submitted to the Pearl Prime verification queue.', 'success');
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not submit property for verification.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const updatePropertyVerification = async (
    propertyId: string,
    status: Property['verificationStatus'],
    notes?: string,
    checklist?: VerificationChecklistUpdate
  ): Promise<Property> => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ServiceError(
        'Only authorized administrators can update property verification status.',
        'FORBIDDEN',
        403
      );
    }
    try {
      setServiceError(null);
      const checklistPayload:
        | Partial<
            Pick<
              PropertyVerificationDetails,
              'advertiserVerified' | 'locationConfirmed' | 'priceConfirmed' | 'availabilityConfirmed'
            >
          >
        | undefined = checklist
        ? {
            advertiserVerified: checklist.advertiserVerified,
            locationConfirmed: checklist.locationConfirmed,
            priceConfirmed: checklist.priceConfirmed,
            availabilityConfirmed: checklist.availabilityConfirmed
          }
        : undefined;

      const updated = await propertyService.updatePropertyVerification({
        propertyId,
        status,
        notes,
        checklist: checklistPayload,
        publishListing: checklist?.publishListing
      });
      setProperties((prev) => prev.map((p) => (p.id === propertyId ? updated : p)));
      showToast(`Property verification status updated to: ${status}`, 'success');
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not update property verification.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  // Property Image Service Actions
  const validatePropertyImageFile = (file: File): void => {
    propertyService.validatePropertyImageFile(file);
  };

  const uploadPropertyImages = async (
    propertyId: string,
    files: File[],
    startOrder?: number,
    onFileProgress?: (fileIndex: number, progressPercent: number) => void
  ): Promise<PersistedPropertyImage[]> => {
    if (!currentUser) {
      throw new ServiceError(
        'Please sign in before uploading property images.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const uploaded = await propertyService.uploadPropertyImages(
        propertyId,
        files,
        startOrder,
        onFileProgress
      );
      const refreshed = await propertyService.getPropertyById(propertyId);
      if (refreshed) {
        setProperties((prev) => prev.map((p) => (p.id === propertyId ? refreshed : p)));
      }
      return uploaded;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not upload property image(s).');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const removePropertyImage = async (
    propertyId: string,
    image: Pick<PersistedPropertyImage, 'id' | 'storagePath' | 'url'>
  ): Promise<Property> => {
    if (!currentUser) {
      throw new ServiceError(
        'Please sign in before removing property images.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const updated = await propertyService.removePropertyImage(propertyId, image);
      setProperties((prev) => prev.map((p) => (p.id === propertyId ? updated : p)));
      showToast('Property photograph removed.', 'info');
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not remove property photograph.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const reorderPropertyImages = async (
    propertyId: string,
    orderedImages: PersistedPropertyImage[]
  ): Promise<Property> => {
    if (!currentUser) {
      throw new ServiceError(
        'Please sign in before reordering property images.',
        'UNAUTHORIZED',
        401
      );
    }
    try {
      setServiceError(null);
      const updated = await propertyService.reorderPropertyImages(propertyId, orderedImages);
      setProperties((prev) => prev.map((p) => (p.id === propertyId ? updated : p)));
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not update photograph ordering.');
      setServiceError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  // Filters state
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };
  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
    showToast('Search filters reset', 'info');
  };

  const completeAuthTransition = (user: User, toastText: string) => {
    setCurrentUser(user);
    setAuthStatus('authenticated');
    setAuthError(null);
    setIsAuthModalOpen(false);
    showToast(toastText, 'success');

    void savedPropertyService
      .getSavedPropertyIds(user.id)
      .then((ids) => setSavedPropertyIds(ids))
      .catch(() => {});

    if (pendingAuthAction) {
      const actionToRun = pendingAuthAction;
      setPendingAuthAction(null);
      actionToRun();
    }
  };

  const login = async (input: LoginInput): Promise<User> => {
    setAuthError(null);
    try {
      const session = await authService.signIn(input);
      completeAuthTransition(
        session.user,
        `Signed in as ${session.user.name} (${session.user.role.toUpperCase()})`
      );
      return session.user;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Unable to sign in.');
      setAuthError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const loginAs = async (user: User): Promise<void> => {
    setAuthError(null);
    try {
      const session = await authService.loginAsDemoUser(user);
      completeAuthTransition(
        session.user,
        `Demo Mode: Signed in as ${session.user.name} (${session.user.role.toUpperCase()})`
      );
    } catch (err) {
      const msg = extractErrorMessage(err, 'Unable to switch demo profile.');
      setAuthError(msg);
      showToast(msg, 'error');
    }
  };

  const registerUser = async (
    name: string,
    phone: string,
    email: string,
    role: User['role'] = 'buyer',
    password?: string
  ): Promise<AuthSessionResponse> => {
    setAuthError(null);
    try {
      if (role === 'admin') {
        throw new ServiceError(
          'Administrator accounts cannot be created through public registration.',
          'FORBIDDEN',
          403
        );
      }

      const publicRole: PublicRegistrableRole = role;
      const session = await authService.signUp({
        name,
        phone,
        email,
        role: publicRole,
        password
      });

      if (session.requiresEmailConfirmation) {
        setAuthStatus('unauthenticated');
        setCurrentUser(null);
        showToast(
          'Account created! Please check your email inbox to confirm your address before signing in.',
          'info'
        );
        return session;
      }

      completeAuthTransition(
        session.user,
        `Account created! Signed in as ${session.user.name} (${session.user.role.toUpperCase()})`
      );
      return session;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Registration failed.');
      setAuthError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    setAuthError(null);
    try {
      await authService.requestPasswordReset(email);
      showToast(
        'Password reset instructions have been sent to your email address.',
        'success'
      );
    } catch (err) {
      const msg = extractErrorMessage(err, 'Could not send password reset email.');
      setAuthError(msg);
      showToast(msg, 'error');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setAuthStatus('unauthenticated');
      setSavedPropertyIds([]);
      setAuthError(null);
      showToast('You have signed out', 'info');
      navigateTo('/');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to sign out.');
      showToast(msg, 'error');
    }
  };

  const refreshCurrentUser = async (): Promise<User | null> => {
    setAuthStatus('loading');
    try {
      const user = await authService.getCurrentProfile();
      setCurrentUser(user);
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
      return user;
    } catch {
      setCurrentUser(null);
      setAuthStatus('unauthenticated');
      return null;
    }
  };

  // Contact Agent Modal (Protected Action)
  const [contactAgentProperty, setContactAgentProperty] = useState<Property | null>(null);
  const openContactAgentModal = (property: Property) => {
    if (!currentUser) {
      openAuthModal(
        'Sign in to contact this property representative and send direct enquiries.',
        () => setContactAgentProperty(property)
      );
      return;
    }
    setContactAgentProperty(property);
  };
  const closeContactAgentModal = () => {
    setContactAgentProperty(null);
  };

  return (
    <AppContext.Provider
      value={{
        authStatus,
        currentUser,
        currentProfile: currentUser,
        isAuthenticated: authStatus === 'authenticated' && Boolean(currentUser),
        isAuthLoading: authStatus === 'loading',
        isDemoMode,
        authError,
        demoUsers,
        login,
        loginAs,
        registerUser,
        requestPasswordReset,
        logout,
        refreshCurrentUser,
        isDataLoading,
        isStorageConfigured,
        serviceError,
        clearServiceError,
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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

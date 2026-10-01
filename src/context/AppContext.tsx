import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Property, 
  ViewingRequest, 
  Enquiry, 
  TransactionRecord, 
  FilterState 
} from '../types/property';
import { 
  INITIAL_PROPERTIES, 
  DEMO_USERS, 
  INITIAL_VIEWING_REQUESTS, 
  INITIAL_ENQUIRIES, 
  INITIAL_TRANSACTIONS 
} from '../data/mockProperties';
import { slugify } from '../utils/formatters';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface AppContextType {
  currentUser: User | null;
  loginAs: (user: User) => void;
  registerUser: (name: string, phone: string, email: string, role?: User['role']) => void;
  logout: () => void;
  
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
  toggleSaveProperty: (propertyId: string) => void;
  isPropertySaved: (propertyId: string) => boolean;
  addProperty: (property: Partial<Property>) => Property;
  updatePropertyVerification: (
    propertyId: string, 
    status: Property['verificationStatus'], 
    notes?: string
  ) => void;

  // Theme (Dark / Light)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Viewings & Enquiries
  viewingRequests: ViewingRequest[];
  addViewingRequest: (
    req: Omit<ViewingRequest, 'id' | 'dateRequested' | 'status' | 'assignedAgentName'>
  ) => void;
  updateViewingStatus: (requestId: string, status: ViewingRequest['status']) => void;
  cancelViewingRequest: (requestId: string) => void;

  enquiries: Enquiry[];
  addEnquiry: (
    enq: Omit<Enquiry, 'id' | 'date' | 'status' | 'assignedRep'>
  ) => void;
  updateEnquiryStatus: (enquiryId: string, status: Enquiry['status']) => void;

  // Transactions
  transactions: TransactionRecord[];
  updateTransactionStage: (txId: string, stage: TransactionRecord['stage']) => void;

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: dark / light
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reality_estates_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reality_estates_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
      return next;
    });
  };

  // Current user state (starts as null for anonymous browsing)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reality_estates_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState(
    'Create a free account to contact this property representative and request a viewing.'
  );
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  // Path routing (supports clean URLs like /properties/slug, /search, /dashboard, etc.)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Synchronize browser history
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

  // Properties state
  const [properties, setProperties] = useState<Property[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reality_estates_properties');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_PROPERTIES;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reality_estates_properties', JSON.stringify(properties));
    }
  }, [properties]);

  // Saved / Favourites
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reality_estates_saved');
      return saved ? JSON.parse(saved) : ['prop-1'];
    }
    return ['prop-1'];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reality_estates_saved', JSON.stringify(savedPropertyIds));
    }
  }, [savedPropertyIds]);

  const toggleSaveProperty = (propertyId: string) => {
    setSavedPropertyIds(prev => {
      const exists = prev.includes(propertyId);
      if (exists) {
        showToast('Property removed from saved listings', 'info');
        return prev.filter(id => id !== propertyId);
      } else {
        showToast('Property added to saved listings', 'success');
        return [...prev, propertyId];
      }
    });
  };

  const isPropertySaved = (propertyId: string) => savedPropertyIds.includes(propertyId);

  // Viewing Requests
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reality_estates_viewings');
      return saved ? JSON.parse(saved) : INITIAL_VIEWING_REQUESTS;
    }
    return INITIAL_VIEWING_REQUESTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reality_estates_viewings', JSON.stringify(viewingRequests));
    }
  }, [viewingRequests]);

  const addViewingRequest = (
    req: Omit<ViewingRequest, 'id' | 'dateRequested' | 'status' | 'assignedAgentName'>
  ) => {
    const newReq: ViewingRequest = {
      ...req,
      id: `view-${Date.now()}`,
      status: 'Pending',
      dateRequested: new Date().toISOString().split('T')[0],
      assignedAgentName: 'Pearl Prime Verification Desk'
    };
    setViewingRequests(prev => [newReq, ...prev]);
    showToast('Viewing request submitted successfully! Representative notified.', 'success');
  };

  const updateViewingStatus = (requestId: string, status: ViewingRequest['status']) => {
    setViewingRequests(prev => prev.map(v => v.id === requestId ? { ...v, status } : v));
    showToast(`Viewing request status updated to: ${status}`, 'info');
  };

  const cancelViewingRequest = (requestId: string) => {
    updateViewingStatus(requestId, 'Cancelled');
  };

  // Enquiries
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reality_estates_enquiries');
      return saved ? JSON.parse(saved) : INITIAL_ENQUIRIES;
    }
    return INITIAL_ENQUIRIES;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reality_estates_enquiries', JSON.stringify(enquiries));
    }
  }, [enquiries]);

  const addEnquiry = (enq: Omit<Enquiry, 'id' | 'date' | 'status' | 'assignedRep'>) => {
    const newEnq: Enquiry = {
      ...enq,
      id: `enq-${Date.now()}`,
      status: 'New',
      date: new Date().toISOString().split('T')[0],
      assignedRep: 'Grace Achieng'
    };
    setEnquiries(prev => [newEnq, ...prev]);
    showToast('Enquiry sent directly to property representative.', 'success');
  };

  const updateEnquiryStatus = (enquiryId: string, status: Enquiry['status']) => {
    setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status } : e));
    showToast(`Enquiry updated to: ${status}`, 'info');
  };

  // Transactions
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reality_estates_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    }
    return INITIAL_TRANSACTIONS;
  });

  const updateTransactionStage = (txId: string, stage: TransactionRecord['stage']) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          stage,
          dateClosed: stage === 'Closed' ? new Date().toISOString().split('T')[0] : t.dateClosed,
          paymentStatus: stage === 'Closed' ? 'Received' : t.paymentStatus
        };
      }
      return t;
    }));
    showToast(`Transaction advanced to: ${stage}`, 'success');
  };

  // Add new property
  const addProperty = (newPropData: Partial<Property>): Property => {
    const title = newPropData.title || 'Newly Listed Ugandan Property';
    const slug = `${slugify(title)}-${Date.now().toString().slice(-4)}`;
    
    const newProperty: Property = {
      id: `prop-custom-${Date.now()}`,
      slug,
      title,
      transaction: newPropData.transaction || 'buy',
      propertyType: newPropData.propertyType || 'House',
      price: newPropData.price || 500000000,
      currency: 'UGX',
      pricePeriod: newPropData.pricePeriod || (newPropData.transaction === 'rent' ? 'month' : 'total'),
      location: newPropData.location || 'Kira',
      district: newPropData.district || 'Wakiso',
      address: newPropData.address || `${newPropData.location || 'Kira'}, Uganda`,
      bedrooms: newPropData.bedrooms || 3,
      bathrooms: newPropData.bathrooms || 2,
      parking: newPropData.parking || 2,
      landSizeDecimals: newPropData.landSizeDecimals,
      buildingSizeSqm: newPropData.buildingSizeSqm,
      tenure: newPropData.tenure || 'Mailo',
      furnished: newPropData.furnished || false,
      availability: 'Available',
      verificationStatus: 'pending',
      listingStatus: 'pending',
      description: newPropData.description || 'Verified property listing submitted via Reality Estates.',
      features: newPropData.features || ['Water Reservoir', 'Security', 'Perimeter Wall'],
      images: newPropData.images && newPropData.images.length > 0 
        ? newPropData.images 
        : ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'],
      advertiser: newPropData.advertiser || {
        id: currentUser?.id || 'owner-custom',
        name: currentUser?.name || 'Property Owner',
        type: (currentUser?.role === 'agent' ? 'Agent' : currentUser?.role === 'developer' ? 'Developer' : 'Owner') as any,
        phone: currentUser?.phone || '+256 700 000 000',
        whatsapp: currentUser?.phone ? currentUser.phone.replace(/\s+/g, '') : '+256700000000',
        email: currentUser?.email || 'owner@example.ug',
        agencyName: currentUser?.company,
        verified: false,
        responseRate: 'New listing'
      },
      verificationDetails: {
        advertiserVerified: false,
        locationConfirmed: false,
        priceConfirmed: false,
        availabilityConfirmed: false,
        notes: 'Pending verification inspection by Reality Estates desk.'
      },
      coordinates: {
        lat: 0.3476,
        lng: 32.5825
      },
      featured: false,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setProperties(prev => [newProperty, ...prev]);
    showToast('Listing submitted! Sent to verification queue for on-site inspection.', 'success');
    return newProperty;
  };

  const updatePropertyVerification = (
    propertyId: string, 
    status: Property['verificationStatus'], 
    notes?: string
  ) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          verificationStatus: status,
          verificationDetails: {
            ...p.verificationDetails,
            advertiserVerified: status === 'verified',
            locationConfirmed: status === 'verified',
            priceConfirmed: status === 'verified',
            availabilityConfirmed: status === 'verified',
            verifiedAt: status === 'verified' ? new Date().toISOString().split('T')[0] : undefined,
            notes: notes || p.verificationDetails.notes
          }
        };
      }
      return p;
    }));
    showToast(`Property verification status updated to: ${status}`, 'success');
  };

  // Filters state
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };
  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
    showToast('Search filters reset', 'info');
  };

  // Auth Modal trigger
  const openAuthModal = (message?: string, onSuccessAction?: () => void) => {
    if (message) setAuthModalMessage(message);
    if (onSuccessAction) setPendingAuthAction(() => onSuccessAction);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAuthAction(null);
  };

  const requireAuth = (action: () => void, promptMessage?: string) => {
    if (currentUser) {
      action();
    } else {
      openAuthModal(promptMessage, action);
    }
  };

  const loginAs = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reality_estates_user', JSON.stringify(user));
    }
    setIsAuthModalOpen(false);
    showToast(`Signed in as ${user.name} (${user.role.toUpperCase()})`, 'success');
    
    if (pendingAuthAction) {
      pendingAuthAction();
      setPendingAuthAction(null);
    }
  };

  const registerUser = (name: string, phone: string, email: string, role: User['role'] = 'buyer') => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      phone,
      email,
      role,
      verifiedIdentity: true
    };
    loginAs(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('reality_estates_user');
    }
    showToast('You have signed out', 'info');
    navigateTo('/');
  };

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  // Contact Agent Modal
  const [contactAgentProperty, setContactAgentProperty] = useState<Property | null>(null);
  const openContactAgentModal = (property: Property) => {
    setContactAgentProperty(property);
  };
  const closeContactAgentModal = () => {
    setContactAgentProperty(null);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        loginAs,
        registerUser,
        logout,
        isAuthModalOpen,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        currentPath,
        navigateTo,
        properties,
        savedPropertyIds,
        toggleSaveProperty,
        isPropertySaved,
        addProperty,
        updatePropertyVerification,
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

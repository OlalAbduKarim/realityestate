import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Property, 
  ViewingRequest, 
  Enquiry, 
  TransactionRecord, 
  FinancingEnquiry, 
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

  // Transactions & Financing
  transactions: TransactionRecord[];
  updateTransactionStage: (txId: string, stage: TransactionRecord['stage']) => void;
  financingEnquiries: FinancingEnquiry[];
  submitFinancingEnquiry: (enquiry: Omit<FinancingEnquiry, 'id' | 'date' | 'status'>) => void;

  // Filters
  filters: FilterState;
  setFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Toast notifications
  toasts: Toast[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

export const DEFAULT_FILTERS: FilterState = {
  transaction: 'all',
  propertyType: 'all',
  location: 'All Locations',
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
    const saved = localStorage.getItem('reality_estates_user');
    return saved ? JSON.parse(saved) : null;
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
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Properties state
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('reality_estates_properties');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PROPERTIES;
      }
    }
    return INITIAL_PROPERTIES;
  });

  useEffect(() => {
    localStorage.setItem('reality_estates_properties', JSON.stringify(properties));
  }, [properties]);

  // Saved / Favourites
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('reality_estates_saved');
    return saved ? JSON.parse(saved) : ['prop-1', 'prop-2'];
  });

  useEffect(() => {
    localStorage.setItem('reality_estates_saved', JSON.stringify(savedPropertyIds));
  }, [savedPropertyIds]);

  // Viewing Requests
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>(() => {
    const saved = localStorage.getItem('reality_estates_viewings');
    return saved ? JSON.parse(saved) : INITIAL_VIEWING_REQUESTS;
  });

  useEffect(() => {
    localStorage.setItem('reality_estates_viewings', JSON.stringify(viewingRequests));
  }, [viewingRequests]);

  // Enquiries
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    const saved = localStorage.getItem('reality_estates_enquiries');
    return saved ? JSON.parse(saved) : INITIAL_ENQUIRIES;
  });

  useEffect(() => {
    localStorage.setItem('reality_estates_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  // Transactions
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('reality_estates_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('reality_estates_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Financing enquiries
  const [financingEnquiries, setFinancingEnquiries] = useState<FinancingEnquiry[]>(() => {
    const saved = localStorage.getItem('reality_estates_financing');
    return saved ? JSON.parse(saved) : [];
  });

  // Filters
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
  };

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Authentication operations
  const loginAs = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('reality_estates_user', JSON.stringify(user));
    setIsAuthModalOpen(false);
    showToast(`Signed in as ${user.name} (${user.role.toUpperCase()})`, 'success');
    
    // Execute pending action if any
    if (pendingAuthAction) {
      pendingAuthAction();
      setPendingAuthAction(null);
    }
  };

  const registerUser = (name: string, phone: string, email: string, role: User['role'] = 'buyer') => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      phone,
      email,
      role,
      title: role === 'agent' ? 'Registered Real Estate Agent' : 'Registered Client',
      createdAt: new Date().toISOString().split('T')[0]
    };
    loginAs(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('reality_estates_user');
    showToast('Signed out. You are now browsing anonymously.', 'info');
  };

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

  // Property actions
  const isPropertySaved = (propertyId: string) => savedPropertyIds.includes(propertyId);

  const toggleSaveProperty = (propertyId: string) => {
    requireAuth(() => {
      setSavedPropertyIds(prev => {
        const exists = prev.includes(propertyId);
        if (exists) {
          showToast('Property removed from your saved list', 'info');
          return prev.filter(id => id !== propertyId);
        } else {
          showToast('Property saved to your dashboard', 'success');
          return [...prev, propertyId];
        }
      });
    }, 'Create a free account to save and compare your favourite properties.');
  };

  const addProperty = (newProp: Partial<Property>): Property => {
    const title = newProp.title || 'New Property Listing';
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const fullProp: Property = {
      id: `prop-${Date.now()}`,
      slug,
      title,
      transaction: newProp.transaction || 'buy',
      propertyType: newProp.propertyType || 'House',
      price: newProp.price || 500000000,
      currency: 'UGX',
      pricePeriod: newProp.pricePeriod || (newProp.transaction === 'rent' ? 'month' : 'total'),
      location: newProp.location || 'Kampala',
      district: newProp.district || 'Kampala',
      address: newProp.address || 'Kampala Metropolitan Area',
      bedrooms: newProp.bedrooms || 3,
      bathrooms: newProp.bathrooms || 2,
      parking: newProp.parking || 2,
      landSizeDecimals: newProp.landSizeDecimals,
      buildingSizeSqm: newProp.buildingSizeSqm,
      tenure: newProp.tenure || 'Mailo',
      furnished: !!newProp.furnished,
      availability: 'Available',
      verificationStatus: 'pending',
      listingStatus: 'pending',
      description: newProp.description || 'Modern property listing with excellent infrastructure access.',
      features: newProp.features || ['Parking', 'Security', 'Water Reservoir'],
      images: newProp.images && newProp.images.length > 0 ? newProp.images : [
        INITIAL_PROPERTIES[0].images[0]
      ],
      advertiser: newProp.advertiser || {
        id: currentUser?.id || 'adv-self',
        name: currentUser?.name || 'Property Owner',
        type: currentUser?.role === 'agent' ? 'Agent' : 'Owner',
        phone: currentUser?.phone || '+256 700 000 000',
        whatsapp: currentUser?.phone ? currentUser.phone.replace(/\s+/g, '') : '+256700000000',
        email: currentUser?.email || 'advertiser@realityestates.ug',
        verified: false,
        agencyName: currentUser?.company || 'Direct Listing',
        responseRate: 'New listing'
      },
      verificationDetails: {
        advertiserVerified: false,
        locationConfirmed: false,
        priceConfirmed: false,
        availabilityConfirmed: false,
        notes: 'Submitted via portal. Verification team will review cadastral title copy and conduct verification checks.'
      },
      insights: {
        estimatedMonthlyRent: newProp.transaction === 'rent' ? newProp.price : Math.round((newProp.price || 500000000) * 0.0055),
        grossRentalYield: 6.6
      },
      coordinates: newProp.coordinates || { lat: 0.3476, lng: 32.5825 },
      featured: false,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setProperties(prev => [fullProp, ...prev]);
    showToast('Listing submitted successfully for review!', 'success');
    return fullProp;
  };

  const updatePropertyVerification = (
    propertyId: string, 
    status: Property['verificationStatus'], 
    notes?: string
  ) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const isVerified = status === 'verified';
        return {
          ...p,
          verificationStatus: status,
          listingStatus: isVerified ? 'published' : (status === 'unverified' ? 'rejected' : 'pending'),
          verificationDetails: {
            ...p.verificationDetails,
            advertiserVerified: isVerified,
            locationConfirmed: isVerified,
            priceConfirmed: isVerified,
            availabilityConfirmed: isVerified,
            verifiedDate: isVerified ? new Date().toISOString().split('T')[0] : undefined,
            verifiedBy: currentUser?.name || 'Reality Estates Operations Admin',
            notes: notes || p.verificationDetails.notes
          }
        };
      }
      return p;
    }));
    showToast(`Property status updated to: ${status.toUpperCase()}`, 'success');
  };

  const addViewingRequest = (
    req: Omit<ViewingRequest, 'id' | 'dateRequested' | 'status' | 'assignedAgentName'>
  ) => {
    const newRequest: ViewingRequest = {
      ...req,
      id: `view-${Date.now()}`,
      dateRequested: new Date().toISOString().split('T')[0],
      status: 'Pending',
      assignedAgentName: 'Reality Estates Partner Desk'
    };
    setViewingRequests(prev => [newRequest, ...prev]);
    showToast('Viewing request submitted! The property representative will contact you to confirm.', 'success');
  };

  const updateViewingStatus = (requestId: string, status: ViewingRequest['status']) => {
    setViewingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    showToast(`Viewing request updated to: ${status}`, 'info');
  };

  const cancelViewingRequest = (requestId: string) => {
    setViewingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Cancelled' } : r));
    showToast('Viewing request has been cancelled.', 'info');
  };

  const addEnquiry = (
    enq: Omit<Enquiry, 'id' | 'date' | 'status' | 'assignedRep'>
  ) => {
    const newEnquiry: Enquiry = {
      ...enq,
      id: `enq-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      assignedRep: 'Operations Desk'
    };
    setEnquiries(prev => [newEnquiry, ...prev]);
    showToast('Enquiry sent directly to listing representative.', 'success');
  };

  const updateEnquiryStatus = (enquiryId: string, status: Enquiry['status']) => {
    setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status } : e));
    showToast(`Enquiry marked as: ${status}`, 'info');
  };

  const updateTransactionStage = (txId: string, stage: TransactionRecord['stage']) => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, stage } : t));
    showToast(`Transaction pipeline stage updated to: ${stage}`, 'info');
  };

  const submitFinancingEnquiry = (enquiry: Omit<FinancingEnquiry, 'id' | 'date' | 'status'>) => {
    const newRecord: FinancingEnquiry = {
      ...enquiry,
      id: `fin-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted'
    };
    setFinancingEnquiries(prev => [newRecord, ...prev]);
    showToast('Financing pre-qualification enquiry submitted to partner institutions.', 'success');
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
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
      viewingRequests,
      addViewingRequest,
      updateViewingStatus,
      cancelViewingRequest,
      enquiries,
      addEnquiry,
      updateEnquiryStatus,
      transactions,
      updateTransactionStage,
      financingEnquiries,
      submitFinancingEnquiry,
      filters,
      setFilters,
      resetFilters,
      toasts,
      showToast,
      dismissToast
    }}>
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

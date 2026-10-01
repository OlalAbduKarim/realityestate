import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { DEMO_USERS } from '../data/mockProperties';
import { formatUGX } from '../utils/formatters';
import { 
  Heart, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Columns, 
  X, 
  Check, 
  Trash2, 
  Building2, 
  Clock, 
  Phone,
  SlidersHorizontal,
  Compass,
  Lock
} from 'lucide-react';
import { Property, TransactionType } from '../types/property';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    loginAs, 
    logout, 
    openAuthModal, 
    properties, 
    savedPropertyIds, 
    toggleSaveProperty,
    viewingRequests, 
    cancelViewingRequest,
    enquiries, 
    navigateTo,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'viewings' | 'enquiries' | 'recommended'>('saved');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [savedTransactionFilter, setSavedTransactionFilter] = useState<'all' | 'buy' | 'rent'>('all');
  const [savedSortBy, setSavedSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  // Filter saved properties
  const savedProperties = useMemo(() => {
    return properties
      .filter(p => savedPropertyIds.includes(p.id))
      .filter(p => {
        if (savedTransactionFilter === 'all') return true;
        return p.transaction === savedTransactionFilter;
      })
      .sort((a, b) => {
        if (savedSortBy === 'price_asc') return a.price - b.price;
        if (savedSortBy === 'price_desc') return b.price - a.price;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });
  }, [properties, savedPropertyIds, savedTransactionFilter, savedSortBy]);

  // Total valuation of saved properties
  const totalSavedValue = useMemo(() => {
    return savedProperties.reduce((sum, p) => sum + p.price, 0);
  }, [savedProperties]);

  // Filter recommendations (distinct from saved)
  const recommendedProperties = properties
    .filter(p => !savedPropertyIds.includes(p.id) && p.featured)
    .slice(0, 4);

  // Toggle selection for comparison
  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(i => i !== id));
    } else {
      if (compareIds.length >= 3) {
        showToast('You can compare a maximum of 3 properties at once', 'info');
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  const handleClearAllSaved = () => {
    if (savedPropertyIds.length === 0) return;
    if (window.confirm('Are you sure you want to remove all saved properties?')) {
      savedPropertyIds.forEach(id => toggleSaveProperty(id));
      setCompareIds([]);
      showToast('All saved properties cleared', 'info');
    }
  };

  const propertiesToCompare = properties.filter(p => compareIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* User / Guest Header Banner */}
      {currentUser ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xl">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white">
                  {currentUser.name}
                </h1>
                {currentUser.verifiedIdentity && (
                  <span title="Verified Identity">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {currentUser.email} • {currentUser.phone} • <span className="capitalize">{currentUser.role} Account</span>
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 text-center">
              <div className="text-sm font-bold text-rose-600 dark:text-rose-400">{savedPropertyIds.length}</div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">Saved</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 text-center">
              <div className="text-sm font-bold text-stone-900 dark:text-white">{viewingRequests.length}</div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">Viewings</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 text-center">
              <div className="text-sm font-bold text-stone-900 dark:text-white">{enquiries.length}</div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">Enquiries</div>
            </div>
          </div>
        </div>
      ) : (
        /* Guest Explorer Banner */
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold text-xl">
              <Compass className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white">
                  Property Portfolio & Favorites
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                  Guest Mode
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Tracking {savedPropertyIds.length} saved {savedPropertyIds.length === 1 ? 'property' : 'properties'} on this device. Sign in to sync across devices and book viewings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuthModal('Sign in to sync your saved properties across all devices and message property owners.')}
              className="py-2.5 px-5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 flex-wrap gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* TAB 1: SAVED PROPERTIES */}
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${savedPropertyIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>Saved Properties ({savedPropertyIds.length})</span>
          </button>

          {/* TAB 2: SCHEDULED VIEWINGS */}
          <button
            onClick={() => setActiveTab('viewings')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'viewings'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduled Viewings ({viewingRequests.length})</span>
          </button>

          {/* TAB 3: MY ENQUIRIES */}
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'enquiries'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>My Enquiries ({enquiries.length})</span>
          </button>

          {/* TAB 4: RECOMMENDED */}
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'recommended'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended for You</span>
          </button>
        </div>

        {/* Comparison Trigger if in saved tab */}
        {activeTab === 'saved' && savedProperties.length >= 2 && (
          <button
            onClick={() => setIsCompareModalOpen(true)}
            disabled={compareIds.length < 2}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              compareIds.length >= 2 
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs cursor-pointer' 
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare Selected ({compareIds.length}/3)</span>
          </button>
        )}
      </div>

      {/* Tab Content 1: SAVED PROPERTIES */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          
          {/* Saved Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/90 dark:border-stone-800">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Saved Listings & Preferences</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {savedProperties.length} {savedProperties.length === 1 ? 'listing' : 'listings'} saved • Total Portfolio: <strong className="text-stone-800 dark:text-stone-200">{formatUGX(totalSavedValue, true)}</strong>
              </p>
            </div>

            {savedPropertyIds.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {/* Transaction filter chips */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setSavedTransactionFilter('all')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      savedTransactionFilter === 'all'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSavedTransactionFilter('buy')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      savedTransactionFilter === 'buy'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    For Sale
                  </button>
                  <button
                    onClick={() => setSavedTransactionFilter('rent')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      savedTransactionFilter === 'rent'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    For Rent
                  </button>
                </div>

                {/* Sort dropdown */}
                <select
                  value={savedSortBy}
                  onChange={(e) => setSavedSortBy(e.target.value as any)}
                  className="text-xs p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                >
                  <option value="newest">Recently Saved</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>

                {/* Clear all */}
                <button
                  onClick={handleClearAllSaved}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Remove all saved properties"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {/* Properties Grid or Empty State */}
          {savedProperties.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                  No saved properties yet
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                  Click the heart icon on any property card or property details page to save homes, compare pricing, and track inspection availability.
                </p>
              </div>
              <button
                onClick={() => navigateTo('/search')}
                className="py-2.5 px-6 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Explore Properties in Uganda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map(property => (
                <div key={property.id} className="relative flex flex-col group">
                  {/* Select for comparison checkbox */}
                  <label className="absolute top-3 right-12 z-20 bg-stone-900/85 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1.5 cursor-pointer hover:bg-stone-900">
                    <input
                      type="checkbox"
                      checked={compareIds.includes(property.id)}
                      onChange={() => toggleCompare(property.id)}
                      className="rounded text-emerald-600 focus:ring-0"
                    />
                    <span>Compare</span>
                  </label>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Scheduled Viewings */}
      {activeTab === 'viewings' && (
        <div className="space-y-4">
          {!currentUser ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-w-md mx-auto">
              <Lock className="w-8 h-8 text-stone-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  Sign in to view scheduled viewings
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Scheduled viewings are linked to your registered profile to coordinate on-site appointments.
                </p>
              </div>
              <button
                onClick={() => openAuthModal('Sign in to view and manage your scheduled property viewings.')}
                className="py-2.5 px-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
              >
                Sign In or Register
              </button>
            </div>
          ) : viewingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
              <Calendar className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                No scheduled viewings
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Request an in-person or guided property viewing from any property page to have a verified representative meet you on site.
              </p>
              <button
                onClick={() => navigateTo('/search')}
                className="py-2 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg"
              >
                Browse Listings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingRequests.map(v => (
                <div key={v.id} className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        v.status === 'Confirmed' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                        v.status === 'Completed' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                        v.status === 'Cancelled' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}>
                        {v.status}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white mt-1.5 line-clamp-1">
                        {v.propertyTitle}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {v.propertyLocation}
                      </p>
                    </div>

                    <div className="text-right text-xs font-semibold text-stone-900 dark:text-white">
                      {formatUGX(v.propertyPrice, true)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-stone-400" /> Date:</span>
                      <span className="font-semibold text-stone-900 dark:text-white">{v.preferredDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-stone-400" /> Time:</span>
                      <span className="font-semibold text-stone-900 dark:text-white">{v.preferredTime}</span>
                    </div>
                    {v.assignedAgentName && (
                      <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                        <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5 text-stone-400" /> Agent:</span>
                        <span className="font-semibold text-stone-900 dark:text-white">{v.assignedAgentName}</span>
                      </div>
                    )}
                  </div>

                  {v.status === 'Pending' && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => cancelViewingRequest(v.id)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: My Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {!currentUser ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-w-md mx-auto">
              <Lock className="w-8 h-8 text-stone-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  Sign in to view your inquiries
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Direct messages sent to property representatives are securely archived in your account.
                </p>
              </div>
              <button
                onClick={() => openAuthModal('Sign in to view messages and direct representative responses.')}
                className="py-2.5 px-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
              >
                Sign In or Register
              </button>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
              <MessageSquare className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                No active enquiries
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Messages sent to property owners and listing agents appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-xs transition-colors">
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {enquiries.map(enq => (
                  <div key={enq.id} className="p-5 space-y-2 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          enq.status === 'Contacted' || enq.status === 'Viewing Scheduled' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                          enq.status === 'Closed' ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300' :
                          'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}>
                          {enq.status}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white mt-1">
                          {enq.propertyTitle}
                        </h4>
                        {enq.subject && (
                          <div className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                            Subject: <span className="text-stone-800 dark:text-stone-100">{enq.subject}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-stone-400">
                        Date: {enq.date}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 p-3 rounded-lg border border-stone-100 dark:border-stone-700/60 italic">
                      "{enq.message}"
                    </p>

                    <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between pt-1">
                      <span>Assigned Representative: <strong className="text-stone-800 dark:text-stone-200">{enq.assignedRep || 'Pearl Prime Desk'}</strong></span>
                      <span>Phone: {enq.customerPhone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Recommended Properties */}
      {activeTab === 'recommended' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {isCompareModalOpen && propertiesToCompare.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                  Property Comparison Matrix
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Side-by-side evaluation of your selected listings
                </p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <th className="p-3 text-stone-400 font-medium">Metric</th>
                    {propertiesToCompare.map(p => (
                      <th key={p.id} className="p-3 font-serif font-bold text-stone-900 dark:text-white min-w-[200px]">
                        <div className="line-clamp-1">{p.title}</div>
                        <div className="text-[11px] font-sans font-normal text-stone-500">{p.location}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  <tr>
                    <td className="p-3 text-stone-500 dark:text-stone-400 font-semibold">Price</td>
                    {propertiesToCompare.map(p => (
                      <td key={p.id} className="p-3 font-bold text-stone-900 dark:text-white">
                        {formatUGX(p.price)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-stone-500 dark:text-stone-400 font-semibold">Transaction</td>
                    {propertiesToCompare.map(p => (
                      <td key={p.id} className="p-3 uppercase tracking-wider text-[11px] font-semibold">
                        {p.transaction === 'buy' ? 'For Sale' : 'For Rent'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-stone-500 dark:text-stone-400 font-semibold">Type</td>
                    {propertiesToCompare.map(p => (
                      <td key={p.id} className="p-3">{p.propertyType}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-stone-500 dark:text-stone-400 font-semibold">Bedrooms / Baths</td>
                    {propertiesToCompare.map(p => (
                      <td key={p.id} className="p-3">
                        {p.bedrooms > 0 ? `${p.bedrooms} Beds, ` : ''}{p.bathrooms > 0 ? `${p.bathrooms} Baths` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-stone-500 dark:text-stone-400 font-semibold">Plot / Size</td>
                    {propertiesToCompare.map(p => (
                      <td key={p.id} className="p-3">
                        {p.landSizeDecimals ? `${p.landSizeDecimals} Decimals` : p.buildingSizeSqm ? `${p.buildingSizeSqm} m²` : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-stone-500 dark:text-stone-400 font-semibold">Tenure</td>
                    {propertiesToCompare.map(p => (
                      <td key={p.id} className="p-3">{p.tenure || 'N/A'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-stone-500 dark:text-stone-400 font-semibold">Verification</td>
                    {propertiesToCompare.map(p => (
                      <td key={p.id} className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          p.verificationStatus === 'verified' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {p.verificationStatus}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-stone-500 dark:text-stone-400 font-semibold">Action</td>
                    {propertiesToCompare.map(p => (
                      <td key={p.id} className="p-3">
                        <button
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            navigateTo(`/properties/${p.slug}`);
                          }}
                          className="py-1.5 px-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold"
                        >
                          View Listing
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="py-2 px-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Demo Profiles Footer for Easy Testing */}
      {!currentUser && (
        <div className="pt-8 border-t border-stone-200 dark:border-stone-800">
          <p className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500 mb-3">
            Quick Test: Switch to a Demo Profile
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {DEMO_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => loginAs(user)}
                className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-700 text-stone-800 dark:text-stone-200 transition-colors text-left cursor-pointer"
              >
                <div className="font-semibold truncate">{user.name}</div>
                <div className="text-[10px] text-stone-500 capitalize">{user.role} Account</div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

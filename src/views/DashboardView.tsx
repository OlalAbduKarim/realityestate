import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { formatUGX, formatPriceDisplay } from '../utils/formatters';
import { 
  Heart, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  User as UserIcon, 
  ArrowRight,
  Clock,
  CheckCircle2, 
  Columns,
  X
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    openAuthModal, 
    savedPropertyIds, 
    properties, 
    viewingRequests, 
    cancelViewingRequest,
    enquiries, 
    navigateTo 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'viewings' | 'enquiries' | 'recommended' | 'compare'>('saved');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-700 dark:text-stone-300">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
          Sign In to Your Dashboard
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Access your saved listings, scheduled on-site inspections, active representative enquiries, and personalized property recommendations.
        </p>
        <div className="pt-2">
          <button
            onClick={() => openAuthModal('Sign in to access your personal dashboard and saved listings.')}
            className="py-2.5 px-6 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Sign In or Register
          </button>
        </div>
      </div>
    );
  }

  // Filter properties
  const savedProperties = properties.filter(p => savedPropertyIds.includes(p.id));
  const recommendedProperties = properties
    .filter(p => !savedPropertyIds.includes(p.id) && p.verificationStatus === 'verified')
    .slice(0, 3);

  // Compare selection toggle
  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(p => p !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        return; // Max 3
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const comparedProperties = properties.filter(p => selectedForCompare.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      
      {/* Header Profile summary */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center text-xl font-bold font-serif">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white">
                {currentUser.name}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {currentUser.email} · {currentUser.phone}
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-stone-100 dark:border-stone-800 pt-4 md:pt-0 md:pl-6">
          <div className="text-left">
            <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">{savedProperties.length}</span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Saved</span>
          </div>
          <div className="text-left">
            <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">{viewingRequests.length}</span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Viewings</span>
          </div>
          <div className="text-left">
            <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">{enquiries.length}</span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Enquiries</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('saved')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'saved' 
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white' 
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Properties ({savedProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('viewings')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'viewings' 
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white' 
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Viewing Requests ({viewingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'enquiries' 
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white' 
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Enquiries ({enquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recommended')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'recommended' 
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white' 
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Recommended For You</span>
        </button>

        {savedProperties.length >= 2 && (
          <button
            onClick={() => setActiveTab('compare')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'compare' 
                ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white' 
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Compare Listings ({selectedForCompare.length})</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}

      {/* 1. Saved Properties Tab */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {savedProperties.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
              <Heart className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                No saved properties yet
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Explore our curated listings and click the heart icon to save and compare your top selections.
              </p>
              <button
                onClick={() => navigateTo('/search')}
                className="mt-2 py-2 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors"
              >
                Browse Properties
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Select up to 3 listings to compare specs side-by-side.
                </p>
                {selectedForCompare.length >= 2 && (
                  <button
                    onClick={() => setActiveTab('compare')}
                    className="py-1.5 px-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Compare {selectedForCompare.length} Selected</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map(property => {
                  const isChecked = selectedForCompare.includes(property.id);
                  return (
                    <div key={property.id} className="relative group">
                      <div className="absolute top-2 left-2 z-20">
                        <label className="flex items-center gap-1.5 bg-stone-900/80 dark:bg-stone-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-1 rounded-md cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCompare(property.id)}
                            className="rounded text-stone-900 focus:ring-0"
                          />
                          <span>Compare</span>
                        </label>
                      </div>
                      <PropertyCard property={property} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Viewing Requests Tab */}
      {activeTab === 'viewings' && (
        <div className="space-y-4">
          {viewingRequests.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
              <Calendar className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                No viewing requests scheduled
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Found a property you love? Click "Request Viewing" on the property page to arrange a physical walk-through.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {viewingRequests.map(req => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                      <img src={req.propertyImage} alt={req.propertyTitle} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          req.status === 'Confirmed' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                            : req.status === 'Completed' 
                              ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300' 
                              : req.status === 'Cancelled'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-stone-400 dark:text-stone-500">Requested: {req.dateRequested}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white">{req.propertyTitle}</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{req.propertyLocation}</p>
                      <div className="flex items-center gap-3 text-xs text-stone-700 dark:text-stone-300 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {req.preferredDate}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {req.preferredTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right border-t sm:border-t-0 dark:border-stone-800 pt-3 sm:pt-0 space-y-1">
                    <span className="text-xs font-bold text-stone-900 dark:text-white block tabular-nums">
                      {formatUGX(req.propertyPrice, true)}
                    </span>
                    <div className="flex items-center sm:justify-end gap-3">
                      <button
                        onClick={() => navigateTo(`/properties/${req.propertyId}`)}
                        className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:underline inline-block"
                      >
                        View Page
                      </button>
                      {req.status !== 'Cancelled' && (
                        <button
                          onClick={() => cancelViewingRequest(req.id)}
                          className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. My Enquiries Tab */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
              <MessageSquare className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                No active enquiries
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Submit an enquiry to get questions answered by the listing owner or representative.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.map(enq => (
                <div
                  key={enq.id}
                  className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                    <div>
                      <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        enq.status === 'Closed' 
                          ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400' 
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        Status: {enq.status}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white mt-1">{enq.propertyTitle}</h4>
                    </div>
                    <span className="text-xs text-stone-400 tabular-nums">{enq.date}</span>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic">
                    "{enq.message}"
                  </div>

                  {enq.notes && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Representative Response: {enq.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Recommended Tab */}
      {activeTab === 'recommended' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curated suggestions based on verified listings in high-demand Kampala and Wakiso neighborhoods.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Compare Listings Tab */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {comparedProperties.length < 2 ? (
            <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
              <Columns className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                Select at least 2 properties to compare
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                Head to your "Saved Properties" tab and check the "Compare" box on listings you wish to review.
              </p>
              <button
                onClick={() => setActiveTab('saved')}
                className="mt-2 py-2 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors"
              >
                Back to Saved Listings
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-x-auto p-4 sm:p-6 transition-colors">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <th className="py-3 px-4 text-stone-400 dark:text-stone-500 font-medium">Metric</th>
                    {comparedProperties.map(p => (
                      <th key={p.id} className="py-3 px-4 font-bold text-stone-900 dark:text-white min-w-[200px]">
                        {p.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  <tr>
                    <td className="py-3 px-4 font-medium text-stone-500 dark:text-stone-400">Asking Price</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="py-3 px-4 font-bold text-stone-900 dark:text-white tabular-nums">
                        {formatPriceDisplay(p.price, p.transaction, p.pricePeriod)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-stone-500 dark:text-stone-400">Location</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="py-3 px-4 text-stone-800 dark:text-stone-200">{p.location}, {p.district}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-stone-500 dark:text-stone-400">Bedrooms / Baths</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="py-3 px-4 text-stone-800 dark:text-stone-200">{p.bedrooms} beds · {p.bathrooms} baths</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-stone-500 dark:text-stone-400">Land Size</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="py-3 px-4 text-stone-800 dark:text-stone-200">{p.landSizeDecimals ? `${p.landSizeDecimals} decimals` : 'N/A'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-stone-500 dark:text-stone-400">Est. Rental Yield</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">{p.insights?.grossRentalYield || '6.5'}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-stone-500 dark:text-stone-400">Verification Status</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="py-3 px-4">
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{p.verificationStatus}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

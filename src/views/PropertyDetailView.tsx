import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyGallery } from '../components/PropertyGallery';
import { VerificationPanel } from '../components/VerificationPanel';
import { PropertyInsights } from '../components/PropertyInsights';
import { ViewingRequestModal } from '../components/ViewingRequestModal';
import { ContactAgentModal } from '../components/ContactAgentModal';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveAreaMap } from '../components/InteractiveAreaMap';
import { formatUGX, formatPriceDisplay } from '../utils/formatters';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  LandPlot, 
  Maximize2, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Check, 
  ArrowLeft,
  Info
} from 'lucide-react';

interface PropertyDetailViewProps {
  slug: string;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ slug }) => {
  const { 
    properties, 
    savedPropertyIds,
    isPropertySaved, 
    toggleSaveProperty, 
    openAuthModal, 
    currentUser, 
    navigateTo, 
    showToast 
  } = useApp();

  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Find property by slug
  const property = properties.find(p => p.slug === slug) || properties[0];

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Property Not Found</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">The listing you are looking for may have been removed or moved.</p>
        <button
          onClick={() => navigateTo('/search')}
          className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg"
        >
          Browse Active Listings
        </button>
      </div>
    );
  }

  const isSaved = isPropertySaved(property.id);
  const isVerified = property.verificationStatus === 'verified';

  // Similar properties
  const relatedProperties = properties
    .filter(p => p.id !== property.id && (p.propertyType === property.propertyType || p.location === property.location))
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Listing URL copied to clipboard!', 'info');
    }
  };

  const handleOpenViewing = () => {
    if (!currentUser) {
      openAuthModal('Create a free account to schedule an in-person property viewing.', () => {
        setIsViewingModalOpen(true);
      });
      return;
    }
    setIsViewingModalOpen(true);
  };

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <button 
            onClick={() => navigateTo('/search')}
            className="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <span>/</span>
          <span>{property.district}</span>
          <span>/</span>
          <span className="text-stone-900 dark:text-stone-200 font-medium truncate max-w-xs">{property.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700 text-xs font-medium transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={() => toggleSaveProperty(property.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isSaved 
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Media Gallery, Information, Verification, Specs */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Gallery Component */}
          <PropertyGallery 
            images={property.images}
            title={property.title}
            floorPlanUrl={property.floorPlanUrl}
            videoUrl={property.videoUrl}
          />

          {/* Property Header & Title Info */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {property.transaction === 'buy' ? 'For Sale' : 'For Rent'}
              </span>

              {isVerified && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified Listing
                </span>
              )}

              <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium px-2.5 py-1 rounded-md">
                {property.propertyType}
              </span>

              {property.tenure && (
                <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium px-2.5 py-1 rounded-md">
                  {property.tenure} Title
                </span>
              )}

              <span className="ml-auto text-xs text-stone-500 dark:text-stone-400">
                Added {property.dateAdded}
              </span>
            </div>

            {/* Title & Price */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 dark:text-white leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 pt-1">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{property.address}, {property.location}, {property.district}</span>
              </div>
            </div>

            {/* Price Banner */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-baseline gap-2">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
                {formatPriceDisplay(property.price, property.transaction, property.pricePeriod)}
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                ({formatUGX(property.price)})
              </span>
            </div>

            {/* Key Specs Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
              {property.bedrooms > 0 && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 flex items-center gap-3">
                  <Bed className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  <div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Bedrooms</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-white">{property.bedrooms} Beds</div>
                  </div>
                </div>
              )}

              {property.bathrooms > 0 && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 flex items-center gap-3">
                  <Bath className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  <div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Bathrooms</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-white">{property.bathrooms} Baths</div>
                  </div>
                </div>
              )}

              {property.parking > 0 && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 flex items-center gap-3">
                  <Car className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  <div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Parking</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-white">{property.parking} Cars</div>
                  </div>
                </div>
              )}

              {property.landSizeDecimals ? (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 flex items-center gap-3">
                  <LandPlot className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  <div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Plot Size</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-white">{property.landSizeDecimals} Decimals</div>
                  </div>
                </div>
              ) : property.buildingSizeSqm ? (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 flex items-center gap-3">
                  <Maximize2 className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  <div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Floor Area</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-white">{property.buildingSizeSqm} m²</div>
                  </div>
                </div>
              ) : null}
            </div>

          </div>

          {/* Description */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3 transition-colors">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              About this property
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Features & Amenities */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Features & Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.features.map(feat => (
                <div key={feat} className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 border border-stone-100 dark:border-stone-700/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood Highlights */}
          {property.neighborhoodHighlights && property.neighborhoodHighlights.length > 0 && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3 transition-colors">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Neighborhood & Accessibility
              </h3>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                {property.neighborhoodHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Panel */}
          <VerificationPanel property={property} />

          {/* Property Insights (Rental Yields & Valuation) */}
          <PropertyInsights property={property} />

          {/* Location Map Preview */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                  Location & Cadastral Setting
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  GPS: {property.coordinates.lat.toFixed(4)}, {property.coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="h-72 rounded-xl overflow-hidden shadow-xs">
              <InteractiveAreaMap 
                properties={[property]} 
                selectedProperty={property}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Contact & Action Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-md space-y-6 transition-colors">
            
            {/* Advertiser Info */}
            <div className="flex items-center gap-3 pb-5 border-b border-stone-100 dark:border-stone-800">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                {property.advertiser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                    {property.advertiser.name}
                  </h4>
                  {property.advertiser.verified && (
                    <span title="Verified Representative">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {property.advertiser.agencyName || property.advertiser.type}
                </p>
                {property.advertiser.responseRate && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ⚡ {property.advertiser.responseRate}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleOpenViewing}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Request a Viewing</span>
              </button>

              <button
                onClick={handleOpenContact}
                className="w-full py-3 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Contact Agent</span>
              </button>

              {/* Dedicated Save to Favorites Button */}
              <button
                type="button"
                onClick={() => toggleSaveProperty(property.id)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isSaved 
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isSaved ? 'Saved to Favorites' : 'Save to Favorites'}</span>
              </button>

              {/* Quick Link to Saved in Dashboard */}
              {isSaved && (
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-1 pt-1">
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Added to your preferences
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateTo('/dashboard')}
                    className="text-stone-900 dark:text-white font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Saved</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>

            {/* Security Guarantee Note */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed space-y-1">
              <p className="font-semibold text-stone-900 dark:text-stone-200">
                🔒 Protected Communication
              </p>
              <p>
                Direct contact details and inquiries are handled under Reality Estates verification standards. We never charge viewing dispatch fees.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Similar Properties Section */}
      {relatedProperties.length > 0 && (
        <div className="pt-10 border-t border-stone-200 dark:border-stone-800 space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
              Similar Properties in {property.location}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Compare options within similar price brackets and districts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProperties.map(rel => (
              <PropertyCard key={rel.id} property={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 p-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-xl flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-stone-500 dark:text-stone-400">Price</div>
          <div className="text-sm font-bold text-stone-900 dark:text-white truncate max-w-[140px]">
            {formatPriceDisplay(property.price, property.transaction, property.pricePeriod)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Favorite Heart Toggle */}
          <button
            type="button"
            onClick={() => toggleSaveProperty(property.id)}
            aria-label={isSaved ? "Remove from Favorites" : "Save to Favorites"}
            className={`p-2.5 rounded-lg border transition-colors shrink-0 ${
              isSaved 
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400' 
                : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
            }`}
            title={isSaved ? "Saved to Favorites" : "Save to Favorites"}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleOpenContact}
            className="py-2.5 px-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact Agent</span>
          </button>
          <button
            onClick={handleOpenViewing}
            className="py-2.5 px-4 bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer"
          >
            Request Viewing
          </button>
        </div>
      </div>

      {/* Modals */}
      <ViewingRequestModal
        property={property}
        isOpen={isViewingModalOpen}
        onClose={() => setIsViewingModalOpen(false)}
      />

      <ContactAgentModal
        property={property}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
};

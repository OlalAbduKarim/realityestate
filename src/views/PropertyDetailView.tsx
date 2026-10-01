import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyGallery } from '../components/PropertyGallery';
import { VerificationPanel } from '../components/VerificationPanel';
import { PropertyInsights } from '../components/PropertyInsights';
import { ViewingRequestModal } from '../components/ViewingRequestModal';
import { ContactRepresentativeModal } from '../components/ContactRepresentativeModal';
import { formatPriceDisplay } from '../utils/formatters';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Calendar, 
  Phone, 
  ChevronDown, 
  ChevronUp,
  CreditCard,
  ArrowRight
} from 'lucide-react';

interface PropertyDetailViewProps {
  slug: string;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ slug }) => {
  const { 
    properties, 
    navigateTo, 
    currentUser, 
    openAuthModal, 
    toggleSaveProperty, 
    isPropertySaved,
    showToast 
  } = useApp();

  // Find property by slug or id
  const property = properties.find(p => p.slug === slug || p.id === slug) || properties[0];

  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const saved = isPropertySaved(property.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Property link copied to clipboard', 'info');
    }
  };

  const handleRequestViewingClick = () => {
    if (!currentUser) {
      openAuthModal(
        'Create a free account to schedule an on-site property viewing inspection.',
        () => setIsViewingModalOpen(true)
      );
    } else {
      setIsViewingModalOpen(true);
    }
  };

  const handleContactClick = () => {
    if (!currentUser) {
      openAuthModal(
        'Create a free account to access direct phone numbers, WhatsApp, and representative contact details.',
        () => setIsContactModalOpen(true)
      );
    } else {
      setIsContactModalOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-24 md:pb-12 transition-colors">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('/search')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Properties</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            title="Share Property"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleSaveProperty(property.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
              saved 
                ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' 
                : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Property Title & Pricing Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] font-semibold px-2.5 py-1 rounded-md tracking-wider uppercase">
              {property.transaction === 'buy' ? 'For Sale' : 'For Rent'}
            </span>
            <span className="text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md">
              {property.propertyType}
            </span>
            {property.verificationStatus === 'verified' && (
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Listing
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
            {property.title}
          </h1>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
            <span>{property.address} · {property.location}, {property.district}</span>
          </div>
        </div>

        {/* Price & Primary Desktop CTAs */}
        <div className="text-left md:text-right space-y-3">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 block">Advertised Price</span>
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight tabular-nums">
              {formatPriceDisplay(property.price, property.transaction, property.pricePeriod)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 md:justify-end">
            <button
              onClick={handleContactClick}
              className="py-2.5 px-4 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-900 dark:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Representative</span>
            </button>
            <button
              onClick={handleRequestViewingClick}
              className="py-2.5 px-5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Viewing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Slot: Property Gallery */}
      <PropertyGallery
        images={property.images}
        title={property.title}
        floorPlanUrl={property.floorPlanUrl}
        videoUrl={property.videoUrl}
      />

      {/* Two Column Layout: Main Content (Left) & Sticky Representative Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Property Overview Grid */}
          <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
              Property Overview
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Property Type</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">{property.propertyType}</span>
              </div>

              {property.bedrooms > 0 && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Bedrooms</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">{property.bedrooms} Bed</span>
                </div>
              )}

              {property.bathrooms > 0 && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Bathrooms</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">{property.bathrooms} Bath</span>
                </div>
              )}

              {property.parking > 0 && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Parking</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">{property.parking} Spaces</span>
                </div>
              )}

              {property.landSizeDecimals && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Land Size</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">{property.landSizeDecimals} Decimals</span>
                </div>
              )}

              {property.buildingSizeSqm && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Built Area</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">{property.buildingSizeSqm} m²</span>
                </div>
              )}

              {property.tenure && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Land Title Tenure</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">{property.tenure} Title</span>
                </div>
              )}

              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                <span className="text-stone-400 dark:text-stone-500 block text-[11px]">Availability</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mt-0.5">{property.availability}</span>
              </div>
            </div>
          </div>

          {/* Section: Description with Read More */}
          <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3 transition-colors">
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
              About This Property
            </h3>
            <p className={`text-sm text-stone-600 dark:text-stone-300 leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-4'}`}>
              {property.description}
            </p>
            <button
              type="button"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-xs font-semibold text-stone-900 dark:text-stone-200 hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>{isDescriptionExpanded ? 'Read Less' : 'Read Full Description'}</span>
              {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Section: Features & Amenities */}
          <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
              Features & Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.features.map(feat => (
                <div key={feat} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 p-2 rounded-lg bg-stone-50 dark:bg-stone-800">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Location & Neighborhood */}
          <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                Location & Neighborhood
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">{property.location}, {property.district}</span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Situated in the established {property.location} residential & commercial precinct. Convenient access to major arterial routes, schools, commercial shopping, and health facilities.
            </p>

            {property.neighborhoodHighlights && (
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                  Area Accessibility
                </span>
                <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                  {property.neighborhoodHighlights.map((hl, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section: Verification Panel */}
          <VerificationPanel property={property} />

          {/* Section: Gated Property Insights */}
          <PropertyInsights property={property} />

          {/* Section: Financing Linkage Banner */}
          <div className="p-6 rounded-xl bg-radial from-stone-100 to-stone-50 dark:from-stone-900 dark:to-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
                <CreditCard className="w-4 h-4 text-stone-900 dark:text-white" />
                <span>Looking for Property Financing?</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
                Explore mortgage terms from partner Ugandan commercial institutions including Stanbic Bank, Absa, and Housing Finance Bank.
              </p>
            </div>
            <button
              onClick={() => navigateTo('/financing')}
              className="py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <span>Mortgage Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right 4 Columns: Sticky Representative & Action Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          
          <div className="bg-white dark:bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-5 transition-colors">
            <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              Listing Representative
            </span>

            {/* Rep profile */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center text-base font-bold shrink-0">
                {property.advertiser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                    {property.advertiser.name}
                  </h4>
                  {property.advertiser.verified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                  {property.advertiser.agencyName || property.advertiser.type}
                </p>
              </div>
            </div>

            {/* Rep stats */}
            <div className="grid grid-cols-2 gap-2 text-center p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Response Time</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">{property.advertiser.responseRate}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Representative Type</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">{property.advertiser.type}</span>
              </div>
            </div>

            {/* Protected Contact Information & Buttons */}
            {!currentUser ? (
              <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Representative phone numbers and WhatsApp chats are protected to prevent unsolicited marketing.
                </p>
                <button
                  type="button"
                  onClick={() => openAuthModal('Create a free account to access direct contact details for this property representative.')}
                  className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Sign In to Reveal Contacts
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call or WhatsApp Representative</span>
                </button>
              </div>
            )}

            {/* Schedule Viewing CTA */}
            <button
              type="button"
              onClick={handleRequestViewingClick}
              className="w-full py-2.5 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <span>Request Viewing Inspection</span>
            </button>

            {/* Booking guarantee */}
            <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center leading-normal">
              Zero upfront booking fees. Inspection schedules are confirmed directly with the property representative.
            </p>
          </div>

        </div>

      </div>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-4 py-2 shadow-lg flex items-center gap-3 transition-colors">
        <button
          onClick={handleContactClick}
          className="flex-1 py-2.5 px-3 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contact</span>
        </button>
        <button
          onClick={handleRequestViewingClick}
          className="flex-1 py-2.5 px-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Request Viewing</span>
        </button>
      </div>

      {/* Modals */}
      <ViewingRequestModal
        property={property}
        isOpen={isViewingModalOpen}
        onClose={() => setIsViewingModalOpen(false)}
      />

      <ContactRepresentativeModal
        property={property}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
};

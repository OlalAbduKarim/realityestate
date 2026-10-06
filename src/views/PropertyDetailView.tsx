import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Property } from '../types/property';
import { propertyService } from '../services/propertyService';
import { PropertyGallery } from '../components/PropertyGallery';
import { PropertyCard } from '../components/PropertyCard';
import { ViewingRequestModal } from '../components/ViewingRequestModal';
import { ContactAgentModal } from '../components/ContactAgentModal';
import { VerificationPanel } from '../components/VerificationPanel';
import { PropertyInsights } from '../components/PropertyInsights';
import { formatPriceDisplay } from '../utils/formatters';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  ShieldCheck,
  Calendar,
  Phone,
  MessageSquare,
  CheckCircle2,
  Building,
  Sparkles,
  Scale,
  Check,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PropertyDetailViewProps {
  slug?: string;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ slug }) => {
  const {
    currentUser,
    openAuthModal,
    properties,
    isDataLoading,
    getPropertyBySlug,
    navigateTo,
    isPropertySaved,
    toggleSaveProperty,
    showToast
  } = useApp();

  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isContactAgentModalOpen, setIsContactAgentModalOpen] = useState(false);
  const [contactAgentDefaultTab, setContactAgentDefaultTab] = useState<
    'call' | 'whatsapp' | 'message'
  >('call');
  const [copied, setCopied] = useState(false);
  const [fetchedProperty, setFetchedProperty] = useState<Property | null>(null);
  const [isFetchingBySlug, setIsFetchingBySlug] = useState(false);

  const contextProperty = slug ? getPropertyBySlug(slug) : properties[0];
  const property = contextProperty || fetchedProperty;

  useEffect(() => {
    if (!slug || contextProperty) {
      setFetchedProperty(null);
      return;
    }

    let isMounted = true;
    setIsFetchingBySlug(true);
    propertyService
      .getPropertyBySlug(slug)
      .then((loaded) => {
        if (isMounted) {
          setFetchedProperty(loaded);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFetchedProperty(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsFetchingBySlug(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, contextProperty]);

  if (isDataLoading || isFetchingBySlug) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-stone-950 transition-colors duration-200">
        <Loader2 className="w-8 h-8 text-emerald-700 dark:text-emerald-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Loading property...
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-stone-950 transition-colors duration-200">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
          Property Not Found
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          The property you are looking for might have been removed or is unavailable.
        </p>
        <button
          onClick={() => navigateTo('/search')}
          className="px-6 py-3 bg-emerald-900 text-white rounded-xl font-medium hover:bg-emerald-800 transition-colors"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const isSaved = isPropertySaved(property.id);

  const similarProperties = properties
    .filter(
      (p) =>
        p.id !== property.id &&
        p.listingStatus === 'published' &&
        (p.propertyType === property.propertyType || p.location === property.location)
    )
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopied(true);
    showToast('Property link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScheduleViewingClick = () => {
    if (!currentUser) {
      openAuthModal('Create an account or sign in to continue.', () => {
        setIsViewingModalOpen(true);
      });
      return;
    }
    setIsViewingModalOpen(true);
  };

  const openContactAgent = (tab: 'call' | 'whatsapp' | 'message') => {
    if (!currentUser) {
      openAuthModal('Create an account or sign in to continue.', () => {
        setContactAgentDefaultTab(tab);
        setIsContactAgentModalOpen(true);
      });
      return;
    }
    setContactAgentDefaultTab(tab);
    setIsContactAgentModalOpen(true);
  };

  const advertiserName = property.advertiser?.name || 'Property Representative';
  const advertiserType = property.advertiser?.type || 'Agent';
  const isAdvertiserVerified = Boolean(
    property.verificationDetails?.advertiserVerified ?? property.advertiser?.verified
  );
  const features = Array.isArray(property.features) ? property.features : [];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-20 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigateTo('/search')}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-medium transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied Link' : 'Share'}</span>
            </button>
            <button
              onClick={() => {
                void toggleSaveProperty(property.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                isSaved
                  ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                  : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Non-published notice for owner/admin previewing drafts or pending listings */}
        {property.listingStatus !== 'published' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3 text-amber-900 dark:text-amber-200 text-sm">
            <Clock className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <strong className="font-semibold capitalize">
                {property.listingStatus} Listing Preview:
              </strong>{' '}
              This property is currently {property.listingStatus} and is awaiting verification review before appearing in public search results.
            </div>
          </div>
        )}

        {/* Gallery */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header Info */}
            <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                    property.transaction === 'buy'
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'bg-emerald-800 text-white'
                  }`}
                >
                  {property.transaction === 'buy' ? 'For Sale' : 'For Rent'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {property.propertyType}
                </span>
                {property.verificationStatus === 'verified' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{' '}
                    Verified Listing
                  </span>
                )}
                {property.verificationStatus === 'pending' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1 border border-amber-200 dark:border-amber-800/50">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />{' '}
                    Verification Pending
                  </span>
                )}
                {property.verificationStatus === 'unverified' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Unverified
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 ml-auto">
                  Listed {property.dateAdded}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-3 leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center text-stone-600 dark:text-stone-400 text-base mb-6">
                <MapPin className="w-5 h-5 mr-2 text-emerald-800 dark:text-emerald-500 shrink-0" />
                <span>
                  {property.address ? `${property.address}, ` : ''}
                  {property.location}, {property.district}
                </span>
              </div>

              <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold mb-1">
                    Asking Price
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-emerald-400 tracking-tight">
                    {formatPriceDisplay(
                      property.price,
                      property.transaction,
                      property.pricePeriod,
                      property.currency
                    )}
                  </p>
                </div>

                {/* Key Specs */}
                <div className="flex flex-wrap items-center gap-6 bg-stone-50 dark:bg-stone-800/50 px-5 py-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                      <div>
                        <p className="text-sm font-bold text-stone-900 dark:text-white leading-none">
                          {property.bedrooms}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase">
                          Beds
                        </p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                      <div>
                        <p className="text-sm font-bold text-stone-900 dark:text-white leading-none">
                          {property.bathrooms}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase">
                          Baths
                        </p>
                      </div>
                    </div>
                  )}
                  {property.parking > 0 && (
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                      <div>
                        <p className="text-sm font-bold text-stone-900 dark:text-white leading-none">
                          {property.parking}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase">
                          Parking
                        </p>
                      </div>
                    </div>
                  )}
                  {(property.buildingSizeSqm !== undefined ||
                    property.landSizeDecimals !== undefined) && (
                    <div className="flex items-center gap-2">
                      <Maximize className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                      <div>
                        <p className="text-sm font-bold text-stone-900 dark:text-white leading-none">
                          {property.buildingSizeSqm
                            ? `${property.buildingSizeSqm} m²`
                            : `${property.landSizeDecimals} Decimals`}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase">
                          Size
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ugandan Specific Highlights (Land Tenure, Plot Size, Furnishing) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {property.tenure && (
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase">
                      Land Tenure
                    </p>
                    <p className="font-bold text-stone-900 dark:text-white mt-0.5">
                      {property.tenure}
                    </p>
                  </div>
                </div>
              )}

              {property.landSizeDecimals !== undefined && (
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Maximize className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase">
                      Plot Size
                    </p>
                    <p className="font-bold text-stone-900 dark:text-white mt-0.5">
                      {property.landSizeDecimals} Decimals
                    </p>
                  </div>
                </div>
              )}

              {property.furnished !== undefined && (
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase">
                      Furnishing
                    </p>
                    <p className="font-bold text-stone-900 dark:text-white mt-0.5">
                      {property.furnished ? 'Fully Furnished' : 'Unfurnished'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
                About this property
              </h2>
              <div className="prose prose-stone dark:prose-invert max-w-none text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Verification & Trust Panel */}
            <VerificationPanel property={property} />

            {/* Features & Amenities */}
            {features.length > 0 && (
              <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
                <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-6">
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="text-stone-700 dark:text-stone-300 font-medium text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market & Area Insights */}
            <PropertyInsights property={property} />
          </div>

          {/* Right Column: Sticky Action & Agent Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 space-y-6">
              {/* Primary Action Card */}
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-lg shadow-stone-200/40 dark:shadow-none">
                <div className="flex items-center gap-4 pb-6 border-b border-stone-100 dark:border-stone-800 mb-6">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center justify-center font-bold text-xl">
                      {advertiserName.charAt(0)}
                    </div>
                    {isAdvertiserVerified && (
                      <div
                        className="absolute -bottom-1 -right-1 bg-white dark:bg-stone-900 rounded-full p-0.5"
                        title="Verified Advertiser"
                      >
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-stone-900 dark:text-white text-base">
                        {advertiserName}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      {advertiserType}
                      {property.advertiser?.agencyName
                        ? ` • ${property.advertiser.agencyName}`
                        : ''}
                    </p>
                  </div>
                </div>

                {/* Primary CTA: Schedule Viewing */}
                <button
                  onClick={handleScheduleViewingClick}
                  className="w-full py-4 px-6 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 mb-3 text-base"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule a Viewing
                </button>

                <p className="text-center text-xs text-stone-400 dark:text-stone-500 mb-6">
                  Free, no-obligation physical or virtual tour
                </p>

                {/* Secondary Contact Actions */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => openContactAgent('call')}
                    className="py-3 px-4 border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                    Call Agent
                  </button>
                  <button
                    onClick={() => openContactAgent('whatsapp')}
                    className="py-3 px-4 border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    WhatsApp
                  </button>
                </div>

                {/* Send Formal Enquiry Button */}
                <button
                  onClick={() => openContactAgent('message')}
                  className="w-full mt-3 py-2.5 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  Send Direct Enquiry Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-20 pt-12 border-t border-stone-200 dark:border-stone-800">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-8">
              Similar Properties You Might Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Viewing Request Modal */}
      <ViewingRequestModal
        property={property}
        isOpen={isViewingModalOpen}
        onClose={() => setIsViewingModalOpen(false)}
      />

      {/* Contact Agent Modal */}
      <ContactAgentModal
        isOpen={isContactAgentModalOpen}
        onClose={() => setIsContactAgentModalOpen(false)}
        property={property}
        defaultTab={contactAgentDefaultTab}
      />
    </div>
  );
};

import React from 'react';
import { Property } from '../types/property';
import { formatPriceDisplay } from '../utils/formatters';
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ShieldCheck,
  Building,
  Clock,
  ImageOff,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const { isPropertySaved, toggleSaveProperty, navigateTo, openContactAgentModal } = useApp();
  const isSaved = isPropertySaved(property.id);

  const handleCardClick = () => {
    if (onClick) {
      onClick(property);
    } else if (property.slug && property.id !== 'preview-temp') {
      navigateTo(`/properties/${property.slug}`);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    void toggleSaveProperty(property.id);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openContactAgentModal(property);
  };

  const primaryImage = property.images?.[0] || '';
  const advertiserName = property.advertiser?.name || 'Property Representative';
  const advertiserType = property.advertiser?.type || 'Agent';

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 gap-1.5">
            <ImageOff className="w-7 h-7" />
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase backdrop-blur-md ${
              property.transaction === 'buy'
                ? 'bg-stone-900/80 text-white'
                : 'bg-emerald-800/90 text-white'
            }`}
          >
            {property.transaction === 'buy' ? 'For Sale' : 'For Rent'}
          </span>

          {property.verificationStatus === 'verified' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/95 dark:bg-stone-900/95 text-emerald-900 dark:text-emerald-400 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Verified
            </span>
          )}

          {property.verificationStatus === 'pending' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50/95 dark:bg-amber-950/95 text-amber-800 dark:text-amber-300 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Pending Check
            </span>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center hover:bg-white dark:hover:bg-stone-900 transition-colors shadow-sm"
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved
                ? 'fill-red-500 text-red-500'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          />
        </button>

        {/* Bottom Overlay Info */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12 flex items-end justify-between">
          <div className="text-white">
            <p className="text-lg font-bold tracking-tight">
              {formatPriceDisplay(
                property.price,
                property.transaction,
                property.pricePeriod,
                property.currency
              )}
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-white text-xs font-medium">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center text-stone-500 dark:text-stone-400 text-xs font-medium mb-1.5">
            <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-700 dark:text-emerald-500 shrink-0" />
            <span className="truncate">
              {property.location}, {property.district}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-stone-900 dark:text-white text-base leading-snug mb-3 line-clamp-2 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
            {property.title}
          </h3>
        </div>

        <div>
          {/* Specs Divider */}
          <div className="h-px bg-stone-100 dark:bg-stone-800 my-3" />

          {/* Specifications */}
          <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 text-xs">
            <div className="flex items-center gap-3">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-1" title="Bedrooms">
                  <Bed className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-1" title="Bathrooms">
                  <Bath className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
              )}
              {(property.buildingSizeSqm !== undefined ||
                property.landSizeDecimals !== undefined) && (
                <div className="flex items-center gap-1" title="Size">
                  <Maximize className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <span className="font-medium">
                    {property.buildingSizeSqm
                      ? `${property.buildingSizeSqm} sqm`
                      : `${property.landSizeDecimals} dec`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {property.tenure ? (
                <span className="text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-1.5 py-0.5 rounded">
                  {property.tenure}
                </span>
              ) : (
                <span
                  className="text-[11px] flex items-center gap-0.5 text-stone-400 dark:text-stone-500"
                  title={advertiserName}
                >
                  <Building className="w-3 h-3" />
                  {advertiserType}
                </span>
              )}
              {property.id !== 'preview-temp' && (
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  title={`Contact ${advertiserName}`}
                  aria-label={`Contact ${advertiserName}`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

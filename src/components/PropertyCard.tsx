import React, { useState } from 'react';
import { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import { formatPriceDisplay } from '../utils/formatters';
import { Heart, ShieldCheck, MapPin, Building, ArrowUpRight, Phone } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { navigateTo, isPropertySaved, toggleSaveProperty, openContactAgentModal } = useApp();
  const [imageError, setImageError] = useState(false);
  const saved = isPropertySaved(property.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent triggering if clicked on favourite heart or contact agent button
    if (
      (e.target as HTMLElement).closest('.favorite-btn') ||
      (e.target as HTMLElement).closest('.contact-agent-btn')
    ) {
      return;
    }
    navigateTo(`/properties/${property.slug}`);
  };

  const isVerified = property.verificationStatus === 'verified';

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Visual Slot: Dominant Photography */}
      <div className="relative aspect-4/3 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {!imageError && property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-400 p-4 text-center">
            <Building className="w-8 h-8 mb-2 text-stone-300 dark:text-stone-600" />
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{property.propertyType} in {property.location}</span>
          </div>
        )}

        {/* Transaction Tag & Verification Top Indicators */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="bg-stone-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md tracking-wider uppercase">
            {property.transaction === 'buy' ? 'For Sale' : 'For Rent'}
          </span>

          {isVerified && (
            <span className="bg-emerald-950/85 backdrop-blur-xs text-emerald-300 text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveProperty(property.id);
          }}
          aria-label={saved ? 'Remove from saved' : 'Save property'}
          className={`favorite-btn absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors z-10 ${
            saved 
              ? 'bg-rose-50 text-rose-600 shadow-sm' 
              : 'bg-stone-900/50 hover:bg-stone-900/80 text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Property Type marker */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-[11px] font-medium text-white bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Card Content & Zero-Pill Metadata */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight tabular-nums">
              {formatPriceDisplay(property.price, property.transaction, property.pricePeriod)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
            {property.title}
          </h3>

          {/* Location with icon */}
          <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
            <span className="truncate">{property.location}, {property.district}</span>
          </div>
        </div>

        {/* Metadata Specs - ZERO PILL DISCIPLINE */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            {property.bedrooms > 0 && (
              <>
                <span>{property.bedrooms} beds</span>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
              </>
            )}
            {property.bathrooms > 0 && (
              <>
                <span>{property.bathrooms} baths</span>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
              </>
            )}
            {property.parking > 0 && (
              <>
                <span>{property.parking} park</span>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
              </>
            )}
            {property.landSizeDecimals ? (
              <span>{property.landSizeDecimals} dec</span>
            ) : property.buildingSizeSqm ? (
              <span>{property.buildingSizeSqm} m²</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openContactAgentModal(property);
              }}
              className="contact-agent-btn text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
              title={`Contact agent for ${property.title}`}
            >
              <Phone className="w-3 h-3" />
              <span>Contact Agent</span>
            </button>
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-200 flex items-center gap-0.5 transition-colors shrink-0">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

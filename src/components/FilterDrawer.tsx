import React from 'react';
import { useApp } from '../context/AppContext';
import { PropertyType } from '../types/property';
import { formatUGX } from '../utils/formatters';
import { UGANDAN_REGIONS, POPULAR_NEIGHBORHOODS } from '../data/ugandaLocations';
import { 
  X, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Home, 
  LandPlot, 
  Building2, 
  Building, 
  Briefcase, 
  Store, 
  MapPin, 
  DollarSign 
} from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resultCount: number;
}

const AVAILABLE_FEATURES = [
  'Parking',
  'Garden',
  'Swimming Pool',
  'Furnished',
  'Security',
  'Water Reservoir',
  'Generator',
  'Servants Quarters',
  'Balcony',
  'Air Conditioning',
  'Perimeter Wall',
  'Solar Backup'
];

const PROPERTY_TYPES: { label: string; value: 'all' | PropertyType; icon: React.ElementType }[] = [
  { label: 'All Types', value: 'all', icon: Building2 },
  { label: 'Houses & Homes', value: 'House', icon: Home },
  { label: 'Apartments', value: 'Apartment', icon: Building2 },
  { label: 'Land & Plots', value: 'Land', icon: LandPlot },
  { label: 'Commercial', value: 'Commercial', icon: Building },
  { label: 'Offices', value: 'Office', icon: Briefcase },
  { label: 'Shops & Retail', value: 'Shop', icon: Store },
  { label: 'Warehouses', value: 'Warehouse', icon: Building }
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  resultCount
}) => {
  const { filters, setFilters, resetFilters } = useApp();

  if (!isOpen) return null;

  const toggleFeature = (feature: string) => {
    const current = filters.features;
    if (current.includes(feature)) {
      setFilters({ features: current.filter(f => f !== feature) });
    } else {
      setFilters({ features: [...current, feature] });
    }
  };

  const handlePricePreset = (min: number, max: number) => {
    setFilters({ minPrice: min, maxPrice: max });
  };

  const isSale = filters.transaction === 'buy' || filters.transaction === 'all';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg h-full bg-white dark:bg-stone-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right border-l border-stone-200 dark:border-stone-800 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Filter Properties
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Refine by price range, property type, and prime locations
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 pt-5">
            
            {/* 1. Transaction Type */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Transaction Purpose
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'buy', 'rent'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilters({ transaction: type })}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                      filters.transaction === type 
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs' 
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'buy' ? 'For Sale' : 'For Rent'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Property Type Filter */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Property Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map(({ label, value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilters({ propertyType: value })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      filters.propertyType === value
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-stone-500 dark:text-stone-400" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Location & District Filter */}
            <div className="space-y-3">
              {/* District Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>District (Uganda)</span>
                  </label>
                  {filters.district && filters.district !== 'All Districts' && (
                    <button
                      onClick={() => setFilters({ district: 'All Districts' })}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Reset District
                    </button>
                  )}
                </div>
                <select
                  value={filters.district || 'All Districts'}
                  onChange={e => setFilters({ district: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-stone-900 cursor-pointer"
                >
                  <option value="All Districts">All Districts (Uganda)</option>
                  {UGANDAN_REGIONS.map(region => (
                    <optgroup key={region.name} label={`── ${region.name} ──`}>
                      {region.districts.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Neighborhood Text Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                    <span>Neighborhood / Area</span>
                  </label>
                  {filters.location && filters.location !== 'All Locations' && (
                    <button
                      onClick={() => setFilters({ location: '' })}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    list="drawer-neighborhood-suggestions"
                    value={filters.location === 'All Locations' ? '' : filters.location}
                    onChange={e => setFilters({ location: e.target.value })}
                    placeholder="Type neighborhood (e.g. Kololo, Kira, Naguru)..."
                    className="w-full px-3 py-2 pr-7 text-xs border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-900"
                  />
                  {filters.location && filters.location !== 'All Locations' && (
                    <button
                      type="button"
                      onClick={() => setFilters({ location: '' })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <datalist id="drawer-neighborhood-suggestions">
                    {POPULAR_NEIGHBORHOODS.map(nh => (
                      <option key={nh} value={nh} />
                    ))}
                  </datalist>
                </div>

                {/* Quick neighborhood suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-stone-400">Popular:</span>
                  {['Kololo', 'Naguru', 'Kira', 'Najjera', 'Ntinda', 'Lubowa', 'Muyenga', 'Entebbe'].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFilters({ location: chip })}
                      className={`px-2 py-0.5 text-[10px] rounded-md transition-colors cursor-pointer ${
                        filters.location === chip
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Price Range (UGX) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Price Range (Uganda Shillings)</span>
                </label>
                {(filters.minPrice > 0 || filters.maxPrice < 3000000000) && (
                  <button
                    onClick={() => setFilters({ minPrice: 0, maxPrice: 3000000000 })}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset Price
                  </button>
                )}
              </div>

              {/* Min & Max Inputs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Min Price (UGX)</label>
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ minPrice: Number(e.target.value) || 0 })}
                    placeholder="0"
                    step="10000000"
                    min="0"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">{formatUGX(filters.minPrice || 0, true)}</span>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Max Price (UGX)</label>
                  <input
                    type="number"
                    value={filters.maxPrice >= 3000000000 ? '' : filters.maxPrice}
                    onChange={(e) => setFilters({ maxPrice: Number(e.target.value) || 3000000000 })}
                    placeholder="3,000,000,000"
                    step="10000000"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    {filters.maxPrice >= 3000000000 ? 'Any Max' : formatUGX(filters.maxPrice, true)}
                  </span>
                </div>
              </div>

              {/* Price Preset Brackets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Quick Presets:</span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {isSale ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePricePreset(0, 200000000)}
                        className={`p-1.5 rounded-lg border text-left text-[11px] transition-colors cursor-pointer ${
                          filters.minPrice === 0 && filters.maxPrice === 200000000
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        Under UGX 200M
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePricePreset(200000000, 500000000)}
                        className={`p-1.5 rounded-lg border text-left text-[11px] transition-colors cursor-pointer ${
                          filters.minPrice === 200000000 && filters.maxPrice === 500000000
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        UGX 200M – 500M
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePricePreset(500000000, 1000000000)}
                        className={`p-1.5 rounded-lg border text-left text-[11px] transition-colors cursor-pointer ${
                          filters.minPrice === 500000000 && filters.maxPrice === 1000000000
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        UGX 500M – 1B
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePricePreset(1000000000, 3000000000)}
                        className={`p-1.5 rounded-lg border text-left text-[11px] transition-colors cursor-pointer ${
                          filters.minPrice === 1000000000 && filters.maxPrice === 3000000000
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        Above UGX 1B
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePricePreset(0, 1500000)}
                        className={`p-1.5 rounded-lg border text-left text-[11px] transition-colors cursor-pointer ${
                          filters.minPrice === 0 && filters.maxPrice === 1500000
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        Under 1.5M / mo
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePricePreset(1500000, 3500000)}
                        className={`p-1.5 rounded-lg border text-left text-[11px] transition-colors cursor-pointer ${
                          filters.minPrice === 1500000 && filters.maxPrice === 3500000
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        1.5M – 3.5M / mo
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePricePreset(3500000, 7000000)}
                        className={`p-1.5 rounded-lg border text-left text-[11px] transition-colors cursor-pointer ${
                          filters.minPrice === 3500000 && filters.maxPrice === 7000000
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        3.5M – 7M / mo
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePricePreset(7000000, 3000000000)}
                        className={`p-1.5 rounded-lg border text-left text-[11px] transition-colors cursor-pointer ${
                          filters.minPrice === 7000000 && filters.maxPrice === 3000000000
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        Above 7M / mo
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Verification Status Filter */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Verification Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFilters({ verification: 'all' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                    filters.verification === 'all' 
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold' 
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  All Properties
                </button>
                <button
                  type="button"
                  onClick={() => setFilters({ verification: 'verified_only' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    filters.verification === 'verified_only' 
                      ? 'border-emerald-800 bg-emerald-900 text-white dark:bg-emerald-950/80 dark:border-emerald-600 font-semibold' 
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Only</span>
                </button>
              </div>
            </div>

            {/* 6. Bedrooms selector */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Bedrooms
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {['any', '1', '2', '3', '4', '5+'].map(bed => (
                  <button
                    key={bed}
                    type="button"
                    onClick={() => setFilters({ bedrooms: bed as any })}
                    className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                      filters.bedrooms === bed 
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold' 
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {bed === 'any' ? 'Any' : `${bed}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Bathrooms selector */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Bathrooms
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['any', '1+', '2+', '3+'].map(bath => (
                  <button
                    key={bath}
                    type="button"
                    onClick={() => setFilters({ bathrooms: bath as any })}
                    className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                      filters.bathrooms === bath 
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold' 
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {bath === 'any' ? 'Any' : `${bath}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 8. Features & Amenities Multi-Select */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Features & Amenities
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {AVAILABLE_FEATURES.map(feat => {
                  const isChecked = filters.features.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`py-1.5 px-2.5 text-xs rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isChecked 
                          ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium' 
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span className="truncate">{feat}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 9. Sorting */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Sort Results By
              </label>
              <select
                value={filters.sortBy}
                onChange={e => setFilters({ sortBy: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-stone-900"
              >
                <option value="recommended">Recommended by Platform</option>
                <option value="newest">Recently Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-stone-100 dark:border-stone-800 mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="py-2.5 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer shadow-xs"
          >
            Show {resultCount} {resultCount === 1 ? 'Property' : 'Properties'}
          </button>
        </div>

      </div>
    </div>
  );
};

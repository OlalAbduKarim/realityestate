import React from 'react';
import { useApp } from '../context/AppContext';
import { FilterState, PropertyType } from '../types/property';
import { X, RotateCcw, ShieldCheck } from 'lucide-react';
import { UGANDAN_REGIONS } from '../data/ugandaLocations';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters, resetFilters } = useApp();

  if (!isOpen) return null;

  const propertyTypes: Array<PropertyType | 'all'> = [
    'all',
    'House',
    'Apartment',
    'Land',
    'Commercial',
    'Office',
    'Shop',
    'Warehouse'
  ];

  const bedroomOptions: Array<FilterState['bedrooms']> = ['any', '1', '2', '3', '4', '5+'];
  const bathroomOptions: Array<FilterState['bathrooms']> = ['any', '1+', '2+', '3+'];

  const featureOptions = [
    'Swimming Pool',
    'Solar Backup',
    'Water Reservoir',
    'Perimeter Wall',
    'Security',
    'Furnished',
    'Servants Quarters',
    'Garden'
  ];

  const toggleFeature = (feat: string) => {
    const exists = filters.features.includes(feat);
    const nextFeatures = exists
      ? filters.features.filter((f) => f !== feat)
      : [...filters.features, feat];
    setFilters({ features: nextFeatures });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 transition-colors">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
            Filter Properties
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 dark:text-white mb-3">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
              {(['all', 'buy', 'rent'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilters({ transaction: type })}
                  className={`py-2.5 text-sm font-medium rounded-lg transition-all ${
                    filters.transaction === type
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'buy' ? 'For Sale' : 'For Rent'}
                </button>
              ))}
            </div>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 dark:text-white mb-2">
              District
            </label>
            <select
              value={filters.district || 'All Districts'}
              onChange={(e) => setFilters({ district: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-emerald-800 dark:focus:border-emerald-500"
            >
              <option value="All Districts">All Districts</option>
              {UGANDAN_REGIONS.map((region) => (
                <optgroup key={region.name} label={region.name}>
                  {region.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 dark:text-white mb-3">
              Property Type
            </label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilters({ propertyType: type })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    filters.propertyType === type
                      ? 'border-emerald-800 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range (UGX) */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 dark:text-white mb-3">
              Price Range (UGX)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                  Minimum
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={filters.minPrice > 0 ? filters.minPrice : ''}
                  onChange={(e) =>
                    setFilters({
                      minPrice: e.target.value ? Math.max(0, Number(e.target.value)) : 0
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-emerald-800 dark:focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                  Maximum
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="No Max"
                  value={filters.maxPrice < 3000000000 ? filters.maxPrice : ''}
                  onChange={(e) =>
                    setFilters({
                      maxPrice: e.target.value ? Math.max(0, Number(e.target.value)) : 3000000000
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl text-sm focus:outline-none focus:border-emerald-800 dark:focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          {filters.propertyType !== 'Land' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-stone-900 dark:text-white mb-3">
                  Bedrooms
                </label>
                <div className="flex gap-2">
                  {bedroomOptions.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFilters({ bedrooms: num })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        filters.bedrooms === num
                          ? 'border-emerald-800 dark:border-emerald-600 bg-emerald-900 dark:bg-emerald-700 text-white'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      {num === 'any' ? 'Any' : num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-900 dark:text-white mb-3">
                  Bathrooms
                </label>
                <div className="flex gap-2">
                  {bathroomOptions.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFilters({ bathrooms: num })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        filters.bathrooms === num
                          ? 'border-emerald-800 dark:border-emerald-600 bg-emerald-900 dark:bg-emerald-700 text-white'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      {num === 'any' ? 'Any' : num}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Amenities / Features */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 dark:text-white mb-3">
              Amenities & Features
            </label>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map((feat) => {
                const active = filters.features.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      active
                        ? 'border-emerald-800 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                    }`}
                  >
                    {feat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verified Listings Only Toggle */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 cursor-pointer hover:border-emerald-700/40 transition-colors">
              <input
                type="checkbox"
                checked={filters.verification === 'verified_only'}
                onChange={(e) =>
                  setFilters({
                    verification: e.target.checked ? 'verified_only' : 'all'
                  })
                }
                className="mt-1 w-4 h-4 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Verified Listings Only
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Show only properties that have completed Reality Estates' 4-point registry and field verification check.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

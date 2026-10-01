import React from 'react';
import { useApp } from '../context/AppContext';
import { X, RotateCcw, Check, ShieldCheck } from 'lucide-react';

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md h-full bg-white dark:bg-stone-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right border-l border-stone-200 dark:border-stone-800 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Filter Properties
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 pt-5">
            
            {/* Transaction Segment */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'buy', 'rent'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilters({ transaction: type })}
                    className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors capitalize ${
                      filters.transaction === type 
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'buy' ? 'For Sale' : 'For Rent'}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Status Filter */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Verification Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFilters({ verification: 'all' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                    filters.verification === 'all' 
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  All Properties
                </button>
                <button
                  type="button"
                  onClick={() => setFilters({ verification: 'verified_only' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors flex items-center justify-center gap-1.5 ${
                    filters.verification === 'verified_only' 
                      ? 'border-emerald-800 bg-emerald-900 text-white' 
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Only</span>
                </button>
              </div>
            </div>

            {/* Bedrooms selector */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Bedrooms
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {['any', '1', '2', '3', '4', '5+'].map(bed => (
                  <button
                    key={bed}
                    type="button"
                    onClick={() => setFilters({ bedrooms: bed })}
                    className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                      filters.bedrooms === bed 
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {bed === 'any' ? 'Any' : `${bed}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms selector */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
                Bathrooms
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['any', '1+', '2+', '3+'].map(bath => (
                  <button
                    key={bath}
                    type="button"
                    onClick={() => setFilters({ bathrooms: bath })}
                    className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                      filters.bathrooms === bath 
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {bath === 'any' ? 'Any' : `${bath}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Features & Amenities Multi-Select */}
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
                      className={`py-1.5 px-2.5 text-xs rounded-lg border text-left flex items-center justify-between transition-colors ${
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

            {/* Sorting */}
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
            className="py-2.5 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors text-center"
          >
            Show {resultCount} Properties
          </button>
        </div>

      </div>
    </div>
  );
};

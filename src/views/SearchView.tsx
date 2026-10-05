import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FilterState } from '../types/property';
import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { FilterDrawer } from '../components/FilterDrawer';
import { InteractiveAreaMap } from '../components/InteractiveAreaMap';
import {
  SlidersHorizontal,
  MapPin,
  RotateCcw,
  ArrowUpDown,
  LayoutGrid,
  Map as MapIcon,
  ShieldCheck
} from 'lucide-react';

export const SearchView: React.FC = () => {
  const {
    properties,
    filters,
    setFilters,
    resetFilters,
    navigateTo
  } = useApp();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filter and Sort Properties (only published properties appear in public search)
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        if (p.listingStatus !== 'published') return false;

        // Transaction Type
        if (filters.transaction !== 'all' && p.transaction !== filters.transaction) {
          return false;
        }
        // Property Type
        if (filters.propertyType !== 'all' && p.propertyType !== filters.propertyType) {
          return false;
        }
        // District
        if (
          filters.district &&
          filters.district !== 'All Districts' &&
          p.district.toLowerCase() !== filters.district.toLowerCase()
        ) {
          return false;
        }
        // Location (Neighborhood, District, Address, or Title match)
        if (filters.location.trim() !== '') {
          const q = filters.location.toLowerCase().trim();
          const matchNeighborhood = p.location.toLowerCase().includes(q);
          const matchDistrict = p.district.toLowerCase().includes(q);
          const matchAddress = p.address.toLowerCase().includes(q);
          const matchTitle = p.title.toLowerCase().includes(q);
          if (!matchNeighborhood && !matchDistrict && !matchAddress && !matchTitle) return false;
        }
        // Min Price
        if (filters.minPrice > 0 && p.price < filters.minPrice) {
          return false;
        }
        // Max Price
        if (filters.maxPrice < 3000000000 && p.price > filters.maxPrice) {
          return false;
        }
        // Bedrooms
        if (filters.bedrooms !== 'any') {
          const minBeds = filters.bedrooms === '5+' ? 5 : Number(filters.bedrooms);
          if (p.bedrooms < minBeds) return false;
        }
        // Bathrooms
        if (filters.bathrooms !== 'any') {
          const minBaths = parseInt(filters.bathrooms, 10);
          if (p.bathrooms < minBaths) return false;
        }
        // Features
        if (filters.features.length > 0) {
          const hasAll = filters.features.every((f) => p.features.includes(f));
          if (!hasAll) return false;
        }
        // Verified Only
        if (filters.verification === 'verified_only' && p.verificationStatus !== 'verified') {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.price - b.price;
        if (filters.sortBy === 'price_desc') return b.price - a.price;
        if (filters.sortBy === 'newest') {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
        // recommended: verified & featured first
        const scoreA = (a.verificationStatus === 'verified' ? 2 : 0) + (a.featured ? 1 : 0);
        const scoreB = (b.verificationStatus === 'verified' ? 2 : 0) + (b.featured ? 1 : 0);
        return scoreB - scoreA;
      });
  }, [properties, filters]);

  const activeFilterCount = [
    filters.transaction !== 'all',
    filters.propertyType !== 'all',
    filters.district && filters.district !== 'All Districts',
    filters.location !== '',
    filters.minPrice > 0,
    filters.maxPrice < 3000000000,
    filters.bedrooms !== 'any',
    filters.bathrooms !== 'any',
    filters.features.length > 0,
    filters.verification === 'verified_only'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 transition-colors duration-200">
      {/* Sticky Search Header */}
      <SearchBar
        variant="compact"
        onOpenAdvancedFilters={() => setIsFilterDrawerOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Controls & Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              {filters.transaction === 'buy'
                ? 'Properties for Sale'
                : filters.transaction === 'rent'
                ? 'Properties for Rent'
                : 'All Properties'}{' '}
              {filters.location
                ? `in "${filters.location}"`
                : filters.district && filters.district !== 'All Districts'
                ? `in ${filters.district}`
                : 'in Uganda'}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Showing{' '}
              <span className="font-semibold text-stone-900 dark:text-white">
                {filteredProperties.length}
              </span>{' '}
              available listings
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle (Grid vs Interactive Map) */}
            <div className="flex bg-stone-200/70 dark:bg-stone-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                Map Explorer
              </button>
            </div>

            {/* Verified Only Quick Toggle */}
            <button
              onClick={() =>
                setFilters({
                  verification:
                    filters.verification === 'verified_only' ? 'all' : 'verified_only'
                })
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold transition-colors ${
                filters.verification === 'verified_only'
                  ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300'
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Verified Only
            </button>

            {/* Filter Drawer Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>More Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-900 dark:bg-emerald-600 text-white text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2 shadow-sm">
              <ArrowUpDown className="w-4 h-4 text-stone-400 dark:text-stone-500 mr-2 pointer-events-none" />
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    sortBy: e.target.value as FilterState['sortBy']
                  })
                }
                className="appearance-none bg-transparent text-sm font-medium text-stone-700 dark:text-stone-200 pr-4 focus:outline-none cursor-pointer [&>option]:bg-white dark:[&>option]:bg-stone-900"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 mr-1">
              Active filters:
            </span>

            {filters.transaction !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {filters.transaction === 'buy' ? 'For Sale' : 'For Rent'}
                <button
                  onClick={() => setFilters({ transaction: 'all' })}
                  className="hover:text-emerald-600"
                >
                  ×
                </button>
              </span>
            )}

            {filters.propertyType !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Type: {filters.propertyType}
                <button
                  onClick={() => setFilters({ propertyType: 'all' })}
                  className="hover:text-emerald-600"
                >
                  ×
                </button>
              </span>
            )}

            {filters.district && filters.district !== 'All Districts' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                District: {filters.district}
                <button
                  onClick={() => setFilters({ district: 'All Districts' })}
                  className="hover:text-emerald-600"
                >
                  ×
                </button>
              </span>
            )}

            {filters.location !== '' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Area: {filters.location}
                <button
                  onClick={() => setFilters({ location: '' })}
                  className="hover:text-emerald-600"
                >
                  ×
                </button>
              </span>
            )}

            {filters.bedrooms !== 'any' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {filters.bedrooms}+ Beds
                <button
                  onClick={() => setFilters({ bedrooms: 'any' })}
                  className="hover:text-emerald-600"
                >
                  ×
                </button>
              </span>
            )}

            {filters.verification === 'verified_only' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified Only
                <button
                  onClick={() => setFilters({ verification: 'all' })}
                  className="hover:text-emerald-600"
                >
                  ×
                </button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Grid or Interactive Map */}
        {filteredProperties.length > 0 ? (
          viewMode === 'map' ? (
            <div className="mb-12 h-[540px]">
              <InteractiveAreaMap
                properties={filteredProperties}
                onSelectProperty={(p) => navigateTo(`/properties/${p.slug}`)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
              No matching properties found
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
              We couldn't find any properties matching your exact criteria. Try broadening your location search or adjusting your price filters.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      />
    </div>
  );
};

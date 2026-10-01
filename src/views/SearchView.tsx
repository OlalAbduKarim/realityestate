import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveAreaMap } from '../components/InteractiveAreaMap';
import { FilterDrawer } from '../components/FilterDrawer';
import { Property } from '../types/property';
import { 
  SlidersHorizontal, 
  Map, 
  Grid3X3, 
  RotateCcw, 
  ShieldCheck, 
  Building
} from 'lucide-react';

export const SearchView: React.FC = () => {
  const { properties, filters, setFilters, resetFilters, navigateTo } = useApp();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [selectedMapProperty, setSelectedMapProperty] = useState<Property | null>(null);

  // Filter properties based on active filter state
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // Transaction
      if (filters.transaction !== 'all' && prop.transaction !== filters.transaction) {
        return false;
      }
      // Property Type
      if (filters.propertyType !== 'all' && prop.propertyType !== filters.propertyType) {
        return false;
      }
      // Location
      if (filters.location && filters.location !== 'All Locations') {
        const queryLoc = filters.location.toLowerCase();
        const matchesLoc = prop.location.toLowerCase().includes(queryLoc) ||
          prop.district.toLowerCase().includes(queryLoc) ||
          prop.address.toLowerCase().includes(queryLoc);
        if (!matchesLoc) return false;
      }
      // Price
      if (filters.maxPrice && prop.price > filters.maxPrice) {
        return false;
      }
      if (filters.minPrice && prop.price < filters.minPrice) {
        return false;
      }
      // Bedrooms
      if (filters.bedrooms !== 'any') {
        const reqBeds = parseInt(filters.bedrooms, 10);
        if (filters.bedrooms === '5+') {
          if (prop.bedrooms < 5) return false;
        } else if (prop.bedrooms < reqBeds) {
          return false;
        }
      }
      // Bathrooms
      if (filters.bathrooms !== 'any') {
        const reqBaths = parseInt(filters.bathrooms.replace('+', ''), 10);
        if (prop.bathrooms < reqBaths) return false;
      }
      // Verification
      if (filters.verification === 'verified_only' && prop.verificationStatus !== 'verified') {
        return false;
      }
      // Features
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(f => prop.features.includes(f));
        if (!hasAllFeatures) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      if (filters.sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price_desc') {
        return b.price - a.price;
      }
      // Recommended: Featured first, then verified
      if (a.featured !== b.featured) return b.featured ? 1 : -1;
      if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
      if (b.verificationStatus === 'verified' && a.verificationStatus !== 'verified') return 1;
      return 0;
    });
  }, [properties, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
              Find Your Next Property
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Showing <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">{filteredProperties.length}</span> properties across Uganda
            </p>
          </div>

          {/* View Toggles & Filter trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="py-2 px-3.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {filters.features.length > 0 ? `(${filters.features.length})` : ''}</span>
            </button>

            {/* Desktop View Switcher (Grid vs Split Map) */}
            <div className="hidden lg:flex items-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'split' ? 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-white' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
                title="Split Map View"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Horizontal Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          
          {/* Transaction Quick Chips */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg shrink-0">
            <button
              onClick={() => setFilters({ transaction: 'all' })}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filters.transaction === 'all' 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilters({ transaction: 'buy' })}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filters.transaction === 'buy' 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setFilters({ transaction: 'rent' })}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filters.transaction === 'rent' 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              For Rent
            </button>
          </div>

          {/* Property Types */}
          {['House', 'Apartment', 'Land', 'Commercial'].map(pt => (
            <button
              key={pt}
              onClick={() => setFilters({ propertyType: filters.propertyType === pt ? 'all' : pt as any })}
              className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors shrink-0 ${
                filters.propertyType === pt 
                  ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              {pt === 'Land' ? 'Titled Land' : pt}
            </button>
          ))}

          {/* Verified Only Chip */}
          <button
            onClick={() => setFilters({ verification: filters.verification === 'verified_only' ? 'all' : 'verified_only' })}
            className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 ${
              filters.verification === 'verified_only' 
                ? 'border-emerald-800 bg-emerald-900 text-white dark:bg-emerald-950/80 dark:border-emerald-600' 
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Only</span>
          </button>

          {/* Sort Selector */}
          <div className="ml-auto shrink-0 flex items-center gap-1.5 pl-2">
            <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={e => setFilters({ sortBy: e.target.value as any })}
              className="py-1.5 px-2.5 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-stone-900"
            >
              <option value="recommended" className="dark:bg-stone-800">Recommended</option>
              <option value="newest" className="dark:bg-stone-800">Newest Listed</option>
              <option value="price_asc" className="dark:bg-stone-800">Price: Low to High</option>
              <option value="price_desc" className="dark:bg-stone-800">Price: High to Low</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={resetFilters}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredProperties.length === 0 ? (
        // Empty State
        <div className="py-20 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 transition-colors">
          <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400 mb-4">
            <Building className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
            No properties found
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Try widening your search filters, adjusting your price range, or clearing location parameters.
          </p>
          <div className="mt-6">
            <button
              onClick={resetFilters}
              className="py-2 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'split' ? (
        // Split Screen View: List + Interactive Area Map
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Scrollable Property Cards */}
          <div className="lg:col-span-6 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProperties.map(property => (
                <div
                  key={property.id}
                  onMouseEnter={() => setSelectedMapProperty(property)}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sticky Interactive Map */}
          <div className="lg:col-span-6 sticky top-24 h-[calc(100vh-220px)]">
            <InteractiveAreaMap
              properties={filteredProperties}
              selectedProperty={selectedMapProperty}
              onSelectProperty={(prop) => navigateTo(`/properties/${prop.slug}`)}
            />
          </div>
        </div>
      ) : (
        // Full Width Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Advanced Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        resultCount={filteredProperties.length}
      />

    </div>
  );
};

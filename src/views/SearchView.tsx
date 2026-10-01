import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { FilterDrawer } from '../components/FilterDrawer';
import { InteractiveAreaMap } from '../components/InteractiveAreaMap';
import { formatUGX } from '../utils/formatters';
import { Property, PropertyType } from '../types/property';
import { 
  SlidersHorizontal, 
  Map, 
  LayoutGrid, 
  RotateCcw, 
  Search, 
  X, 
  ShieldCheck,
  Check,
  MapPin,
  DollarSign,
  ChevronDown,
  Home,
  Building2,
  LandPlot,
  Building,
  Briefcase,
  Store,
  Layers
} from 'lucide-react';

import { UGANDAN_REGIONS, ALL_UGANDAN_DISTRICTS, POPULAR_NEIGHBORHOODS } from '../data/ugandaLocations';

const PROPERTY_TYPES: { label: string; value: 'all' | PropertyType; icon: React.ElementType }[] = [
  { label: 'All', value: 'all', icon: Layers },
  { label: 'Houses', value: 'House', icon: Home },
  { label: 'Apartments', value: 'Apartment', icon: Building2 },
  { label: 'Land', value: 'Land', icon: LandPlot },
  { label: 'Commercial', value: 'Commercial', icon: Building },
  { label: 'Offices', value: 'Office', icon: Briefcase },
  { label: 'Warehouses', value: 'Warehouse', icon: Building }
];

export const SearchView: React.FC = () => {
  const { properties, filters, setFilters, resetFilters, navigateTo } = useApp();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showMapSplit, setShowMapSplit] = useState(false);
  const [selectedMapProperty, setSelectedMapProperty] = useState<Property | null>(null);

  // Price popover state
  const [isPriceMenuOpen, setIsPriceMenuOpen] = useState(false);
  const priceMenuRef = useRef<HTMLDivElement>(null);

  // Temporary price inputs inside popover
  const [tempMinPrice, setTempMinPrice] = useState<number>(filters.minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(filters.maxPrice);

  // Sync temp prices when filters change externally
  useEffect(() => {
    setTempMinPrice(filters.minPrice);
    setTempMaxPrice(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  // Close price popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (priceMenuRef.current && !priceMenuRef.current.contains(e.target as Node)) {
        setIsPriceMenuOpen(false);
      }
    };
    if (isPriceMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isPriceMenuOpen]);

  // Filter properties according to active filter state
  const filteredProperties = useMemo(() => {
    return properties.filter(item => {
      // Transaction type
      if (filters.transaction !== 'all' && item.transaction !== filters.transaction) {
        return false;
      }

      // Property type
      if (filters.propertyType !== 'all' && item.propertyType !== filters.propertyType) {
        return false;
      }

      // District match
      if (filters.district && filters.district !== 'All Districts' && filters.district !== 'All Locations') {
        const queryDist = filters.district.toLowerCase();
        const matchesDistrict = item.district.toLowerCase() === queryDist ||
                                item.district.toLowerCase().includes(queryDist);
        if (!matchesDistrict) return false;
      }

      // Neighborhood / Location typed-in match
      if (filters.location && filters.location !== 'All Locations' && filters.location.trim() !== '') {
        const queryLoc = filters.location.toLowerCase().trim();
        const matchesLoc = item.location.toLowerCase().includes(queryLoc) || 
                           item.district.toLowerCase().includes(queryLoc) ||
                           item.address.toLowerCase().includes(queryLoc);
        if (!matchesLoc) return false;
      }

      // Price range
      if (filters.minPrice > 0 && item.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice < 3000000000 && item.price > filters.maxPrice) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms !== 'any') {
        const bedNum = parseInt(filters.bedrooms);
        if (item.bedrooms < bedNum) return false;
      }

      // Bathrooms
      if (filters.bathrooms !== 'any') {
        const bathNum = parseInt(filters.bathrooms);
        if (item.bathrooms < bathNum) return false;
      }

      // Verification
      if (filters.verification === 'verified_only' && item.verificationStatus !== 'verified') {
        return false;
      }

      // Features
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feat => item.features.includes(feat));
        if (!hasAllFeatures) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'newest') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      // recommended / featured
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [properties, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.transaction !== 'all') count++;
    if (filters.propertyType !== 'all') count++;
    if (filters.district && filters.district !== 'All Districts' && filters.district !== 'All Locations') count++;
    if (filters.location && filters.location !== 'All Locations' && filters.location.trim() !== '') count++;
    if (filters.minPrice > 0 || filters.maxPrice < 3000000000) count++;
    if (filters.bedrooms !== 'any') count++;
    if (filters.bathrooms !== 'any') count++;
    if (filters.verification !== 'all') count++;
    count += filters.features.length;
    return count;
  }, [filters]);

  const hasPriceFilter = filters.minPrice > 0 || filters.maxPrice < 3000000000;

  const handleApplyPrice = (min: number, max: number) => {
    setFilters({ minPrice: min, maxPrice: max });
    setIsPriceMenuOpen(false);
  };

  const handleResetPrice = () => {
    setFilters({ minPrice: 0, maxPrice: 3000000000 });
    setTempMinPrice(0);
    setTempMaxPrice(3000000000);
    setIsPriceMenuOpen(false);
  };

  const isSale = filters.transaction === 'buy' || filters.transaction === 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Search Controls Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
        
        {/* Row 1: Primary Discovery Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Transaction Tabs (Buy / Rent / All) */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setFilters({ transaction: 'all' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filters.transaction === 'all' 
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setFilters({ transaction: 'buy' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filters.transaction === 'buy' 
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setFilters({ transaction: 'rent' })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filters.transaction === 'rent' 
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              For Rent
            </button>
          </div>

          {/* Location, Price, Verification, and Advanced Filters Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* 1. Location Selector */}
            {/* 1. District Selector (All 136 Ugandan Districts) */}
            <div className="relative">
              <select
                value={filters.district || 'All Districts'}
                onChange={(e) => setFilters({ district: e.target.value })}
                className="text-xs font-medium py-2 pl-8 pr-7 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
              >
                <option value="All Districts">📍 All Districts</option>
                {UGANDAN_REGIONS.map(region => (
                  <optgroup key={region.name} label={`── ${region.name} ──`}>
                    {region.districts.map(dist => (
                      <option key={dist} value={dist}>📍 {dist}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 2. Neighborhood / Area Input (Free text typing) */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                list="search-view-neighborhoods"
                value={filters.location === 'All Locations' ? '' : filters.location}
                onChange={(e) => setFilters({ location: e.target.value })}
                placeholder="Type neighborhood..."
                className="text-xs font-medium py-2 pl-8 pr-7 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-stone-400 w-36 sm:w-44"
              />
              {filters.location && filters.location !== 'All Locations' && (
                <button
                  type="button"
                  onClick={() => setFilters({ location: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  title="Clear neighborhood"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <datalist id="search-view-neighborhoods">
                {POPULAR_NEIGHBORHOODS.map(nh => (
                  <option key={nh} value={nh} />
                ))}
              </datalist>
            </div>

            {/* 2. Price Range Popover Button */}
            <div className="relative" ref={priceMenuRef}>
              <button
                type="button"
                onClick={() => setIsPriceMenuOpen(!isPriceMenuOpen)}
                className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  hasPriceFilter
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-stone-400'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {hasPriceFilter 
                    ? `${formatUGX(filters.minPrice, true)} – ${filters.maxPrice >= 3000000000 ? 'Any' : formatUGX(filters.maxPrice, true)}`
                    : 'Price Range'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {/* Price Range Dropdown Popover */}
              {isPriceMenuOpen && (
                <div className="absolute top-full left-0 mt-2 z-40 w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                    <span className="text-xs font-serif font-bold text-stone-900 dark:text-white">
                      Price Range (UGX)
                    </span>
                    {hasPriceFilter && (
                      <button
                        type="button"
                        onClick={handleResetPrice}
                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Manual Min & Max Inputs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Min Price</label>
                      <input
                        type="number"
                        value={tempMinPrice || ''}
                        onChange={(e) => setTempMinPrice(Number(e.target.value) || 0)}
                        placeholder="0"
                        step="10000000"
                        className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                      />
                      <span className="text-[10px] text-stone-500 mt-0.5 block">{formatUGX(tempMinPrice, true)}</span>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Max Price</label>
                      <input
                        type="number"
                        value={tempMaxPrice >= 3000000000 ? '' : tempMaxPrice}
                        onChange={(e) => setTempMaxPrice(Number(e.target.value) || 3000000000)}
                        placeholder="3,000,000,000"
                        step="10000000"
                        className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                      />
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        {tempMaxPrice >= 3000000000 ? 'Any Max' : formatUGX(tempMaxPrice, true)}
                      </span>
                    </div>
                  </div>

                  {/* Preset Brackets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Quick Brackets:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {isSale ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApplyPrice(0, 200000000)}
                            className="p-1.5 text-[11px] text-left rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            Under UGX 200M
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPrice(200000000, 500000000)}
                            className="p-1.5 text-[11px] text-left rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            UGX 200M – 500M
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPrice(500000000, 1000000000)}
                            className="p-1.5 text-[11px] text-left rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            UGX 500M – 1B
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPrice(1000000000, 3000000000)}
                            className="p-1.5 text-[11px] text-left rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            Above UGX 1B
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApplyPrice(0, 1500000)}
                            className="p-1.5 text-[11px] text-left rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            Under 1.5M / mo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPrice(1500000, 3500000)}
                            className="p-1.5 text-[11px] text-left rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            1.5M – 3.5M / mo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPrice(3500000, 7000000)}
                            className="p-1.5 text-[11px] text-left rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            3.5M – 7M / mo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyPrice(7000000, 3000000000)}
                            className="p-1.5 text-[11px] text-left rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                          >
                            Above 7M / mo
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Apply Custom Button */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyPrice(tempMinPrice, tempMaxPrice)}
                      className="w-full py-2 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-white"
                    >
                      Apply Custom Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Verification Only Toggle */}
            <button
              onClick={() => setFilters({ verification: filters.verification === 'verified_only' ? 'all' : 'verified_only' })}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                filters.verification === 'verified_only'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Only</span>
            </button>

            {/* 4. Advanced Filters Button (Opens Drawer) */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>All Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </button>
          </div>

          {/* View Toggles (Grid vs Map Split) */}
          <div className="flex items-center gap-1 border-l border-stone-200 dark:border-stone-800 pl-3">
            <button
              onClick={() => setShowMapSplit(false)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                !showMapSplit 
                  ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white' 
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMapSplit(true)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showMapSplit 
                  ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white' 
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              title="Split Map View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Property Type Visual Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-stone-100 dark:border-stone-800 text-xs">
          <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider shrink-0 mr-1">
            Type:
          </span>
          {PROPERTY_TYPES.map(({ label, value, icon: Icon }) => {
            const isSelected = filters.propertyType === value;
            const count = value === 'all' 
              ? properties.length 
              : properties.filter(p => p.propertyType === value).length;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilters({ propertyType: value })}
                className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 font-semibold shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400 dark:text-emerald-600' : 'text-stone-400'}`} />
                <span>{label}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                  isSelected ? 'bg-stone-700 text-stone-200 dark:bg-stone-300 dark:text-stone-800' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filter Badges Bar */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Active filters:</span>
            
            {/* Transaction Badge */}
            {filters.transaction !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                <span>{filters.transaction === 'buy' ? 'For Sale' : 'For Rent'}</span>
                <button 
                  onClick={() => setFilters({ transaction: 'all' })}
                  className="hover:text-rose-500 cursor-pointer"
                  title="Remove transaction filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* District Badge */}
            {filters.district && filters.district !== 'All Districts' && filters.district !== 'All Locations' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>District: {filters.district}</span>
                <button 
                  onClick={() => setFilters({ district: 'All Districts' })}
                  className="hover:text-rose-500 cursor-pointer"
                  title="Remove district filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Neighborhood Badge */}
            {filters.location && filters.location !== 'All Locations' && filters.location.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Search className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Neighborhood: {filters.location}</span>
                <button 
                  onClick={() => setFilters({ location: '' })}
                  className="hover:text-rose-500 cursor-pointer"
                  title="Remove neighborhood filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Property Type Badge */}
            {filters.propertyType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                <span>Type: {filters.propertyType}</span>
                <button 
                  onClick={() => setFilters({ propertyType: 'all' })}
                  className="hover:text-rose-500 cursor-pointer"
                  title="Remove property type filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Price Range Badge */}
            {hasPriceFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Price: {formatUGX(filters.minPrice, true)} – {filters.maxPrice >= 3000000000 ? 'Any' : formatUGX(filters.maxPrice, true)}
                </span>
                <button 
                  onClick={handleResetPrice}
                  className="hover:text-rose-500 cursor-pointer"
                  title="Reset price range"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Verified Only Badge */}
            {filters.verification === 'verified_only' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Only</span>
                <button 
                  onClick={() => setFilters({ verification: 'all' })}
                  className="hover:text-rose-500 cursor-pointer"
                  title="Remove verified filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Features Badges */}
            {filters.features.map(feat => (
              <span key={feat} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                <span>{feat}</span>
                <button 
                  onClick={() => setFilters({ features: filters.features.filter(f => f !== feat) })}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Clear All Reset Button */}
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline ml-2 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Header: Count & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Available
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Prices displayed in Uganda Shillings (UGX) • Verified GPS and cadastral data
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-xs text-stone-500 dark:text-stone-400">Sort by:</label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value as any })}
            className="text-xs font-medium py-1.5 px-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
          >
            <option value="recommended">Recommended & Verified</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Recently Listed</option>
          </select>
        </div>
      </div>

      {/* Main Content: Split Map or Full Grid */}
      {showMapSplit ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Property Cards Column */}
          <div className="lg:col-span-6 space-y-4 h-[750px] overflow-y-auto pr-1">
            {filteredProperties.length === 0 ? (
              <EmptyState 
                resetFilters={resetFilters} 
                filters={filters}
                setFilters={setFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>

          {/* Interactive Map Column */}
          <div className="lg:col-span-6 sticky top-22 h-[750px] rounded-2xl overflow-hidden shadow-sm">
            <InteractiveAreaMap 
              properties={filteredProperties}
              selectedProperty={selectedMapProperty}
              onSelectProperty={(p) => {
                setSelectedMapProperty(p);
                navigateTo(`/properties/${p.slug}`);
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          {filteredProperties.length === 0 ? (
            <EmptyState 
              resetFilters={resetFilters} 
              filters={filters}
              setFilters={setFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
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

const EmptyState: React.FC<{ 
  resetFilters: () => void;
  filters: any;
  setFilters: (f: any) => void;
}> = ({ resetFilters, filters, setFilters }) => {
  return (
    <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-w-lg mx-auto transition-colors">
      <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto text-stone-500 dark:text-stone-400">
        <Search className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
          No matching properties found
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
          We couldn't find listings matching your current filter combination. Try clearing your price ceiling or expanding your location selection.
        </p>
      </div>

      {/* Quick suggestions to loosen filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {filters.district && filters.district !== 'All Districts' && filters.district !== 'All Locations' && (
          <button
            type="button"
            onClick={() => setFilters({ district: 'All Districts' })}
            className="py-1.5 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            Clear District ({filters.district})
          </button>
        )}

        {filters.location && filters.location !== 'All Locations' && filters.location.trim() !== '' && (
          <button
            type="button"
            onClick={() => setFilters({ location: '' })}
            className="py-1.5 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            Clear Neighborhood ({filters.location})
          </button>
        )}

        {(filters.minPrice > 0 || filters.maxPrice < 3000000000) && (
          <button
            type="button"
            onClick={() => setFilters({ minPrice: 0, maxPrice: 3000000000 })}
            className="py-1.5 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            Clear Price Range
          </button>
        )}

        {filters.propertyType !== 'all' && (
          <button
            type="button"
            onClick={() => setFilters({ propertyType: 'all' })}
            className="py-1.5 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            Any Property Type
          </button>
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={resetFilters}
          className="py-2.5 px-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

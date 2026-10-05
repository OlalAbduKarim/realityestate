import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyType } from '../types/property';
import { Search, MapPin, Home, DollarSign, SlidersHorizontal, ChevronDown } from 'lucide-react';
import {
  UGANDAN_REGIONS,
  ALL_UGANDAN_DISTRICTS,
  POPULAR_NEIGHBORHOODS
} from '../data/ugandaLocations';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  onOpenAdvancedFilters?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ variant = 'hero', onOpenAdvancedFilters }) => {
  const { filters, setFilters, navigateTo } = useApp();
  const [showLocations, setShowLocations] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocations(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('/search');
  };

  const query = filters.location.toLowerCase().trim();
  const matchingDistricts = query
    ? ALL_UGANDAN_DISTRICTS.filter((d) => d.toLowerCase().includes(query)).slice(0, 8)
    : [];

  const matchingNeighborhoods = query
    ? POPULAR_NEIGHBORHOODS.filter((loc) => loc.toLowerCase().includes(query)).slice(0, 8)
    : POPULAR_NEIGHBORHOODS.slice(0, 8);

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-20 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Transaction Type Toggle */}
            <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
              {(['all', 'buy', 'rent'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilters({ transaction: type })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filters.transaction === type
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'buy' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>

            {/* Location Input */}
            <div className="relative flex-1 min-w-[200px]" ref={locationRef}>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="District or neighborhood (e.g. Kololo, Mbarara, Gulu)..."
                  value={filters.location}
                  onChange={(e) => {
                    setFilters({ location: e.target.value });
                    setShowLocations(true);
                  }}
                  onFocus={() => setShowLocations(true)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 dark:focus:ring-emerald-500/20 focus:border-emerald-800 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-900 transition-all"
                />
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocations && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 py-2 z-50 max-h-80 overflow-y-auto">
                  {!filters.location ? (
                    <>
                      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                        Popular Neighborhoods
                      </div>
                      {POPULAR_NEIGHBORHOODS.slice(0, 6).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setFilters({ location: loc, district: 'All Districts' });
                            setShowLocations(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
                            {loc}
                          </span>
                        </button>
                      ))}
                      <div className="px-3 py-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 border-t border-stone-100 dark:border-stone-800 pt-2">
                        Browse Ugandan Districts by Region
                      </div>
                      {UGANDAN_REGIONS.map((reg) => (
                        <div key={reg.name} className="px-3.5 py-1.5">
                          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                            {reg.name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {reg.districts.slice(0, 6).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => {
                                  setFilters({ location: '', district: d });
                                  setShowLocations(false);
                                }}
                                className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-stone-700 dark:text-stone-300 rounded"
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {matchingDistricts.length > 0 && (
                        <>
                          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                            Districts
                          </div>
                          {matchingDistricts.map((dist) => (
                            <button
                              key={dist}
                              type="button"
                              onClick={() => {
                                setFilters({ location: '', district: dist });
                                setShowLocations(false);
                              }}
                              className="w-full text-left px-3.5 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
                                {dist} District
                              </span>
                            </button>
                          ))}
                        </>
                      )}

                      {matchingNeighborhoods.length > 0 && (
                        <>
                          <div className="px-3 py-1 mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                            Neighborhoods & Towns
                          </div>
                          {matchingNeighborhoods.map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setFilters({ location: loc, district: 'All Districts' });
                                setShowLocations(false);
                              }}
                              className="w-full text-left px-3.5 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between"
                            >
                              <span className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                                {loc}
                              </span>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Property Type Select */}
            <div className="relative min-w-[140px] hidden sm:block">
              <select
                value={filters.propertyType}
                onChange={(e) =>
                  setFilters({
                    propertyType: e.target.value as PropertyType | 'all'
                  })
                }
                className="w-full appearance-none pl-3.5 pr-8 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 dark:focus:ring-emerald-500/20 focus:border-emerald-800 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-900"
              >
                <option value="all">All Types</option>
                <option value="House">Houses</option>
                <option value="Apartment">Apartments</option>
                <option value="Land">Land & Plots</option>
                <option value="Commercial">Commercial</option>
                <option value="Office">Offices</option>
                <option value="Shop">Shops & Retail</option>
                <option value="Warehouse">Warehouses</option>
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Drawer Trigger */}
            {onOpenAdvancedFilters && (
              <button
                type="button"
                onClick={onOpenAdvancedFilters}
                className="flex items-center gap-2 px-3.5 py-2 border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden md:inline">Filters</span>
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Hero Variant
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Transaction Type Tabs */}
      <div className="inline-flex bg-stone-900/60 backdrop-blur-md p-1.5 rounded-t-2xl border-t border-x border-white/15">
        {(['all', 'buy', 'rent'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilters({ transaction: type })}
            className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
              filters.transaction === type
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {type === 'all' ? 'All Properties' : type === 'buy' ? 'For Sale' : 'For Rent'}
          </button>
        ))}
      </div>

      {/* Main Search Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-2xl shadow-stone-950/20 border border-stone-100 dark:border-stone-800 flex flex-col md:flex-row items-center gap-3 transition-colors duration-200"
      >
        {/* Location Field */}
        <div
          className="relative w-full md:flex-1 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 pb-3 md:pb-0 md:pr-3"
          ref={locationRef}
        >
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1 pl-8 text-left">
            Location (All Uganda)
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-5 h-5 text-emerald-800 dark:text-emerald-500 absolute left-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Any district or area (e.g. Kololo, Mbarara, Gulu)..."
              value={filters.location}
              onChange={(e) => {
                setFilters({ location: e.target.value });
                setShowLocations(true);
              }}
              onFocus={() => setShowLocations(true)}
              className="w-full pl-8 pr-4 py-1 bg-transparent text-stone-900 dark:text-white font-medium placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* Location Dropdown */}
          {showLocations && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 py-2.5 z-50 max-h-80 overflow-y-auto text-left">
              {!filters.location ? (
                <>
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Popular Neighborhoods & Cities
                  </div>
                  {POPULAR_NEIGHBORHOODS.slice(0, 6).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setFilters({ location: loc, district: 'All Districts' });
                        setShowLocations(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                        {loc}
                      </span>
                    </button>
                  ))}
                  <div className="px-4 py-1.5 mt-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 border-t border-stone-100 dark:border-stone-800 pt-2">
                    Browse Ugandan Districts by Region
                  </div>
                  {UGANDAN_REGIONS.map((reg) => (
                    <div key={reg.name} className="px-4 py-1.5">
                      <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1.5">
                        {reg.name}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {reg.districts.slice(0, 8).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setFilters({ location: '', district: d });
                              setShowLocations(false);
                            }}
                            className="text-xs px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-stone-700 dark:text-stone-300 rounded-md transition-colors"
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {matchingDistricts.length > 0 && (
                    <>
                      <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                        Matching Districts
                      </div>
                      {matchingDistricts.map((dist) => (
                        <button
                          key={dist}
                          type="button"
                          onClick={() => {
                            setFilters({ location: '', district: dist });
                            setShowLocations(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2.5 font-semibold text-emerald-900 dark:text-emerald-400">
                            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                            {dist} District
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                  {matchingNeighborhoods.length > 0 && (
                    <>
                      <div className="px-4 py-1.5 mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                        Neighborhoods & Towns
                      </div>
                      {matchingNeighborhoods.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setFilters({ location: loc, district: 'All Districts' });
                            setShowLocations(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2.5 font-medium">
                            <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                            {loc}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Property Type Field */}
        <div className="relative w-full md:w-52 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 pb-3 md:pb-0 md:pr-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1 pl-8 text-left">
            Property Type
          </label>
          <div className="relative flex items-center">
            <Home className="w-5 h-5 text-emerald-800 dark:text-emerald-500 absolute left-2 pointer-events-none" />
            <select
              value={filters.propertyType}
              onChange={(e) =>
                setFilters({
                  propertyType: e.target.value as PropertyType | 'all'
                })
              }
              className="w-full appearance-none pl-8 pr-6 py-1 bg-transparent text-stone-900 dark:text-white font-medium focus:outline-none text-sm sm:text-base cursor-pointer [&>option]:bg-white dark:[&>option]:bg-stone-900"
            >
              <option value="all">Any Type</option>
              <option value="House">Houses</option>
              <option value="Apartment">Apartments</option>
              <option value="Land">Land & Plots</option>
              <option value="Commercial">Commercial</option>
              <option value="Office">Offices</option>
              <option value="Shop">Shops & Retail</option>
              <option value="Warehouse">Warehouses</option>
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Max Price Field */}
        <div className="relative w-full md:w-56 pb-2 md:pb-0">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1 pl-8 text-left">
            Max Budget (UGX)
          </label>
          <div className="relative flex items-center">
            <DollarSign className="w-5 h-5 text-emerald-800 dark:text-emerald-500 absolute left-2 pointer-events-none" />
            <select
              value={filters.maxPrice >= 3000000000 ? '' : filters.maxPrice}
              onChange={(e) =>
                setFilters({
                  maxPrice: e.target.value ? Number(e.target.value) : 3000000000
                })
              }
              className="w-full appearance-none pl-8 pr-6 py-1 bg-transparent text-stone-900 dark:text-white font-medium focus:outline-none text-sm sm:text-base cursor-pointer [&>option]:bg-white dark:[&>option]:bg-stone-900"
            >
              <option value="">No Maximum</option>
              {filters.transaction === 'rent' ? (
                <>
                  <option value="1500000">Up to 1.5M / mo</option>
                  <option value="3000000">Up to 3M / mo</option>
                  <option value="5000000">Up to 5M / mo</option>
                  <option value="10000000">Up to 10M / mo</option>
                  <option value="20000000">Up to 20M / mo</option>
                </>
              ) : (
                <>
                  <option value="150000000">Up to 150M UGX</option>
                  <option value="350000000">Up to 350M UGX</option>
                  <option value="600000000">Up to 600M UGX</option>
                  <option value="1200000000">Up to 1.2B UGX</option>
                  <option value="2500000000">Up to 2.5B UGX</option>
                </>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-4 bg-emerald-900 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

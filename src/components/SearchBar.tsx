import React from 'react';
import { useApp } from '../context/AppContext';
import { PropertyType } from '../types/property';
import { Search, SlidersHorizontal, MapPin, Building } from 'lucide-react';

interface SearchBarProps {
  onOpenAdvancedFilters?: () => void;
  showAdvancedToggle?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onOpenAdvancedFilters, 
  showAdvancedToggle = true 
}) => {
  const { filters, setFilters, navigateTo } = useApp();

  const LOCATIONS = [
    'All Locations',
    'Kampala',
    'Wakiso',
    'Kololo',
    'Naguru',
    'Kira',
    'Ntinda',
    'Muyenga',
    'Lubowa',
    'Najjera',
    'Entebbe',
    'Mukono',
    'Jinja'
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('/search');
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200/90 dark:border-stone-800 p-3 sm:p-4 text-stone-900 dark:text-stone-100 transition-colors">
      
      {/* Transaction Toggle */}
      <div className="flex items-center gap-1.5 pb-3 border-b border-stone-100 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setFilters({ transaction: 'all' })}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filters.transaction === 'all' 
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs' 
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          All Listings
        </button>
        <button
          type="button"
          onClick={() => setFilters({ transaction: 'buy' })}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filters.transaction === 'buy' 
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs' 
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Buy (For Sale)
        </button>
        <button
          type="button"
          onClick={() => setFilters({ transaction: 'rent' })}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filters.transaction === 'rent' 
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs' 
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Rent (For Lease)
        </button>
      </div>

      {/* Main Search Controls Grid */}
      <form onSubmit={handleSearchSubmit} className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Location Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Location / Area
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
            <select
              value={filters.location}
              onChange={e => setFilters({ location: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 bg-stone-50/50 dark:bg-stone-800 dark:text-stone-100 appearance-none"
            >
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc} className="dark:bg-stone-800">{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Property Type Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Property Type
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
            <select
              value={filters.propertyType}
              onChange={e => setFilters({ propertyType: e.target.value as any })}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 bg-stone-50/50 dark:bg-stone-800 dark:text-stone-100 appearance-none"
            >
              <option value="all" className="dark:bg-stone-800">All Types (House, Land, etc.)</option>
              <option value="House" className="dark:bg-stone-800">Residential Houses</option>
              <option value="Apartment" className="dark:bg-stone-800">Apartments & Condos</option>
              <option value="Land" className="dark:bg-stone-800">Titled Land & Plots</option>
              <option value="Commercial" className="dark:bg-stone-800">Commercial Buildings</option>
              <option value="Office" className="dark:bg-stone-800">Office Spaces</option>
              <option value="Warehouse" className="dark:bg-stone-800">Warehouses & Logistics</option>
              <option value="Shop" className="dark:bg-stone-800">Retail Shops</option>
            </select>
          </div>
        </div>

        {/* Price Filter Preset / Range */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Max Price (UGX)
          </label>
          <select
            value={filters.maxPrice}
            onChange={e => setFilters({ maxPrice: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 bg-stone-50/50 dark:bg-stone-800 dark:text-stone-100"
          >
            <option value="3000000000" className="dark:bg-stone-800">Any Price Range</option>
            <option value="3000000" className="dark:bg-stone-800">Under UGX 3M (Rentals)</option>
            <option value="10000000" className="dark:bg-stone-800">Under UGX 10M (High-end Rent)</option>
            <option value="200000000" className="dark:bg-stone-800">Under UGX 200M (Entry Land)</option>
            <option value="500000000" className="dark:bg-stone-800">Under UGX 500M (Affordable Homes)</option>
            <option value="1000000000" className="dark:bg-stone-800">Under UGX 1.0 Billion</option>
            <option value="2000000000" className="dark:bg-stone-800">Under UGX 2.0 Billion</option>
          </select>
        </div>

        {/* Search & Filter Actions */}
        <div className="flex items-end gap-2">
          {showAdvancedToggle && onOpenAdvancedFilters && (
            <button
              type="button"
              onClick={onOpenAdvancedFilters}
              className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors flex items-center justify-center shrink-0"
              title="More Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Properties</span>
          </button>
        </div>

      </form>
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, setFilters, theme, toggleTheme } = useApp();

  const handleLocationClick = (location: string) => {
    setFilters({ location });
    navigateTo('/search');
  };

  const handleTypeClick = (propertyType: any) => {
    setFilters({ propertyType });
    navigateTo('/search');
  };

  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 dark:text-stone-400 pt-16 pb-24 md:pb-16 border-t border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top brand grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-2xl font-serif font-bold text-white tracking-tight">
              Reality Estates
            </span>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Uganda's premier property discovery and listing marketplace. Connecting discerning buyers and tenants with verified homes, apartments, land parcels, and commercial spaces across the country.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated property physical inspections & advertiser verification desk</span>
            </div>

            {/* Quick Dark Mode toggle in footer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Switch to Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-stone-300" />
                    <span>Switch to Dark Theme</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => { setFilters({ transaction: 'buy' }); navigateTo('/search'); }} className="hover:text-white transition-colors">
                  Properties for Sale
                </button>
              </li>
              <li>
                <button onClick={() => { setFilters({ transaction: 'rent' }); navigateTo('/search'); }} className="hover:text-white transition-colors">
                  Rental Properties
                </button>
              </li>
              <li>
                <button onClick={() => handleTypeClick('House')} className="hover:text-white transition-colors">
                  Residential Houses
                </button>
              </li>
              <li>
                <button onClick={() => handleTypeClick('Apartment')} className="hover:text-white transition-colors">
                  Modern Apartments
                </button>
              </li>
              <li>
                <button onClick={() => handleTypeClick('Land')} className="hover:text-white transition-colors">
                  Titled Land & Plots
                </button>
              </li>
              <li>
                <button onClick={() => handleTypeClick('Commercial')} className="hover:text-white transition-colors">
                  Commercial & Offices
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Locations</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => handleLocationClick('Kololo')} className="hover:text-white transition-colors">
                  Kololo, Kampala
                </button>
              </li>
              <li>
                <button onClick={() => handleLocationClick('Naguru')} className="hover:text-white transition-colors">
                  Naguru Hill
                </button>
              </li>
              <li>
                <button onClick={() => handleLocationClick('Kira')} className="hover:text-white transition-colors">
                  Kira Municipality
                </button>
              </li>
              <li>
                <button onClick={() => handleLocationClick('Muyenga')} className="hover:text-white transition-colors">
                  Muyenga & Buziga
                </button>
              </li>
              <li>
                <button onClick={() => handleLocationClick('Entebbe')} className="hover:text-white transition-colors">
                  Entebbe Peninsula
                </button>
              </li>
              <li>
                <button onClick={() => handleLocationClick('Ntinda')} className="hover:text-white transition-colors">
                  Ntinda & Ministers Village
                </button>
              </li>
            </ul>
          </div>

          {/* Suppliers & Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Partners & Agents</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => navigateTo('/list-property')} className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400 font-medium">
                  <span>List Your Property</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/admin')} className="hover:text-white transition-colors text-xs text-stone-500">
                  Operations Console
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Regulatory Notice */}
        <div className="py-6 border-b border-stone-800 text-xs text-stone-500 leading-relaxed space-y-2">
          <p>
            <strong className="text-stone-400">Important Regulatory Notice:</strong> Reality Estates is a real estate discovery, marketing, and listing marketplace. The platform does not hold escrow or buyer funds, process rental payments, transfer legal land titles, approve mortgages, guarantee property titles, or provide legal advice.
          </p>
          <p>
            Listing verification information is based strictly on physical inspections and advertiser identity checks conducted by the platform and does NOT substitute for independent cadastral search, boundary opening, and legal due diligence by an advocate of the High Court of Uganda.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Reality Estates Uganda Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Kampala, Uganda</span>
            <span>·</span>
            <span>ISO Compliant Verification Standards</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

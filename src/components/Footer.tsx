import React from 'react';
import { useApp } from '../context/AppContext';
import { PropertyType } from '../types/property';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, setFilters } = useApp();

  const handleQuickSearch = (location: string, type?: PropertyType | 'all') => {
    setFilters({
      location,
      district: 'All Districts',
      propertyType: type ? type : 'all'
    });
    navigateTo('/search');
  };

  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-800 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-white">
                Reality<span className="text-emerald-500">Estates</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Uganda's premier digital real estate marketplace. Connecting discerning buyers, tenants, and investors with verified homes, apartments, and titled land across Kampala, Wakiso, Entebbe, Mbarara, Gulu, Jinja, and all Ugandan districts.
            </p>
            <div className="pt-2 space-y-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Plot 14, Acacia Avenue, Kololo, Kampala, Uganda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>+256 700 123 456 / +256 772 987 654</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>concierge@realityestates.ug</span>
              </div>
            </div>
          </div>

          {/* Popular Locations */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Prime Locations</h4>
            <ul className="space-y-2.5 text-sm">
              {['Kololo', 'Nakasero', 'Bugolobi', 'Muyenga', 'Ntinda', 'Kira', 'Entebbe'].map(
                (loc) => (
                  <li key={loc}>
                    <button
                      onClick={() => handleQuickSearch(loc)}
                      className="hover:text-emerald-400 transition-colors text-left"
                    >
                      Properties in {loc}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Property Types</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleQuickSearch('', 'House')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Houses for Sale & Rent
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleQuickSearch('', 'Apartment')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Serviced Apartments
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleQuickSearch('', 'Land')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Titled Land & Plots
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleQuickSearch('', 'Commercial')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Commercial & Office Space
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleQuickSearch('', 'Office')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Executive Offices
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigateTo('/list-property')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  List Your Property
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Saved Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Manage Viewings
                </button>
              </li>
              <li>
                <span className="text-stone-500 cursor-default">
                  Land Title Verification Guide
                </span>
              </li>
              <li>
                <span className="text-stone-500 cursor-default">
                  Uganda Real Estate Report
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Reality Estates Uganda Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Land Tenure Advisory</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

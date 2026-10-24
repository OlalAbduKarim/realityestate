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
    <footer className="bg-[#0f1115] text-stone-400 border-t border-stone-800 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                TYGA<span className="text-amber-500 ml-1">ESTATES</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Uganda's premier digital real estate marketplace. Connecting discerning buyers, tenants, and investors with verified homes, apartments, and titled land across Kampala, Wakiso, Entebbe, and all Ugandan districts.
            </p>
            <div className="pt-2 space-y-2.5 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Rubaga Road, Kampala, Uganda</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p>
                    <span className="text-red-400 font-semibold">Airtel:</span>{' '}
                    <a href="tel:+256759705328" className="hover:underline font-mono">
                      +256 759 705 328
                    </a>{' '}
                    (Calls & WhatsApp)
                  </p>
                  <p>
                    <span className="text-amber-400 font-semibold">MTN:</span>{' '}
                    <a href="tel:+256764384080" className="hover:underline font-mono">
                      +256 764 384 080
                    </a>{' '}
                    (Calls & WhatsApp)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>info@tygaestates.ug</span>
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
                      className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                    >
                      Properties in {loc}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Specialized Services (Rubaga Road Desk) */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Our Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">1.</span> Land & Property Valuation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">2.</span> Professional Land Surveying
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">3.</span> Administrative Letters
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">4.</span> Making Wills & Succession
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">5.</span> Processing Land Titles
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">6.</span> House Construction
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">7.</span> Shifting & Transportation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">8.</span> Inventory & Storage
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  <span className="text-amber-400 font-mono mr-1">9.</span> Renovations & Interiors
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
                  onClick={() => navigateTo('/contact')}
                  className="hover:text-amber-400 text-amber-400 font-medium transition-colors cursor-pointer"
                >
                  Contact TYGA ESTATES
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/list-property')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  List Your Property
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/dashboard')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Saved Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/dashboard')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Manage Viewings
                </button>
              </li>
              <li>
                <span className="text-stone-500 cursor-default">
                  Land Title Verification Guide
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} TYGA ESTATES Uganda Ltd. All rights reserved.</p>
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

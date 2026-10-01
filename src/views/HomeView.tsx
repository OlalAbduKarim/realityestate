import React from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import { SearchBar } from '../components/SearchBar';
import heroVillaImg from '../assets/images/hero_kampala_villa_1790704142442.jpg';
import kololoAptImg from '../assets/images/kololo_modern_apartment_1790704155678.jpg';
import kiraHomeImg from '../assets/images/kira_family_residence_1790704168602.jpg';
import naguruTowerImg from '../assets/images/naguru_commercial_tower_1790704181131.jpg';
import entebbeLandImg from '../assets/images/entebbe_lakeview_land_1790704191262.jpg';
import { 
  ShieldCheck, 
  Search, 
  Users, 
  Building2, 
  ArrowRight, 
  Compass, 
  MapPin, 
  Home, 
  Warehouse, 
  Layers
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { properties, navigateTo, setFilters } = useApp();

  const featuredProperties = properties.filter(p => p.featured).slice(0, 6);
  const verifiedProperties = properties.filter(p => p.verificationStatus === 'verified').slice(0, 6);
  const recentProperties = [...properties].reverse().slice(0, 6);

  const PROPERTY_TYPES = [
    { type: 'House', label: 'Houses & Villas', count: '140+ listed', icon: Home, image: kiraHomeImg },
    { type: 'Apartment', label: 'Apartments & Condos', count: '95+ listed', icon: Layers, image: kololoAptImg },
    { type: 'Land', label: 'Titled Land & Plots', count: '110+ parcels', icon: Compass, image: entebbeLandImg },
    { type: 'Commercial', label: 'Commercial Buildings', count: '45+ spaces', icon: Building2, image: naguruTowerImg },
    { type: 'Office', label: 'Corporate Offices', count: '38+ floors', icon: Building2, image: naguruTowerImg },
    { type: 'Warehouse', label: 'Warehouses & Industrial', count: '22+ facilities', icon: Warehouse, image: naguruTowerImg }
  ];

  const LOCATIONS = [
    { name: 'Kampala', sub: 'Diplomatic & commercial capital', count: '220 properties' },
    { name: 'Kololo', sub: 'Upper terrace & embassies', count: '45 properties' },
    { name: 'Naguru', sub: 'Hilltop panoramas & corporate towers', count: '38 properties' },
    { name: 'Kira', sub: 'Contemporary suburban family homes', count: '64 properties' },
    { name: 'Entebbe', sub: 'Lake Victoria breeze & expressway link', count: '42 properties' },
    { name: 'Wakiso', sub: 'Fast-appreciating residential corridors', count: '85 properties' }
  ];

  const handleSelectType = (propertyType: any) => {
    setFilters({ propertyType });
    navigateTo('/search');
  };

  const handleSelectLocation = (location: string) => {
    setFilters({ location });
    navigateTo('/search');
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 bg-radial from-stone-100 via-stone-50 to-stone-50 dark:from-stone-900 dark:via-stone-950 dark:to-stone-950 border-b border-stone-200/70 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-8 sm:mb-12">
            
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xs text-xs font-medium text-stone-700 dark:text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Uganda's Most Trusted Property Discovery Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-white tracking-tight text-balance">
              Find a place you'll love.
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed text-balance">
              Discover verified homes, luxury apartments, titled land and commercial property across Kampala, Wakiso, Entebbe, and beyond.
            </p>
          </div>

          {/* Large Search Interface */}
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>

          {/* Hero Quick Metrics */}
          <div className="mt-8 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xs rounded-xl border border-stone-200/60 dark:border-stone-800">
              <p className="text-lg font-bold text-stone-900 dark:text-white tabular-nums">100%</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Physical Inspections</p>
            </div>
            <div className="p-3 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xs rounded-xl border border-stone-200/60 dark:border-stone-800">
              <p className="text-lg font-bold text-stone-900 dark:text-white tabular-nums">UGX 0</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Anonymous Browsing Fee</p>
            </div>
            <div className="p-3 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xs rounded-xl border border-stone-200/60 dark:border-stone-800">
              <p className="text-lg font-bold text-stone-900 dark:text-white tabular-nums">Direct</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Agent & Owner Connect</p>
            </div>
            <div className="p-3 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xs rounded-xl border border-stone-200/60 dark:border-stone-800">
              <p className="text-lg font-bold text-stone-900 dark:text-white tabular-nums">5 Banks</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Financing Linkage</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-1">
              Featured Properties
            </h2>
          </div>
          <button
            onClick={() => navigateTo('/search')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-200 hover:text-stone-700 dark:hover:text-white transition-colors"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Explore by Property Type */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-8">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Category Breakdown
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-1">
            Explore by Property Type
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {PROPERTY_TYPES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.type}
                onClick={() => handleSelectType(cat.type)}
                className="group p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 hover:shadow-sm transition-all duration-200 text-left flex flex-col justify-between h-36"
              >
                <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 group-hover:bg-stone-900 dark:group-hover:bg-stone-100 group-hover:text-white dark:group-hover:text-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-stone-800 dark:group-hover:text-white">
                    {cat.label}
                  </h3>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">{cat.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Explore by Location */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Prime Districts
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-1">
              Explore by Location
            </h2>
          </div>
          <button
            onClick={() => navigateTo('/search')}
            className="text-xs font-semibold text-stone-900 dark:text-stone-200 hover:underline flex items-center gap-1"
          >
            <span>View All Districts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOCATIONS.map(loc => (
            <button
              key={loc.name}
              onClick={() => handleSelectLocation(loc.name)}
              className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 hover:shadow-sm transition-all text-left flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-white">
                    {loc.name}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">{loc.sub}</p>
              </div>
              <span className="text-xs font-medium text-stone-400 dark:text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors shrink-0">
                {loc.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Dedicated Verified Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 dark:bg-stone-950 text-white rounded-2xl p-6 sm:p-10 border border-stone-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-stone-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-4 h-4" />
                <span>Physical Site Verified</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Verified Properties
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
                Every listing in this section has completed on-site physical coordinates check, owner mandate validation, and pricing confirmation by our inspections unit.
              </p>
            </div>
            <button
              onClick={() => {
                setFilters({ verification: 'verified_only' });
                navigateTo('/search');
              }}
              className="py-2.5 px-4 bg-white text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors whitespace-nowrap self-start md:self-auto"
            >
              Browse All Verified ({verifiedProperties.length}+)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {verifiedProperties.slice(0, 3).map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Market Fresh
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-1">
              Recently Added
            </h2>
          </div>
          <button
            onClick={() => {
              setFilters({ sortBy: 'newest' });
              navigateTo('/search');
            }}
            className="text-xs font-semibold text-stone-900 dark:text-stone-200 hover:underline flex items-center gap-1"
          >
            <span>View Newest Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {recentProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Why Use Reality Estates? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Built for Uganda's Modern Property Sector
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-2">
            Why Discerning Clients Choose Reality Estates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">Verified Listings</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              We conduct on-the-ground checks of advertiser identity, land parcel beacons, and price mandates to minimize duplicate or phantom listings.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">Intelligent Discovery</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Filter with accuracy across Mailo and Freehold tenure, land decimals, building square meters, and backup utilities like solar and generators.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">Direct Connections</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Zero middlemen markups. Connect directly with vetted developers, property owners, and certified real estate agents in Uganda.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">Financing Linkage</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Seamlessly calculate mortgage terms and request pre-qualification assistance from premier Ugandan commercial banking partners.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Section: List Your Property */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100 dark:bg-stone-900 rounded-2xl p-8 sm:p-12 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors">
          <div className="space-y-3 text-left max-w-xl">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              For Property Owners, Agents & Developers
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
              Have a property to list in Uganda?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Reach thousands of qualified local and diaspora buyers, tenants, and commercial investors. Benefit from our verified listing pipeline and fast enquiry tracking.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigateTo('/list-property')}
              className="py-3 px-6 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors text-center shadow-xs"
            >
              List Your Property Now
            </button>
            <button
              onClick={() => navigateTo('/financing')}
              className="py-3 px-5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg transition-colors text-center"
            >
              Partner Financing
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

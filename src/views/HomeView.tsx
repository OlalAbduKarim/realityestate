import React from 'react';
import { useApp } from '../context/AppContext';
import { PropertyType } from '../types/property';
import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveAreaMap } from '../components/InteractiveAreaMap';
import {
  Building2,
  Home,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Layers,
  LandPlot,
  Building,
  Briefcase,
  Store,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    properties,
    isDataLoading,
    serviceError,
    refreshProperties,
    setFilters,
    navigateTo
  } = useApp();

  const publishedProperties = properties.filter((p) => p.listingStatus === 'published');
  const featuredProperties = (
    publishedProperties.some((p) => p.featured)
      ? publishedProperties.filter((p) => p.featured)
      : publishedProperties
  ).slice(0, 4);
  const verifiedProperties = publishedProperties
    .filter((p) => p.verificationStatus === 'verified')
    .slice(0, 3);

  const PROPERTY_TYPES: Array<{
    name: string;
    type: PropertyType;
    icon: React.ElementType;
    count: number;
  }> = [
    {
      name: 'Houses',
      type: 'House',
      icon: Home,
      count: publishedProperties.filter((p) => p.propertyType === 'House').length
    },
    {
      name: 'Apartments',
      type: 'Apartment',
      icon: Building2,
      count: publishedProperties.filter((p) => p.propertyType === 'Apartment').length
    },
    {
      name: 'Land',
      type: 'Land',
      icon: LandPlot,
      count: publishedProperties.filter((p) => p.propertyType === 'Land').length
    },
    {
      name: 'Commercial',
      type: 'Commercial',
      icon: Building,
      count: publishedProperties.filter((p) => p.propertyType === 'Commercial').length
    },
    {
      name: 'Offices',
      type: 'Office',
      icon: Briefcase,
      count: publishedProperties.filter((p) => p.propertyType === 'Office').length
    },
    {
      name: 'Shops & Retail',
      type: 'Shop',
      icon: Store,
      count: publishedProperties.filter((p) => p.propertyType === 'Shop').length
    }
  ];

  const POPULAR_LOCATIONS = [
    {
      name: 'Kololo',
      district: 'Kampala',
      count: publishedProperties.filter((p) => p.location.includes('Kololo')).length,
      desc: 'Diplomatic hub, luxury villas & upscale apartments'
    },
    {
      name: 'Naguru',
      district: 'Kampala',
      count: publishedProperties.filter((p) => p.location.includes('Naguru')).length,
      desc: 'Panoramic hilltop views, commercial towers & duplexes'
    },
    {
      name: 'Kira & Najjera',
      district: 'Wakiso',
      count: publishedProperties.filter(
        (p) => p.location.includes('Kira') || p.location.includes('Najjera')
      ).length,
      desc: 'Rapidly growing family residential belt'
    },
    {
      name: 'Entebbe',
      district: 'Wakiso',
      count: publishedProperties.filter((p) => p.location.includes('Entebbe')).length,
      desc: 'Lakeside estates, airport corridor & scenic retreats'
    },
    {
      name: 'Lubowa',
      district: 'Wakiso',
      count: publishedProperties.filter((p) => p.location.includes('Lubowa')).length,
      desc: 'Entebbe road corridor, gated communities & schools'
    },
    {
      name: 'Jinja & Mukono',
      district: 'Central / East',
      count: publishedProperties.filter(
        (p) => p.location.includes('Mukono') || p.location.includes('Jinja')
      ).length,
      desc: 'Industrial growth, expansive land & tourism nodes'
    }
  ];

  const handleTypeClick = (type: PropertyType) => {
    setFilters({ propertyType: type });
    navigateTo('/search');
  };

  const handleLocationClick = (loc: string, district?: string) => {
    if (district && district !== 'Central / East') {
      setFilters({ location: loc, district });
    } else {
      setFilters({ location: loc, district: 'All Districts' });
    }
    navigateTo('/search');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-stone-200 dark:border-stone-800 bg-linear-to-b from-stone-100/60 to-transparent dark:from-stone-900/60 dark:to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Uganda's Transparent Real Estate Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-950 dark:text-white tracking-tight leading-tight">
              Find a place you'll love.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-normal">
              Discover verified homes, contemporary apartments, surveyed land parcels, and commercial spaces across Kampala and Uganda.
            </p>
          </div>

          {/* Prominent Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-stone-200/60 dark:border-stone-800">
            <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-stone-800/40 backdrop-blur-xs border border-stone-200/60 dark:border-stone-800">
              <div className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                {publishedProperties.length}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Published Properties
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-stone-800/40 backdrop-blur-xs border border-stone-200/60 dark:border-stone-800">
              <div className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Verified Coordinates
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-stone-800/40 backdrop-blur-xs border border-stone-200/60 dark:border-stone-800">
              <div className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                133
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Districts Supported
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-stone-800/40 backdrop-blur-xs border border-stone-200/60 dark:border-stone-800">
              <div className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                Zero
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Hidden Buyer Fees
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              Curated Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 dark:text-white">
              Featured Properties
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Hand-picked verified residential and commercial opportunities
            </p>
          </div>
          <button
            onClick={() => navigateTo('/search')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>View all listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isDataLoading ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
            <Loader2 className="w-8 h-8 text-emerald-700 dark:text-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
              Loading properties...
            </p>
          </div>
        ) : serviceError ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-10 text-center max-w-xl mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
              Unable to load properties
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-5">
              {serviceError}
            </p>
            <button
              onClick={() => void refreshProperties()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Loading
            </button>
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
            <Building2 className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
              No properties are currently available.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
              Published listings will appear here once approved by the Reality Estates verification team.
            </p>
            <button
              onClick={() => navigateTo('/list-property')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              List a Property
            </button>
          </div>
        )}
      </section>

      {/* Explore by Property Type */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 mb-1">
            Categorized Discovery
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 dark:text-white">
            Explore by Property Type
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Browse verified listings tailored to your residential or business requirements
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PROPERTY_TYPES.map(({ name, type, icon: Icon, count }) => (
            <button
              key={name}
              onClick={() => handleTypeClick(type)}
              className="p-5 rounded-xl text-left bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-200 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {count} available
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Explore by Location */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 mb-1">
              Prime Districts
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 dark:text-white">
              Explore by Location
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              From upscale diplomatic corridors to high-growth suburban corridors
            </p>
          </div>
          <button
            onClick={() => {
              setFilters({ location: '', district: 'All Districts' });
              navigateTo('/search');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>All Ugandan locations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POPULAR_LOCATIONS.map((loc) => (
            <div
              key={loc.name}
              onClick={() => handleLocationClick(loc.name, loc.district)}
              className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {loc.district}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-stone-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-0.5">
                    {loc.name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {loc.count} listings
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 leading-relaxed">
                {loc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Properties Spotlight */}
      <section className="bg-stone-900 text-stone-100 py-16 dark:bg-stone-950 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pearl Prime Verification Standard</span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
                Buy & Rent with Certainty
              </h2>
              <p className="text-stone-400 text-sm mt-2 leading-relaxed">
                Every verified badge on Reality Estates denotes an inspected property: cadastral coordinates checked, advertiser identity validated, and title registration history reviewed.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700/60 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>On-Site GPS Survey</span>
              </div>
              <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700/60 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>ID & Mandate Check</span>
              </div>
              <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700/60 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Direct Owner Access</span>
              </div>
            </div>
          </div>

          {verifiedProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-8 text-center text-sm text-stone-400">
              {isDataLoading
                ? 'Loading verified properties...'
                : 'No verified properties are currently available.'}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 mb-1">
              Geographic Exploration
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 dark:text-white">
              Map of Kampala & Wakiso Corridor
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Tap pins to inspect property cards and coordinate locations
            </p>
          </div>
          <button
            onClick={() => navigateTo('/search')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <span>Open search with split map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="h-[460px] rounded-2xl overflow-hidden shadow-sm">
          <InteractiveAreaMap
            properties={publishedProperties}
            onSelectProperty={(p) => navigateTo(`/properties/${p.slug}`)}
          />
        </div>
      </section>

      {/* Why Use Reality Estates Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 mb-1">
            Built for Ugandan Real Estate
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 dark:text-white">
            Why Reality Estates?
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            The safe, transparent, and modern way to navigate property transactions in East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
              Verified Listings
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              We physically verify boundaries, GPS locations, ownership mandates, and realistic market valuations to prevent ghost properties.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
              Investment Insights
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Access rental yields, historical capital growth forecasts, and price-per-decimal benchmark analytics.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
              Direct Connections
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Schedule direct on-site viewings and communicate directly with vetted agents, owners, and developers with zero middlemen markup.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
              Verified Documentation
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Every listing undergoes rigorous verification of land tenure, cadastral map overlays, and verified advertiser credentials.
            </p>
          </div>
        </div>
      </section>

      {/* List Property Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-8 sm:p-12 bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 text-white relative overflow-hidden shadow-xl border border-stone-800">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              For Property Owners, Agents & Developers
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
              Have a property to list in Uganda?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Join Uganda's fastest growing property network. List your residential, commercial, or land development to reach serious buyers and tenants directly.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => navigateTo('/list-property')}
                className="py-3 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-sm transition-colors shadow-md cursor-pointer"
              >
                List Your Property
              </button>
              <button
                onClick={() => navigateTo('/search')}
                className="py-3 px-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-medium text-sm transition-colors border border-stone-700 cursor-pointer"
              >
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

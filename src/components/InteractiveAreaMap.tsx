import React, { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { formatPriceDisplay } from '../utils/formatters';
import {
  MapPin,
  ShieldCheck,
  Navigation,
  ArrowUpRight,
  Bed,
  Bath,
  Maximize,
  Sparkles,
  Compass,
  ImageOff
} from 'lucide-react';

interface InteractiveAreaMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const InteractiveAreaMap: React.FC<InteractiveAreaMapProps> = ({
  properties,
  onSelectProperty
}) => {
  const [activeProperty, setActiveProperty] = useState<Property | null>(
    properties[0] || null
  );
  const [selectedZone, setSelectedZone] = useState<string>('All');

  useEffect(() => {
    if (
      properties.length > 0 &&
      (!activeProperty || !properties.some((p) => p.id === activeProperty.id))
    ) {
      setActiveProperty(properties[0]);
    } else if (properties.length === 0) {
      setActiveProperty(null);
    }
  }, [properties, activeProperty]);

  // Dynamically extract distinct districts from the filtered properties so listings outside Kampala are equally represented
  const zones = [
    'All',
    ...Array.from(new Set(properties.map((p) => p.district).filter(Boolean)))
  ];

  const visibleProperties =
    selectedZone === 'All'
      ? properties
      : properties.filter((p) => p.district === selectedZone);

  // Convert lat/lng into relative x/y percentages across the map canvas
  const getCanvasCoords = (prop: Property, index: number) => {
    if (prop.coordinates) {
      const { lat, lng } = prop.coordinates;
      const x = Math.min(88, Math.max(12, ((lng - 32.45) / (32.68 - 32.45)) * 76 + 12));
      const y = Math.min(86, Math.max(14, (1 - (lat - 0.04) / (0.42 - 0.04)) * 72 + 14));
      return { x, y };
    }
    const fallbackPositions = [
      { x: 48, y: 42 },
      { x: 56, y: 36 },
      { x: 64, y: 48 },
      { x: 42, y: 58 },
      { x: 72, y: 30 },
      { x: 30, y: 78 },
      { x: 52, y: 50 },
      { x: 60, y: 62 }
    ];
    return fallbackPositions[index % fallbackPositions.length];
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-lg h-full flex flex-col">
      {/* Top Map Toolbar */}
      <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 bg-stone-50/70 dark:bg-stone-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-900 text-white flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Uganda Interactive Property Explorer
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Click any price pin on the map to inspect neighborhood metrics and property status
            </p>
          </div>
        </div>

        {/* Zone Quick Filter */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-200/70 dark:bg-stone-800 p-1 rounded-xl">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => {
                setSelectedZone(zone);
                const firstInZone =
                  zone === 'All'
                    ? properties[0]
                    : properties.find((p) => p.district === zone);
                if (firstInZone) setActiveProperty(firstInZone);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedZone === zone
                  ? 'bg-white dark:bg-stone-900 text-emerald-900 dark:text-emerald-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {zone === 'All' ? 'All Districts' : zone}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Map & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[380px]">
        {/* Left: Stylized SVG Map Canvas */}
        <div className="lg:col-span-8 relative bg-[#e9efe8] dark:bg-[#131c18] overflow-hidden min-h-[340px]">
          <svg
            className="absolute inset-0 w-full h-full object-cover opacity-80 dark:opacity-40 pointer-events-none"
            viewBox="0 0 800 600"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="map-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  className="text-emerald-900/10 dark:text-emerald-400/10"
                />
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#map-grid)" />

            <path
              d="M 0 470 Q 180 430 340 480 T 680 440 L 800 460 L 800 600 L 0 600 Z"
              className="fill-sky-200/70 dark:fill-sky-950/60"
            />
            <path
              d="M 0 490 Q 200 455 360 500 T 700 465 L 800 485 L 800 600 L 0 600 Z"
              className="fill-sky-300/50 dark:fill-sky-900/40"
            />

            <circle
              cx="380"
              cy="240"
              r="95"
              className="fill-emerald-200/35 dark:fill-emerald-900/20"
            />
            <circle
              cx="530"
              cy="190"
              r="75"
              className="fill-emerald-300/25 dark:fill-emerald-800/15"
            />
            <circle
              cx="260"
              cy="420"
              r="65"
              className="fill-emerald-200/30 dark:fill-emerald-900/20"
            />

            <path
              d="M 100 120 Q 350 240 420 280 T 750 220"
              fill="none"
              strokeWidth="4"
              className="stroke-amber-400/50 dark:stroke-amber-500/30"
            />
            <path
              d="M 380 260 Q 340 380 240 510"
              fill="none"
              strokeWidth="4"
              strokeDasharray="8 4"
              className="stroke-emerald-600/40 dark:stroke-emerald-500/30"
            />
            <path
              d="M 220 80 Q 390 220 520 440"
              fill="none"
              strokeWidth="2.5"
              className="stroke-stone-400/40 dark:stroke-stone-600/40"
            />
          </svg>

          {/* Subtle Geographic Labels */}
          <div className="absolute top-6 left-8 pointer-events-none select-none">
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 block">
              Northern Bypass & Wakiso Growth Belt
            </span>
          </div>
          <div className="absolute top-[38%] left-[44%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-stone-500/50 dark:text-stone-400/40">
              Central Kampala
            </span>
          </div>
          <div className="absolute bottom-8 right-10 pointer-events-none select-none text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-800/60 dark:text-sky-400/50 block">
              Lake Victoria Shoreline
            </span>
            <span className="text-[10px] text-sky-700/50 dark:text-sky-400/40">
              Munyonyo • Garuga • Entebbe Corridor
            </span>
          </div>

          {/* Interactive Property Price Pins */}
          {visibleProperties.map((prop, idx) => {
            const { x, y } = getCanvasCoords(prop, idx);
            const isSelected = activeProperty?.id === prop.id;

            return (
              <button
                key={prop.id}
                onClick={() => setActiveProperty(prop)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group focus:outline-none ${
                  isSelected ? 'z-30 scale-110' : 'z-10 hover:z-20 hover:scale-105'
                }`}
              >
                <div
                  className={`px-3 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5 border transition-colors ${
                    isSelected
                      ? 'bg-emerald-900 text-white border-white ring-4 ring-emerald-500/30'
                      : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                  }`}
                >
                  {prop.verificationStatus === 'verified' && (
                    <ShieldCheck
                      className={`w-3.5 h-3.5 ${
                        isSelected
                          ? 'text-emerald-300'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    />
                  )}
                  <span>
                    {formatPriceDisplay(
                      prop.price,
                      prop.transaction,
                      prop.pricePeriod,
                      prop.currency
                    )}
                  </span>
                </div>
                <div
                  className={`w-2.5 h-2.5 rotate-45 mx-auto -mt-1.5 border-r border-b ${
                    isSelected
                      ? 'bg-emerald-900 border-white'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Active Property Inspector Card */}
        <div className="lg:col-span-4 p-6 flex flex-col justify-between bg-white dark:bg-stone-900 border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-800 overflow-y-auto">
          {activeProperty ? (
            <div className="space-y-4">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                {activeProperty.images?.[0] ? (
                  <img
                    src={activeProperty.images[0]}
                    alt={activeProperty.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-1">
                    <ImageOff className="w-6 h-6" />
                    <span className="text-xs">No Image</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-stone-900/85 text-white backdrop-blur-md">
                    {activeProperty.transaction === 'buy' ? 'For Sale' : 'For Rent'}
                  </span>
                  {activeProperty.verificationStatus === 'verified' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-900/90 text-white backdrop-blur-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" /> Verified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {activeProperty.location}, {activeProperty.district}
                  </span>
                </div>
                <h4 className="text-base font-bold text-stone-900 dark:text-white leading-snug mb-1 line-clamp-2">
                  {activeProperty.title}
                </h4>
                <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-400">
                  {formatPriceDisplay(
                    activeProperty.price,
                    activeProperty.transaction,
                    activeProperty.pricePeriod,
                    activeProperty.currency
                  )}
                </p>
              </div>

              {/* Specs */}
              <div className="flex items-center gap-4 py-2.5 border-y border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
                {activeProperty.bedrooms > 0 && (
                  <span className="flex items-center gap-1 font-medium">
                    <Bed className="w-4 h-4 text-stone-400" /> {activeProperty.bedrooms} Beds
                  </span>
                )}
                {activeProperty.bathrooms > 0 && (
                  <span className="flex items-center gap-1 font-medium">
                    <Bath className="w-4 h-4 text-stone-400" /> {activeProperty.bathrooms} Baths
                  </span>
                )}
                {(activeProperty.buildingSizeSqm !== undefined ||
                  activeProperty.landSizeDecimals !== undefined) && (
                  <span className="flex items-center gap-1 font-medium">
                    <Maximize className="w-4 h-4 text-stone-400" />
                    {activeProperty.buildingSizeSqm
                      ? `${activeProperty.buildingSizeSqm} sqm`
                      : `${activeProperty.landSizeDecimals} dec`}
                  </span>
                )}
              </div>

              {/* Area Intelligence Snapshot */}
              {activeProperty.insights && (
                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 border border-stone-200/70 dark:border-stone-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Neighborhood Intelligence
                  </div>
                  {activeProperty.insights.capitalGrowthForecast && (
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      Forecast: {activeProperty.insights.capitalGrowthForecast}
                    </p>
                  )}
                  {activeProperty.insights.grossRentalYield !== undefined && (
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Est. Gross Yield: {activeProperty.insights.grossRentalYield}% p.a.
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => onSelectProperty(activeProperty)}
                className="w-full py-3 px-5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Open Full Property Dossier</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400">
              <Navigation className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a pin on the map to inspect property details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

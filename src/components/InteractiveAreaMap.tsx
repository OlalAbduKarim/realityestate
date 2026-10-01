import React, { useState } from 'react';
import { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/formatters';
import { Navigation, Eye, X, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveAreaMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onSelectProperty?: (property: Property) => void;
  interactive?: boolean;
}

export const InteractiveAreaMap: React.FC<InteractiveAreaMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty
}) => {
  const { theme } = useApp();
  const [activePin, setActivePin] = useState<Property | null>(selectedProperty || null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const isDark = theme === 'dark';

  const projectCoordinates = (lat: number, lng: number) => {
    const minLat = 0.02;
    const maxLat = 0.48;
    const minLng = 32.42;
    const maxLng = 32.78;

    const x = ((lng - minLng) / (maxLng - minLng)) * 720 + 40;
    const y = 560 - ((lat - minLat) / (maxLat - minLat)) * 500;
    return { x: Math.max(40, Math.min(760, x)), y: Math.max(40, Math.min(560, y)) };
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 select-none transition-colors">
      
      {/* Interactive Map Header Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 shadow-xs flex items-center gap-1.5 text-xs font-medium text-stone-800 dark:text-stone-200">
          <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Greater Kampala & Wakiso Corridor</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
          className="p-2 bg-white/95 dark:bg-stone-800/95 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg border border-stone-200 dark:border-stone-700 shadow-xs transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
          className="p-2 bg-white/95 dark:bg-stone-800/95 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg border border-stone-200 dark:border-stone-700 shadow-xs transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas Map */}
      <div 
        className="w-full h-full transition-transform duration-300 flex items-center justify-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg 
          viewBox="0 0 800 600" 
          className="w-full h-full w-[800px] h-[600px] object-cover"
        >
          <defs>
            <linearGradient id="lakeWater" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#1e3a8a' : '#bfdbfe'} stopOpacity={isDark ? '0.7' : '0.4'} />
              <stop offset="100%" stopColor={isDark ? '#172554' : '#93c5fd'} stopOpacity={isDark ? '0.9' : '0.6'} />
            </linearGradient>
          </defs>

          {/* Background landmass */}
          <rect width="800" height="600" fill={isDark ? '#1c1917' : '#f5f5f4'} />

          {/* Lake Victoria body at South */}
          <path
            d="M 0,420 Q 150,440 260,400 T 450,470 T 680,450 T 800,520 L 800,600 L 0,600 Z"
            fill="url(#lakeWater)"
          />
          <text x="360" y="540" fill={isDark ? '#93c5fd' : '#60a5fa'} fontSize="13" fontWeight="600" letterSpacing="2">
            LAKE VICTORIA
          </text>

          {/* Transport Corridors */}
          <path
            d="M 120,260 C 240,240 380,220 540,240 C 620,250 710,270 780,290"
            fill="none"
            stroke={isDark ? '#292524' : '#e7e5e4'}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 120,260 C 240,240 380,220 540,240 C 620,250 710,270 780,290"
            fill="none"
            stroke={isDark ? '#57534e' : '#a8a29e'}
            strokeWidth="2.5"
            strokeDasharray="6,4"
          />
          <text x="360" y="215" fill={isDark ? '#78716c' : '#a8a29e'} fontSize="10" fontWeight="500">
            NORTHERN BYPASS
          </text>

          {/* Entebbe Expressway */}
          <path
            d="M 380,310 C 340,360 280,440 210,500"
            fill="none"
            stroke={isDark ? '#292524' : '#e7e5e4'}
            strokeWidth="7"
          />
          <path
            d="M 380,310 C 340,360 280,440 210,500"
            fill="none"
            stroke={isDark ? '#57534e' : '#a8a29e'}
            strokeWidth="2.5"
          />
          <text x="230" y="440" fill={isDark ? '#78716c' : '#a8a29e'} fontSize="9" fontWeight="500" transform="rotate(-40 230 440)">
            ENTEBBE EXPRESSWAY
          </text>

          {/* Jinja Road */}
          <path
            d="M 420,300 C 510,290 620,280 780,270"
            fill="none"
            stroke={isDark ? '#292524' : '#e7e5e4'}
            strokeWidth="6"
          />
          <path
            d="M 420,300 C 510,290 620,280 780,270"
            fill="none"
            stroke={isDark ? '#57534e' : '#a8a29e'}
            strokeWidth="2"
          />

          {/* Regional Labels */}
          <g fontSize="11" fontWeight="700" fill={isDark ? '#a8a29e' : '#78716c'}>
            <text x="380" y="300">KAMPALA CBD</text>
            <text x="430" y="260">KOLOLO</text>
            <text x="450" y="235">NAGURU</text>
            <text x="475" y="210">NTINDA</text>
            <text x="510" y="180">KIRA</text>
            <text x="410" y="360">MUYENGA</text>
            <text x="390" y="410">MUNYONYO</text>
            <text x="320" y="380">LUBOWA</text>
            <text x="180" y="520">ENTEBBE</text>
            <text x="690" y="250">MUKONO</text>
          </g>

          {/* Property Pins */}
          {properties.map((prop) => {
            const { x, y } = projectCoordinates(prop.coordinates.lat, prop.coordinates.lng);
            const isSelected = activePin?.id === prop.id;

            return (
              <g
                key={prop.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => {
                  setActivePin(prop);
                  if (onSelectProperty) onSelectProperty(prop);
                }}
              >
                {isSelected && (
                  <circle r="16" fill="#10b981" opacity="0.4" className="animate-ping" />
                )}
                <ellipse cx="0" cy="14" rx="7" ry="3" fill="#000000" opacity="0.25" />
                <path
                  d="M 0,0 C -6,-10 -9,-14 -9,-20 C -9,-25 -5,-29 0,-29 C 5,-29 9,-25 9,-20 C 9,-14 6,-10 0,0 Z"
                  fill={isSelected ? '#10b981' : prop.transaction === 'buy' ? (isDark ? '#e7e5e4' : '#1c1917') : '#059669'}
                  stroke={isDark ? '#0c0a09' : '#ffffff'}
                  strokeWidth="2"
                />
                <circle cx="0" cy="-20" r="3.5" fill={isDark && prop.transaction === 'buy' && !isSelected ? '#0c0a09' : '#ffffff'} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Property Card Popover when pin is clicked */}
      {activePin && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 p-3 z-30 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => setActivePin(null)}
            className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-3">
            <div className="w-20 h-16 rounded-lg bg-stone-100 dark:bg-stone-700 overflow-hidden shrink-0">
              <img
                src={activePin.images[0]}
                alt={activePin.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                {activePin.transaction === 'buy' ? 'For Sale' : 'For Rent'} · {activePin.propertyType}
              </span>
              <h4 className="text-xs font-semibold text-stone-900 dark:text-white truncate mt-0.5">
                {activePin.title}
              </h4>
              <p className="text-xs font-bold text-stone-900 dark:text-white mt-1 tabular-nums">
                {formatUGX(activePin.price, true)}
                {activePin.transaction === 'rent' ? '/mo' : ''}
              </p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              {activePin.location}, {activePin.district}
            </span>
            <button
              onClick={() => {
                if (onSelectProperty) {
                  onSelectProperty(activePin);
                } else {
                  window.location.pathname = `/properties/${activePin.slug}`;
                }
              }}
              className="text-xs font-semibold text-stone-900 dark:text-white hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View Details</span>
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

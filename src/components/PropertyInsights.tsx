import React from 'react';
import { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/formatters';
import { TrendingUp, Lock, ArrowRight, BarChart3 } from 'lucide-react';

interface PropertyInsightsProps {
  property: Property;
}

export const PropertyInsights: React.FC<PropertyInsightsProps> = ({ property }) => {
  const { currentUser, openAuthModal, properties, navigateTo } = useApp();
  const insights = property.insights;

  // Find comparable properties in same location/type
  const comparables = properties
    .filter(p => p.id !== property.id && (p.location === property.location || p.propertyType === property.propertyType))
    .slice(0, 2);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-5 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-stone-800 dark:text-stone-200" />
          <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
            Property & Investment Insights
          </h3>
        </div>
        <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          Market Intelligence
        </span>
      </div>

      {!currentUser ? (
        // Protected Lock State for Anonymous Browsers
        <div className="p-6 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-white dark:bg-stone-700 rounded-full shadow-xs flex items-center justify-center mx-auto mb-3 text-stone-700 dark:text-stone-200">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-stone-900 dark:text-white">
            Market Yields & Investment Metrics Locked
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Create a free account or sign in to access estimated rental yields, historical capital growth data for {property.location}, and comparable valuation analyses.
          </p>
          <div className="mt-4">
            <button
              onClick={() => openAuthModal('Sign in to unlock estimated rental yields, comparable properties, and valuation metrics.')}
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Unlock Investment Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        // Unlocked Authenticated View
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Metric 1: Asking Price */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-700/60">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Asking Valuation</span>
              <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tabular-nums mt-0.5 block">
                {formatUGX(property.price, true)}
              </span>
            </div>

            {/* Metric 2: Estimated Monthly Rent */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-700/60">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Est. Monthly Rent</span>
              <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tabular-nums mt-0.5 block">
                {insights?.estimatedMonthlyRent ? formatUGX(insights.estimatedMonthlyRent, true) : 'N/A'}
              </span>
            </div>

            {/* Metric 3: Gross Rental Yield */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-700/60">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Est. Gross Yield</span>
              <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5 block">
                {insights?.grossRentalYield ? `${insights.grossRentalYield}% p.a.` : '6.5% est.'}
              </span>
            </div>

            {/* Metric 4: Unit Rate (Decimal or Sqm) */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-700/60">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">
                {property.landSizeDecimals ? 'Price / Decimal' : 'Price / m²'}
              </span>
              <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tabular-nums mt-0.5 block">
                {property.landSizeDecimals && insights?.pricePerDecimal
                  ? formatUGX(insights.pricePerDecimal, true)
                  : insights?.pricePerSqm
                    ? formatUGX(insights.pricePerSqm, true)
                    : 'Competitive'}
              </span>
            </div>

          </div>

          {/* Area Capital Growth Note */}
          {insights?.capitalGrowthForecast && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 rounded-lg text-xs text-emerald-900 dark:text-emerald-300">
              <BarChart3 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Area Trend ({property.location}): </strong>
                {insights.capitalGrowthForecast}
              </span>
            </div>
          )}

          {/* Comparable Properties Section */}
          {comparables.length > 0 && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2.5">
                Nearby Comparables
              </h4>
              <div className="space-y-2">
                {comparables.map(comp => (
                  <div
                    key={comp.id}
                    onClick={() => navigateTo(`/properties/${comp.slug}`)}
                    className="p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">{comp.title}</p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">{comp.location} · {comp.propertyType}</p>
                    </div>
                    <span className="text-xs font-bold text-stone-900 dark:text-white tabular-nums shrink-0">
                      {formatUGX(comp.price, true)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Disclaimer */}
          <div className="pt-2 text-[11px] text-stone-400 dark:text-stone-500 leading-relaxed">
            <p>
              * All valuations and gross rental yield calculations are algorithmic market estimates based on recent area listings. They do not constitute guaranteed financial returns or formal bank appraisal.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

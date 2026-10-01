import React from 'react';
import { Property } from '../types/property';
import { ShieldCheck, CheckCircle2, Info } from 'lucide-react';

interface VerificationPanelProps {
  property: Property;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ property }) => {
  const { verificationStatus, verificationDetails } = property;
  const isVerified = verificationStatus === 'verified';

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`} />
          <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
            Listing Verification
          </h3>
        </div>

        {isVerified ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified Listing
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Verification in Review
          </span>
        )}
      </div>

      {/* Verification Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        
        {/* Advertiser Identity */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${verificationDetails.advertiserVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-600'}`} />
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Advertiser Identity Verified</p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">National ID / Passport & agent mandate validated.</p>
          </div>
        </div>

        {/* Location Confirmed */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${verificationDetails.locationConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-600'}`} />
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Property Location Confirmed</p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">Physical on-site GPS coordinates & boundary markers inspected.</p>
          </div>
        </div>

        {/* Price Confirmed */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${verificationDetails.priceConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-600'}`} />
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Advertised Price Confirmed</p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">Owner mandate matches advertised UGX asking terms.</p>
          </div>
        </div>

        {/* Availability Confirmed */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700/60">
          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${verificationDetails.availabilityConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-600'}`} />
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Availability Confirmed</p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">Unit active and ready for viewing scheduling.</p>
          </div>
        </div>

      </div>

      {/* Field Inspection Inspector Notes */}
      {verificationDetails.notes && (
        <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-300 border border-stone-100 dark:border-stone-700 flex items-start gap-2">
          <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-medium text-stone-800 dark:text-stone-200">Inspection Note: </span>
            {verificationDetails.notes}
          </p>
        </div>
      )}

      {/* Crucial Legal Disclaimer */}
      <div className="pt-2 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800">
        <p>
          <strong className="text-stone-700 dark:text-stone-300">Notice to Buyers & Tenants:</strong> Verification information is based on physical inspections and advertiser documentation checks performed by the Reality Estates team. It does not replace independent legal due diligence, cadastral deed search at the Ministry of Lands, or boundary opening by a registered surveyor.
        </p>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Property, TransactionRecord } from '../types/property';
import { formatUGX } from '../utils/formatters';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Search, 
  User as UserIcon, 
  Eye, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  DollarSign, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { DEMO_USERS } from '../data/mockProperties';

export const AdminView: React.FC = () => {
  const { 
    currentUser, 
    loginAs, 
    properties, 
    updatePropertyVerification, 
    transactions, 
    updateTransactionStage,
    enquiries,
    updateEnquiryStatus,
    navigateTo 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'verification' | 'crm' | 'revenue' | 'enquiries'>('verification');
  const [inspectingProperty, setInspectingProperty] = useState<Property | null>(null);

  // Verification modal checklist states
  const [checkAdvertiser, setCheckAdvertiser] = useState(true);
  const [checkLocation, setCheckLocation] = useState(true);
  const [checkPrice, setCheckPrice] = useState(true);
  const [checkAvailability, setCheckAvailability] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const pendingProperties = properties.filter(p => p.verificationStatus === 'pending' || p.verificationStatus === 'unverified');
  const verifiedProperties = properties.filter(p => p.verificationStatus === 'verified');

  const openInspector = (prop: Property) => {
    setInspectingProperty(prop);
    setCheckAdvertiser(prop.verificationDetails?.advertiserVerified ?? true);
    setCheckLocation(prop.verificationDetails?.locationConfirmed ?? true);
    setCheckPrice(prop.verificationDetails?.priceConfirmed ?? true);
    setCheckAvailability(prop.verificationDetails?.availabilityConfirmed ?? true);
    setAdminNotes(prop.verificationDetails?.notes || '');
  };

  const handleApproveVerification = (propertyId: string) => {
    updatePropertyVerification(propertyId, 'verified', adminNotes || 'Cadastral coordinates and legal mandate verified by Admin Desk.');
    setInspectingProperty(null);
  };

  const handleRejectVerification = (propertyId: string) => {
    updatePropertyVerification(propertyId, 'unverified', adminNotes || 'Required title documentation or coordinates missing.');
    setInspectingProperty(null);
  };

  const CRM_STAGES: TransactionRecord['stage'][] = [
    'Enquiry',
    'Contacted',
    'Viewing',
    'Negotiation',
    'Offer',
    'Closed'
  ];

  if (!isAdmin) {
    const adminUser = DEMO_USERS.find(u => u.role === 'admin') || DEMO_USERS[3];
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
            Admin Verification & CRM Console
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
            This module is reserved for Reality Estates verification officers and marketplace admins to approve listing badges, manage the transaction pipeline, and audit enquiries.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => loginAs(adminUser)}
            className="py-3 px-6 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Switch to Admin Demo Account ({adminUser.name})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
              Admin & Verification Console
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Logged in as {currentUser?.name} • Pearl Prime National Desk
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'verification'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Verification Queue ({pendingProperties.length})
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'crm'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Transaction CRM ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'enquiries'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Inquiry Audit ({enquiries.length})
          </button>
        </div>
      </div>

      {/* TAB 1: VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Pending Verification Queue
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Inspect advertised listings to certify coordinates, ownership mandate, and market price sanity.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {verifiedProperties.length} Properties Currently Certified
            </span>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {properties.map(p => (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <img 
                      src={p.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'} 
                      alt={p.title} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          p.verificationStatus === 'verified' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                          p.verificationStatus === 'pending' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                          'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                        }`}>
                          {p.verificationStatus}
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">{p.location}, {p.district}</span>
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-white mt-1">
                        {p.title}
                      </h3>
                      <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                        {formatUGX(p.price)} • Rep: <strong>{p.advertiser.name}</strong> ({p.advertiser.phone})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => navigateTo(`/properties/${p.slug}`)}
                      className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded-lg border border-stone-200 dark:border-stone-700"
                      title="View public listing page"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openInspector(p)}
                      className="py-2 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-white"
                    >
                      Review & Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSACTION CRM KANBAN */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              6-Stage Transaction Pipeline (CRM)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Track buyer inquiries from initial viewing to final tenure transfer and closure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {CRM_STAGES.map(stage => {
              const stageDeals = transactions.filter(t => t.stage === stage);
              return (
                <div key={stage} className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col min-w-[220px]">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-3">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                      {stage}
                    </h4>
                    <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300 flex items-center justify-center">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {stageDeals.map(deal => (
                      <div key={deal.id} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 space-y-2 text-xs">
                        <div className="font-bold text-stone-900 dark:text-white line-clamp-1">
                          {deal.propertyTitle}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatUGX(deal.transactionValue, true)}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Client: <strong>{deal.customerName}</strong>
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Rep: {deal.agentName}
                        </div>

                        {/* Advance stage button */}
                        <div className="pt-2 flex justify-between items-center border-t border-stone-200/60 dark:border-stone-700">
                          <span className="text-[9px] text-stone-400">{deal.dateInitiated}</span>
                          {stage !== 'Closed' && (
                            <button
                              onClick={() => {
                                const currentIndex = CRM_STAGES.indexOf(stage);
                                const nextStage = CRM_STAGES[currentIndex + 1];
                                if (nextStage) updateTransactionStage(deal.id, nextStage);
                              }}
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: INQUIRY AUDIT */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Platform Enquiries & Leads Ledger
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Audit client engagement, response status, and communications.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
                    <th className="p-3.5 text-stone-500 dark:text-stone-400">Property</th>
                    <th className="p-3.5 text-stone-500 dark:text-stone-400">Customer</th>
                    <th className="p-3.5 text-stone-500 dark:text-stone-400">Date</th>
                    <th className="p-3.5 text-stone-500 dark:text-stone-400">Message</th>
                    <th className="p-3.5 text-stone-500 dark:text-stone-400">Status</th>
                    <th className="p-3.5 text-stone-500 dark:text-stone-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {enquiries.map(e => (
                    <tr key={e.id}>
                      <td className="p-3.5 font-bold text-stone-900 dark:text-white min-w-[160px]">
                        <div>{e.propertyTitle}</div>
                        {e.subject && (
                          <div className="text-[11px] font-normal text-stone-500 dark:text-stone-400">
                            Subj: {e.subject}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-900 dark:text-white">{e.customerName}</div>
                        <div className="text-[11px] text-stone-400">{e.customerPhone}</div>
                      </td>
                      <td className="p-3.5 text-stone-500">{e.date}</td>
                      <td className="p-3.5 max-w-xs truncate text-stone-600 dark:text-stone-300 italic">
                        "{e.message}"
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          e.status === 'Contacted' || e.status === 'Viewing Scheduled' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                          e.status === 'Closed' ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300' :
                          e.status === 'Lost' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' :
                          'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={e.status}
                          onChange={(evt) => updateEnquiryStatus(e.id, evt.target.value as any)}
                          className="text-xs p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Viewing Scheduled">Viewing Scheduled</option>
                          <option value="Offer Made">Offer Made</option>
                          <option value="Closed">Closed</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review & Inspect Modal */}
      {inspectingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  Inspect & Verify Listing
                </h3>
              </div>
              <button
                onClick={() => setInspectingProperty(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                {inspectingProperty.title}
              </h4>
              <p className="text-stone-500">
                {inspectingProperty.location}, {inspectingProperty.district} • {formatUGX(inspectingProperty.price)}
              </p>
              <p className="text-stone-500">
                GPS: {inspectingProperty.coordinates.lat}, {inspectingProperty.coordinates.lng}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkAdvertiser}
                  onChange={(e) => setCheckAdvertiser(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Advertiser Identity & Power of Attorney / Mandate Checked</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkLocation}
                  onChange={(e) => setCheckLocation(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Physical Site Location & Boundary Coordinates Confirmed</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkPrice}
                  onChange={(e) => setCheckPrice(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Price & Valuation Verified Against Land Registry Benchmarks</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkAvailability}
                  onChange={(e) => setCheckAvailability(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Availability Confirmed with Listing Representative</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Admin Sign-off Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notes on title inspection, boundary survey, or reason for decline..."
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleRejectVerification(inspectingProperty.id)}
                className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Mark as Unverified
              </button>

              <button
                type="button"
                onClick={() => handleApproveVerification(inspectingProperty.id)}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
              >
                Approve & Grant Verified Badge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

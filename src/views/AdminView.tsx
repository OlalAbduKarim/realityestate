import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Property, TransactionRecord } from '../types/property';
import { formatUGX } from '../utils/formatters';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  X
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { 
    properties, 
    updatePropertyVerification, 
    enquiries, 
    updateEnquiryStatus, 
    viewingRequests, 
    transactions, 
    updateTransactionStage
  } = useApp();

  const [activeTab, setActiveTab] = useState<'verification' | 'pipeline' | 'revenue' | 'enquiries'>('verification');
  const [reviewingProperty, setReviewingProperty] = useState<Property | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Checklist state for active review
  const [checkId, setCheckId] = useState(true);
  const [checkLocation, setCheckLocation] = useState(true);
  const [checkPrice, setCheckPrice] = useState(true);
  const [checkAvailability, setCheckAvailability] = useState(true);

  // Platform KPIs
  const totalProperties = properties.length;
  const verifiedPropertiesCount = properties.filter(p => p.verificationStatus === 'verified').length;
  const pendingVerificationProperties = properties.filter(p => p.verificationStatus === 'pending');
  const publishedPropertiesCount = properties.filter(p => p.listingStatus === 'published').length;
  const totalViewingRequests = viewingRequests.length;
  const totalPlatformRevenue = transactions.reduce((acc, t) => acc + (t.paymentStatus === 'Received' ? t.platformRevenue : 0), 0);
  const pipelineValue = transactions.reduce((acc, t) => acc + t.transactionValue, 0);

  const handleApprove = (propertyId: string) => {
    updatePropertyVerification(propertyId, 'verified', adminNote || 'Approved after physical boundary and owner mandate check.');
    setReviewingProperty(null);
    setAdminNote('');
  };

  const handleReject = (propertyId: string) => {
    updatePropertyVerification(propertyId, 'unverified', adminNote || 'Rejected due to incomplete cadastral documentation.');
    setReviewingProperty(null);
    setAdminNote('');
  };

  const PIPELINE_STAGES: TransactionRecord['stage'][] = [
    'Enquiry',
    'Contacted',
    'Viewing',
    'Negotiation',
    'Offer',
    'Closed'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Platform Administration & Verification Unit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
            Operations & Compliance Control
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Review supplier submissions, enforce anti-fraud checks, track CRM pipeline, and monitor marketplace revenue.
          </p>
        </div>

        {/* View toggles */}
        <div className="flex rounded-lg bg-stone-100 dark:bg-stone-800 p-1 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('verification')}
            className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'verification' 
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Verification Queue ({pendingVerificationProperties.length})
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'pipeline' 
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Transaction CRM
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'revenue' 
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Revenue Tracking
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'enquiries' 
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Enquiries ({enquiries.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block">Total Properties</span>
          <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums mt-1 block">{totalProperties}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">{publishedPropertiesCount} published</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block">Pending Review</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-1 block">{pendingVerificationProperties.length}</span>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Awaiting inspection</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block">Verified Badge</span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1 block">{verifiedPropertiesCount}</span>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">{(verifiedPropertiesCount / totalProperties * 100).toFixed(0)}% verified ratio</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block">Client Viewings</span>
          <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums mt-1 block">{totalViewingRequests}</span>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Scheduled walk-throughs</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block">Pipeline Value</span>
          <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums mt-1 block">{formatUGX(pipelineValue, true)}</span>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Active transactions</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 block">Received Revenue</span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1 block">{formatUGX(totalPlatformRevenue, true)}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">Commission ledger</span>
        </div>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verification' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Pending Verification Queue
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Properties submitted by owners and agents requiring cadastral and physical check prior to verification.
              </p>
            </div>
          </div>

          {pendingVerificationProperties.length === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              All submitted listings have been processed by the verification desk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 font-semibold uppercase">
                    <th className="py-3 px-3">Property</th>
                    <th className="py-3 px-3">Advertiser</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Asking Price</th>
                    <th className="py-3 px-3">Submitted</th>
                    <th className="py-3 px-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {pendingVerificationProperties.map(prop => (
                    <tr key={prop.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                            <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 dark:text-white">{prop.title}</p>
                            <p className="text-[11px] text-stone-400 dark:text-stone-500">{prop.propertyType} · {prop.transaction === 'buy' ? 'Sale' : 'Rent'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-stone-800 dark:text-stone-200">{prop.advertiser.name}</p>
                        <p className="text-[11px] text-stone-400 dark:text-stone-500">{prop.advertiser.phone}</p>
                      </td>
                      <td className="py-3 px-3 text-stone-700 dark:text-stone-300">{prop.location}, {prop.district}</td>
                      <td className="py-3 px-3 font-bold text-stone-900 dark:text-white tabular-nums">
                        {formatUGX(prop.price, true)}
                      </td>
                      <td className="py-3 px-3 text-stone-400 dark:text-stone-500 tabular-nums">{prop.dateAdded}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReviewingProperty(prop);
                              setAdminNote(prop.verificationDetails.notes || '');
                            }}
                            className="py-1.5 px-3 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold transition-colors"
                          >
                            Review & Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Review of already verified properties for admin auditing */}
          <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">
              Sample of Active Verified Listings:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {properties.filter(p => p.verificationStatus === 'verified').slice(0, 3).map(p => (
                <div key={p.id} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="font-semibold text-stone-900 dark:text-white truncate">{p.title}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">{p.location} · {formatUGX(p.price, true)}</p>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 font-bold px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Transaction CRM Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Transaction Pipeline Management
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Visual CRM tracking progression from initial inquiry through scheduled viewing, negotiations, to closed deal.
              </p>
            </div>
          </div>

          {/* Pipeline Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PIPELINE_STAGES.map(stage => {
              const stageTxs = transactions.filter(t => t.stage === stage);
              return (
                <div key={stage} className="bg-stone-50 dark:bg-stone-850 rounded-xl p-3 border border-stone-200/80 dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
                    <span className="text-xs font-bold text-stone-900 dark:text-white">{stage}</span>
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800 px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                      {stageTxs.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stageTxs.map(tx => (
                      <div key={tx.id} className="bg-white dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700 shadow-2xs space-y-2">
                        <div>
                          <p className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">{tx.propertyTitle}</p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">{tx.customerName}</p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-900 dark:text-white tabular-nums">
                          <span>{formatUGX(tx.transactionValue, true)}</span>
                          <span className="text-emerald-700 dark:text-emerald-400">{tx.agreedCommissionPercent}% comm</span>
                        </div>
                        <div className="pt-1 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 dark:text-stone-500">{tx.agentName}</span>
                          {stage !== 'Closed' && (
                            <button
                              onClick={() => {
                                const nextIndex = PIPELINE_STAGES.indexOf(stage) + 1;
                                if (nextIndex < PIPELINE_STAGES.length) {
                                  updateTransactionStage(tx.id, PIPELINE_STAGES[nextIndex]);
                                }
                              }}
                              className="text-[10px] font-bold text-stone-900 dark:text-stone-200 hover:underline flex items-center gap-0.5"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
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

      {/* Tab 3: Revenue Tracking */}
      {activeTab === 'revenue' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Internal Marketplace Revenue Tracking
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Platform commission accruals and settlement tracking. (Platform discovery fee tracking; does not process banking escrow).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 font-semibold uppercase">
                  <th className="py-3 px-3">Property</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Transaction Type</th>
                  <th className="py-3 px-3">Deal Value</th>
                  <th className="py-3 px-3">Commission %</th>
                  <th className="py-3 px-3">Platform Revenue</th>
                  <th className="py-3 px-3">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-stone-900 dark:text-white">{t.propertyTitle}</td>
                    <td className="py-3 px-3 text-stone-700 dark:text-stone-300">{t.customerName}</td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                        {t.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900 dark:text-white tabular-nums">
                      {formatUGX(t.transactionValue)}
                    </td>
                    <td className="py-3 px-3 text-stone-700 dark:text-stone-300 tabular-nums">{t.agreedCommissionPercent}%</td>
                    <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatUGX(t.platformRevenue)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        t.paymentStatus === 'Received' 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                          : t.paymentStatus === 'Invoiced' 
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' 
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}>
                        {t.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Enquiries Management */}
      {activeTab === 'enquiries' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                Customer Enquiries Management
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Monitor client inquiries submitted to suppliers and representatives across Uganda.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 font-semibold uppercase">
                  <th className="py-3 px-3">Property</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned Representative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {enquiries.map(enq => (
                  <tr key={enq.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-stone-900 dark:text-white">{enq.propertyTitle}</td>
                    <td className="py-3 px-3 text-stone-800 dark:text-stone-200">{enq.customerName}</td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-400">{enq.customerPhone}</td>
                    <td className="py-3 px-3 text-stone-400 dark:text-stone-500 tabular-nums">{enq.date}</td>
                    <td className="py-3 px-3">
                      <select
                        value={enq.status}
                        onChange={e => updateEnquiryStatus(enq.id, e.target.value as any)}
                        className="py-1 px-2 text-xs border border-stone-200 dark:border-stone-700 rounded-md bg-stone-50 dark:bg-stone-800 dark:text-stone-100 font-medium focus:outline-hidden"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Viewing Scheduled">Viewing Scheduled</option>
                        <option value="Offer Made">Offer Made</option>
                        <option value="Closed">Closed</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-stone-700 dark:text-stone-300">{enq.assignedRep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Property Review Modal */}
      {reviewingProperty && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setReviewingProperty(null)}
        >
          <div 
            className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 dark:border-stone-800 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-6 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Compliance Inspection Review
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
                  {reviewingProperty.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewingProperty(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo & Specs overview */}
            <div className="flex gap-4">
              <div className="w-32 h-24 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                <img src={reviewingProperty.images[0]} alt={reviewingProperty.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                <p><strong className="text-stone-900 dark:text-white">Advertiser:</strong> {reviewingProperty.advertiser.name} ({reviewingProperty.advertiser.type})</p>
                <p><strong className="text-stone-900 dark:text-white">Phone:</strong> {reviewingProperty.advertiser.phone}</p>
                <p><strong className="text-stone-900 dark:text-white">Location:</strong> {reviewingProperty.address}, {reviewingProperty.location}</p>
                <p><strong className="text-stone-900 dark:text-white">Price:</strong> {formatUGX(reviewingProperty.price)}</p>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-3 bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Verification Checklist (Field Inspector Sign-Off):
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-300 cursor-pointer">
                  <input type="checkbox" checked={checkId} onChange={e => setCheckId(e.target.checked)} className="rounded text-stone-900" />
                  <span>1. Advertiser identity confirmed via National ID / Passport mandate</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-300 cursor-pointer">
                  <input type="checkbox" checked={checkLocation} onChange={e => setCheckLocation(e.target.checked)} className="rounded text-stone-900" />
                  <span>2. Property location GPS and boundary stones inspected on-site</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-300 cursor-pointer">
                  <input type="checkbox" checked={checkPrice} onChange={e => setCheckPrice(e.target.checked)} className="rounded text-stone-900" />
                  <span>3. Advertised price confirmed against owner authority to sell/lease</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-300 cursor-pointer">
                  <input type="checkbox" checked={checkAvailability} onChange={e => setCheckAvailability(e.target.checked)} className="rounded text-stone-900" />
                  <span>4. Property is physically available with no competing active lock</span>
                </label>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Field Inspection Notes / Public Dossier Remarks:
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="e.g. Visited Kira site; inspected boundary beacons. Paved access confirmed."
                className="w-full p-3 text-xs border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => handleReject(reviewingProperty.id)}
                className="py-2.5 px-4 rounded-lg border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors"
              >
                Reject Listing
              </button>
              <button
                type="button"
                onClick={() => handleApprove(reviewingProperty.id)}
                className="py-2.5 px-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve & Grant Verified Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

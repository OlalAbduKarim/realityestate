import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  EnquiryStatus,
  Property,
  PropertyVerificationDetails,
  TransactionStage,
  VerificationStatus,
  ViewingStatus
} from '../types/property';
import { formatPriceDisplay, formatUGX } from '../utils/formatters';
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  MapPin,
  Calendar,
  MessageSquare,
  Eye,
  Check,
  DollarSign,
  Briefcase,
  Lock
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    properties,
    enquiries,
    viewingRequests,
    transactions,
    updatePropertyVerification,
    updateEnquiryStatus,
    updateViewingStatus,
    updateTransactionStage,
    navigateTo,
    openAuthModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'verifications' | 'enquiries' | 'viewings' | 'transactions'
  >('verifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPropertyForAudit, setSelectedPropertyForAudit] = useState<Property | null>(null);
  const [auditState, setAuditState] = useState<{
    verificationStatus: VerificationStatus;
    publishListing: boolean;
    details: PropertyVerificationDetails;
  } | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [isSavingAudit, setIsSavingAudit] = useState(false);

  // Client-side UI guard (NOTE: Future backend must enforce admin RBAC independently on all API routes)
  if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[75vh] bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
            Admin Operations Desk
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            Access to property verification, field inspection audits, and transaction pipelines requires an authorized Reality Estates Admin account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal('Sign in with an Admin account to access operations.')}
                className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Sign In as Admin
              </button>
            ) : null}
            <button
              onClick={() => navigateTo('/')}
              className="px-6 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-semibold text-sm transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingVerificationsCount = properties.filter(
    (p) => p.verificationStatus === 'pending'
  ).length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;
  const pendingViewingsCount = viewingRequests.filter((v) => v.status === 'Pending').length;
  const totalRevenue = transactions
    .filter((t) => t.stage === 'Closed')
    .reduce((sum, t) => sum + (Number.isFinite(t.platformRevenue) ? t.platformRevenue : 0), 0);

  const openAuditModal = (property: Property) => {
    setSelectedPropertyForAudit(property);
    setAuditError(null);
    setAuditState({
      verificationStatus: property.verificationStatus,
      publishListing: property.listingStatus === 'published',
      details: {
        ...property.verificationDetails,
        verifiedAt:
          property.verificationDetails?.verifiedAt || new Date().toISOString().split('T')[0]
      }
    });
  };

  const handleSaveAudit = async () => {
    if (!selectedPropertyForAudit || !auditState || isSavingAudit) return;
    setIsSavingAudit(true);
    setAuditError(null);

    try {
      await updatePropertyVerification(
        selectedPropertyForAudit.id,
        auditState.verificationStatus,
        auditState.details.notes,
        {
          advertiserVerified: auditState.details.advertiserVerified,
          locationConfirmed: auditState.details.locationConfirmed,
          priceConfirmed: auditState.details.priceConfirmed,
          availabilityConfirmed: auditState.details.availabilityConfirmed,
          publishListing: auditState.publishListing
        }
      );
      setSelectedPropertyForAudit(null);
      setAuditState(null);
    } catch (err) {
      setAuditError(
        err instanceof Error ? err.message : 'Failed to save verification audit.'
      );
    } finally {
      setIsSavingAudit(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ENQUIRY_STATUSES: EnquiryStatus[] = ['New', 'Replied', 'Archived'];
  const VIEWING_STATUSES: ViewingStatus[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const TRANSACTION_STAGES: TransactionStage[] = [
    'Enquiry',
    'Contacted',
    'Viewing',
    'Negotiation',
    'Offer',
    'Closed'
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
      {/* Top Admin Header */}
      <div className="bg-stone-900 text-white pt-8 pb-16 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Reality Estates Operations Desk
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Verification, Leads & Deal Pipeline
              </h1>
              <p className="text-stone-400 text-sm mt-1">
                Manage field inspections, verify land titles, coordinate viewings, and track closed commissions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-stone-800/90 border border-stone-700 rounded-xl px-4 py-2.5 text-right">
                <p className="text-xs text-stone-400">Logged in as</p>
                <p className="text-sm font-semibold text-white">
                  {currentUser?.name || 'Admin Desk'}
                </p>
              </div>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-stone-800/70 border border-stone-700/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-stone-400 text-xs font-medium mb-2">
                <span>Pending Verification</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">{pendingVerificationsCount}</p>
              <p className="text-xs text-amber-400 mt-1">Awaiting field or desk check</p>
            </div>

            <div className="bg-stone-800/70 border border-stone-700/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-stone-400 text-xs font-medium mb-2">
                <span>New Buyer Enquiries</span>
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{newEnquiriesCount}</p>
              <p className="text-xs text-emerald-400 mt-1">{enquiries.length} total enquiries</p>
            </div>

            <div className="bg-stone-800/70 border border-stone-700/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-stone-400 text-xs font-medium mb-2">
                <span>Viewing Requests</span>
                <Calendar className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-white">{pendingViewingsCount}</p>
              <p className="text-xs text-sky-400 mt-1">{viewingRequests.length} total requests</p>
            </div>

            <div className="bg-stone-800/70 border border-stone-700/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-stone-400 text-xs font-medium mb-2">
                <span>Closed Commission</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{formatUGX(totalRevenue, true)}</p>
              <p className="text-xs text-stone-400 mt-1">Display estimate from closed deals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-2 shadow-sm border border-stone-200/80 dark:border-stone-800 flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'verifications'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Property Verifications
            {pendingVerificationsCount > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold">
                {pendingVerificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'enquiries'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Customer Enquiries
            <span className="px-2 py-0.5 text-xs rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
              {enquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('viewings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'viewings'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Viewing Schedule
            <span className="px-2 py-0.5 text-xs rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
              {viewingRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Deal & Commission Pipeline
            <span className="px-2 py-0.5 text-xs rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
              {transactions.length}
            </span>
          </button>
        </div>

        {/* TAB 1: PROPERTY VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, title, neighborhood, or district..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'verified', 'unverified'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      statusFilter === status
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {filteredProperties.map((property) => {
                const v = property.verificationDetails;
                const checkCount = v
                  ? [
                      v.advertiserVerified,
                      v.locationConfirmed,
                      v.priceConfirmed,
                      v.availabilityConfirmed
                    ].filter(Boolean).length
                  : 0;
                const primaryImage = property.images?.[0] || '';

                return (
                  <div
                    key={property.id}
                    className="p-5 hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={property.title}
                          className="w-24 h-20 rounded-xl object-cover shrink-0 bg-stone-200"
                        />
                      ) : (
                        <div className="w-24 h-20 rounded-xl shrink-0 bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-xs text-stone-500">
                          No image
                        </div>
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-stone-400">#{property.id}</span>
                          {property.verificationStatus === 'verified' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified ({checkCount}/4)
                            </span>
                          )}
                          {property.verificationStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300">
                              <Clock className="w-3.5 h-3.5" /> Verification Pending ({checkCount}/4)
                            </span>
                          )}
                          {property.verificationStatus === 'unverified' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400">
                              <AlertCircle className="w-3.5 h-3.5" /> Unverified ({checkCount}/4)
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 capitalize">
                            Listing: {property.listingStatus}
                          </span>
                        </div>

                        <h3 className="font-bold text-stone-900 dark:text-white text-base">
                          {property.title}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {property.location}, {property.district} •{' '}
                          <span className="font-semibold text-stone-700 dark:text-stone-300">
                            {formatPriceDisplay(
                              property.price,
                              property.transaction,
                              property.pricePeriod,
                              property.currency
                            )}
                          </span>
                        </p>
                        <p className="text-xs text-stone-500 mt-1">
                          Submitted by:{' '}
                          <strong className="text-stone-700 dark:text-stone-300">
                            {property.advertiser?.name || 'Property Representative'}
                          </strong>{' '}
                          ({property.advertiser?.type || 'Agent'}) • Tenure:{' '}
                          {property.tenure || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        onClick={() => navigateTo(`/properties/${property.slug}`)}
                        className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => openAuditModal(property)}
                        className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Inspect & Verify
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProperties.length === 0 && (
                <div className="p-12 text-center text-stone-500 dark:text-stone-400">
                  No properties match the current filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800">
              <h2 className="font-bold text-stone-900 dark:text-white">
                Customer Enquiries & Lead Routing
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Track buyer and tenant messages sent to property representatives.
              </p>
            </div>
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {enquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          enquiry.status === 'New'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : enquiry.status === 'Replied'
                            ? 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                      <span className="text-xs text-stone-400">{enquiry.date}</span>
                    </div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                      {enquiry.customerName} •{' '}
                      <span className="text-emerald-800 dark:text-emerald-400">
                        {enquiry.customerPhone}
                      </span>
                      {enquiry.customerEmail ? (
                        <span className="text-stone-400 font-normal">
                          {' '}
                          ({enquiry.customerEmail})
                        </span>
                      ) : null}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Property:{' '}
                      <strong className="text-stone-700 dark:text-stone-300">
                        {enquiry.propertyTitle}
                      </strong>{' '}
                      ({enquiry.propertyLocation})
                    </p>
                    <p className="text-sm text-stone-700 dark:text-stone-300 mt-2 bg-stone-50 dark:bg-stone-800/70 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                      "{enquiry.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ENQUIRY_STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          void updateEnquiryStatus(enquiry.id, st);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          enquiry.status === st
                            ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                        }`}
                      >
                        Mark {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {enquiries.length === 0 && (
                <div className="p-12 text-center text-stone-500 dark:text-stone-400">
                  No customer enquiries recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VIEWING REQUESTS */}
        {activeTab === 'viewings' && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800">
              <h2 className="font-bold text-stone-900 dark:text-white">
                Scheduled Property Viewings
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Confirm and coordinate site inspections between clients and listing agents.
              </p>
            </div>
            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {viewingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {req.propertyImage ? (
                      <img
                        src={req.propertyImage}
                        alt={req.propertyTitle}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-stone-200 dark:bg-stone-800 shrink-0 flex items-center justify-center text-xs text-stone-500">
                        No img
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            req.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : req.status === 'Pending'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                              : req.status === 'Completed'
                              ? 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-300'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          {req.preferredDate} at {req.preferredTime}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                        {req.propertyTitle}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Client: <strong>{req.customerName}</strong> ({req.customerPhone})
                      </p>
                      {req.message && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 italic">
                          Note: "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {VIEWING_STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          void updateViewingStatus(req.id, st);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          req.status === st
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {viewingRequests.length === 0 && (
                <div className="p-12 text-center text-stone-500 dark:text-stone-400">
                  No viewing requests scheduled yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS & COMMISSIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-stone-900 dark:text-white">
                  Deal Attribution & Commission Tracker
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Track leads from initial enquiry through site inspection, offer negotiation, and commission settlement.
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium">
                Client-side figures are display estimates • Backend calculates authoritative settlement
              </span>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {transactions.map((tx) => {
                const calculatedEstimate = Math.round(
                  (Number.isFinite(tx.transactionValue) ? tx.transactionValue : 0) *
                    ((Number.isFinite(tx.agreedCommissionPercent)
                      ? tx.agreedCommissionPercent
                      : 0) /
                      100)
                );
                const displayRevenue = Number.isFinite(tx.platformRevenue)
                  ? tx.platformRevenue
                  : calculatedEstimate;

                return (
                  <div key={tx.id} className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Stage: {tx.stage}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 uppercase">
                            {tx.transactionType}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              tx.paymentStatus === 'Received'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.paymentStatus === 'Invoiced'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            Commission: {tx.paymentStatus}
                          </span>
                        </div>

                        <h4 className="font-bold text-stone-900 dark:text-white text-base">
                          {tx.propertyTitle}
                        </h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Client: <strong>{tx.customerName}</strong> • Rep:{' '}
                          <strong>{tx.agentName}</strong> • Initiated: {tx.dateInitiated}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 bg-stone-50 dark:bg-stone-800/60 px-4 py-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-stone-400">
                            Deal Value
                          </p>
                          <p className="text-sm font-bold text-stone-900 dark:text-white">
                            {formatUGX(tx.transactionValue, true)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-stone-400">
                            Rate
                          </p>
                          <p className="text-sm font-bold text-stone-900 dark:text-white">
                            {tx.agreedCommissionPercent}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-stone-400">
                            Platform Revenue
                          </p>
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {formatUGX(displayRevenue, true)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-stone-400">Advance Deal Stage:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {TRANSACTION_STAGES.map((stage) => (
                          <button
                            key={stage}
                            onClick={() => {
                              void updateTransactionStage(tx.id, stage);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              tx.stage === stage
                                ? 'bg-emerald-900 text-white'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                            }`}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {transactions.length === 0 && (
                <div className="p-12 text-center text-stone-500 dark:text-stone-400">
                  No transactions in pipeline yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AUDIT & VERIFICATION MODAL */}
      {selectedPropertyForAudit && auditState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                  Verification Audit
                </span>
                <h3 className="text-lg font-bold mt-0.5 line-clamp-1">
                  {selectedPropertyForAudit.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPropertyForAudit(null)}
                className="p-2 text-stone-400 hover:text-white rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {auditError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-xs text-red-700 dark:text-red-300 font-medium">
                  {auditError}
                </div>
              )}

              {/* 4-Point Verification Checklist */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  4-Point Field & Registry Checklist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'advertiserVerified', label: '1. Advertiser Identity Verified' },
                    { key: 'locationConfirmed', label: '2. Boundary & Location Confirmed' },
                    { key: 'priceConfirmed', label: '3. Asking Price & Terms Confirmed' },
                    { key: 'availabilityConfirmed', label: '4. Active Availability Confirmed' }
                  ].map((item) => {
                    const checked = Boolean(
                      auditState.details[item.key as keyof PropertyVerificationDetails]
                    );
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setAuditState((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  details: {
                                    ...prev.details,
                                    [item.key]: !checked
                                  }
                                }
                              : null
                          )
                        }
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          checked
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 text-emerald-950 dark:text-emerald-200'
                            : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <span className="text-xs font-semibold">{item.label}</span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            checked
                              ? 'bg-emerald-700 text-white'
                              : 'border border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Verification Status & Publication Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Verification Badge Status
                  </label>
                  <select
                    value={auditState.verificationStatus}
                    onChange={(e) =>
                      setAuditState((prev) =>
                        prev
                          ? {
                              ...prev,
                              verificationStatus: e.target.value as VerificationStatus
                            }
                          : null
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-white"
                  >
                    <option value="verified">Verified (Green Badge)</option>
                    <option value="pending">Verification Pending</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Marketplace Visibility
                  </label>
                  <select
                    value={auditState.publishListing ? 'published' : 'pending'}
                    onChange={(e) =>
                      setAuditState((prev) =>
                        prev
                          ? {
                              ...prev,
                              publishListing: e.target.value === 'published'
                            }
                          : null
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-white"
                  >
                    <option value="published">Published (Live in Search)</option>
                    <option value="pending">Pending Review (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Inspector Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Field Inspector & Title Registry Notes
                </label>
                <textarea
                  rows={3}
                  value={auditState.details.notes || ''}
                  onChange={(e) =>
                    setAuditState((prev) =>
                      prev
                        ? {
                            ...prev,
                            details: {
                              ...prev.details,
                              notes: e.target.value
                            }
                          }
                        : null
                    )
                  }
                  placeholder="Enter registry check findings, surveyor remarks, or physical inspection notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setSelectedPropertyForAudit(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingAudit}
                  onClick={handleSaveAudit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold shadow-sm"
                >
                  {isSavingAudit ? 'Saving Audit...' : 'Save Verification Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

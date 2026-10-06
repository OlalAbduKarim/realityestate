import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/PropertyCard';
import {
  Heart,
  Calendar,
  Building,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  ArrowRight,
  LogOut,
  ShieldCheck,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';

interface DashboardViewProps {
  initialTab?: 'saved' | 'viewings' | 'listings' | 'enquiries';
}

export const DashboardView: React.FC<DashboardViewProps> = ({ initialTab = 'saved' }) => {
  const {
    currentUser,
    isDataLoading,
    isUserDashboardLoading,
    logout,
    properties,
    savedPropertyIds,
    viewingRequests,
    updateViewingStatus,
    cancelViewingRequest,
    enquiries,
    updateEnquiryStatus,
    submitPropertyForVerification,
    navigateTo,
    openAuthModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'viewings' | 'listings' | 'enquiries'>(
    initialTab
  );
  const [submittingPropertyId, setSubmittingPropertyId] = useState<string | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  if (isDataLoading || isUserDashboardLoading) {
    return (
      <div className="min-h-[70vh] bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <Loader2 className="w-8 h-8 text-emerald-700 dark:text-emerald-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
            Create an account or sign in to continue.
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-8">
            Access your saved properties, manage viewing requests, and track your listings across Uganda.
          </p>
          <button
            onClick={() => openAuthModal('Create an account or sign in to continue.')}
            className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-medium transition-colors"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  const savedProperties = properties.filter((p) => savedPropertyIds.includes(p.id));
  const userListings = properties.filter(
    (p) =>
      p.advertiser?.id === currentUser.id ||
      p.advertiser?.email === currentUser.email ||
      currentUser.role === 'admin'
  );

  const handlePropertyClick = (propertyId: string) => {
    const found = properties.find((p) => p.id === propertyId);
    if (found) {
      navigateTo(`/properties/${found.slug}`);
    }
  };

  const handleSubmitDraftForReview = async (propertyId: string) => {
    if (submittingPropertyId) return;
    setSubmittingPropertyId(propertyId);
    setSubmissionFeedback(null);
    try {
      await submitPropertyForVerification(propertyId);
      setSubmissionFeedback('Listing submitted for verification and publication review.');
    } catch (err) {
      setSubmissionFeedback(
        err instanceof Error ? err.message : 'Unable to submit listing for verification.'
      );
    } finally {
      setSubmittingPropertyId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" /> Pending Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getListingStatusBadge = (listingStatus: string, verificationStatus: string) => {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
            listingStatus === 'published'
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
              : listingStatus === 'pending'
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
              : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          {listingStatus}
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
            verificationStatus === 'verified'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : verificationStatus === 'pending'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
          }`}
        >
          {verificationStatus === 'verified'
            ? 'Verified'
            : verificationStatus === 'pending'
            ? 'Verification Pending'
            : 'Unverified'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 transition-colors duration-200">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 pt-8 pb-0 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                    {currentUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-sm">
                  {currentUser.email} • {currentUser.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => navigateTo('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white hover:bg-emerald-800 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Desk
                </button>
              )}
              <button
                onClick={() => {
                  void logout();
                  navigateTo('/');
                }}
                className="flex items-center gap-2 px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-8 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'border-emerald-900 dark:border-emerald-500 text-emerald-900 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              Saved Properties
              <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 py-0.5 px-2 rounded-full text-xs">
                {savedProperties.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('viewings')}
              className={`pb-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'viewings'
                  ? 'border-emerald-900 dark:border-emerald-500 text-emerald-900 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Viewing Schedule
              <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 py-0.5 px-2 rounded-full text-xs">
                {viewingRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'listings'
                  ? 'border-emerald-900 dark:border-emerald-500 text-emerald-900 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              My Listings
              <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 py-0.5 px-2 rounded-full text-xs">
                {userListings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('enquiries')}
              className={`pb-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'enquiries'
                  ? 'border-emerald-900 dark:border-emerald-500 text-emerald-900 dark:text-emerald-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Enquiries
              <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 py-0.5 px-2 rounded-full text-xs">
                {enquiries.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'saved' && (
          <div>
            {savedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center max-w-lg mx-auto mt-8">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                  No saved properties yet
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-8">
                  Tap the heart icon on any property across Kampala, Wakiso, or Entebbe to save it here for easy comparison.
                </p>
                <button
                  onClick={() => navigateTo('/search')}
                  className="px-6 py-3 bg-emerald-900 text-white rounded-xl font-medium hover:bg-emerald-800 transition-colors inline-flex items-center gap-2"
                >
                  Explore Properties <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'viewings' && (
          <div className="max-w-4xl">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-6">
              Scheduled Property Viewings
            </h2>
            {viewingRequests.length > 0 ? (
              <div className="space-y-4">
                {viewingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
                      {request.propertyImage ? (
                        <img
                          src={request.propertyImage}
                          alt={request.propertyTitle}
                          className="w-full sm:w-32 h-32 sm:h-24 object-cover rounded-xl shrink-0 cursor-pointer"
                          onClick={() => handlePropertyClick(request.propertyId)}
                        />
                      ) : (
                        <div
                          onClick={() => handlePropertyClick(request.propertyId)}
                          className="w-full sm:w-32 h-32 sm:h-24 bg-stone-200 dark:bg-stone-800 rounded-xl shrink-0 cursor-pointer flex items-center justify-center text-xs text-stone-500"
                        >
                          No image
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {getStatusBadge(request.status)}
                          <span className="text-xs text-stone-400 dark:text-stone-500">
                            Requested {request.dateRequested}
                          </span>
                        </div>
                        <h3
                          className="font-bold text-stone-900 dark:text-white text-lg hover:text-emerald-800 dark:hover:text-emerald-400 cursor-pointer transition-colors mb-1"
                          onClick={() => handlePropertyClick(request.propertyId)}
                        >
                          {request.propertyTitle}
                        </h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5" /> {request.propertyLocation}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-medium">
                            <Calendar className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                            {request.preferredDate}
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-medium">
                            <Clock className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                            {request.preferredTime}
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                            <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                            {request.customerPhone}
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.status === 'Pending' && (
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100 dark:border-stone-800">
                        <button
                          onClick={() => {
                            void updateViewingStatus(request.id, 'Confirmed');
                          }}
                          className="flex-1 sm:w-32 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors text-center"
                        >
                          Confirm Viewing
                        </button>
                        <button
                          onClick={() => {
                            void cancelViewingRequest(request.id);
                          }}
                          className="flex-1 sm:w-32 py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-600 dark:text-stone-400 hover:text-red-700 dark:hover:text-red-400 rounded-lg text-xs font-semibold transition-colors text-center"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
                <Calendar className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
                  No viewings scheduled
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6">
                  When you request to view a property, your schedule and confirmation status will appear here.
                </p>
                <button
                  onClick={() => navigateTo('/search')}
                  className="px-6 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors"
                >
                  Browse Properties
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                  Managed Properties
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Properties you have listed or manage on Reality Estates.
                </p>
              </div>
              <button
                onClick={() => navigateTo('/list-property')}
                className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2 self-start"
              >
                <Plus className="w-4 h-4" /> Add New Listing
              </button>
            </div>

            {submissionFeedback && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <span>{submissionFeedback}</span>
                <button
                  onClick={() => setSubmissionFeedback(null)}
                  className="text-xs underline ml-4"
                >
                  Dismiss
                </button>
              </div>
            )}

            {userListings.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListings.map((property) => (
                    <div key={property.id} className="flex flex-col">
                      <PropertyCard property={property} />
                      <div className="mt-2 px-3 py-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2">
                        {getListingStatusBadge(
                          property.listingStatus,
                          property.verificationStatus
                        )}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigateTo(`/edit-property/${property.id}`)}
                            className="px-2.5 py-1 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          {property.listingStatus === 'draft' && (
                            <button
                              onClick={() => handleSubmitDraftForReview(property.id)}
                              disabled={submittingPropertyId === property.id}
                              className="px-3 py-1 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              {submittingPropertyId === property.id
                                ? 'Submitting...'
                                : 'Submit for Review'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
                <Building className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
                  You haven't listed any properties
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
                  Reach thousands of verified buyers and tenants looking for prime real estate in Uganda.
                </p>
                <button
                  onClick={() => navigateTo('/list-property')}
                  className="px-6 py-3 bg-emerald-900 text-white rounded-xl font-medium hover:bg-emerald-800 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> List Your First Property
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'enquiries' && (
          <div className="max-w-4xl">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-6">
              Property Enquiries & Leads
            </h2>
            {enquiries.length > 0 ? (
              <div className="space-y-4">
                {enquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
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
                      <div className="flex items-center gap-2">
                        {(['New', 'Replied', 'Archived'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              void updateEnquiryStatus(enquiry.id, st);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              enquiry.status === st
                                ? 'bg-emerald-900 text-white border-emerald-900'
                                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <h3
                      onClick={() => handlePropertyClick(enquiry.propertyId)}
                      className="font-bold text-stone-900 dark:text-white hover:text-emerald-800 cursor-pointer"
                    >
                      {enquiry.propertyTitle}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      From: <strong>{enquiry.customerName}</strong> ({enquiry.customerPhone})
                      {enquiry.customerEmail ? ` • ${enquiry.customerEmail}` : ''}
                    </p>
                    <p className="text-sm text-stone-700 dark:text-stone-300 mt-3 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl">
                      "{enquiry.message}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
                  No enquiries yet
                </h3>
                <p className="text-stone-500 dark:text-stone-400">
                  Customer messages about your properties will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

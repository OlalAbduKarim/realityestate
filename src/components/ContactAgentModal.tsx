import React, { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import {
  X,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  ShieldCheck,
  Mail,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Images,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export interface ContactAgentModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  defaultTab?: 'call' | 'whatsapp' | 'message';
}

export const ContactAgentModal: React.FC<ContactAgentModalProps> = ({
  property,
  isOpen,
  onClose,
  initialSubject
}) => {
  const { currentUser, openAuthModal, addEnquiry, navigateTo } = useApp();

  const [subject, setSubject] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [inquiryType, setInquiryType] = useState<
    'General Inquiry' | 'Schedule Inspection' | 'Price Negotiation' | 'Availability Check'
  >('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const advertiserName = property?.advertiser?.name || 'Property Representative';
  const advertiserPhone = property?.advertiser?.phone || '';
  const advertiserWhatsapp = property?.advertiser?.whatsapp || advertiserPhone;
  const propertyPhotos = Array.isArray(property?.images)
    ? property.images.filter(Boolean).slice(0, 4)
    : [];

  useEffect(() => {
    if (isOpen && property) {
      const defaultSubject = initialSubject || `Inquiry regarding ${property.title}`;
      setSubject(defaultSubject);
      setCustomerName(currentUser?.name || '');
      setCustomerEmail(currentUser?.email || '');
      setCustomerPhone(currentUser?.phone || '');
      setMessage(
        `Hello ${advertiserName},\n\nI am inquiring about "${property.title}" in ${property.location}, ${property.district} (Price: ${formatCurrency(property.price, property.currency, true)}).\n\nCould you please provide further details and inform me of when the property is available for a walkthrough inspection?\n\nThank you.`
      );
      setSubmitted(false);
      setIsSubmitting(false);
      setErrorMessage(null);
      setActivePhotoIndex(0);
    }
  }, [isOpen, property, currentUser, initialSubject, advertiserName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim() || !message.trim()) {
      setErrorMessage('Please fill in your name, phone number, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addEnquiry({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: propertyPhotos[0] || '',
        propertyPrice: property.price,
        propertyLocation: `${property.location}, ${property.district}`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim(),
        subject: subject.trim() || property.title,
        message: message.trim()
      });
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to send enquiry. Please check your details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInquiryTypeSelect = (type: typeof inquiryType) => {
    setInquiryType(type);
    let updatedMsg = '';
    switch (type) {
      case 'Schedule Inspection':
        updatedMsg = `Hello ${advertiserName},\n\nI would like to schedule an in-person physical inspection for "${property.title}". Please let me know your availability this week.\n\nThank you.`;
        break;
      case 'Price Negotiation':
        updatedMsg = `Hello ${advertiserName},\n\nI am reviewing "${property.title}" listed at ${formatCurrency(property.price, property.currency, true)}. Is there flexibility on the price for a committed buyer/tenant?\n\nLooking forward to your guidance.`;
        break;
      case 'Availability Check':
        updatedMsg = `Hello ${advertiserName},\n\nIs "${property.title}" in ${property.location} still actively available on the market? Please confirm the current status.\n\nThank you.`;
        break;
      default:
        updatedMsg = `Hello ${advertiserName},\n\nI am inquiring about "${property.title}" in ${property.location}, ${property.district} (Price: ${formatCurrency(property.price, property.currency, true)}).\n\nCould you please provide further details and inform me of when the property is available for inspection?\n\nThank you.`;
        break;
    }
    setMessage(updatedMsg);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="contact-agent-modal-title"
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-stone-100 dark:border-stone-800 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto text-left transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3
                id="contact-agent-modal-title"
                className="text-2xl font-serif font-bold text-stone-900 dark:text-white"
              >
                Message Sent to Agent
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 max-w-md mx-auto leading-relaxed">
                Your message regarding{' '}
                <strong className="text-stone-900 dark:text-white">
                  "{property.title}"
                </strong>{' '}
                has been delivered to{' '}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {advertiserName}
                </strong>{' '}
                ({property.advertiser?.agencyName || 'Listing Agent'}).
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 text-left border border-stone-200/70 dark:border-stone-700/60 text-xs space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Subject:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 truncate ml-2">
                  {subject}
                </span>
              </div>
              {property.advertiser?.responseRate && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">
                    Expected Response:
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {property.advertiser.responseRate}
                  </span>
                </div>
              )}
              {advertiserPhone && (
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Agent Phone:</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200">
                    {advertiserPhone}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigateTo('/dashboard');
                }}
                className="w-full sm:w-auto py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>View My Enquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1">
                Direct Agent Inquiry
              </span>
              <h3
                id="contact-agent-modal-title"
                className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white"
              >
                Contact Representative
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                Listing: {property.title} • {property.location}, {property.district}
              </p>
            </div>

            {/* Property Photographs Preview (Shows Main Photo + Additional Uploaded Photos 2-4) */}
            {propertyPhotos.length > 0 && (
              <div className="mb-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Images className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Property Photographs ({activePhotoIndex + 1} of {propertyPhotos.length})
                    </span>
                  </span>
                  {property.slug && property.id !== 'preview-temp' && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigateTo(`/properties/${property.slug}`);
                      }}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Open Full Listing Details →
                    </button>
                  )}
                </div>

                {/* Active Selected Photo */}
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800">
                  <img
                    src={propertyPhotos[activePhotoIndex] || propertyPhotos[0]}
                    alt={`${property.title} — Photo ${activePhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-semibold">
                    {activePhotoIndex === 0
                      ? 'Main Listing Photo'
                      : `Additional Photo ${activePhotoIndex + 1} of ${propertyPhotos.length}`}
                  </span>

                  {propertyPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIndex(
                            (prev) => (prev - 1 + propertyPhotos.length) % propertyPhotos.length
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIndex((prev) => (prev + 1) % propertyPhotos.length)
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* All Uploaded Photos Thumbnail Strip (Main + Photos 2, 3, 4) */}
                {propertyPhotos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {propertyPhotos.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          activePhotoIndex === idx
                            ? 'border-emerald-600 dark:border-emerald-400 ring-1 ring-emerald-500/40'
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${property.title} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/75 text-white text-[9px] font-semibold">
                          {idx === 0 ? 'Main' : `#${idx + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Agent / Representative Profile Card */}
            <div className="bg-stone-50 dark:bg-stone-800/70 rounded-xl p-3.5 border border-stone-200/80 dark:border-stone-700/60 mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center text-sm font-bold shrink-0">
                  {advertiserName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-stone-900 dark:text-white truncate">
                      {advertiserName}
                    </span>
                    {property.advertiser?.verified && (
                      <span title="Verified Agent">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 truncate">
                    <span className="truncate">
                      {property.advertiser?.agencyName ||
                        property.advertiser?.type ||
                        'Representative'}
                    </span>
                    {property.advertiser?.responseRate && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Clock className="w-3 h-3" /> {property.advertiser.responseRate}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {advertiserPhone && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${advertiserPhone.replace(/\s+/g, '')}`}
                    title="Call Agent directly"
                    className="p-2 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 rounded-lg border border-stone-200 dark:border-stone-600 transition-colors shadow-2xs"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  {advertiserWhatsapp && (
                    <a
                      href={`https://wa.me/${advertiserWhatsapp.replace(
                        /[^0-9]/g,
                        ''
                      )}?text=${encodeURIComponent(
                        `Hello ${advertiserName}, I am contacting you regarding "${property.title}" on Reality Estates.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Chat on WhatsApp"
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="contact-agent-subject"
                    className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5"
                  >
                    <span>Subject</span>
                    <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> Pre-filled with listing title
                    </span>
                  </label>
                </div>
                <input
                  id="contact-agent-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="contact-agent-name"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="contact-agent-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ronald Mukasa"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-agent-phone"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="contact-agent-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-agent-email"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Email Address{' '}
                  <span className="text-stone-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="contact-agent-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
                  I want to:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      'General Inquiry',
                      'Schedule Inspection',
                      'Price Negotiation',
                      'Availability Check'
                    ] as const
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInquiryTypeSelect(type)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                        inquiryType === type
                          ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                          : 'bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-agent-message"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Your Message to {advertiserName} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-agent-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white transition-colors leading-relaxed"
                />
              </div>

              {!currentUser && (
                <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200/80 dark:border-stone-700/60 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span>Have an account? Sign in for one-click contact.</span>
                  <button
                    type="button"
                    onClick={() =>
                      openAuthModal(
                        'Sign in to track your property inquiries and message history.'
                      )
                    }
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Sending to Agent...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message to Agent</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const ContactRepresentativeModal = ContactAgentModal;

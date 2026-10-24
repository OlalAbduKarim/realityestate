import React, { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import {
  X,
  Phone,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Mail,
  ArrowRight,
  Images,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Send,
  Loader2,
  Lock
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import {
  TYGA_ESTATES_CONFIG,
  getTygaEstatesWhatsAppUrl,
  buildPropertyInquiryWhatsAppMessage
} from '../config/company';

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
  initialSubject,
  defaultTab = 'message'
}) => {
  const { currentUser, openAuthModal, addEnquiry, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState<'message' | 'call' | 'whatsapp'>(
    defaultTab || 'message'
  );
  const [selectedNetwork, setSelectedNetwork] = useState<'Airtel' | 'MTN'>('Airtel');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

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

  const { airtel, mtn } = TYGA_ESTATES_CONFIG.contacts;
  const currentContact = selectedNetwork === 'Airtel' ? airtel : mtn;

  const propertyPhotos = Array.isArray(property?.images)
    ? property.images.filter(Boolean).slice(0, 4)
    : [];

  useEffect(() => {
    if (isOpen && property) {
      setActiveTab(defaultTab || 'message');
      setCopiedNumber(null);
      const defaultSubject = initialSubject || `Inquiry regarding ${property.title}`;
      setSubject(defaultSubject);
      setCustomerName(currentUser?.name || '');
      setCustomerEmail(currentUser?.email || '');
      setCustomerPhone(currentUser?.phone || '');
      setMessage(
        `Hello TYGA ESTATES,\n\nI am inquiring about "${property.title}" located in ${property.location}, ${property.district} (Price: ${formatCurrency(
          property.price,
          property.currency,
          true
        )}).\n\nCould you please provide further details and arrange an on-site physical inspection with your team?\n\nThank you.`
      );
      setSubmitted(false);
      setIsSubmitting(false);
      setErrorMessage(null);
      setActivePhotoIndex(0);
    }
  }, [isOpen, property, currentUser, initialSubject, defaultTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (num: string, label: string) => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(num.replace(/\s+/g, ''));
      setCopiedNumber(label);
      setTimeout(() => setCopiedNumber(null), 2500);
    }
  };

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim() || !message.trim()) {
      setErrorMessage('Please fill in your name, phone number, and message.');
      return;
    }

    if (!currentUser) {
      openAuthModal(
        'Please sign in or create an account to record your message and track viewing status in your dashboard.',
        () => {
          setIsSubmitting(false);
        }
      );
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
        updatedMsg = `Hello TYGA ESTATES,\n\nI would like to schedule an in-person physical inspection for "${property.title}" in ${property.location}. Please let me know the availability this week.\n\nThank you.`;
        break;
      case 'Price Negotiation':
        updatedMsg = `Hello TYGA ESTATES,\n\nI am reviewing "${property.title}" listed at ${formatCurrency(
          property.price,
          property.currency,
          true
        )}. Is there room for negotiation or flexible payment terms for a committed buyer/tenant?\n\nLooking forward to your guidance.`;
        break;
      case 'Availability Check':
        updatedMsg = `Hello TYGA ESTATES,\n\nIs "${property.title}" in ${property.location} still actively available on the market? Please confirm the current status.\n\nThank you.`;
        break;
      default:
        updatedMsg = `Hello TYGA ESTATES,\n\nI am inquiring about "${property.title}" in ${property.location}, ${property.district} (Price: ${formatCurrency(
          property.price,
          property.currency,
          true
        )}).\n\nCould you please provide further details and inform me of when the property is available for inspection?\n\nThank you.`;
        break;
    }
    setMessage(updatedMsg);
  };

  const formattedPrice = formatCurrency(property.price, property.currency, true);

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
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/80 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3
                id="contact-agent-modal-title"
                className="text-2xl font-serif font-bold text-stone-900 dark:text-white"
              >
                Inquiry Sent to TYGA ESTATES
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 max-w-md mx-auto leading-relaxed">
                Your message regarding{' '}
                <strong className="text-stone-900 dark:text-white">
                  "{property.title}"
                </strong>{' '}
                has been received by the{' '}
                <strong className="text-amber-500">
                  TYGA ESTATES
                </strong>{' '}
                concierge team.
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 text-left border border-stone-200/70 dark:border-stone-700/60 text-xs space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Listing:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 truncate ml-2">
                  {property.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Airtel Line:</span>
                <span className="font-mono font-medium text-stone-900 dark:text-white">
                  {airtel.displayNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">MTN Line:</span>
                <span className="font-mono font-medium text-stone-900 dark:text-white">
                  {mtn.displayNumber}
                </span>
              </div>
            </div>

            {/* Quick Instant WhatsApp Continuation */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getTygaEstatesWhatsAppUrl(
                  airtel.whatsappNumber,
                  buildPropertyInquiryWhatsAppMessage(property.title, property.location, formattedPrice)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on Airtel WhatsApp</span>
              </a>

              <a
                href={getTygaEstatesWhatsAppUrl(
                  mtn.whatsappNumber,
                  buildPropertyInquiryWhatsAppMessage(property.title, property.location, formattedPrice)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on MTN WhatsApp</span>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-2 px-5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigateTo('/dashboard');
                }}
                className="w-full sm:w-auto py-2 px-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Track in Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1">
                <Building2 className="w-3 h-3" />
                TYGA ESTATES Official Concierge
              </div>
              <h3
                id="contact-agent-modal-title"
                className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white"
              >
                Contact TYGA ESTATES
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

                {/* Active Photo Container */}
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-inner group">
                  <img
                    src={propertyPhotos[activePhotoIndex]}
                    alt={`${property.title} photo ${activePhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {activePhotoIndex === 0
                      ? 'Main Hero Photo'
                      : `Detailed View Photo ${activePhotoIndex + 1} of 4`}
                  </div>

                  {propertyPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous photograph"
                        onClick={() =>
                          setActivePhotoIndex((prev) =>
                            prev === 0 ? propertyPhotos.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next photograph"
                        onClick={() =>
                          setActivePhotoIndex((prev) =>
                            prev === propertyPhotos.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails of up to 4 images */}
                {propertyPhotos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {propertyPhotos.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          activePhotoIndex === idx
                            ? 'border-emerald-600 dark:border-emerald-400 ring-2 ring-emerald-500/20 scale-102'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-stone-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-black/70 text-white">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Official TYGA ESTATES Concierge Notice */}
            <div className="bg-stone-50 dark:bg-stone-800/70 rounded-xl p-3.5 border border-stone-200/80 dark:border-stone-700/60 mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-stone-950 border border-stone-800 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-stone-900 dark:text-white truncate">
                      TYGA ESTATES Desk
                    </span>
                    <span title="Verified Company Representative">
                      <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                    Authorized property verification & viewing coordinators
                  </p>
                </div>
              </div>

              {/* Direct Quick Actions for Airtel & MTN */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${airtel.rawNumber}`}
                  title="Call Airtel line directly"
                  className="p-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 transition-colors shadow-2xs"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={getTygaEstatesWhatsAppUrl(
                    airtel.whatsappNumber,
                    buildPropertyInquiryWhatsAppMessage(property.title, property.location, formattedPrice)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp Airtel"
                  className="p-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-colors shadow-2xs font-bold"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Network Selector (Airtel vs MTN) */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Select Your Network Line:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedNetwork('Airtel')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    selectedNetwork === 'Airtel'
                      ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 ring-2 ring-red-500/20'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span>Airtel Uganda</span>
                  </div>
                  <span className="font-mono text-[11px]">{airtel.displayNumber}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNetwork('MTN')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    selectedNetwork === 'MTN'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-2 ring-amber-500/20'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>MTN Uganda</span>
                  </div>
                  <span className="font-mono text-[11px]">{mtn.displayNumber}</span>
                </button>
              </div>
            </div>

            {/* Contact Method Selector Tabs */}
            <div className="grid grid-cols-3 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'whatsapp'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('call')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'call'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone Call</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('message')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'message'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Direct Inquiry</span>
              </button>
            </div>

            {/* TAB 1: WHATSAPP PANE */}
            {activeTab === 'whatsapp' && (
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-4 text-center animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900 dark:text-white">
                    Instant WhatsApp with TYGA ESTATES
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                    Chat directly with our property consultants on{' '}
                    <strong className="text-stone-800 dark:text-stone-200 font-mono">
                      {currentContact.label}
                    </strong>
                    . Details for "{property.title}" will be pre-filled automatically.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 italic max-w-md mx-auto">
                    "{buildPropertyInquiryWhatsAppMessage(property.title, property.location, formattedPrice)}"
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <a
                      href={getTygaEstatesWhatsAppUrl(
                        currentContact.whatsappNumber,
                        buildPropertyInquiryWhatsAppMessage(property.title, property.location, formattedPrice)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-98"
                    >
                      <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                      <span>Open WhatsApp on {selectedNetwork}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(currentContact.rawNumber, selectedNetwork)}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedNumber === selectedNetwork ? (
                        <>
                          <Check className="w-4 h-4 text-amber-500" />
                          <span>{selectedNetwork} Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy {selectedNetwork} Number</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-300">
                  You can also switch to the{' '}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedNetwork(selectedNetwork === 'Airtel' ? 'MTN' : 'Airtel')
                    }
                    className="font-bold underline text-amber-600 dark:text-amber-400 cursor-pointer"
                  >
                    {selectedNetwork === 'Airtel' ? 'MTN' : 'Airtel'} line
                  </button>{' '}
                  if that is your primary Uganda SIM.
                </div>
              </div>
            )}

            {/* TAB 2: PHONE CALL PANE */}
            {activeTab === 'call' && (
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-4 text-center animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <Phone className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900 dark:text-white">
                    Direct Phone Contact with TYGA ESTATES
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                    Speak directly with a TYGA ESTATES client advisor regarding "{property.title}" on{' '}
                    <strong className="text-stone-900 dark:text-white font-mono">
                      {currentContact.label}
                    </strong>
                    .
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 inline-block font-mono text-lg font-bold text-stone-900 dark:text-white tracking-wide">
                    {currentContact.displayNumber}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <a
                      href={`tel:${currentContact.rawNumber}`}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call {currentContact.displayNumber}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentContact.rawNumber, selectedNetwork)}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedNumber === selectedNetwork ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Number Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                  Standard telecom tariffs apply. Service desk hours: Monday – Saturday, 8:00 AM – 6:30 PM EAT.
                </p>
              </div>
            )}

            {/* TAB 3: DIRECT ENQUIRY MESSAGE FORM */}
            {activeTab === 'message' && (
              <form onSubmit={handleSubmit} className="space-y-3.5 animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="contact-agent-subject"
                      className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                    >
                      Subject
                    </label>
                    <span className="text-[10px] text-stone-400">Concierge Routing</span>
                  </div>
                  <input
                    id="contact-agent-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Inquiry Subject"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Quick Subject Templates */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Quick Inquiry Category:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'General Inquiry',
                      'Schedule Inspection',
                      'Price Negotiation',
                      'Availability Check'
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleInquiryTypeSelect(type as typeof inquiryType)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          inquiryType === type
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-500 font-semibold'
                            : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="contact-agent-customer-name"
                      className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
                    >
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-agent-customer-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ronald Kato"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-agent-customer-phone"
                      className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
                    >
                      Your Mobile (WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-agent-customer-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-agent-message"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Your Message for TYGA ESTATES <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-agent-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your questions or notes..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {errorMessage}
                  </p>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-60 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send to TYGA ESTATES</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getTygaEstatesWhatsAppUrl(
                      currentContact.whatsappNumber,
                      buildPropertyInquiryWhatsAppMessage(property.title, property.location, formattedPrice)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Or WhatsApp Us Now</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default ContactAgentModal;
export const ContactRepresentativeModal = ContactAgentModal;

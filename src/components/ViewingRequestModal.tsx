import React, { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import { isValidIsoDateString, formatCurrency } from '../utils/formatters';
import {
  X,
  Calendar,
  Clock,
  Phone,
  User as UserIcon,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Images,
  Building2,
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';
import {
  TYGA_ESTATES_CONFIG,
  getTygaEstatesWhatsAppUrl,
  buildPropertyInquiryWhatsAppMessage
} from '../config/company';

interface ViewingRequestModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewingRequestModal: React.FC<ViewingRequestModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  const { currentUser, addViewingRequest, navigateTo } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+256 7');
  const [preferredNetwork, setPreferredNetwork] = useState<'Airtel' | 'MTN'>('Airtel');
  const [preferredDate, setPreferredDate] = useState(() => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 2);
    return nextDay.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('10:30 AM – 12:00 PM');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const { airtel, mtn } = TYGA_ESTATES_CONFIG.contacts;
  const currentContact = preferredNetwork === 'Airtel' ? airtel : mtn;

  const propertyPhotos = Array.isArray(property?.images)
    ? property.images.filter(Boolean).slice(0, 4)
    : [];

  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name || '');
      setPhone(currentUser?.phone || '+256 7');
      setValidationError(null);
      setIsSubmitting(false);
      setActivePhotoIndex(0);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const formattedPrice = formatCurrency(property.price, property.currency, true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 7) {
      setValidationError('Please enter a valid contact phone number.');
      return;
    }
    if (!isValidIsoDateString(preferredDate)) {
      setValidationError('Please select a valid preferred calendar date.');
      return;
    }
    if (!preferredTime.trim()) {
      setValidationError('Please select a preferred time window.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addViewingRequest({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: `${property.location}, ${property.district}`,
        propertyImage: propertyPhotos[0] || '',
        propertyPrice: property.price,
        propertyTransaction: property.transaction,
        propertyPricePeriod: property.pricePeriod,
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        customerEmail: currentUser?.email,
        preferredDate,
        preferredTime,
        message:
          message.trim() ||
          `Requesting on-site property inspection with TYGA ESTATES team (Preferred line: ${preferredNetwork} - ${currentContact.displayNumber}).`
      });
      setIsSubmitted(true);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'Unable to submit viewing request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setValidationError(null);
    onClose();
  };

  const viewingWhatsAppMsg = `Hello TYGA ESTATES, I have submitted a viewing request for "${property.title}" in ${property.location} on ${preferredDate} (${preferredTime}). My name is ${name || 'Buyer'} and my contact is ${phone}. Please confirm the inspection walkthrough.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 dark:border-stone-800 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
              Viewing Request Recorded
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
              Your walkthrough inspection request for{' '}
              <strong className="text-stone-800 dark:text-stone-100">
                {property.title}
              </strong>{' '}
              on{' '}
              <strong className="text-stone-800 dark:text-stone-100">
                {preferredDate}
              </strong>{' '}
              ({preferredTime}) has been recorded by{' '}
              <strong className="text-amber-500">
                TYGA ESTATES
              </strong>
              .
            </p>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-300 text-left space-y-2">
              <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>TYGA ESTATES Viewing Coordination</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Our verification officer will review property site access and contact you at <strong>{phone}</strong> to confirm the exact meeting point.
              </p>
            </div>

            {/* Instant WhatsApp Confirmation */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <a
                href={getTygaEstatesWhatsAppUrl(currentContact.whatsappNumber, viewingWhatsAppMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm on {preferredNetwork} WhatsApp</span>
              </a>

              <a
                href={`tel:${currentContact.rawNumber}`}
                className="py-2.5 px-4 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call {currentContact.displayNumber}</span>
              </a>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigateTo('/dashboard');
                }}
                className="py-2 px-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
              >
                Track in My Dashboard
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-2 px-4 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-left mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-1">
                <Building2 className="w-3 h-3" />
                TYGA ESTATES Walkthrough Inspection
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white tracking-tight mt-1">
                Schedule a Viewing
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-1">
                {property.title} · {property.location}, {property.district}
              </p>
            </div>

            {/* Photos Strip */}
            {propertyPhotos.length > 0 && (
              <div className="mb-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                  <span className="inline-flex items-center gap-1">
                    <Images className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Property Photos ({activePhotoIndex + 1} / {propertyPhotos.length})
                    </span>
                  </span>
                </div>
                <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800 relative">
                  <img
                    src={propertyPhotos[activePhotoIndex] || propertyPhotos[0]}
                    alt={`${property.title} — Photo ${activePhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {propertyPhotos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {propertyPhotos.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative aspect-[4/3] rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                          activePhotoIndex === idx
                            ? 'border-emerald-600 dark:border-emerald-400'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {validationError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ronald Kato"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Contact Phone Number (Calls & WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 700 000 000"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Preferred TYGA ESTATES Contact Network */}
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Preferred Network for Viewing Coordination:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredNetwork('Airtel')}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      preferredNetwork === 'Airtel'
                        ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 ring-1 ring-red-500'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Airtel: {airtel.displayNumber}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredNetwork('MTN')}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      preferredNetwork === 'MTN'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-500'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>MTN: {mtn.displayNumber}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Preferred Time Window
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 bg-white dark:bg-stone-800 dark:text-stone-100"
                    >
                      <option value="09:00 AM – 10:30 AM">Morning (09:00 – 10:30)</option>
                      <option value="10:30 AM – 12:00 PM">Late Morning (10:30 – 12:00)</option>
                      <option value="02:00 PM – 03:30 PM">Afternoon (02:00 – 03:30)</option>
                      <option value="04:00 PM – 05:30 PM">Late Afternoon (04:00 – 05:30)</option>
                      <option value="Weekend Flexible">Weekend Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Notes or Questions for TYGA ESTATES (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Any inquiries on title status, boundary markers, or road access..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200/60 dark:border-stone-700 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                Viewing requests are securely coordinated by TYGA ESTATES field inspectors. Zero booking fees apply.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirm Viewing Request with TYGA ESTATES</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
export default ViewingRequestModal;

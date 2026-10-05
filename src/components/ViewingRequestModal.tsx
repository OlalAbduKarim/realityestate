import React, { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import { isValidIsoDateString } from '../utils/formatters';
import {
  X,
  Calendar,
  Clock,
  Phone,
  User as UserIcon,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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

  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name || '');
      setPhone(currentUser?.phone || '+256 7');
      setValidationError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

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
        propertyImage: property.images?.[0] || '',
        propertyPrice: property.price,
        propertyTransaction: property.transaction,
        propertyPricePeriod: property.pricePeriod,
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        customerEmail: currentUser?.email,
        preferredDate,
        preferredTime,
        message: message.trim() || 'Requesting on-site property inspection with representative.'
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 dark:border-stone-800 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
              Viewing Request Submitted
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-sm mx-auto leading-relaxed">
              Your request for <strong className="text-stone-800 dark:text-stone-100">{property.title}</strong> on <strong className="text-stone-800 dark:text-stone-100">{preferredDate}</strong> ({preferredTime}) has been recorded.
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
              Representative <span className="font-semibold text-stone-700 dark:text-stone-200">{property.advertiser?.name || 'Listing Representative'}</span> has been alerted to confirm access details.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigateTo('/dashboard');
                }}
                className="py-2.5 px-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors"
              >
                Track in My Dashboard
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-left mb-6">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Schedule On-Site Inspection
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white tracking-tight mt-1">
                Request a Viewing
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-1">
                {property.title} · {property.location}, {property.district}
              </p>
            </div>

            {validationError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ronald Kato"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+256 772 000 000"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                  />
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
                      onChange={e => setPreferredDate(e.target.value)}
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
                      onChange={e => setPreferredTime(e.target.value)}
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
                  Notes or Questions for Representative (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3" />
                  <textarea
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="e.g. Any details on water tanks, access road conditions, or security arrangements."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200/60 dark:border-stone-700 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                Viewing requests are confirmed directly by the property owner or registered agent. There are zero upfront viewing request booking fees on Reality Estates.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{isSubmitting ? 'Submitting Request...' : 'Confirm Viewing Request'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

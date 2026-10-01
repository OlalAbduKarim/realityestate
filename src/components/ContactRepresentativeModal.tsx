import React, { useState } from 'react';
import { Property } from '../types/property';
import { useApp } from '../context/AppContext';
import { X, Phone, MessageSquare, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ContactRepresentativeModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactRepresentativeModal: React.FC<ContactRepresentativeModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  const { currentUser, openAuthModal, addEnquiry } = useApp();
  const [message, setMessage] = useState(
    `Hello ${property.advertiser.name}, I am interested in "${property.title}" advertised on Reality Estates at ${property.price.toLocaleString()} UGX. Please share further details regarding inspection availability.`
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-100 dark:border-stone-800 relative text-left transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-stone-800 dark:text-stone-200" />
          </div>

          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            Contact Listing Representative
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
            Direct phone numbers and WhatsApp links are protected to prevent spam. Create a free account or sign in to connect directly with <strong className="text-stone-800 dark:text-stone-100">{property.advertiser.name}</strong>.
          </p>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => {
                onClose();
                openAuthModal('Create a free account to access direct phone numbers and WhatsApp chats with property owners and agents.');
              }}
              className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              Create Free Account
            </button>
            <button
              onClick={() => {
                onClose();
                openAuthModal('Sign in to reveal verified property representative contact details.');
              }}
              className="w-full py-2.5 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Sign In with Existing Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSendEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    addEnquiry({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.images[0] || '',
      propertyPrice: property.price,
      propertyLocation: `${property.location}, ${property.district}`,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone,
      message: message.trim()
    });
    setSubmitted(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 dark:border-stone-800 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
              Enquiry Transmitted
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 max-w-sm mx-auto leading-relaxed">
              Your message was sent to <strong className="text-stone-800 dark:text-stone-100">{property.advertiser.name}</strong> ({property.advertiser.agencyName || 'Representative'}). You can track correspondence in your dashboard.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Representative profile summary */}
            <div className="flex items-start gap-3.5 pb-5 border-b border-stone-100 dark:border-stone-800">
              <div className="w-12 h-12 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center text-base font-bold shrink-0">
                {property.advertiser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-stone-900 dark:text-white truncate">
                    {property.advertiser.name}
                  </h4>
                  {property.advertiser.verified && (
                    <span title="Verified Advertiser">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {property.advertiser.agencyName || property.advertiser.type} · Response: {property.advertiser.responseRate}
                </p>
              </div>
            </div>

            {/* Direct Connect Buttons: Call & WhatsApp */}
            <div className="grid grid-cols-2 gap-3 my-5">
              <a
                href={`tel:${property.advertiser.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call ({property.advertiser.phone})</span>
              </a>

              <a
                href={`https://wa.me/${property.advertiser.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I saw your listing for ${property.title} on Reality Estates.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Direct In-App Enquiry Form */}
            <form onSubmit={handleSendEnquiry} className="space-y-3">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Or send a formal written enquiry:
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full p-3 text-xs border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-hidden focus:border-stone-900 dark:focus:border-stone-100 dark:bg-stone-800 leading-relaxed text-stone-800 dark:text-stone-100"
              />

              <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
                <span>Sending as {currentUser.name} ({currentUser.phone})</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send In-App Enquiry</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Send,
  Loader2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  TYGA_ESTATES_CONFIG,
  getTygaEstatesWhatsAppUrl,
  buildGeneralContactWhatsAppMessage
} from '../config/company';
import { useApp } from '../context/AppContext';
import { ServicesSection } from '../components/ServicesSection';

export const ContactUsView: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+256 7');
  const [subject, setSubject] = useState('Property Inquiry');
  const [message, setMessage] = useState('');
  const [preferredNetwork, setPreferredNetwork] = useState<'Airtel' | 'MTN'>('Airtel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const { airtel, mtn } = TYGA_ESTATES_CONFIG.contacts;

  const handleCopy = (num: string, label: string) => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(num.replace(/\s+/g, ''));
      setCopiedNumber(label);
      showToast(`${label} number copied to clipboard`, 'success');
      setTimeout(() => setCopiedNumber(null), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill in your name, phone number, and message.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate short processing before giving instant option to launch WhatsApp directly
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Thank you! Your message has been received by TYGA ESTATES.', 'success');
    }, 600);
  };

  const handleLaunchWhatsApp = (targetNetwork: 'Airtel' | 'MTN') => {
    const contact = targetNetwork === 'Airtel' ? airtel : mtn;
    const url = getTygaEstatesWhatsAppUrl(
      contact.whatsappNumber,
      buildGeneralContactWhatsAppMessage(subject, name || undefined) +
        (message ? `\n\nNote: ${message}` : '')
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
      {/* Header Banner */}
      <section className="bg-stone-900 text-white py-16 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Building2 className="w-3.5 h-3.5" />
            Head Offices: Rubaga Road, Kampala
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
            Contact TYGA ESTATES
          </h1>
          <p className="text-stone-300 text-sm sm:text-base mt-3 leading-relaxed">
            Our head offices are situated on <strong>Rubaga Road, Kampala</strong>. Connect directly with our concierge and professional services team via Airtel or MTN on WhatsApp or telephone for land surveying, property valuation, titling, construction, shifting logistics, and viewing schedules.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Direct Call & WhatsApp Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Airtel Line */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xl shadow-stone-200/40 dark:shadow-none transition-all">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Airtel Uganda Direct Line
                </span>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white font-mono">
                  {airtel.displayNumber}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Available for direct calls and instant WhatsApp messaging
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
              Fastest response for property viewing coordination, land title verification updates, and immediate client advisory across Uganda.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={`tel:${airtel.rawNumber}`}
                className="py-3 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Direct Call</span>
              </a>

              <a
                href={getTygaEstatesWhatsAppUrl(
                  airtel.whatsappNumber,
                  buildGeneralContactWhatsAppMessage('Property Inquiry via Airtel Line')
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(airtel.rawNumber, 'Airtel')}
                className="py-3 px-3 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedNumber === 'Airtel' ? (
                  <>
                    <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MTN Line */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xl shadow-stone-200/40 dark:shadow-none transition-all">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  MTN Uganda Direct Line
                </span>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white font-mono">
                  {mtn.displayNumber}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Available for direct calls and instant WhatsApp messaging
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
              Connect with our corporate listings team, commercial developments division, and property onboarding consultants.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={`tel:${mtn.rawNumber}`}
                className="py-3 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Direct Call</span>
              </a>

              <a
                href={getTygaEstatesWhatsAppUrl(
                  mtn.whatsappNumber,
                  buildGeneralContactWhatsAppMessage('Property Inquiry via MTN Line')
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(mtn.rawNumber, 'MTN')}
                className="py-3 px-3 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedNumber === 'MTN' ? (
                  <>
                    <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Inquiry Form + Corporate Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-white">
                Send a Message to TYGA ESTATES
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Fill out the form below and our team will get back to you promptly, or choose your preferred network to launch an instant WhatsApp session.
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-10 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                  Message Sent to TYGA ESTATES
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name}</strong>. Our dedicated property consultants have received your inquiry and will contact you via <strong>{phone}</strong>.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleLaunchWhatsApp(preferredNetwork)}
                    className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Continue on {preferredNetwork} WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage('');
                    }}
                    className="py-3 px-5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. David Kato"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number (Calls & WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Service / Inquiry Category
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                    >
                      <optgroup label="Specialized Estate Services (Rubaga Road Desk)">
                        <option value="Land & Property Valuation">1. Land & Property Valuation</option>
                        <option value="Professional Surveying of Land">2. Professional Surveying of Land</option>
                        <option value="Processing of Administrative Letters">3. Processing of Administrative Letters</option>
                        <option value="Making Wills & Estate Planning">4. Making Wills</option>
                        <option value="Processing Land Titles">5. Processing Land Titles</option>
                        <option value="Construction of Houses">6. Construction of Houses</option>
                        <option value="Transportation During Shifting">7. Transportation During Shifting</option>
                        <option value="Inventory & Storage Facilities">8. Inventory & Storage</option>
                        <option value="Renovations & Interior Designs">9. Renovations & Interior Designs</option>
                      </optgroup>
                      <optgroup label="Marketplace Listings & Viewings">
                        <option value="Property Viewing Walkthrough">Schedule On-Site Property Viewing</option>
                        <option value="Buy or Rent Property Inquiry">Looking to Buy or Rent Property</option>
                        <option value="List My Property Consultation">List My House / Land on TYGA ESTATES</option>
                        <option value="General Concierge">Other Inquiries / Rubaga Road Office Visit</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Preferred Line for Response
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreferredNetwork('Airtel')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        preferredNetwork === 'Airtel'
                          ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      <span>Airtel: {airtel.displayNumber}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredNetwork('MTN')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        preferredNetwork === 'MTN'
                          ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>MTN: {mtn.displayNumber}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Your Message / Requirements <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what type of property you are looking for, desired location, budget, or any viewing questions..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto py-3 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to TYGA ESTATES</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchWhatsApp(preferredNetwork)}
                    className="w-full sm:w-auto py-3 px-5 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    <span>Or Chat on {preferredNetwork} WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Corporate Details & Operational Information */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Head Office & Helpdesk</span>
              </h3>

              <div className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 dark:text-white block font-semibold">
                      Location
                    </strong>
                    <span>{TYGA_ESTATES_CONFIG.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 dark:text-white block font-semibold">
                      Office Hours
                    </strong>
                    <span>{TYGA_ESTATES_CONFIG.workingHours}</span>
                    <span className="block text-[11px] text-stone-400 mt-0.5">
                      {TYGA_ESTATES_CONFIG.sundayHours}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 dark:text-white block font-semibold">
                      Email Concierge
                    </strong>
                    <span className="block font-mono text-[11px]">
                      {TYGA_ESTATES_CONFIG.email}
                    </span>
                    <span className="block font-mono text-[11px] text-stone-400">
                      {TYGA_ESTATES_CONFIG.supportEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Safe Deal Guarantee Box */}
            <div className="bg-stone-100 dark:bg-stone-900/90 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span>Protected Contact Model</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                To protect buyers, tenants, and property owners from unregulated middlemen, fraud, and unverified markups, <strong>TYGA ESTATES</strong> acts as your authorized coordinator for all viewing schedules, inspection permits, and negotiations.
              </p>
              <div className="p-3 bg-white dark:bg-stone-800 rounded-xl text-[11px] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60">
                Lister details remain strictly confidential and are exclusively reviewed by our accredited legal & verification desk.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Services Showcase & Advertisement */}
      <div className="mt-16">
        <ServicesSection showTitleBanner={true} />
      </div>
    </div>
  );
};

export default ContactUsView;

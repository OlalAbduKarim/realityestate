import React, { useState } from 'react';
import {
  Scale,
  Compass,
  FileCheck,
  Scroll,
  ShieldCheck,
  HardHat,
  Truck,
  Warehouse,
  Paintbrush,
  Phone,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  TYGA_ESTATES_SERVICES,
  TYGA_ESTATES_CONFIG,
  EstateService,
  getTygaEstatesWhatsAppUrl,
  buildServiceInquiryWhatsAppMessage
} from '../config/company';
import { useApp } from '../context/AppContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Scale,
  Compass,
  FileCheck,
  Scroll,
  ShieldCheck,
  HardHat,
  Truck,
  Warehouse,
  Paintbrush
};

interface ServicesSectionProps {
  showTitleBanner?: boolean;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ showTitleBanner = true }) => {
  const { navigateTo, currentUser } = useApp();
  const [selectedService, setSelectedService] = useState<EstateService | null>(null);
  const [activeNetwork, setActiveNetwork] = useState<'Airtel' | 'MTN'>('Airtel');

  const { airtel, mtn } = TYGA_ESTATES_CONFIG.contacts;
  const currentContact = activeNetwork === 'Airtel' ? airtel : mtn;

  const handleOpenWhatsAppService = (service: EstateService) => {
    const url = getTygaEstatesWhatsAppUrl(
      currentContact.whatsappNumber,
      buildServiceInquiryWhatsAppMessage(service.title, currentUser?.name)
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-16 bg-gradient-to-b from-stone-50 via-white to-stone-50 dark:from-stone-950 dark:via-stone-900/60 dark:to-stone-950 border-y border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {showTitleBanner && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs font-semibold uppercase tracking-wider mb-3 border border-stone-200 dark:border-stone-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Full-Scope Real Estate & Professional Solutions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-950 dark:text-white tracking-tight">
              We Also Deal In Specialized Services
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base mt-3 leading-relaxed">
              Beyond verified property listings, <strong>TYGA ESTATES</strong> provides end-to-end estate solutions from our <strong>Rubaga Road offices</strong>. Led by licensed land surveyors, certified property valuers, legal estate consultants, civil builders, and seasoned relocation logisticians.
            </p>

            {/* Quick Network Selector for Inquiries */}
            <div className="mt-5 inline-flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-semibold">
              <span className="px-3 py-1 text-stone-500 dark:text-stone-400">Consult via:</span>
              <button
                type="button"
                onClick={() => setActiveNetwork('Airtel')}
                className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeNetwork === 'Airtel'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-950'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Airtel: {airtel.displayNumber}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveNetwork('MTN')}
                className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeNetwork === 'MTN'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-950'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-stone-900" />
                <span>MTN: {mtn.displayNumber}</span>
              </button>
            </div>
          </div>
        )}

        {/* Services Grid (Arranged in precise order of priority/importance) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TYGA_ESTATES_SERVICES.map((service) => {
            const IconComponent = ICON_MAP[service.iconName] || Scale;
            return (
              <div
                key={service.id}
                className="group bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 hover:border-amber-500/80 dark:hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Order badge & Tagline */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                      <span>{service.badge}</span>
                    </span>
                    <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 font-mono">
                      #{service.order}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-stone-900 group-hover:scale-105 transition-all shadow-inner">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                        {service.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-stone-800/80 mb-5">
                    {service.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-stone-700 dark:text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsAppService(service)}
                    className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
                    title={`Inquire via ${activeNetwork} WhatsApp`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Inquire on WhatsApp</span>
                  </button>

                  <a
                    href={`tel:${currentContact.rawNumber}`}
                    className="p-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl transition-colors cursor-pointer"
                    title={`Call Rubaga Road Desk on ${currentContact.label}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="p-2.5 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl transition-colors cursor-pointer"
                    title="View Detailed Service Specifications"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rubaga Road Office Visit & Consultation Banner (20% Charcoal structure) */}
        <div className="mt-12 bg-[#0f1115] rounded-2xl p-6 sm:p-8 text-white border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Visit TYGA ESTATES Rubaga Road Offices</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold">
              Need Land Title Processing, Boundary Surveys, or House Construction?
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Walk in to our head offices on <strong>Rubaga Road, Kampala</strong> for one-on-one consultations with certified surveyors, registered property valuers, and construction project managers.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Mon – Sat: 8:00 AM – 6:30 PM</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Rubaga Helpdesk: +256 759 705 328 / +256 764 384 080</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('/contact')}
              className="w-full sm:w-auto py-3 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-colors shadow-md cursor-pointer active:scale-98"
            >
              Book Office Appointment
            </button>
            <a
              href={getTygaEstatesWhatsAppUrl(
                airtel.whatsappNumber,
                'Hello TYGA ESTATES, I would like to visit your Rubaga Road office for a consultation regarding estate services.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3 px-5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors border border-stone-700 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>WhatsApp Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* Detailed Service Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 text-left relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {selectedService.badge}
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1">
                  {selectedService.title}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  {selectedService.tagline}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
              {selectedService.description}
            </p>

            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200/70 dark:border-stone-700/60 mb-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Key Deliverables & Scope:
              </h4>
              <div className="space-y-1.5">
                {selectedService.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-stone-800 dark:text-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 mb-6 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Conducted from our <strong>Rubaga Road, Kampala</strong> offices. We deploy teams throughout Kampala, Wakiso, Mukono, Mpigi, Entebbe, and regional Uganda.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={getTygaEstatesWhatsAppUrl(
                  airtel.whatsappNumber,
                  buildServiceInquiryWhatsAppMessage(selectedService.title, currentUser?.name)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-red-400" />
                <span>WhatsApp Airtel</span>
              </a>

              <a
                href={getTygaEstatesWhatsAppUrl(
                  mtn.whatsappNumber,
                  buildServiceInquiryWhatsAppMessage(selectedService.title, currentUser?.name)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-stone-950" />
                <span>WhatsApp MTN</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
export default ServicesSection;

/**
 * Official Company Configuration for TYGA ESTATES.
 * Offices located on Rubaga Road, Kampala, Uganda.
 * Comprehensive estate services, surveying, valuation, legal titling, construction & logistics.
 */

export interface CompanyContact {
  network: 'Airtel' | 'MTN';
  displayNumber: string;
  rawNumber: string; // E.164 formatted without spaces
  whatsappNumber: string; // Digits only for wa.me/
  label: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
}

export interface EstateService {
  id: string;
  order: number;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  highlights: string[];
  iconName: string;
}

export const TYGA_ESTATES_SERVICES: EstateService[] = [
  {
    id: 'valuation',
    order: 1,
    title: 'Land & Property Valuation',
    tagline: 'Certified Market & Bank Appraisal',
    description:
      'Accredited, scientific valuation of residential plots, commercial buildings, agricultural land, and industrial estates for sales, mortgages, estate planning, and taxation.',
    badge: 'Core Service #1',
    highlights: [
      'Certified asset & real estate valuations',
      'Mortgage & bank loan collateral appraisal',
      'Accurate Kampala & regional price-per-decimal index',
      'Stamp duty & URA tax dispute advisory'
    ],
    iconName: 'Scale'
  },
  {
    id: 'surveying',
    order: 2,
    title: 'Professional Surveying of Land',
    tagline: 'Cadastral & Boundary Opening',
    description:
      'Licensed professional surveyors using advanced RTK GPS and total station technology for boundary opening, deed plan generation, topographic mapping, and resolving encroaching neighbor disputes.',
    badge: 'Core Service #2',
    highlights: [
      'Boundary opening & beacon placement',
      'Cadastral deed plan mapping for Ministry of Lands',
      'Contour & topography mapping for engineering',
      'Resolution of land boundary overlaps & disputes'
    ],
    iconName: 'Compass'
  },
  {
    id: 'administrative-letters',
    order: 3,
    title: 'Processing of Administrative Letters',
    tagline: 'Letters of Administration & Succession',
    description:
      'Legal guidance and processing of Letters of Administration for deceased estates through courts of law, family succession meetings, Administrator General clearances, and probate certificates.',
    badge: 'Legal & Estates #3',
    highlights: [
      'Court petitions for Letters of Administration',
      'Administrator General verification & reports',
      'Family meeting documentation & legal gazetting',
      'Distribution of estate properties to rightful beneficiaries'
    ],
    iconName: 'FileCheck'
  },
  {
    id: 'wills',
    order: 4,
    title: 'Making Wills & Estate Planning',
    tagline: 'Legally Binding Testamentary Protection',
    description:
      'Confidential drafting, witnessing, safe custody, and registration of legally binding wills to protect your family, land, and hard-earned assets from future disputes.',
    badge: 'Legal & Estates #4',
    highlights: [
      'Confidential drafting by experienced estate attorneys',
      'Appointing executors, guardians & trustees',
      'Land tenure & property schedule documentation',
      'Secure document custody and probate readiness'
    ],
    iconName: 'Scroll'
  },
  {
    id: 'land-titles',
    order: 5,
    title: 'Processing Land Titles',
    tagline: 'Mailo, Freehold, Leasehold & Subdivisions',
    description:
      'End-to-end processing of certificates of title across Uganda: transfer of ownership, lease renewal, Mailo titling, mutation and subdivision, and searching records at Zonal Land Offices (MZOs).',
    badge: 'Land Registry #5',
    highlights: [
      'Title transfers, mutations & subdivision approvals',
      'Search certificates at Ministry Zonal Offices (MZOs)',
      'Processing Mailo, Freehold, & Leasehold titles',
      'Caveat lodging, title replacement & deed clearance'
    ],
    iconName: 'ShieldCheck'
  },
  {
    id: 'construction',
    order: 6,
    title: 'Construction of Houses',
    tagline: 'Architectural Design to Turnkey Finish',
    description:
      'Full architectural planning, engineering approvals, foundation work, structural building, and premium finishing for modern residential homes, commercial units, and perimeter security walls.',
    badge: 'Engineering #6',
    highlights: [
      'Architectural blueprints & city council approvals',
      'Civil engineering & quality building materials',
      'Turnkey residential bungalows & duplexes',
      'Perimeter wall fencing & compound drainage'
    ],
    iconName: 'HardHat'
  },
  {
    id: 'shifting-logistics',
    order: 7,
    title: 'Transportation During Shifting',
    tagline: 'Safe Relocation & Moving Logistics',
    description:
      'Hassle-free residential and corporate relocation services across Kampala, Wakiso, Entebbe, and regional Uganda with careful packing, covered moving trucks, and experienced handlers.',
    badge: 'Logistics #7',
    highlights: [
      'Enclosed trucks for safe weather-proof shifting',
      'Careful packing of delicate furniture & appliances',
      'Office, residential home & apartment moving',
      'Disassembly & reassembly support upon arrival'
    ],
    iconName: 'Truck'
  },
  {
    id: 'inventory-storage',
    order: 8,
    title: 'Inventory & Storage Facilities',
    tagline: 'Secure Warehousing & Item Cataloging',
    description:
      'Short-term and long-term secure warehousing for household furniture, commercial goods, and building materials, complete with itemized digital inventory tracking.',
    badge: 'Logistics #8',
    highlights: [
      'Secure, 24/7 guarded and CCTV-monitored storage',
      'Short-term transition & long-term storage units',
      'Itemized inventory cataloging & condition audits',
      'Pest-controlled, moisture-safe warehouse facilities'
    ],
    iconName: 'Warehouse'
  },
  {
    id: 'renovations-interiors',
    order: 9,
    title: 'Renovations & Interior Designs',
    tagline: 'Modern Makeovers & Elegant Living',
    description:
      'Complete home and office transformation: modern gypsum ceilings, ambient LED lighting, customized kitchen cabinetry, bathroom tiling, exterior repainting, and aesthetic space planning.',
    badge: 'Design & Finishes #9',
    highlights: [
      'Gypsum ceilings & ambient modern lighting',
      'Fitted kitchen cabinets & quartz/granite counters',
      'Bathroom remodeling & premium plumbing fixtures',
      'Exterior repainting, waterproofing & interior styling'
    ],
    iconName: 'Paintbrush'
  }
];

export const TYGA_ESTATES_CONFIG = {
  name: 'TYGA ESTATES',
  tagline: "Uganda's Premier Property Marketplace & Complete Estate Solutions",
  shortDesc:
    'Verified residential homes, titled land, professional surveying, valuation, title processing, construction, moving & interior design across Uganda.',
  address: 'Rubaga Road, Kampala, Uganda',
  detailedAddress: 'Rubaga Road (Near Mengo / Lubaga Cathedral Corridor), Kampala, Uganda',
  email: 'info@tygaestates.ug',
  supportEmail: 'concierge@tygaestates.ug',
  workingHours: 'Monday – Saturday: 8:00 AM – 6:30 PM EAT',
  sundayHours: 'Sunday: Scheduled Viewings, Urgent Surveys & WhatsApp Desk',

  // Official contact lines specified by client
  contacts: {
    airtel: {
      network: 'Airtel' as const,
      displayNumber: '+256 759 705 328',
      rawNumber: '+256759705328',
      whatsappNumber: '256759705328',
      label: 'Airtel Uganda (Call & WhatsApp)',
      colorClass: 'text-red-600 dark:text-red-400',
      badgeBg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800',
      badgeText: 'text-red-700 dark:text-red-300'
    },
    mtn: {
      network: 'MTN' as const,
      displayNumber: '+256 764 384 080',
      rawNumber: '+256764384080',
      whatsappNumber: '256764384080',
      label: 'MTN Uganda (Call & WhatsApp)',
      colorClass: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      badgeText: 'text-amber-800 dark:text-amber-300'
    }
  }
};

/**
 * Generates an encoded WhatsApp URL for TYGA ESTATES.
 */
export function getTygaEstatesWhatsAppUrl(
  phoneDigits: string,
  message: string
): string {
  const cleanDigits = phoneDigits.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
}

/**
 * Standard pre-filled WhatsApp message for property inquiries.
 */
export function buildPropertyInquiryWhatsAppMessage(
  propertyTitle: string,
  location: string,
  priceFormatted?: string
): string {
  const priceSnippet = priceFormatted ? ` (Price: ${priceFormatted})` : '';
  return `Hello TYGA ESTATES (Rubaga Road Office), I am interested in "${propertyTitle}" in ${location}${priceSnippet}. Please share more details and let me know when an inspection can be scheduled.`;
}

/**
 * Pre-filled WhatsApp message for specific company services.
 */
export function buildServiceInquiryWhatsAppMessage(
  serviceTitle: string,
  customerName?: string
): string {
  const nameSnippet = customerName ? ` My name is ${customerName}.` : '';
  return `Hello TYGA ESTATES (Rubaga Road Office)!${nameSnippet} I would like to inquire about your professional services in "${serviceTitle}". Please provide your consultation details and pricing guidance.`;
}

/**
 * Standard pre-filled WhatsApp message for general company contact.
 */
export function buildGeneralContactWhatsAppMessage(
  subject?: string,
  name?: string
): string {
  const nameSnippet = name ? ` My name is ${name}.` : '';
  const subjectSnippet = subject ? ` regarding "${subject}"` : '';
  return `Hello TYGA ESTATES (Rubaga Road Office)!${nameSnippet} I am contacting your team${subjectSnippet} for assistance with properties or specialized estate services.`;
}

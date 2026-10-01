import { Property, TransactionRecord, Enquiry, ViewingRequest, User } from '../types/property';

export const DEMO_USERS: User[] = [
  {
    id: 'user-buyer-1',
    name: 'Ronald Kato',
    email: 'ronald.kato@example.ug',
    phone: '+256 772 458 912',
    role: 'buyer',
    company: 'Nakasero Medical Center',
    verifiedIdentity: true
  },
  {
    id: 'user-agent-1',
    name: 'Grace Achieng',
    email: 'grace@pearlrealty.ug',
    phone: '+256 701 889 234',
    role: 'agent',
    company: 'Pearl Prime Properties Uganda',
    verifiedIdentity: true
  },
  {
    id: 'user-admin-1',
    name: 'Esther Nakayiza',
    email: 'admin@realityestates.ug',
    phone: '+256 782 110 554',
    role: 'admin',
    company: 'Reality Estates HQ (Kampala)',
    verifiedIdentity: true
  },
  {
    id: 'user-owner-1',
    name: 'David Mukasa',
    email: 'david.mukasa@gmail.com',
    phone: '+256 752 900 120',
    role: 'owner',
    verifiedIdentity: true
  }
];

export const INITIAL_VIEWING_REQUESTS: ViewingRequest[] = [
  {
    id: 'view-1',
    propertyId: 'prop-1',
    propertyTitle: 'Contemporary Hillside Villa in Kololo Terrace',
    propertyLocation: 'Kololo, Kampala',
    propertyImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    propertyPrice: 2850000000,
    propertyTransaction: 'buy',
    customerName: 'Ronald Kato',
    customerPhone: '+256 772 458 912',
    customerEmail: 'ronald.kato@example.ug',
    preferredDate: '2026-10-05',
    preferredTime: '10:30 AM – 12:00 PM',
    message: 'Interested in the solar system specification and borehole depth.',
    status: 'Confirmed',
    dateRequested: '2026-09-28',
    assignedAgentName: 'Grace Achieng'
  },
  {
    id: 'view-2',
    propertyId: 'prop-2',
    propertyTitle: 'Skyline Penthouse with Lake Victoria Panoramas',
    propertyLocation: 'Naguru Hill, Kampala',
    propertyImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    propertyPrice: 12500000,
    propertyTransaction: 'rent',
    propertyPricePeriod: 'month',
    customerName: 'Ronald Kato',
    customerPhone: '+256 772 458 912',
    customerEmail: 'ronald.kato@example.ug',
    preferredDate: '2026-10-08',
    preferredTime: '02:00 PM – 03:30 PM',
    message: 'Would like to inspect the building gym, backup generator and high-speed elevators.',
    status: 'Pending',
    dateRequested: '2026-09-29',
    assignedAgentName: 'Brenda Namutebi'
  }
];

export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-1',
    propertyId: 'prop-1',
    propertyTitle: 'Contemporary Hillside Villa in Kololo Terrace',
    propertyImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    propertyPrice: 2850000000,
    propertyLocation: 'Kololo, Kampala',
    customerName: 'Ronald Kato',
    customerEmail: 'ronald.kato@example.ug',
    customerPhone: '+256 772 458 912',
    message: 'Are the private mailo title deeds available for search at the KCCA Lands Zonal Office?',
    date: '2026-09-28',
    status: 'Contacted',
    notes: 'Title copy sent via email for independent search. Follow-up scheduled.',
    assignedRep: 'Grace Achieng'
  },
  {
    id: 'enq-2',
    propertyId: 'prop-3',
    propertyTitle: 'Prime Titled Lakeview Land Parcel on Entebbe Peninsula',
    propertyImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    propertyPrice: 650000000,
    propertyLocation: 'Entebbe Peninsula, Wakiso',
    customerName: 'Dr. Arthur Ssemwogerere',
    customerEmail: 'arthur.ssem@diaspora.org',
    customerPhone: '+44 7911 123456',
    message: 'Looking to purchase 50 decimals for residential development. Has boundary opening been done?',
    date: '2026-09-27',
    status: 'Viewing Scheduled',
    notes: 'Diaspora client represented locally by brother. Boundary stones confirmed.',
    assignedRep: 'Grace Achieng'
  }
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-101',
    propertyId: 'prop-1',
    propertyTitle: 'Contemporary Hillside Villa in Kololo Terrace',
    customerName: 'Ronald Kato',
    agentName: 'Grace Achieng',
    transactionType: 'buy',
    transactionValue: 2850000000,
    agreedCommissionPercent: 3.0,
    platformRevenue: 85500000,
    stage: 'Negotiation',
    paymentStatus: 'Pending',
    dateInitiated: '2026-09-20'
  },
  {
    id: 'tx-102',
    propertyId: 'prop-4',
    propertyTitle: 'Executive Suburban Residence in Kira Municipality',
    customerName: 'Eng. Patrick Ouma',
    agentName: 'Grace Achieng',
    transactionType: 'buy',
    transactionValue: 580000000,
    agreedCommissionPercent: 3.0,
    platformRevenue: 17400000,
    stage: 'Offer',
    paymentStatus: 'Pending',
    dateInitiated: '2026-09-15'
  },
  {
    id: 'tx-103',
    propertyId: 'prop-2',
    propertyTitle: 'Skyline Penthouse with Lake Victoria Panoramas',
    customerName: 'Clara Dubois (UN Diplomat)',
    agentName: 'Brenda Namutebi',
    transactionType: 'rent',
    transactionValue: 12500000 * 12,
    agreedCommissionPercent: 8.33,
    platformRevenue: 12500000,
    stage: 'Closed',
    paymentStatus: 'Received',
    dateInitiated: '2026-08-10',
    dateClosed: '2026-09-01'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    slug: 'contemporary-hillside-villa-kololo',
    title: 'Contemporary Hillside Villa in Kololo Terrace',
    transaction: 'buy',
    propertyType: 'House',
    price: 2850000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kololo',
    district: 'Kampala',
    address: 'Upper Kololo Terrace, Plot 14B',
    bedrooms: 5,
    bathrooms: 6,
    parking: 4,
    landSizeDecimals: 35,
    buildingSizeSqm: 520,
    tenure: 'Freehold',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'An architectural statement situated on the elevated slopes of Kololo. Features floor-to-ceiling double-glazed acoustic glass, infinity pool overlooking Kampala Central, integrated 15kVA solar inverter with Lithium backup, underground water reservoirs, automated perimeter electric security, and bespoke German-engineered kitchen appliances.',
    features: [
      'Swimming Pool',
      'Solar Backup',
      'Water Reservoir',
      'Perimeter Wall',
      'Security',
      'Furnished',
      'Air Conditioning',
      'Servants Quarters',
      'Balcony',
      'Garden'
    ],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
    ],
    floorPlanUrl: '/floorplans/kololo_villa.svg',
    videoUrl: 'https://realityestates.ug/tours/kololo-villa',
    advertiser: {
      id: 'adv-1',
      name: 'Grace Achieng',
      type: 'Agent',
      phone: '+256 701 889 234',
      whatsapp: '+256701889234',
      email: 'grace@pearlrealty.ug',
      agencyName: 'Pearl Prime Properties Uganda',
      verified: true,
      responseRate: 'Under 1 hour'
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-12',
      notes: 'On-site physical inspection performed. GPS beacons verified against Ministry of Lands cadastral survey deed.'
    },
    insights: {
      estimatedMonthlyRent: 18000000,
      grossRentalYield: 7.6,
      pricePerSqm: 5480769,
      pricePerDecimal: 81428571,
      capitalGrowthForecast: '+9.2% expected YoY'
    },
    coordinates: {
      lat: 0.3345,
      lng: 32.5938
    },
    featured: true,
    dateAdded: '2026-09-15',
    neighborhoodHighlights: [
      '5 minutes to Acacia Mall and Lugogo Bypass',
      'Adjacent to diplomatic missions and foreign embassies',
      'Uninterrupted 24/7 security patrol zone'
    ]
  },
  {
    id: 'prop-2',
    slug: 'skyline-penthouse-naguru-panoramas',
    title: 'Skyline Penthouse with Lake Victoria Panoramas',
    transaction: 'rent',
    propertyType: 'Apartment',
    price: 12500000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Naguru',
    district: 'Kampala',
    address: 'Naguru Hill Road, Tower 2, Penthouse A',
    bedrooms: 3,
    bathrooms: 4,
    parking: 2,
    buildingSizeSqm: 285,
    tenure: 'Leasehold',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Ultra-luxury high-floor corner residence commanding sweeping southern vistas toward Lake Victoria and central Kampala skyline. Features wraparound terrace, central climate control, high-speed fiber internet, rooftop heated lap pool, concierge reception, and dual redundant diesel generators.',
    features: [
      'Swimming Pool',
      'Generator',
      'Security',
      'Air Conditioning',
      'Balcony',
      'Water Reservoir',
      'Furnished'
    ],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Brenda Namutebi',
      type: 'Developer',
      phone: '+256 782 554 990',
      whatsapp: '+256782554990',
      email: 'sales@nagurutowers.ug',
      agencyName: 'Naguru Heights Development Corp',
      verified: true,
      responseRate: 'Under 30 mins'
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-18',
      notes: 'Management authority verified; unit keys inspected on site.'
    },
    insights: {
      estimatedMonthlyRent: 12500000,
      grossRentalYield: 8.8,
      pricePerSqm: 43859,
      capitalGrowthForecast: '+10.4% YoY rental inflation in Naguru'
    },
    coordinates: {
      lat: 0.3421,
      lng: 32.6078
    },
    featured: true,
    dateAdded: '2026-09-18',
    neighborhoodHighlights: [
      'Walking distance to Naguru General Hospital & Kampala Parents School',
      'Quick transit down to Lugogo Sports Club',
      'High diplomatic and international expat occupancy'
    ]
  },
  {
    id: 'prop-3',
    slug: 'prime-lakeview-land-entebbe-peninsula',
    title: 'Prime Titled Lakeview Land Parcel on Entebbe Peninsula',
    transaction: 'buy',
    propertyType: 'Land',
    price: 650000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Entebbe',
    district: 'Wakiso',
    address: 'Kigungu Ridge Road, Lakefront Sector',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    landSizeDecimals: 50,
    tenure: 'Mailo',
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Rare half-acre (50 decimals) elevated titled land parcel overlooking the shimmering waters of Lake Victoria. Gently sloping terrain with mature indigenous mahogany trees and direct murram road link only 6 minutes from the Entebbe-Kampala Expressway interchange.',
    features: [
      'Perimeter Wall',
      'Water Reservoir',
      'Security'
    ],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-3',
      name: 'Capt. Rogers Kisekka',
      type: 'Owner',
      phone: '+256 772 331 445',
      whatsapp: '+256772331445',
      email: 'rogers.kisekka@gmail.com',
      verified: true,
      responseRate: 'Within 2 hours'
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-10',
      notes: 'Cadastral search confirmed free of encumbrance, disputes, or overlapping titles.'
    },
    insights: {
      pricePerDecimal: 13000000,
      capitalGrowthForecast: '+14.5% 3-year historical appreciation rate'
    },
    coordinates: {
      lat: 0.0512,
      lng: 32.4637
    },
    featured: true,
    dateAdded: '2026-09-14',
    neighborhoodHighlights: [
      '7 minutes to Entebbe International Airport',
      'Adjacent to Victoria Mall, golf club and international beachfront resorts',
      'Serene lake breeze and clean equatorial air quality'
    ]
  },
  {
    id: 'prop-4',
    slug: 'executive-family-residence-kira-wakiso',
    title: 'Executive Suburban Residence in Kira Municipality',
    transaction: 'buy',
    propertyType: 'House',
    price: 580000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kira',
    district: 'Wakiso',
    address: 'Kitukutwe Close, Plot 8',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    landSizeDecimals: 20,
    buildingSizeSqm: 260,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Immaculately crafted contemporary 4-bedroom bungalow tailored for growing families in fast-appreciating Kira. Gated perimeter wall with electric fence, paved driveway, manicured tropical lawn, detached staff quarters, domestic solar backup inverter, and 10,000L rain harvesting tank.',
    features: [
      'Solar Backup',
      'Water Reservoir',
      'Perimeter Wall',
      'Security',
      'Servants Quarters',
      'Garden',
      'Balcony'
    ],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Achieng',
      type: 'Agent',
      phone: '+256 701 889 234',
      whatsapp: '+256701889234',
      email: 'grace@pearlrealty.ug',
      agencyName: 'Pearl Prime Properties Uganda',
      verified: true,
      responseRate: 'Under 1 hour'
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-08',
      notes: 'Physical on-site boundary opening verified; municipal occupation permit confirmed.'
    },
    insights: {
      estimatedMonthlyRent: 2800000,
      grossRentalYield: 5.8,
      pricePerSqm: 2230769,
      pricePerDecimal: 29000000,
      capitalGrowthForecast: '+11.0% YoY in Kira corridor'
    },
    coordinates: {
      lat: 0.3984,
      lng: 32.6391
    },
    featured: true,
    dateAdded: '2026-09-19',
    neighborhoodHighlights: [
      '10 minutes to Kira Town Council and Najjera Hub',
      'Close to Vienna College & Greenhill Academy Primary',
      'Tarmac road under 150m from gate'
    ]
  },
  {
    id: 'prop-5',
    slug: 'grade-a-corporate-office-tower-naguru',
    title: 'Grade-A Commercial Corporate Office Floor in Naguru',
    transaction: 'rent',
    propertyType: 'Commercial',
    price: 38000000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Naguru',
    district: 'Kampala',
    address: 'Lugogo Bypass link, Naguru Business Quarter',
    bedrooms: 0,
    bathrooms: 4,
    parking: 12,
    buildingSizeSqm: 650,
    tenure: 'Leasehold',
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Premier column-free open plan corporate commercial floor plate in a high-profile corporate tower. Features curtain glass facade, central HVAC, 100% generator backup, access-controlled security turnstiles, disabled accessibility, and 12 designated basement parking bays.',
    features: [
      'Generator',
      'Air Conditioning',
      'Security',
      'Water Reservoir',
      'Parking'
    ],
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Brenda Namutebi',
      type: 'Developer',
      phone: '+256 782 554 990',
      whatsapp: '+256782554990',
      email: 'sales@nagurutowers.ug',
      agencyName: 'Naguru Heights Development Corp',
      verified: true,
      responseRate: 'Under 30 mins'
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-15',
      notes: 'Direct developer mandate on file. Building occupancy certificate valid.'
    },
    insights: {
      pricePerSqm: 58461,
      grossRentalYield: 9.4
    },
    coordinates: {
      lat: 0.3392,
      lng: 32.6045
    },
    featured: true,
    dateAdded: '2026-09-20',
    neighborhoodHighlights: [
      'Direct link to Northern Bypass & Jinja Road',
      'Host to multinational tech, NGO, and financial headquarters',
      'Fiber optic rings from liquid and Airtel telecom'
    ]
  },
  {
    id: 'prop-6',
    slug: 'serviced-diplomatic-apartment-kololo',
    title: 'Serviced 2-Bedroom Diplomatic Suite in Kololo',
    transaction: 'rent',
    propertyType: 'Apartment',
    price: 6500000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Kololo',
    district: 'Kampala',
    address: 'Prince Charles Drive, Residence 4',
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    buildingSizeSqm: 140,
    tenure: 'Freehold',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Fully furnished and serviced apartment designed specifically for international consultants and diplomatic personnel. Includes weekly housekeeping, high-speed WiFi, 24/7 security guard post, gym access, backup solar & generator, and a private balcony overlooking quiet green gardens.',
    features: [
      'Furnished',
      'Security',
      'Solar Backup',
      'Generator',
      'Air Conditioning',
      'Balcony',
      'Water Reservoir'
    ],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Achieng',
      type: 'Agent',
      phone: '+256 701 889 234',
      whatsapp: '+256701889234',
      email: 'grace@pearlrealty.ug',
      agencyName: 'Pearl Prime Properties Uganda',
      verified: true
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-17',
      notes: 'Inspected with landlord representative. Ready for immediate move-in.'
    },
    coordinates: {
      lat: 0.3298,
      lng: 32.5891
    },
    featured: false,
    dateAdded: '2026-09-21'
  },
  {
    id: 'prop-7',
    slug: 'lake-view-mansion-munyonyo-kampala',
    title: 'Palatial 6-Bedroom Lake View Mansion in Munyonyo',
    transaction: 'buy',
    propertyType: 'House',
    price: 3500000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Munyonyo',
    district: 'Kampala',
    address: 'Speke Resort Way, Plot 18',
    bedrooms: 6,
    bathrooms: 7,
    parking: 6,
    landSizeDecimals: 50,
    buildingSizeSqm: 680,
    tenure: 'Freehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'A stately private estate set on half an acre within walking distance of the Commonwealth Resort Munyonyo. Offers expansive entertaining salons, double-height foyer with marble staircase, cinema room, private sauna, manicured palms, and panoramic views of Lake Victoria from the upper master terrace.',
    features: [
      'Swimming Pool',
      'Solar Backup',
      'Generator',
      'Water Reservoir',
      'Perimeter Wall',
      'Security',
      'Garden',
      'Balcony',
      'Servants Quarters'
    ],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-4',
      name: 'David Mukasa',
      type: 'Owner',
      phone: '+256 752 900 120',
      whatsapp: '+256752900120',
      email: 'david.mukasa@gmail.com',
      verified: true
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-05',
      notes: 'Title deed confirmed under family trust; all property taxes up to date.'
    },
    coordinates: {
      lat: 0.2521,
      lng: 32.6178
    },
    featured: true,
    dateAdded: '2026-09-12'
  },
  {
    id: 'prop-8',
    slug: 'commercial-logistics-warehouse-bweyogerere',
    title: 'Modern High-Clearance Warehouse & Logistics Yard',
    transaction: 'rent',
    propertyType: 'Warehouse',
    price: 24000000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Wakiso',
    district: 'Wakiso',
    address: 'Kampala Industrial Business Park, Namanve / Bweyogerere',
    bedrooms: 0,
    bathrooms: 3,
    parking: 10,
    buildingSizeSqm: 1200,
    tenure: 'Leasehold',
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: '1,200 m² heavy-duty distribution warehouse with 9-meter apex clearance, three loading docks for container articulated lorries, heavy industrial three-phase 100kVA transformer, and attached administrative office suite.',
    features: [
      'Generator',
      'Security',
      'Water Reservoir',
      'Parking'
    ],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Brenda Namutebi',
      type: 'Developer',
      phone: '+256 782 554 990',
      whatsapp: '+256782554990',
      email: 'sales@nagurutowers.ug',
      agencyName: 'Naguru Heights Development Corp',
      verified: true
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-14',
      notes: 'Inspected with UIA Namanve compliance unit.'
    },
    coordinates: {
      lat: 0.3541,
      lng: 32.6845
    },
    featured: false,
    dateAdded: '2026-09-17'
  },
  {
    id: 'prop-9',
    slug: 'affordable-family-cottage-mukono',
    title: '4-Bedroom Family Home with Fruit Garden in Mukono',
    transaction: 'buy',
    propertyType: 'House',
    price: 320000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Mukono',
    district: 'Mukono',
    address: 'Ntaawo Estate Road, Plot 52',
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    landSizeDecimals: 25,
    buildingSizeSqm: 210,
    tenure: 'Mailo',
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Exceptional value in the quiet university district of Mukono. Solid red-brick masonry, spacious master suite with walk-in wardrobe, mature avocado and mango trees, and municipal piped water connection with auxiliary tank.',
    features: [
      'Garden',
      'Water Reservoir',
      'Perimeter Wall',
      'Security'
    ],
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Achieng',
      type: 'Agent',
      phone: '+256 701 889 234',
      whatsapp: '+256701889234',
      email: 'grace@pearlrealty.ug',
      agencyName: 'Pearl Prime Properties Uganda',
      verified: true
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-11'
    },
    coordinates: {
      lat: 0.3534,
      lng: 32.7489
    },
    featured: false,
    dateAdded: '2026-09-13'
  },
  {
    id: 'prop-10',
    slug: 'boutique-retail-shop-ntinda-shopping-centre',
    title: 'Prime Street-Level Commercial Shop in Ntinda Centre',
    transaction: 'rent',
    propertyType: 'Shop',
    price: 4500000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Ntinda',
    district: 'Kampala',
    address: 'Ntinda-Kisaasi Road Junction, Plaza Level 1',
    bedrooms: 0,
    bathrooms: 1,
    parking: 1,
    buildingSizeSqm: 65,
    tenure: 'Leasehold',
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'High-footfall commercial shop space suited for a pharmacy, boutique cafe, salon, or telecommunications outlet. Positioned at the primary junction with massive pedestrian and vehicular exposure.',
    features: [
      'Security',
      'Generator',
      'Parking'
    ],
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Achieng',
      type: 'Agent',
      phone: '+256 701 889 234',
      whatsapp: '+256701889234',
      email: 'grace@pearlrealty.ug',
      agencyName: 'Pearl Prime Properties Uganda',
      verified: true
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-19'
    },
    coordinates: {
      lat: 0.3548,
      lng: 32.6142
    },
    featured: false,
    dateAdded: '2026-09-22'
  },
  {
    id: 'prop-11',
    slug: 'scenic-lakefront-villa-jinja-nile',
    title: 'Riverfront Vacation Retreat overlooking River Nile in Jinja',
    transaction: 'buy',
    propertyType: 'House',
    price: 1100000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Jinja',
    district: 'Jinja',
    address: 'Source of the Nile Drive, Plot 7',
    bedrooms: 4,
    bathrooms: 4,
    parking: 4,
    landSizeDecimals: 40,
    buildingSizeSqm: 380,
    tenure: 'Freehold',
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Breathtaking leisure home perched on the cliffs overlooking the historic River Nile. Rustic hardwood timber styling, solar power, wrap-around verandas, and direct boat jetty access.',
    features: [
      'Solar Backup',
      'Garden',
      'Water Reservoir',
      'Balcony',
      'Security'
    ],
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-4',
      name: 'David Mukasa',
      type: 'Owner',
      phone: '+256 752 900 120',
      whatsapp: '+256752900120',
      email: 'david.mukasa@gmail.com',
      verified: true
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-02'
    },
    coordinates: {
      lat: 0.4244,
      lng: 33.2041
    },
    featured: false,
    dateAdded: '2026-09-05'
  },
  {
    id: 'prop-12',
    slug: 'residential-plot-najjera-corridor',
    title: 'Ready-to-Build 15 Decimals Residential Plot in Najjera',
    transaction: 'buy',
    propertyType: 'Land',
    price: 185000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Najjera',
    district: 'Wakiso',
    address: 'Najjera 2, Kigoogwa Zone',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    landSizeDecimals: 15,
    tenure: 'Mailo',
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Prime dry land with clear rectangular dimensions in an established, quiet residential enclave in Najjera 2. Ready for immediate construction of a modern townhouse or family home.',
    features: [
      'Perimeter Wall'
    ],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Achieng',
      type: 'Agent',
      phone: '+256 701 889 234',
      whatsapp: '+256701889234',
      email: 'grace@pearlrealty.ug',
      agencyName: 'Pearl Prime Properties Uganda',
      verified: true
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedAt: '2026-09-16'
    },
    coordinates: {
      lat: 0.3812,
      lng: 32.6189
    },
    featured: false,
    dateAdded: '2026-09-17'
  }
];

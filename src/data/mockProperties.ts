import { Property, TransactionRecord, Enquiry, ViewingRequest, User } from '../types/property';
import heroVillaImg from '../assets/images/hero_kampala_villa_1790704142442.jpg';
import kololoAptImg from '../assets/images/kololo_modern_apartment_1790704155678.jpg';
import kiraHomeImg from '../assets/images/kira_family_residence_1790704168602.jpg';
import naguruTowerImg from '../assets/images/naguru_commercial_tower_1790704181131.jpg';
import entebbeLandImg from '../assets/images/entebbe_lakeview_land_1790704191262.jpg';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    slug: '4-bedroom-family-home-kira',
    title: '4 Bedroom Contemporary Family Home',
    transaction: 'buy',
    propertyType: 'House',
    price: 650000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kira',
    district: 'Wakiso',
    address: 'Plot 28, Kitukutwe Road, Kira Municipality',
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    landSizeDecimals: 25,
    buildingSizeSqm: 280,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Exceptionally built four-bedroom family residence situated in a quiet, well-planned residential pocket of Kira. Features expansive open-concept living and dining areas opening to a manicured garden. Master bedroom suite with walk-in wardrobe, ensuite bathroom with soaking tub, and a private balcony. Includes self-contained staff quarters, modern fitted kitchen with granite countertops, 5000L rooftop reserve water tank, and a secure boundary wall with razor wire and automated gate.',
    features: [
      'Parking',
      'Garden',
      'Security',
      'Water Reservoir',
      'Servants Quarters',
      'Balcony',
      'Perimeter Wall',
      'Solar Backup'
    ],
    images: [
      kiraHomeImg,
      kololoAptImg,
      heroVillaImg
    ],
    floorPlanUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    advertiser: {
      id: 'adv-1',
      name: 'Grace Namutebi',
      type: 'Agent',
      phone: '+256 772 458 912',
      whatsapp: '+256772458912',
      email: 'grace.namutebi@victoriarealty.ug',
      verified: true,
      agencyName: 'Victoria Prime Properties',
      responseRate: '98% within 1 hour',
      experienceYears: 8
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-08-14',
      verifiedBy: 'Reality Estates Inspections Desk',
      notes: 'Physical on-site inspection conducted; physical boundary stones and owner identity documentation verified.'
    },
    insights: {
      estimatedMonthlyRent: 3500000,
      grossRentalYield: 6.46,
      pricePerDecimal: 26000000,
      pricePerSqm: 2321428,
      capitalGrowthForecast: '+8.2% annual historic area growth'
    },
    coordinates: { lat: 0.3984, lng: 32.6391 },
    featured: true,
    dateAdded: '2026-09-12',
    neighborhoodHighlights: [
      '8 mins to Kira Health Centre IV',
      '5 mins to Greenhill Academy Kibuli branch campus',
      'Easy access to Northern Bypass via Kyaliwajjala',
      '24/7 neighborhood mobile security patrols'
    ]
  },
  {
    id: 'prop-2',
    slug: 'luxury-panoramic-penthouse-kololo',
    title: 'Luxury 3-Bedroom Penthouse with Panoramic Views',
    transaction: 'buy',
    propertyType: 'Apartment',
    price: 1850000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kololo',
    district: 'Kampala',
    address: 'Summit Ridge Heights, Upper Kololo Terrace',
    bedrooms: 3,
    bathrooms: 4,
    parking: 3,
    buildingSizeSqm: 340,
    tenure: 'Leasehold',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'An architectural statement set atop prestigious Upper Kololo Terrace. This penthouse offers uninterrupted panoramic views across the Kampala skyline and the lush Kololo diplomatic zone. Features double-height ceilings, bespoke Italian kitchen with integrated Bosch appliances, smart home automation, full air conditioning, private wrap-around terrace with entertaining deck, biometric elevator access, swimming pool, fully equipped residents gymnasium, and 100% generator redundancy.',
    features: [
      'Swimming Pool',
      'Air Conditioning',
      'Furnished',
      'Generator',
      'Security',
      'Balcony',
      'Gymnasium',
      'Elevator Access'
    ],
    images: [
      kololoAptImg,
      heroVillaImg,
      naguruTowerImg
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Arthur Mukasa',
      type: 'Developer',
      phone: '+256 701 883 204',
      whatsapp: '+256701883204',
      email: 'arthur.m@summitridge.ug',
      verified: true,
      agencyName: 'Summit Ridge Developments Ltd',
      responseRate: '100% within 30 mins',
      experienceYears: 14
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-02',
      verifiedBy: 'Reality Estates Verification Team',
      notes: 'Developer documentation, condominium declaration, and unit keys checked by platform rep.'
    },
    insights: {
      estimatedMonthlyRent: 11500000,
      grossRentalYield: 7.45,
      pricePerSqm: 5441176,
      capitalGrowthForecast: '+9.5% anticipated high-yield diplomatic zone'
    },
    coordinates: { lat: 0.3289, lng: 32.5932 },
    featured: true,
    dateAdded: '2026-09-20',
    neighborhoodHighlights: [
      'Walking distance to upscale Kololo restaurants and embassies',
      '4 mins to Acacia Mall & Golf Course',
      'Guaranteed stable electricity grid with redundant substation'
    ]
  },
  {
    id: 'prop-3',
    slug: 'hilltop-luxury-villa-naguru',
    title: '5-Bedroom Executive Hilltop Villa',
    transaction: 'buy',
    propertyType: 'House',
    price: 2400000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Naguru',
    district: 'Kampala',
    address: 'Plot 17, Katalima Road, Naguru Hill',
    bedrooms: 5,
    bathrooms: 6,
    parking: 4,
    landSizeDecimals: 35,
    buildingSizeSqm: 520,
    tenure: 'Freehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Commanding hillside sanctuary in prestigious Naguru with breathtaking sunset vistas. Designed for elevated diplomatic or executive living, showcasing contemporary lines, imported porcelain tiles, double volume lounge, separate wet & dry kitchens, dedicated private cinema room, home office suite, and a swimming pool flanked by an entertaining pavilion with barbecue station. Includes 2-bedroom staff quarters and solar-hybrid power system.',
    features: [
      'Swimming Pool',
      'Garden',
      'Parking',
      'Security',
      'Generator',
      'Servants Quarters',
      'Air Conditioning',
      'Water Reservoir'
    ],
    images: [
      heroVillaImg,
      kololoAptImg,
      kiraHomeImg
    ],
    advertiser: {
      id: 'adv-3',
      name: 'David Ssenyonga',
      type: 'Agent',
      phone: '+256 782 911 340',
      whatsapp: '+256782911340',
      email: 'david@ugandarealtors.co.ug',
      verified: true,
      agencyName: 'Pearl Haven Realty',
      responseRate: '95% within 2 hours',
      experienceYears: 11
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-08-28',
      verifiedBy: 'Reality Estates Compliance Officer',
      notes: 'Title deed copy verified against registry cadastral sheet. Owner mandate confirmed.'
    },
    insights: {
      estimatedMonthlyRent: 15000000,
      grossRentalYield: 7.5,
      pricePerDecimal: 68571428,
      pricePerSqm: 4615384,
      capitalGrowthForecast: '+10.1% year-on-year'
    },
    coordinates: { lat: 0.3448, lng: 32.6041 },
    featured: true,
    dateAdded: '2026-09-18',
    neighborhoodHighlights: [
      'Close proximity to Naguru Skyz and premier international clinics',
      'Diplomatic security cluster with monitored perimeter patrols',
      '10 mins to Lugogo bypass and Central Business District'
    ]
  },
  {
    id: 'prop-4',
    slug: 'grade-a-commercial-tower-floor-naguru',
    title: 'Grade A Commercial Office Floor (480 sqm)',
    transaction: 'rent',
    propertyType: 'Office',
    price: 18500000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Naguru',
    district: 'Kampala',
    address: 'EastGate Commercial Tower, Naguru Bypass',
    bedrooms: 0,
    bathrooms: 4,
    parking: 10,
    buildingSizeSqm: 480,
    tenure: 'Leasehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Premier column-free Grade A commercial office floor ready for corporate tenant fit-out. Features high-speed fiber backbone, energy-efficient double glazed solar facade, central VRV air conditioning, 3 high-speed passenger elevators, dedicated freight lift, 100% standby generator with automatic synchronizer, 24-hour manned CCTV security, and generous allocated basement parking ratio.',
    features: [
      'Air Conditioning',
      'Generator',
      'Security',
      'Elevator Access',
      'Parking',
      'Water Reservoir',
      'Commercial Grade'
    ],
    images: [
      naguruTowerImg,
      kololoAptImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-4',
      name: 'Brenda Atuhaire',
      type: 'Agent',
      phone: '+256 752 309 881',
      whatsapp: '+256752309881',
      email: 'brenda@commercialproperty.ug',
      verified: true,
      agencyName: 'Corporate Spaces Uganda',
      responseRate: '99% within 45 mins',
      experienceYears: 12
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-01',
      verifiedBy: 'Commercial Desk',
      notes: 'Occupancy permit and corporate landlord authorization on file.'
    },
    insights: {
      pricePerSqm: 38541,
      estimatedMonthlyRent: 18500000,
      capitalGrowthForecast: 'Corporate hub appreciation'
    },
    coordinates: { lat: 0.3392, lng: 32.6105 },
    featured: true,
    dateAdded: '2026-09-05',
    neighborhoodHighlights: [
      'Direct arterial link to Northern Bypass and Jinja Road',
      'Walking distance to prominent corporate banks & business dining'
    ]
  },
  {
    id: 'prop-5',
    slug: 'scenic-lakeview-prime-land-entebbe',
    title: '50 Decimals Prime Lake-View Residential Land',
    transaction: 'buy',
    propertyType: 'Land',
    price: 480000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Entebbe',
    district: 'Wakiso',
    address: 'Manyago Hill, overlooking Lake Victoria, Entebbe',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    landSizeDecimals: 50,
    tenure: 'Freehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Rare titled residential parcel measuring 50 decimals (half acre) perched on a gentle breeze-cooled ridge with direct unobstructed views of Lake Victoria. Gently sloping terrain with mature indigenous trees, direct tarmac road frontage, piped national water (NWSC) and electricity mains adjacent to the boundary. Ideal for a luxury private holiday villa, boutique hospitality lodge, or low-density executive residential compound.',
    features: [
      'Water Reservoir',
      'Perimeter Wall',
      'Electricity',
      'Tarmac Access',
      'Scenic View'
    ],
    images: [
      entebbeLandImg,
      heroVillaImg,
      kiraHomeImg
    ],
    advertiser: {
      id: 'adv-5',
      name: 'Patrick Bwambale',
      type: 'Owner',
      phone: '+256 776 102 443',
      whatsapp: '+256776102443',
      email: 'pbwambale@entebbelands.com',
      verified: true,
      agencyName: 'Direct Landowner',
      responseRate: '92% within 3 hours',
      experienceYears: 6
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-08-19',
      verifiedBy: 'Reality Estates Cadastral Unit',
      notes: 'GPS deed boundary beacons inspected and confirmed with Ministry of Lands zonal office records.'
    },
    insights: {
      pricePerDecimal: 9600000,
      capitalGrowthForecast: '+14% Entebbe corridor infrastructure appreciation'
    },
    coordinates: { lat: 0.0512, lng: 32.4637 },
    featured: true,
    dateAdded: '2026-09-10',
    neighborhoodHighlights: [
      '12 mins to Entebbe International Airport',
      '5 mins to Entebbe Expressway interchange',
      'Serene waterfront micro-climate'
    ]
  },
  {
    id: 'prop-6',
    slug: 'modern-3-bedroom-apartment-ntinda',
    title: 'Furnished 3-Bedroom Apartment in Central Ntinda',
    transaction: 'rent',
    propertyType: 'Apartment',
    price: 3800000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Ntinda',
    district: 'Kampala',
    address: 'Orchid Court, Ministers Village, Ntinda',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    buildingSizeSqm: 165,
    tenure: 'Mailo',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Chic, tastefully furnished three-bedroom apartment in highly sought-after Ministers Village, Ntinda. Features a contemporary open-plan lounge with plush sofa suite, 65-inch Smart TV, high-speed fiber internet connection, modern dining area, and a fully equipped kitchen with microwave, refrigerator, and oven. Master bedroom with ensuite bathroom. Gated compound with 24-hour guard, standby generator, and secure dedicated tenant parking.',
    features: [
      'Furnished',
      'Parking',
      'Security',
      'Water Reservoir',
      'Generator',
      'Balcony',
      'Air Conditioning'
    ],
    images: [
      kololoAptImg,
      kiraHomeImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Namutebi',
      type: 'Agent',
      phone: '+256 772 458 912',
      whatsapp: '+256772458912',
      email: 'grace.namutebi@victoriarealty.ug',
      verified: true,
      agencyName: 'Victoria Prime Properties',
      responseRate: '98% within 1 hour',
      experienceYears: 8
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-15',
      verifiedBy: 'Reality Estates Verification Team',
      notes: 'Apartment walkthrough and inventory verified.'
    },
    insights: {
      estimatedMonthlyRent: 3800000,
      grossRentalYield: 8.1,
      pricePerSqm: 23030
    },
    coordinates: { lat: 0.3541, lng: 32.6174 },
    featured: true,
    dateAdded: '2026-09-22',
    neighborhoodHighlights: [
      '3 mins to Capital Shoppers Ntinda & Quality Shopping Mall',
      'Quick access to Kiwatule & Nakawa business hub',
      'Family-friendly residential street'
    ]
  },
  {
    id: 'prop-7',
    slug: 'gated-estate-villa-lubowa',
    title: '4-Bedroom Tuscan-Style Villa in Lubowa',
    transaction: 'buy',
    propertyType: 'House',
    price: 880000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Lubowa',
    district: 'Wakiso',
    address: 'Estate Drive, Royal Palms Area, Lubowa Hill',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    landSizeDecimals: 22,
    buildingSizeSqm: 320,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Immaculate Tuscan-inspired residence situated in an exclusive gated community on Lubowa Hill. Boasting high vaulted ceilings, spacious master retreat with ensuite bathroom and dual sinks, separate family TV room, ground floor guest suite, and fitted gourmet kitchen. The private garden is beautifully landscaped with flowering borders. The gated community features 24/7 controlled security gates, communal tennis court, and clubhouse.',
    features: [
      'Parking',
      'Garden',
      'Security',
      'Balcony',
      'Servants Quarters',
      'Water Reservoir',
      'Generator'
    ],
    images: [
      heroVillaImg,
      kiraHomeImg,
      kololoAptImg
    ],
    advertiser: {
      id: 'adv-6',
      name: 'Julius Kigozi',
      type: 'Agent',
      phone: '+256 702 449 801',
      whatsapp: '+256702449801',
      email: 'julius@kigoziestates.ug',
      verified: true,
      agencyName: 'Kigozi & Partners Real Estate',
      responseRate: '94% within 2 hours',
      experienceYears: 10
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-08-30',
      verifiedBy: 'Reality Estates Senior Inspector',
      notes: 'Title deed confirmed free of encumbrance or caveat.'
    },
    insights: {
      estimatedMonthlyRent: 4800000,
      grossRentalYield: 6.54,
      pricePerDecimal: 40000000,
      pricePerSqm: 2750000
    },
    coordinates: { lat: 0.2528, lng: 32.5562 },
    featured: true,
    dateAdded: '2026-09-08',
    neighborhoodHighlights: [
      '4 mins to International School of Uganda (ISU)',
      'Direct connection to Entebbe Expressway at Kajjansi',
      'Safe, tranquil community for walking and jogging'
    ]
  },
  {
    id: 'prop-8',
    slug: 'modern-townhouse-muyenga',
    title: '5-Bedroom Lake-View Residence in Muyenga',
    transaction: 'buy',
    propertyType: 'House',
    price: 1350000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Muyenga',
    district: 'Kampala',
    address: 'Tank Hill Close, Muyenga',
    bedrooms: 5,
    bathrooms: 5,
    parking: 3,
    landSizeDecimals: 28,
    buildingSizeSqm: 410,
    tenure: 'Freehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Elegantly proportioned multi-level residence perched on Tank Hill, offering serene breezes and south-facing views towards Lake Victoria. Highlights include a dramatic reception hallway with spiral staircase, solid hardwood flooring in bedrooms, an executive library/study, two expansive balconies, and an outdoor patio perfect for hosting gatherings. Complete with separate staff quarters and automated backup generator.',
    features: [
      'Parking',
      'Garden',
      'Security',
      'Balcony',
      'Servants Quarters',
      'Generator',
      'Water Reservoir'
    ],
    images: [
      heroVillaImg,
      kololoAptImg,
      kiraHomeImg
    ],
    advertiser: {
      id: 'adv-3',
      name: 'David Ssenyonga',
      type: 'Agent',
      phone: '+256 782 911 340',
      whatsapp: '+256782911340',
      email: 'david@ugandarealtors.co.ug',
      verified: true,
      agencyName: 'Pearl Haven Realty',
      responseRate: '95% within 2 hours',
      experienceYears: 11
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-04',
      verifiedBy: 'Reality Estates Verification Team',
      notes: 'Full structural inspection verified.'
    },
    insights: {
      estimatedMonthlyRent: 8000000,
      grossRentalYield: 7.11,
      pricePerDecimal: 48214285,
      pricePerSqm: 3292682
    },
    coordinates: { lat: 0.2986, lng: 32.6134 },
    featured: false,
    dateAdded: '2026-09-14',
    neighborhoodHighlights: [
      'Minutes from Tank Hill culinary precinct',
      '15 mins to Kampala city center via Ggaba Road',
      'Quiet, secure residential street with leafy canopy'
    ]
  },
  {
    id: 'prop-9',
    slug: 'modern-starter-bungalow-kyanja',
    title: '3-Bedroom Newly Built Bungalow in Kyanja',
    transaction: 'buy',
    propertyType: 'House',
    price: 420000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kyanja',
    district: 'Kampala',
    address: 'Kyanja-Walufumbe Road, Kyanja',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    landSizeDecimals: 15,
    buildingSizeSqm: 175,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'An appealing modern family bungalow offering exceptional value in fast-appreciating Kyanja. Built to high standards with durable gypsum ceilings, contemporary aluminum sliding windows, tiled floors throughout, and a bright dining/living space. Self-contained master bedroom with built-in wardrobes. Fully paved compound with private grass patch and secure steel perimeter gate.',
    features: [
      'Parking',
      'Garden',
      'Security',
      'Water Reservoir',
      'Perimeter Wall'
    ],
    images: [
      kiraHomeImg,
      kololoAptImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Namutebi',
      type: 'Agent',
      phone: '+256 772 458 912',
      whatsapp: '+256772458912',
      email: 'grace.namutebi@victoriarealty.ug',
      verified: true,
      agencyName: 'Victoria Prime Properties',
      responseRate: '98% within 1 hour',
      experienceYears: 8
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-11',
      verifiedBy: 'Reality Estates Inspector',
      notes: 'Approved municipal building plan and certified site title on file.'
    },
    insights: {
      estimatedMonthlyRent: 2200000,
      grossRentalYield: 6.28,
      pricePerDecimal: 28000000,
      pricePerSqm: 2400000
    },
    coordinates: { lat: 0.3862, lng: 32.6089 },
    featured: false,
    dateAdded: '2026-09-17',
    neighborhoodHighlights: [
      'Close to Kyanja Community Market and Supermarkets',
      'Direct link to Kisaasi & Bahai Temple heritage area',
      'Established suburban community with school bus routes'
    ]
  },
  {
    id: 'prop-10',
    slug: 'cozy-2-bedroom-apartment-najjera',
    title: 'Contemporary 2-Bedroom Apartment in Najjera',
    transaction: 'rent',
    propertyType: 'Apartment',
    price: 1600000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Najjera',
    district: 'Wakiso',
    address: 'Apex Heights, Najjera II Road',
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    buildingSizeSqm: 95,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Smart, naturally illuminated two-bedroom apartment positioned on the second floor of a secure, well-managed residential block in Najjera II. Features an open kitchen layout with granite counters and wooden cabinets, a private balcony off the living room, master ensuite, and solar water heating. Includes dedicated resident parking, CCTV coverage in common spaces, and backup water reservoir.',
    features: [
      'Parking',
      'Security',
      'Water Reservoir',
      'Balcony',
      'Solar Backup'
    ],
    images: [
      kololoAptImg,
      kiraHomeImg,
      naguruTowerImg
    ],
    advertiser: {
      id: 'adv-7',
      name: 'Florence Nabakooza',
      type: 'Agent',
      phone: '+256 754 882 119',
      whatsapp: '+256754882119',
      email: 'florence@najjeraproperties.ug',
      verified: true,
      agencyName: 'Sunrise Property Partners',
      responseRate: '96% within 1 hour',
      experienceYears: 5
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-18',
      verifiedBy: 'Reality Estates Local Inspector',
      notes: 'Rental pricing verified directly against building management ledger.'
    },
    insights: {
      estimatedMonthlyRent: 1600000,
      pricePerSqm: 16842
    },
    coordinates: { lat: 0.3811, lng: 32.6281 },
    featured: false,
    dateAdded: '2026-09-24',
    neighborhoodHighlights: [
      'Walking distance to Najjera trading center and gym',
      'Convenient access to Kiwatule recreational centre'
    ]
  },
  {
    id: 'prop-11',
    slug: 'industrial-logistics-warehouse-bugolobi',
    title: '1,200 sqm High-Clearance Logistics Warehouse',
    transaction: 'rent',
    propertyType: 'Warehouse',
    price: 28000000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Bugolobi',
    district: 'Kampala',
    address: 'Plot 4, Spring Road Industrial Precinct, Bugolobi',
    bedrooms: 0,
    bathrooms: 4,
    parking: 8,
    buildingSizeSqm: 1200,
    tenure: 'Leasehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Heavy-duty industrial warehouse facility strategically located in Bugolobi industrial belt. Offers clear internal height of 8.5 meters, reinforced power-floated concrete floor slab (3-tonne per sqm load capacity), 3 heavy motorized roller shutter doors, 3-phase high-voltage power supply with 250kVA transformer, mezzanine administrative office suite, driver resting area, and ample turning radius for 40ft container articulated trucks.',
    features: [
      'Parking',
      'Security',
      'Generator',
      'Water Reservoir',
      'Commercial Grade'
    ],
    images: [
      naguruTowerImg,
      kololoAptImg,
      kiraHomeImg
    ],
    advertiser: {
      id: 'adv-4',
      name: 'Brenda Atuhaire',
      type: 'Agent',
      phone: '+256 752 309 881',
      whatsapp: '+256752309881',
      email: 'brenda@commercialproperty.ug',
      verified: true,
      agencyName: 'Corporate Spaces Uganda',
      responseRate: '99% within 45 mins',
      experienceYears: 12
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-08-22',
      verifiedBy: 'Commercial Desk',
      notes: 'Industrial lease deed and safety compliance certificate reviewed.'
    },
    insights: {
      pricePerSqm: 23333,
      estimatedMonthlyRent: 28000000
    },
    coordinates: { lat: 0.3167, lng: 32.6148 },
    featured: false,
    dateAdded: '2026-08-30',
    neighborhoodHighlights: [
      'Strategic position between Jinja Highway and Port Bell pier',
      'Established industrial zone with 24/7 heavy vehicle access'
    ]
  },
  {
    id: 'prop-12',
    slug: 'residential-plots-mukono-mbalala',
    title: '25 Decimals Titled Residential Plot in Mukono',
    transaction: 'buy',
    propertyType: 'Land',
    price: 85000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Mukono',
    district: 'Mukono',
    address: 'Mbalala Estate, 1.2km off Kampala-Jinja Highway',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    landSizeDecimals: 25,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Ready-to-build, surveyed residential plot with clean private Mailo land title situated in an organized emerging residential neighborhood in Mukono, Mbalala. Flat, dry, and fertile red loam soil. Boundary survey beacons already planted and certified. Power and municipal water connection available right outside the plot boundary.',
    features: [
      'Water Reservoir',
      'Electricity',
      'Tarmac Access'
    ],
    images: [
      entebbeLandImg,
      kiraHomeImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-5',
      name: 'Patrick Bwambale',
      type: 'Agent',
      phone: '+256 776 102 443',
      whatsapp: '+256776102443',
      email: 'pbwambale@entebbelands.com',
      verified: true,
      agencyName: 'Direct Landowner',
      responseRate: '92% within 3 hours',
      experienceYears: 6
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-08',
      verifiedBy: 'Reality Estates Cadastral Unit',
      notes: 'Title search carried out at Mukono Ministry of Lands Zonal Office; zero encumbrance.'
    },
    insights: {
      pricePerDecimal: 3400000,
      capitalGrowthForecast: '+15.2% Mukono-Jinja industrial belt spillover'
    },
    coordinates: { lat: 0.3582, lng: 32.7489 },
    featured: false,
    dateAdded: '2026-09-01',
    neighborhoodHighlights: [
      'Close to Uganda Christian University (UCU) main campus',
      'Rapidly modernizing community with fresh grocery markets and private clinics'
    ]
  },
  {
    id: 'prop-13',
    slug: 'river-nile-holiday-lodge-jinja',
    title: '4-Bedroom Scenic Riverfront Retreat in Jinja',
    transaction: 'buy',
    propertyType: 'House',
    price: 780000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Jinja',
    district: 'Jinja',
    address: 'Njeru Waterfront, River Nile Overlook',
    bedrooms: 4,
    bathrooms: 4,
    parking: 4,
    landSizeDecimals: 50,
    buildingSizeSqm: 310,
    tenure: 'Freehold',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Enchanting riverfront sanctuary situated high on the banks of the historic River Nile in Jinja. Crafted with locally sourced natural eucalyptus timber, volcanic stone accents, and vast veranda decks framing sunset vistas over cascading waters. Ideal as a private holiday sanctuary, high-yield luxury Airbnb investment, or wellness retreat.',
    features: [
      'Garden',
      'Furnished',
      'Balcony',
      'Security',
      'Water Reservoir',
      'Solar Backup'
    ],
    images: [
      heroVillaImg,
      entebbeLandImg,
      kololoAptImg
    ],
    advertiser: {
      id: 'adv-6',
      name: 'Julius Kigozi',
      type: 'Agent',
      phone: '+256 702 449 801',
      whatsapp: '+256702449801',
      email: 'julius@kigoziestates.ug',
      verified: true,
      agencyName: 'Kigozi & Partners Real Estate',
      responseRate: '94% within 2 hours',
      experienceYears: 10
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-08-16',
      verifiedBy: 'Reality Estates Regional Inspector',
      notes: 'Riparian buffer compliance and freehold documentation checked.'
    },
    insights: {
      estimatedMonthlyRent: 6500000,
      grossRentalYield: 10.0,
      pricePerDecimal: 15600000,
      pricePerSqm: 2516129
    },
    coordinates: { lat: 0.4344, lng: 33.2026 },
    featured: true,
    dateAdded: '2026-09-03',
    neighborhoodHighlights: [
      '10 mins to Jinja City Centre and Source of the Nile gardens',
      'Direct boat access and world-class whitewater sporting hub nearby'
    ]
  },
  {
    id: 'prop-14',
    slug: 'executive-diplomatic-residence-nakasero',
    title: '6-Bedroom Diplomatic Compound in Nakasero',
    transaction: 'buy',
    propertyType: 'House',
    price: 3600000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Nakasero',
    district: 'Kampala',
    address: 'Plot 9, Kyadondo Road, Nakasero Hill',
    bedrooms: 6,
    bathrooms: 7,
    parking: 6,
    landSizeDecimals: 45,
    buildingSizeSqm: 680,
    tenure: 'Freehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'One of the most prestigious trophy assets on Nakasero Hill. Formally leased to high-commission diplomatic missions, this estate provides impenetrable security features: reinforced concrete perimeter wall, dual gated guardhouse entry, ballistic window treatments, separate security personnel quarters, full commercial standby generator, Olympic-length swimming pool, and an embassy-grade formal banquet hall.',
    features: [
      'Swimming Pool',
      'Security',
      'Garden',
      'Parking',
      'Generator',
      'Servants Quarters',
      'Air Conditioning',
      'Water Reservoir'
    ],
    images: [
      heroVillaImg,
      kololoAptImg,
      naguruTowerImg
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Arthur Mukasa',
      type: 'Agent',
      phone: '+256 701 883 204',
      whatsapp: '+256701883204',
      email: 'arthur.m@summitridge.ug',
      verified: true,
      agencyName: 'Summit Ridge Developments Ltd',
      responseRate: '100% within 30 mins',
      experienceYears: 14
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-12',
      verifiedBy: 'Reality Estates Senior Executive',
      notes: 'Trophy property with certified clean title and approved diplomatic security survey.'
    },
    insights: {
      estimatedMonthlyRent: 22000000,
      grossRentalYield: 7.33,
      pricePerDecimal: 80000000,
      pricePerSqm: 5294117
    },
    coordinates: { lat: 0.3242, lng: 32.5781 },
    featured: true,
    dateAdded: '2026-09-19',
    neighborhoodHighlights: [
      'Heart of Uganda diplomatic and presidential quarter',
      'Minutes to Serena Hotel, Golf Club, and Nakasero Hospital'
    ]
  },
  {
    id: 'prop-15',
    slug: 'modern-ground-floor-retail-shop-bukoto',
    title: '140 sqm Prime Retail Showroom in Bukoto',
    transaction: 'rent',
    propertyType: 'Shop',
    price: 6500000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Bukoto',
    district: 'Kampala',
    address: 'Bukoto Central Plaza, Main Bukoto-Kisaasi Road',
    bedrooms: 0,
    bathrooms: 2,
    parking: 4,
    buildingSizeSqm: 140,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Prominent street-front commercial retail showroom with massive double-glazed display frontage on busy Bukoto-Kisaasi Road. Outstanding footfall and vehicular traffic exposure. Finished with ceramic floor tiles, recessed LED commercial spotlights, independent washroom facilities, prepaid electricity meter (Yaka), and customer parking bays.',
    features: [
      'Parking',
      'Security',
      'Water Reservoir',
      'Commercial Grade'
    ],
    images: [
      naguruTowerImg,
      kololoAptImg,
      kiraHomeImg
    ],
    advertiser: {
      id: 'adv-4',
      name: 'Brenda Atuhaire',
      type: 'Agent',
      phone: '+256 752 309 881',
      whatsapp: '+256752309881',
      email: 'brenda@commercialproperty.ug',
      verified: true,
      agencyName: 'Corporate Spaces Uganda',
      responseRate: '99% within 45 mins',
      experienceYears: 12
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-08-25',
      verifiedBy: 'Commercial Desk',
      notes: 'Commercial zoning compliance and trader occupancy permit verified.'
    },
    insights: {
      pricePerSqm: 46428,
      estimatedMonthlyRent: 6500000
    },
    coordinates: { lat: 0.3512, lng: 32.5976 },
    featured: false,
    dateAdded: '2026-08-28',
    neighborhoodHighlights: [
      'Dense catchment area of young professionals and affluent households',
      'Direct neighbor to major pharmacies, cafes, and branch banks'
    ]
  },
  {
    id: 'prop-16',
    slug: 'luxury-serviced-villa-namugongo',
    title: '4-Bedroom Modern Villa with Swimming Pool in Namugongo',
    transaction: 'buy',
    propertyType: 'House',
    price: 720000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Namugongo',
    district: 'Wakiso',
    address: 'Shine Estate, near Anglican Shrine, Namugongo',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    landSizeDecimals: 20,
    buildingSizeSqm: 290,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Charming newly completed home in an established residential community in Namugongo. Boasts private swimming pool, landscaped lawn, expansive glass sliders connecting living space to terrace, fitted kitchen with breakfast counter, family lounge, and all bedrooms ensuite. Comes with complete solar inverter setup and staff accommodation.',
    features: [
      'Swimming Pool',
      'Garden',
      'Parking',
      'Security',
      'Water Reservoir',
      'Solar Backup',
      'Servants Quarters'
    ],
    images: [
      kiraHomeImg,
      heroVillaImg,
      kololoAptImg
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Namutebi',
      type: 'Agent',
      phone: '+256 772 458 912',
      whatsapp: '+256772458912',
      email: 'grace.namutebi@victoriarealty.ug',
      verified: true,
      agencyName: 'Victoria Prime Properties',
      responseRate: '98% within 1 hour',
      experienceYears: 8
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-14',
      verifiedBy: 'Reality Estates Inspector',
      notes: 'Site visit completed; pool plumbing and power backup tested.'
    },
    insights: {
      estimatedMonthlyRent: 3800000,
      grossRentalYield: 6.33,
      pricePerDecimal: 36000000,
      pricePerSqm: 2482758
    },
    coordinates: { lat: 0.3892, lng: 32.6514 },
    featured: false,
    dateAdded: '2026-09-15',
    neighborhoodHighlights: [
      '5 mins to Namugongo shrines scenic park',
      '7 mins to Kyaliwajjala shopping hub'
    ]
  },
  {
    id: 'prop-17',
    slug: 'modern-apartments-investment-block-kyanja',
    title: 'Block of 6 Contemporary 2-Bedroom Units',
    transaction: 'buy',
    propertyType: 'Commercial',
    price: 1650000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kyanja',
    district: 'Kampala',
    address: 'Ring Road Extension, Kyanja Central',
    bedrooms: 12,
    bathrooms: 12,
    parking: 8,
    landSizeDecimals: 30,
    buildingSizeSqm: 640,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'An outstanding turnkey buy-to-let commercial residential investment. Comprises six spacious, identical two-bedroom two-bathroom apartments, each with modern fitted kitchen, utility balcony, and individual prepaid electricity and water meters. Currently 100% occupied with steady corporate and tech tenants, generating a reliable monthly rental income stream of UGX 10.8M.',
    features: [
      'Parking',
      'Security',
      'Water Reservoir',
      'Generator',
      'Balcony',
      'Perimeter Wall'
    ],
    images: [
      kololoAptImg,
      kiraHomeImg,
      naguruTowerImg
    ],
    advertiser: {
      id: 'adv-3',
      name: 'David Ssenyonga',
      type: 'Agent',
      phone: '+256 782 911 340',
      whatsapp: '+256782911340',
      email: 'david@ugandarealtors.co.ug',
      verified: true,
      agencyName: 'Pearl Haven Realty',
      responseRate: '95% within 2 hours',
      experienceYears: 11
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-09',
      verifiedBy: 'Reality Estates Commercial Unit',
      notes: 'Tenancy agreements and 12-month rent roll verified.'
    },
    insights: {
      estimatedMonthlyRent: 10800000,
      grossRentalYield: 7.85,
      pricePerDecimal: 55000000,
      pricePerSqm: 2578125
    },
    coordinates: { lat: 0.3879, lng: 32.6121 },
    featured: false,
    dateAdded: '2026-09-07',
    neighborhoodHighlights: [
      'Consistently high tenant retention rate',
      'Near supermarkets, banks, and rapid transport links'
    ]
  },
  {
    id: 'prop-18',
    slug: 'luxury-furnished-garden-villa-kololo',
    title: '4-Bedroom Furnished Executive Residence in Kololo',
    transaction: 'rent',
    propertyType: 'House',
    price: 9500000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Kololo',
    district: 'Kampala',
    address: 'Prince Charles Drive, Kololo',
    bedrooms: 4,
    bathrooms: 4,
    parking: 4,
    landSizeDecimals: 30,
    buildingSizeSqm: 380,
    tenure: 'Freehold',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'A distinguished executive residence on Prince Charles Drive. Fully furnished to exceptional standards with bespoke furniture, king-size orthopedic beds, premium linens, fully kitted kitchen, and private enclosed swimming pool. Surrounded by lush, mature tropical trees offering absolute privacy. Full backup power generator and monitored electronic perimeter alarm.',
    features: [
      'Swimming Pool',
      'Furnished',
      'Garden',
      'Parking',
      'Security',
      'Generator',
      'Air Conditioning',
      'Servants Quarters'
    ],
    images: [
      heroVillaImg,
      kololoAptImg,
      kiraHomeImg
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Arthur Mukasa',
      type: 'Agent',
      phone: '+256 701 883 204',
      whatsapp: '+256701883204',
      email: 'arthur.m@summitridge.ug',
      verified: true,
      agencyName: 'Summit Ridge Developments Ltd',
      responseRate: '100% within 30 mins',
      experienceYears: 14
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-17',
      verifiedBy: 'Reality Estates Verification Team',
      notes: 'Furnishing inventory and diplomatic security inspection passed.'
    },
    insights: {
      estimatedMonthlyRent: 9500000,
      pricePerSqm: 25000
    },
    coordinates: { lat: 0.3312, lng: 32.5891 },
    featured: true,
    dateAdded: '2026-09-21',
    neighborhoodHighlights: [
      'Direct access to Kololo Airstrip recreational zone',
      'Top diplomatic safety rating'
    ]
  },
  {
    id: 'prop-19',
    slug: 'titled-commercial-plot-bweyogerere',
    title: '40 Decimals Commercial Land on Jinja Highway',
    transaction: 'buy',
    propertyType: 'Land',
    price: 620000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Wakiso',
    district: 'Wakiso',
    address: 'Bweyogerere Central, Direct Frontage to Jinja Road',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    landSizeDecimals: 40,
    tenure: 'Freehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'High-visibility commercial land plot boasting over 45 meters of direct frontage onto the bustling Kampala-Jinja highway in Bweyogerere. Ideal for fuel service stations, hardware superstores, automotive showrooms, hospital clinics, or banking service centres. Fully surveyed with clear freehold title and commercial zoning permit.',
    features: [
      'Tarmac Access',
      'Electricity',
      'Water Reservoir',
      'Commercial Grade'
    ],
    images: [
      entebbeLandImg,
      naguruTowerImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-5',
      name: 'Patrick Bwambale',
      type: 'Agent',
      phone: '+256 776 102 443',
      whatsapp: '+256776102443',
      email: 'pbwambale@entebbelands.com',
      verified: true,
      agencyName: 'Direct Landowner',
      responseRate: '92% within 3 hours',
      experienceYears: 6
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-08-29',
      verifiedBy: 'Reality Estates Cadastral Unit',
      notes: 'Highway road-reserve setbacks verified with UNRA documentation.'
    },
    insights: {
      pricePerDecimal: 15500000,
      capitalGrowthForecast: '+16% high traffic transit corridor appreciation'
    },
    coordinates: { lat: 0.3547, lng: 32.6682 },
    featured: false,
    dateAdded: '2026-09-06',
    neighborhoodHighlights: [
      'Near Namboole National Stadium',
      'Massive daily vehicular transit flow'
    ]
  },
  {
    id: 'prop-20',
    slug: 'cozy-garden-cottage-gayaza',
    title: '3-Bedroom Suburban Country Home in Gayaza',
    transaction: 'buy',
    propertyType: 'House',
    price: 330000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Wakiso',
    district: 'Wakiso',
    address: 'Kasangati-Gayaza Road, Manyangwa',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    landSizeDecimals: 20,
    buildingSizeSqm: 160,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'pending',
    listingStatus: 'pending',
    description: 'Charming country cottage setting on 20 decimals of fertile green land in Manyangwa, Gayaza. Fresh air, established fruit trees (avocado, mango, jackfruit), perimeter fence, open living layout, and spacious kitchen. Great choice for retirement, young families seeking tranquil living, or organic homesteading.',
    features: [
      'Garden',
      'Parking',
      'Water Reservoir',
      'Perimeter Wall'
    ],
    images: [
      kiraHomeImg,
      heroVillaImg,
      entebbeLandImg
    ],
    advertiser: {
      id: 'adv-7',
      name: 'Florence Nabakooza',
      type: 'Agent',
      phone: '+256 754 882 119',
      whatsapp: '+256754882119',
      email: 'florence@najjeraproperties.ug',
      verified: true,
      agencyName: 'Sunrise Property Partners',
      responseRate: '96% within 1 hour',
      experienceYears: 5
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: false,
      availabilityConfirmed: true,
      notes: 'Awaiting updated land title search verification from Wakiso MZO.'
    },
    insights: {
      estimatedMonthlyRent: 1500000,
      grossRentalYield: 5.45,
      pricePerDecimal: 16500000,
      pricePerSqm: 2062500
    },
    coordinates: { lat: 0.4491, lng: 32.6102 },
    featured: false,
    dateAdded: '2026-09-25',
    neighborhoodHighlights: [
      'Near Gayaza High School and Kasangati medical facility',
      'Peaceful rural-suburban transition area'
    ]
  },
  {
    id: 'prop-21',
    slug: 'modern-studio-apartment-bukoto',
    title: 'Modern Studio Apartment near Acacia Mall',
    transaction: 'rent',
    propertyType: 'Apartment',
    price: 1100000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Bukoto',
    district: 'Kampala',
    address: 'Urban Suites, Old Kira Road, Bukoto',
    bedrooms: 1,
    bathrooms: 1,
    parking: 1,
    buildingSizeSqm: 52,
    tenure: 'Mailo',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Compact, high-efficiency serviced studio apartment in central Bukoto. Fully equipped with kitchen essentials, high-speed WiFi, smart television, private bathroom, and balcony. Building includes laundry facilities, 24/7 security guard, and elevator access.',
    features: [
      'Furnished',
      'Security',
      'Elevator Access',
      'Balcony',
      'Water Reservoir'
    ],
    images: [
      kololoAptImg,
      naguruTowerImg,
      kiraHomeImg
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Namutebi',
      type: 'Agent',
      phone: '+256 772 458 912',
      whatsapp: '+256772458912',
      email: 'grace.namutebi@victoriarealty.ug',
      verified: true,
      agencyName: 'Victoria Prime Properties',
      responseRate: '98% within 1 hour',
      experienceYears: 8
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-23',
      verifiedBy: 'Reality Estates Local Inspector'
    },
    insights: {
      pricePerSqm: 21153,
      estimatedMonthlyRent: 1100000
    },
    coordinates: { lat: 0.3475, lng: 32.5954 },
    featured: false,
    dateAdded: '2026-09-24',
    neighborhoodHighlights: [
      '5 mins to Acacia Mall & Kamwokya tech hubs',
      'Vibrant dining and coffee shops along Old Kira Road'
    ]
  },
  {
    id: 'prop-22',
    slug: 'commercial-office-suite-kampala-cbd',
    title: '220 sqm Partitioned Office Suite in Kampala CBD',
    transaction: 'rent',
    propertyType: 'Office',
    price: 8200000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Kampala',
    district: 'Kampala',
    address: 'Victoria Towers, Kyaggwe Road, Central Kampala',
    bedrooms: 0,
    bathrooms: 3,
    parking: 3,
    buildingSizeSqm: 220,
    tenure: 'Leasehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Fully partitioned corporate office suite on the 4th floor of an established commercial building in the banking district of Kampala CBD. Features reception area, executive boardroom, 4 partitioned manager offices, open workstation area, server room, and private kitchenette.',
    features: [
      'Elevator Access',
      'Air Conditioning',
      'Generator',
      'Security',
      'Water Reservoir',
      'Parking'
    ],
    images: [
      naguruTowerImg,
      kololoAptImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-4',
      name: 'Brenda Atuhaire',
      type: 'Agent',
      phone: '+256 752 309 881',
      whatsapp: '+256752309881',
      email: 'brenda@commercialproperty.ug',
      verified: true,
      agencyName: 'Corporate Spaces Uganda',
      responseRate: '99% within 45 mins',
      experienceYears: 12
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-03',
      verifiedBy: 'Commercial Desk'
    },
    insights: {
      pricePerSqm: 37272,
      estimatedMonthlyRent: 8200000
    },
    coordinates: { lat: 0.3155, lng: 32.5812 },
    featured: false,
    dateAdded: '2026-09-02',
    neighborhoodHighlights: [
      'Steps from Bank of Uganda and commercial banking headquarters',
      'Direct taxi & express bus accessibility'
    ]
  },
  {
    id: 'prop-23',
    slug: 'lake-view-residential-plots-munyonyo',
    title: '30 Decimals Prime Lake-Facing Land in Munyonyo',
    transaction: 'buy',
    propertyType: 'Land',
    price: 750000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kampala',
    district: 'Kampala',
    address: 'Wavamunno Road Overlook, Munyonyo',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    landSizeDecimals: 30,
    tenure: 'Freehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Premier piece of freehold real estate in the prestigious Munyonyo lakefront corridor. Rectangular topology, elevated lake views, direct tarmac road approach, with affluent luxury villas on adjacent boundaries. Ready for construction of a luxury dream residence or high-end condominium development.',
    features: [
      'Tarmac Access',
      'Electricity',
      'Water Reservoir',
      'Perimeter Wall'
    ],
    images: [
      entebbeLandImg,
      heroVillaImg,
      kololoAptImg
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Arthur Mukasa',
      type: 'Agent',
      phone: '+256 701 883 204',
      whatsapp: '+256701883204',
      email: 'arthur.m@summitridge.ug',
      verified: true,
      agencyName: 'Summit Ridge Developments Ltd',
      responseRate: '100% within 30 mins',
      experienceYears: 14
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-10',
      verifiedBy: 'Reality Estates Cadastral Unit'
    },
    insights: {
      pricePerDecimal: 25000000,
      capitalGrowthForecast: '+12% annual waterfront prestige gain'
    },
    coordinates: { lat: 0.2589, lng: 32.6178 },
    featured: true,
    dateAdded: '2026-09-11',
    neighborhoodHighlights: [
      '3 mins to Speke Resort Munyonyo & Commonwealth Convention Centre',
      'Easy link to Southern Bypass and Entebbe Expressway'
    ]
  },
  {
    id: 'prop-24',
    slug: 'cozy-3-bedroom-rental-home-naalya',
    title: '3-Bedroom Standalone Family Home in Naalya',
    transaction: 'rent',
    propertyType: 'House',
    price: 2500000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Wakiso',
    district: 'Wakiso',
    address: 'Near Naalya SS, Naalya Estate',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    landSizeDecimals: 15,
    buildingSizeSqm: 185,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Neat three-bedroom standalone residence nestled in Naalya. Enjoy an intimate private front garden, spacious dining lounge, fitted cupboards in all bedrooms, master ensuite, outdoor staff washroom, and high perimeter wall with electric razor fencing.',
    features: [
      'Garden',
      'Parking',
      'Security',
      'Water Reservoir',
      'Perimeter Wall'
    ],
    images: [
      kiraHomeImg,
      kololoAptImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-6',
      name: 'Julius Kigozi',
      type: 'Agent',
      phone: '+256 702 449 801',
      whatsapp: '+256702449801',
      email: 'julius@kigoziestates.ug',
      verified: true,
      agencyName: 'Kigozi & Partners Real Estate',
      responseRate: '94% within 2 hours',
      experienceYears: 10
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-18',
      verifiedBy: 'Reality Estates Local Inspector'
    },
    insights: {
      estimatedMonthlyRent: 2500000,
      pricePerSqm: 13513
    },
    coordinates: { lat: 0.3702, lng: 32.6398 },
    featured: false,
    dateAdded: '2026-09-19',
    neighborhoodHighlights: [
      '3 mins to Metroplex Mall Naalya and cinemas',
      'Direct access to Northern Bypass'
    ]
  },
  {
    id: 'prop-25',
    slug: 'prime-agricultural-investment-land-luwero',
    title: '5 Acres Titled Farm Land in Luwero',
    transaction: 'buy',
    propertyType: 'Land',
    price: 150000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Wakiso',
    district: 'Wakiso',
    address: 'Luwero Outskirts, 4km off Gulu Highway',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    landSizeDecimals: 500,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'unverified',
    listingStatus: 'published',
    description: 'Expansive 5-acre agricultural and commercial farm investment parcel in Luwero district. Rich black soil, permanent stream along the rear boundary providing year-round natural irrigation, gentle slope ideal for horticulture, cattle farming, or poultry farm setup.',
    features: [
      'Water Reservoir',
      'Electricity'
    ],
    images: [
      entebbeLandImg,
      kiraHomeImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-5',
      name: 'Patrick Bwambale',
      type: 'Owner',
      phone: '+256 776 102 443',
      whatsapp: '+256776102443',
      email: 'pbwambale@entebbelands.com',
      verified: false,
      agencyName: 'Direct Landowner',
      responseRate: '92% within 3 hours',
      experienceYears: 6
    },
    verificationDetails: {
      advertiserVerified: false,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: false,
      notes: 'Pending advertiser passport submission and boundary deed registry survey.'
    },
    insights: {
      pricePerDecimal: 300000,
      capitalGrowthForecast: '+11% agrarian value appreciation'
    },
    coordinates: { lat: 0.8491, lng: 32.4921 },
    featured: false,
    dateAdded: '2026-08-20',
    neighborhoodHighlights: [
      'Strong water source for all-season farming',
      'Truck-accessible murram road link to main tarmac highway'
    ]
  },
  {
    id: 'prop-26',
    slug: 'newly-built-semidetached-homes-najjanankumbi',
    title: 'Modern 3-Bedroom Semi-Detached House in Najjanankumbi',
    transaction: 'buy',
    propertyType: 'House',
    price: 380000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kampala',
    district: 'Kampala',
    address: 'Stella Zone, off Entebbe Road, Najjanankumbi',
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    landSizeDecimals: 12,
    buildingSizeSqm: 160,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Smart and functional newly built semi-detached townhouse in accessible Najjanankumbi. Positioned just 500 meters off Entebbe Road. High-gloss ceramic tiling, fitted kitchen with breakfast table, master bedroom with balcony, ensuite washrooms, and dedicated parking for two vehicles.',
    features: [
      'Parking',
      'Security',
      'Water Reservoir',
      'Balcony',
      'Perimeter Wall'
    ],
    images: [
      kiraHomeImg,
      kololoAptImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-6',
      name: 'Julius Kigozi',
      type: 'Agent',
      phone: '+256 702 449 801',
      whatsapp: '+256702449801',
      email: 'julius@kigoziestates.ug',
      verified: true,
      agencyName: 'Kigozi & Partners Real Estate',
      responseRate: '94% within 2 hours',
      experienceYears: 10
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-08',
      verifiedBy: 'Reality Estates Verification Team'
    },
    insights: {
      estimatedMonthlyRent: 2000000,
      grossRentalYield: 6.31,
      pricePerDecimal: 31666666,
      pricePerSqm: 2375000
    },
    coordinates: { lat: 0.2789, lng: 32.5621 },
    featured: false,
    dateAdded: '2026-09-10',
    neighborhoodHighlights: [
      '10 mins to Kampala CBD off-peak',
      'Easy direct connection to Entebbe Airport corridor'
    ]
  },
  {
    id: 'prop-27',
    slug: 'prime-corner-commercial-building-ntinda',
    title: '3-Story Commercial Corner Building in Ntinda',
    transaction: 'buy',
    propertyType: 'Commercial',
    price: 2900000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Ntinda',
    district: 'Kampala',
    address: 'Ntinda-Nakawa Junction Corner, Ntinda',
    bedrooms: 0,
    bathrooms: 8,
    parking: 12,
    landSizeDecimals: 25,
    buildingSizeSqm: 850,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'An exceptional commercial income property on a prime Ntinda corner. Ground floor features 3 banking or retail storefronts with floor-to-ceiling glass; 1st and 2nd floors comprise fully leased executive offices and professional clinics. 100% leased with gross annual rental income exceeding UGX 220,000,000.',
    features: [
      'Parking',
      'Security',
      'Generator',
      'Water Reservoir',
      'Commercial Grade'
    ],
    images: [
      naguruTowerImg,
      kololoAptImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-4',
      name: 'Brenda Atuhaire',
      type: 'Agent',
      phone: '+256 752 309 881',
      whatsapp: '+256752309881',
      email: 'brenda@commercialproperty.ug',
      verified: true,
      agencyName: 'Corporate Spaces Uganda',
      responseRate: '99% within 45 mins',
      experienceYears: 12
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-02',
      verifiedBy: 'Reality Estates Commercial Desk'
    },
    insights: {
      estimatedMonthlyRent: 18500000,
      grossRentalYield: 7.65,
      pricePerDecimal: 116000000,
      pricePerSqm: 3411764
    },
    coordinates: { lat: 0.3498, lng: 32.6142 },
    featured: true,
    dateAdded: '2026-09-01',
    neighborhoodHighlights: [
      'Unsurpassed visibility at key Ntinda crossroads',
      'High foot traffic and heavy spending consumer demographics'
    ]
  },
  {
    id: 'prop-28',
    slug: 'executive-5-bedroom-palace-buziga',
    title: '5-Bedroom Lake-Panoramic Mansion in Buziga',
    transaction: 'buy',
    propertyType: 'House',
    price: 1750000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kampala',
    district: 'Kampala',
    address: 'Buziga Upper Ring Road, Buziga Hill',
    bedrooms: 5,
    bathrooms: 5,
    parking: 4,
    landSizeDecimals: 30,
    buildingSizeSqm: 460,
    tenure: 'Freehold',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Imposing mansion commanding 180-degree sunset and water views over Ggaba and Lake Victoria from Buziga Hill. Highlights include a dramatic royal entrance foyer, grand granite staircase, high-spec German kitchen fittings, infinity plunge pool, sprawling roof terrace, 2-bedroom domestic staff quarters, and comprehensive CCTV monitoring.',
    features: [
      'Swimming Pool',
      'Garden',
      'Parking',
      'Security',
      'Generator',
      'Servants Quarters',
      'Balcony',
      'Water Reservoir'
    ],
    images: [
      heroVillaImg,
      kololoAptImg,
      kiraHomeImg
    ],
    advertiser: {
      id: 'adv-3',
      name: 'David Ssenyonga',
      type: 'Agent',
      phone: '+256 782 911 340',
      whatsapp: '+256782911340',
      email: 'david@ugandarealtors.co.ug',
      verified: true,
      agencyName: 'Pearl Haven Realty',
      responseRate: '95% within 2 hours',
      experienceYears: 11
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-16',
      verifiedBy: 'Reality Estates Verification Team'
    },
    insights: {
      estimatedMonthlyRent: 11000000,
      grossRentalYield: 7.54,
      pricePerDecimal: 58333333,
      pricePerSqm: 3804347
    },
    coordinates: { lat: 0.2741, lng: 32.6105 },
    featured: true,
    dateAdded: '2026-09-18',
    neighborhoodHighlights: [
      'Breathtaking high-altitude breeze and lake views',
      'Convenient access to Munyonyo Expressway spur'
    ]
  },
  {
    id: 'prop-29',
    slug: 'cozy-furnished-apartment-naguru',
    title: '2-Bedroom Serviced Pent-Suite in Naguru',
    transaction: 'rent',
    propertyType: 'Apartment',
    price: 4500000,
    currency: 'UGX',
    pricePeriod: 'month',
    location: 'Naguru',
    district: 'Kampala',
    address: 'Hilltop Crest, Naguru East Road',
    bedrooms: 2,
    bathrooms: 2,
    parking: 2,
    buildingSizeSqm: 135,
    tenure: 'Leasehold',
    furnished: true,
    availability: 'Available',
    verificationStatus: 'verified',
    listingStatus: 'published',
    description: 'Chic, designer-furnished apartment with expansive floor-to-ceiling glazing opening to a large balcony overlooking the Naguru hills. Features central air-conditioning, smart kitchen with quartz island, master bedroom with walk-in closet, building swimming pool, gym, standby generator, and 24/7 concierge.',
    features: [
      'Swimming Pool',
      'Furnished',
      'Air Conditioning',
      'Generator',
      'Security',
      'Balcony',
      'Parking'
    ],
    images: [
      kololoAptImg,
      heroVillaImg,
      naguruTowerImg
    ],
    advertiser: {
      id: 'adv-2',
      name: 'Arthur Mukasa',
      type: 'Agent',
      phone: '+256 701 883 204',
      whatsapp: '+256701883204',
      email: 'arthur.m@summitridge.ug',
      verified: true,
      agencyName: 'Summit Ridge Developments Ltd',
      responseRate: '100% within 30 mins',
      experienceYears: 14
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: true,
      verifiedDate: '2026-09-19',
      verifiedBy: 'Reality Estates Inspector'
    },
    insights: {
      pricePerSqm: 33333,
      estimatedMonthlyRent: 4500000
    },
    coordinates: { lat: 0.3421, lng: 32.6074 },
    featured: false,
    dateAdded: '2026-09-20',
    neighborhoodHighlights: [
      'Exclusive hilltop residential enclave',
      'Walking distance to rooftop lounges and boutique restaurants'
    ]
  },
  {
    id: 'prop-30',
    slug: 'prime-residential-land-kira-kimwanyi',
    title: '20 Decimals Titled Plot in Kira Kimwanyi',
    transaction: 'buy',
    propertyType: 'Land',
    price: 110000000,
    currency: 'UGX',
    pricePeriod: 'total',
    location: 'Kira',
    district: 'Wakiso',
    address: 'Kimwanyi Zone, 800m from Kira Municipality HQ',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    landSizeDecimals: 20,
    tenure: 'Mailo',
    furnished: false,
    availability: 'Available',
    verificationStatus: 'pending',
    listingStatus: 'pending',
    description: 'Well-situated residential plot measuring 20 decimals in high-demand Kira Kimwanyi. Elevated dry land surrounded by newly built executive family residences. Boundary beacons in place with clean private Mailo land title ready for transfer.',
    features: [
      'Water Reservoir',
      'Electricity',
      'Tarmac Access'
    ],
    images: [
      entebbeLandImg,
      kiraHomeImg,
      heroVillaImg
    ],
    advertiser: {
      id: 'adv-1',
      name: 'Grace Namutebi',
      type: 'Agent',
      phone: '+256 772 458 912',
      whatsapp: '+256772458912',
      email: 'grace.namutebi@victoriarealty.ug',
      verified: true,
      agencyName: 'Victoria Prime Properties',
      responseRate: '98% within 1 hour',
      experienceYears: 8
    },
    verificationDetails: {
      advertiserVerified: true,
      locationConfirmed: true,
      priceConfirmed: true,
      availabilityConfirmed: false,
      notes: 'Pending final beacon coordinates validation with Kira Municipal Planning Office.'
    },
    insights: {
      pricePerDecimal: 5500000,
      capitalGrowthForecast: '+13.5% Kira municipality corridor'
    },
    coordinates: { lat: 0.3952, lng: 32.6415 },
    featured: false,
    dateAdded: '2026-09-24',
    neighborhoodHighlights: [
      '5 mins to Kira Police and Municipal offices',
      'Rapid infrastructure expansion and paved neighborhood access'
    ]
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'user-buyer',
    name: 'Ronald Kato',
    email: 'ronald.kato@gmail.com',
    phone: '+256 772 123 456',
    role: 'buyer',
    title: 'Prospective Homebuyer',
    createdAt: '2026-06-15'
  },
  {
    id: 'user-agent',
    name: 'Grace Namutebi',
    email: 'grace.namutebi@victoriarealty.ug',
    phone: '+256 772 458 912',
    role: 'agent',
    company: 'Victoria Prime Properties',
    title: 'Senior Property Consultant',
    createdAt: '2026-01-10'
  },
  {
    id: 'user-admin',
    name: 'Kiconco Sarah (Admin)',
    email: 'admin@realityestates.ug',
    phone: '+256 701 999 000',
    role: 'admin',
    company: 'Reality Estates HQ',
    title: 'Platform Operations Director',
    createdAt: '2025-11-01'
  }
];

export const INITIAL_VIEWING_REQUESTS: ViewingRequest[] = [
  {
    id: 'view-1',
    propertyId: 'prop-1',
    propertyTitle: '4 Bedroom Contemporary Family Home',
    propertyLocation: 'Kira, Wakiso',
    propertyImage: kiraHomeImg,
    propertyPrice: 650000000,
    propertyTransaction: 'buy',
    propertyPricePeriod: 'total',
    customerName: 'Ronald Kato',
    customerPhone: '+256 772 123 456',
    customerEmail: 'ronald.kato@gmail.com',
    preferredDate: '2026-10-04',
    preferredTime: '10:00 AM – 11:30 AM',
    message: 'Interested in family relocation. Would love to inspect the master suite and the solar inverter setup.',
    status: 'Confirmed',
    dateRequested: '2026-09-27',
    assignedAgentName: 'Grace Namutebi'
  },
  {
    id: 'view-2',
    propertyId: 'prop-2',
    propertyTitle: 'Luxury 3-Bedroom Penthouse with Panoramic Views',
    propertyLocation: 'Kololo, Kampala',
    propertyImage: kololoAptImg,
    propertyPrice: 1850000000,
    propertyTransaction: 'buy',
    propertyPricePeriod: 'total',
    customerName: 'Ronald Kato',
    customerPhone: '+256 772 123 456',
    customerEmail: 'ronald.kato@gmail.com',
    preferredDate: '2026-10-07',
    preferredTime: '02:00 PM – 03:00 PM',
    message: 'Evaluating investment yields and condominium management fees.',
    status: 'Pending',
    dateRequested: '2026-09-28',
    assignedAgentName: 'Arthur Mukasa'
  }
];

export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-1',
    propertyId: 'prop-1',
    propertyTitle: '4 Bedroom Contemporary Family Home',
    propertyImage: kiraHomeImg,
    propertyPrice: 650000000,
    propertyLocation: 'Kira, Wakiso',
    customerName: 'Ronald Kato',
    customerEmail: 'ronald.kato@gmail.com',
    customerPhone: '+256 772 123 456',
    message: 'Is the asking price negotiable if we settle with a 40% cash deposit? Also kindly confirm the water meter type.',
    date: '2026-09-26',
    status: 'Viewing Scheduled',
    assignedRep: 'Grace Namutebi',
    notes: 'Client pre-qualified with Stanbic Bank home loan.'
  },
  {
    id: 'enq-2',
    propertyId: 'prop-4',
    propertyTitle: 'Grade A Commercial Office Floor (480 sqm)',
    propertyImage: naguruTowerImg,
    propertyPrice: 18500000,
    propertyLocation: 'Naguru, Kampala',
    customerName: 'Dr. Michael Walusimbi',
    customerEmail: 'm.walusimbi@medtech.ug',
    customerPhone: '+256 782 554 901',
    message: 'Inquiring about service charge breakdown per square meter and fiber optic internet redundancy.',
    date: '2026-09-28',
    status: 'Contacted',
    assignedRep: 'Brenda Atuhaire',
    notes: 'Sent PDF corporate brochure.'
  }
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-101',
    propertyId: 'prop-8',
    propertyTitle: '5-Bedroom Lake-View Residence in Muyenga',
    customerName: 'Julian Birungi',
    transactionType: 'Sale',
    transactionValue: 1350000000,
    agreedCommissionPercent: 3.0,
    platformRevenue: 40500000,
    paymentStatus: 'Received',
    stage: 'Closed',
    date: '2026-09-15',
    agentName: 'David Ssenyonga'
  },
  {
    id: 'tx-102',
    propertyId: 'prop-7',
    propertyTitle: '4-Bedroom Tuscan-Style Villa in Lubowa',
    customerName: 'Edward Mugisha',
    transactionType: 'Sale',
    transactionValue: 880000000,
    agreedCommissionPercent: 2.5,
    platformRevenue: 22000000,
    paymentStatus: 'Invoiced',
    stage: 'Offer',
    date: '2026-09-22',
    agentName: 'Julius Kigozi'
  },
  {
    id: 'prop-103',
    propertyId: 'prop-6',
    propertyTitle: 'Furnished 3-Bedroom Apartment in Central Ntinda',
    customerName: 'Sophie Achieng',
    transactionType: 'Rent',
    transactionValue: 45600000, // 1 year lease value
    agreedCommissionPercent: 8.33, // 1 month rent
    platformRevenue: 3800000,
    paymentStatus: 'Received',
    stage: 'Closed',
    date: '2026-09-20',
    agentName: 'Grace Namutebi'
  },
  {
    id: 'tx-104',
    propertyId: 'prop-1',
    propertyTitle: '4 Bedroom Contemporary Family Home',
    customerName: 'Ronald Kato',
    transactionType: 'Sale',
    transactionValue: 650000000,
    agreedCommissionPercent: 3.0,
    platformRevenue: 19500000,
    paymentStatus: 'Pending',
    stage: 'Viewing',
    date: '2026-09-27',
    agentName: 'Grace Namutebi'
  }
];

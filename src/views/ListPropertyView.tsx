import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Property, PropertyType, TransactionType } from '../types/property';
import { PropertyCard } from '../components/PropertyCard';
import { formatUGX } from '../utils/formatters';
import heroVillaImg from '../assets/images/hero_kampala_villa_1790704142442.jpg';
import kololoAptImg from '../assets/images/kololo_modern_apartment_1790704155678.jpg';
import kiraHomeImg from '../assets/images/kira_family_residence_1790704168602.jpg';
import naguruTowerImg from '../assets/images/naguru_commercial_tower_1790704181131.jpg';
import entebbeLandImg from '../assets/images/entebbe_lakeview_land_1790704191262.jpg';
import { 
  Building2, 
  PlusCircle, 
  ShieldCheck, 
  Eye, 
  Check, 
  Clock
} from 'lucide-react';

const SAMPLE_PHOTO_CHOICES = [
  { label: 'Suburban Family Home', url: kiraHomeImg },
  { label: 'Contemporary Apartment', url: kololoAptImg },
  { label: 'Hillside Executive Villa', url: heroVillaImg },
  { label: 'Commercial Office Building', url: naguruTowerImg },
  { label: 'Lakeview Land Parcel', url: entebbeLandImg }
];

const AMENITY_OPTIONS = [
  'Parking',
  'Garden',
  'Swimming Pool',
  'Furnished',
  'Security',
  'Water Reservoir',
  'Generator',
  'Servants Quarters',
  'Balcony',
  'Air Conditioning',
  'Perimeter Wall',
  'Solar Backup'
];

export const ListPropertyView: React.FC = () => {
  const { currentUser, openAuthModal, addProperty, properties, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'add' | 'my_properties'>('add');

  // Form State
  const [title, setTitle] = useState('');
  const [transaction, setTransaction] = useState<TransactionType>('buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [price, setPrice] = useState<number>(450000000);
  const [location, setLocation] = useState('Kira');
  const [district, setDistrict] = useState('Wakiso');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState(4);
  const [bathrooms, setBathrooms] = useState(3);
  const [parking, setParking] = useState(2);
  const [landSizeDecimals, setLandSizeDecimals] = useState<number | undefined>(20);
  const [buildingSizeSqm, setBuildingSizeSqm] = useState<number | undefined>(240);
  const [tenure, setTenure] = useState<'Mailo' | 'Freehold' | 'Leasehold' | 'Customary'>('Mailo');
  const [furnished] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Parking',
    'Security',
    'Water Reservoir',
    'Perimeter Wall'
  ]);
  const [selectedPhoto, setSelectedPhoto] = useState(kiraHomeImg);

  // Advertiser info
  const [advertiserType, setAdvertiserType] = useState<'Owner' | 'Agent' | 'Developer'>('Owner');
  const [advertiserName, setAdvertiserName] = useState(currentUser?.name || 'Property Owner');
  const [advertiserPhone, setAdvertiserPhone] = useState(currentUser?.phone || '+256 772 000 000');
  const [agencyName] = useState(currentUser?.company || '');

  // Filter properties submitted by this user/advertiser
  const myProperties = properties.filter(p => 
    (currentUser && p.advertiser.email === currentUser.email) ||
    p.advertiser.name === advertiserName ||
    p.id.startsWith('prop-custom')
  );

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleSubmitListing = (_status: 'pending' | 'draft') => {
    if (!currentUser) {
      openAuthModal('Please sign in or create an account to submit your listing for verification.');
      return;
    }

    addProperty({
      title: title || 'Modern Property Listing',
      transaction,
      propertyType,
      price: Number(price),
      currency: 'UGX',
      pricePeriod: transaction === 'rent' ? 'month' : 'total',
      location,
      district,
      address: address || `${location}, ${district}`,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parking: Number(parking),
      landSizeDecimals: landSizeDecimals ? Number(landSizeDecimals) : undefined,
      buildingSizeSqm: buildingSizeSqm ? Number(buildingSizeSqm) : undefined,
      tenure,
      furnished,
      description: description || 'Beautifully located property with high-quality infrastructure access.',
      features: selectedFeatures,
      images: [selectedPhoto, kololoAptImg],
      advertiser: {
        id: currentUser.id,
        name: advertiserName || currentUser.name,
        type: advertiserType,
        phone: advertiserPhone || currentUser.phone,
        whatsapp: (advertiserPhone || currentUser.phone).replace(/\s+/g, ''),
        email: currentUser.email,
        agencyName: agencyName || undefined,
        verified: false,
        responseRate: 'New listing'
      }
    });

    setActiveTab('my_properties');
  };

  // Preview dummy property object for the live card preview
  const previewProperty: Property = {
    id: 'preview-id',
    slug: 'preview',
    title: title || '4-Bedroom Contemporary Family Home',
    transaction,
    propertyType,
    price: Number(price) || 450000000,
    currency: 'UGX',
    pricePeriod: transaction === 'rent' ? 'month' : 'total',
    location: location || 'Kira',
    district: district || 'Wakiso',
    address: address || 'Kira Municipality',
    bedrooms: Number(bedrooms),
    bathrooms: Number(bathrooms),
    parking: Number(parking),
    landSizeDecimals: landSizeDecimals ? Number(landSizeDecimals) : undefined,
    buildingSizeSqm: buildingSizeSqm ? Number(buildingSizeSqm) : undefined,
    tenure,
    furnished,
    availability: 'Available',
    verificationStatus: 'pending',
    listingStatus: 'pending',
    description: description || 'Property description preview...',
    features: selectedFeatures,
    images: [selectedPhoto],
    advertiser: {
      id: 'adv-preview',
      name: advertiserName,
      type: advertiserType,
      phone: advertiserPhone,
      whatsapp: advertiserPhone,
      email: currentUser?.email || 'owner@realityestates.ug',
      verified: false,
      responseRate: '95%'
    },
    verificationDetails: {
      advertiserVerified: false,
      locationConfirmed: false,
      priceConfirmed: false,
      availabilityConfirmed: false
    },
    coordinates: { lat: 0.3984, lng: 32.6391 },
    featured: false,
    dateAdded: 'Today'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      
      {/* Top Banner */}
      <div className="bg-stone-900 dark:bg-stone-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-800 transition-colors">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md">
            <Building2 className="w-3.5 h-3.5" />
            <span>Supplier & Agent Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            List Your Property on Reality Estates
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
            Reach serious local and diaspora buyers. Our dedicated verification team ensures your property receives verified status to maximize qualified viewing enquiries.
          </p>
        </div>

        {/* View toggle tabs */}
        <div className="flex rounded-lg bg-stone-800 dark:bg-stone-900 p-1 shrink-0 self-start md:self-auto border border-stone-700/60">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-2 px-4 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'add' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'
            }`}
          >
            Add New Property
          </button>
          <button
            onClick={() => setActiveTab('my_properties')}
            className={`py-2 px-4 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'my_properties' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'
            }`}
          >
            My Listings ({myProperties.length})
          </button>
        </div>
      </div>

      {activeTab === 'add' ? (
        /* Multi-step Form & Live Card Preview */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: 8 cols */}
          <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-6 transition-colors">
            
            {/* Step 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] flex items-center justify-center font-bold">1</span>
                <span>Basic Property Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransaction('buy')}
                      className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                        transaction === 'buy' 
                          ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                          : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransaction('rent')}
                      className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                        transaction === 'rent' 
                          ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                          : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  >
                    <option value="House">Residential House / Villa</option>
                    <option value="Apartment">Apartment / Condominium</option>
                    <option value="Land">Titled Land / Plot</option>
                    <option value="Commercial">Commercial Building</option>
                    <option value="Office">Corporate Office</option>
                    <option value="Warehouse">Warehouse / Industrial</option>
                    <option value="Shop">Retail Shop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Listing Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Bedroom Contemporary Family Home"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Price in UGX {transaction === 'rent' ? '(per month)' : ''}
                  </label>
                  <input
                    type="number"
                    required
                    step={1000000}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden tabular-nums"
                  />
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                    Formatted: <strong className="text-stone-700 dark:text-stone-300">{formatUGX(price)}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tenure / Title Type
                  </label>
                  <select
                    value={tenure}
                    onChange={e => setTenure(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  >
                    <option value="Mailo">Private Mailo Title</option>
                    <option value="Freehold">Freehold Title</option>
                    <option value="Leasehold">Leasehold Title (KCCA/Municipal)</option>
                    <option value="Customary">Customary Title</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Location & Coordinates */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] flex items-center justify-center font-bold">2</span>
                <span>Location & Demarcation</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Area / Suburb
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kira, Kololo, Naguru, Ntinda"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  >
                    <option value="Kampala">Kampala</option>
                    <option value="Wakiso">Wakiso</option>
                    <option value="Mukono">Mukono</option>
                    <option value="Entebbe">Entebbe</option>
                    <option value="Jinja">Jinja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Physical Address / Road
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 24, Kitukutwe Road, Kira Municipality"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Step 3: Characteristics & Dimensions */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] flex items-center justify-center font-bold">3</span>
                <span>Specifications & Dimensions</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={e => setBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={bathrooms}
                    onChange={e => setBathrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Parking</label>
                  <input
                    type="number"
                    min={0}
                    value={parking}
                    onChange={e => setParking(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Land (Decimals)</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={landSizeDecimals || ''}
                    onChange={e => setLandSizeDecimals(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Property Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the layout, solar or generator backup, perimeter wall, neighborhood safety, and road connectivity..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Features Checklist */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Select Features & Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITY_OPTIONS.map(opt => {
                    const isChecked = selectedFeatures.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleFeature(opt)}
                        className={`py-2 px-3 text-xs rounded-lg border text-left flex items-center justify-between transition-colors ${
                          isChecked 
                            ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium' 
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 4: High-Resolution Photo Selection */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] flex items-center justify-center font-bold">4</span>
                <span>Select High-Resolution Photography</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SAMPLE_PHOTO_CHOICES.map(photo => (
                  <div
                    key={photo.label}
                    onClick={() => setSelectedPhoto(photo.url)}
                    className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 cursor-pointer transition-all ${
                      selectedPhoto === photo.url 
                        ? 'border-stone-900 dark:border-stone-100 ring-2 ring-stone-900/20 dark:ring-white/20' 
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                      {photo.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Advertiser Contact Information */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] flex items-center justify-center font-bold">5</span>
                <span>Listing Representative Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Role</label>
                  <select
                    value={advertiserType}
                    onChange={e => setAdvertiserType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="Owner">Direct Owner</option>
                    <option value="Agent">Real Estate Agent</option>
                    <option value="Developer">Property Developer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={advertiserName}
                    onChange={e => setAdvertiserName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={advertiserPhone}
                    onChange={e => setAdvertiserPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleSubmitListing('draft')}
                className="w-full sm:w-auto py-2.5 px-5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmitListing('pending')}
                className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Submit for Verification</span>
              </button>
            </div>

          </div>

          {/* Right: Sticky Live Card Preview (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  Live Marketplace Preview
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded font-semibold uppercase">
                  Pending Review
                </span>
              </div>

              {/* Render simulated PropertyCard */}
              <div className="pointer-events-none">
                <PropertyCard property={previewProperty} />
              </div>

              <div className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 p-3 rounded-lg border border-stone-100 dark:border-stone-700 space-y-1">
                <p className="font-semibold text-stone-800 dark:text-stone-200">Inspection & Review Process:</p>
                <p>
                  Upon submission, your listing is assigned to a Reality Estates field inspector who verifies the coordinates and documentation before granting the public verified badge.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* My Properties Management View */
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                My Listed Properties
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Manage your active submissions, verification flags, and published statuses.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('add')}
              className="py-2 px-3.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Another Listing</span>
            </button>
          </div>

          {/* Properties Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Property</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Listing Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {myProperties.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">{p.title}</p>
                          <p className="text-[11px] text-stone-400 dark:text-stone-500">{p.location}, {p.district}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-700 dark:text-stone-300">{p.propertyType}</td>
                    <td className="py-3 px-3 font-bold text-stone-900 dark:text-white tabular-nums">
                      {formatUGX(p.price, true)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.verificationStatus === 'verified' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {p.verificationStatus === 'verified' ? <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] uppercase font-bold text-stone-600 dark:text-stone-400">
                        {p.listingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigateTo(`/properties/${p.slug}`)}
                        className="text-stone-900 dark:text-stone-100 font-semibold hover:underline"
                      >
                        View Page
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

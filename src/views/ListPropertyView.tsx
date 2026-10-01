import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Property, PropertyType, TransactionType } from '../types/property';
import { PropertyCard } from '../components/PropertyCard';
import { formatUGX } from '../utils/formatters';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Image as ImageIcon, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Info,
  Sparkles
} from 'lucide-react';
import { UGANDAN_REGIONS, ALL_UGANDAN_DISTRICTS, POPULAR_NEIGHBORHOODS } from '../data/ugandaLocations';

const PRESET_IMAGE_OPTIONS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
];

const AMENITY_OPTIONS = [
  'Parking',
  'Garden',
  'Swimming Pool',
  'Furnished',
  'Security Guards',
  'Water Reservoir',
  'Generator Backup',
  'Servants Quarters',
  'Balcony',
  'Air Conditioning',
  'Perimeter Wall',
  'Solar Backup',
  'CCTV Surveillance',
  'Paved Compound'
];

export const ListPropertyView: React.FC = () => {
  const { currentUser, openAuthModal, addProperty, navigateTo, showToast } = useApp();

  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'create' | 'guidelines'>('create');

  // Form states
  const [transaction, setTransaction] = useState<TransactionType>('buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(350000000);
  const [pricePeriod, setPricePeriod] = useState<'month' | 'year' | 'total'>('total');
  const [district, setDistrict] = useState('Wakiso');
  const [location, setLocation] = useState('Kira');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(0.4002);
  const [lng, setLng] = useState(32.6412);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);
  const [parking, setParking] = useState(2);
  const [landSizeDecimals, setLandSizeDecimals] = useState<number | undefined>(15);
  const [buildingSizeSqm, setBuildingSizeSqm] = useState<number | undefined>(220);
  const [tenure, setTenure] = useState<'Mailo' | 'Freehold' | 'Leasehold' | 'Customary'>('Mailo');
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Perimeter Wall',
    'Water Reservoir',
    'Security Guards',
    'Parking'
  ]);
  const [imageUrls, setImageUrls] = useState<string[]>([PRESET_IMAGE_OPTIONS[0]]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  
  // Advertiser
  const [advertiserType, setAdvertiserType] = useState<'Owner' | 'Agent' | 'Developer'>(
    currentUser?.role === 'agent' ? 'Agent' : currentUser?.role === 'developer' ? 'Developer' : 'Owner'
  );
  const [advertiserName, setAdvertiserName] = useState(currentUser?.name || '');
  const [advertiserPhone, setAdvertiserPhone] = useState(currentUser?.phone || '+256 700 000 000');
  const [advertiserWhatsapp, setAdvertiserWhatsapp] = useState(currentUser?.phone || '+256 700 000 000');
  const [advertiserEmail, setAdvertiserEmail] = useState(currentUser?.email || '');
  const [agencyName, setAgencyName] = useState(currentUser?.company || '');
  const [agreeVerification, setAgreeVerification] = useState(true);

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleAddImage = (url: string) => {
    if (url && !imageUrls.includes(url)) {
      setImageUrls([...imageUrls, url]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmitListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please provide a property title.', 'error');
      setStep(1);
      return;
    }

    if (!price || price <= 0) {
      showToast('Please specify a valid property price in UGX.', 'error');
      setStep(1);
      return;
    }

    const newProperty = addProperty({
      title: title.trim(),
      transaction,
      propertyType,
      price: Number(price),
      currency: 'UGX',
      pricePeriod: transaction === 'rent' ? 'month' : 'total',
      location: location.trim(),
      district: district.trim(),
      address: address.trim() || `${location}, ${district}`,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parking: Number(parking),
      landSizeDecimals: landSizeDecimals ? Number(landSizeDecimals) : undefined,
      buildingSizeSqm: buildingSizeSqm ? Number(buildingSizeSqm) : undefined,
      tenure,
      description: description.trim() || `Newly listed ${propertyType.toLowerCase()} located in ${location}, ${district}. Features modern finishes and excellent access roads.`,
      features: selectedFeatures,
      images: imageUrls.length > 0 ? imageUrls : [PRESET_IMAGE_OPTIONS[0]],
      coordinates: { lat, lng },
      advertiser: {
        id: currentUser?.id || `adv-${Date.now()}`,
        name: advertiserName.trim() || 'Property Representative',
        type: advertiserType,
        phone: advertiserPhone.trim(),
        whatsapp: advertiserWhatsapp.trim(),
        email: advertiserEmail.trim() || 'info@realityestates.ug',
        agencyName: agencyName.trim() || undefined,
        verified: true,
        responseRate: 'Replies in ~30 mins'
      },
      verificationStatus: 'pending',
      listingStatus: 'published',
      availability: 'Available',
      featured: false,
      dateAdded: new Date().toISOString().split('T')[0],
      verificationDetails: {
        advertiserVerified: true,
        locationConfirmed: true,
        priceConfirmed: true,
        availabilityConfirmed: true,
        verifiedAt: new Date().toISOString().split('T')[0],
        notes: 'Submitted for Pearl Prime marketplace verification'
      }
    });

    navigateTo(`/properties/${newProperty.slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Listing Portal for Owners, Agents & Developers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            List Your Property on Reality Estates
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Reach thousands of serious verified buyers and tenants. Transparent inquiries, zero hidden portal charges, and optional on-site GPS verification.
          </p>
        </div>
      </div>

      {/* Main Wizard Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Wizard Progress & Form (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-8 transition-colors">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 overflow-x-auto">
            {[
              { num: 1, label: 'Basics & Price' },
              { num: 2, label: 'Location & GPS' },
              { num: 3, label: 'Specs & Features' },
              { num: 4, label: 'Photos' },
              { num: 5, label: 'Representative' },
            ].map(s => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 text-xs font-semibold whitespace-nowrap px-2 py-1 rounded-md transition-colors ${
                  step === s.num
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                    : step > s.num
                    ? 'text-stone-800 dark:text-stone-200'
                    : 'text-stone-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === s.num
                    ? 'bg-emerald-600 text-white'
                    : step > s.num
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                }`}>
                  {s.num}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmitListing} className="space-y-6">
            
            {/* STEP 1: BASICS & PRICE */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  1. Property Type & Pricing
                </h3>

                {/* Transaction Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Listing Purpose</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTransaction('buy')}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                        transaction === 'buy'
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      For Sale (Outright Purchase)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransaction('rent')}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                        transaction === 'rent'
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      For Rent (Tenancy)
                    </button>
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                  >
                    <option value="House">House (Bungalow, Villa, Duplex)</option>
                    <option value="Apartment">Apartment / Condominium</option>
                    <option value="Land">Land / Surveyed Plot</option>
                    <option value="Commercial">Commercial Building</option>
                    <option value="Office">Office Space</option>
                    <option value="Shop">Retail Shop</option>
                    <option value="Warehouse">Industrial Warehouse</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Listing Headline / Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Elegant 4-Bedroom Villa with Swimming Pool in Kololo"
                    className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                {/* Price in UGX */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Price in Uganda Shillings (UGX)
                    </label>
                    <span className="text-xs font-serif font-bold text-emerald-600 dark:text-emerald-400">
                      {formatUGX(price || 0)}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min="100000"
                    step="500000"
                    placeholder="350000000"
                    className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {transaction === 'rent' ? 'Advertised monthly rent rate' : 'Total purchase price (UGX)'}
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 py-2.5 px-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-white"
                  >
                    <span>Next: Location & Coordinates</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION & GPS */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  2. Location & Cadastral Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span>District / Region</span>
                      <span className="text-[10px] text-stone-400 font-normal">All 136 Districts</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      {UGANDAN_REGIONS.map((region) => (
                        <optgroup key={region.name} label={`── ${region.name} ──`}>
                          {region.districts.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Neighborhood / Area</label>
                      <span className="text-[10px] text-stone-400 font-normal">Type freely</span>
                    </div>
                    <input
                      type="text"
                      list="uganda-neighborhood-suggestions"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Type neighborhood (e.g. Kololo, Kira, Naguru, Najjera)..."
                      className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                      required
                    />
                    <datalist id="uganda-neighborhood-suggestions">
                      {POPULAR_NEIGHBORHOODS.map(nh => (
                        <option key={nh} value={nh} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Specific Street / Landmark Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 14, Prince Charles Drive, Kololo Hill"
                    className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* GPS Coordinates */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-100 dark:border-stone-700/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-white">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>GPS Coordinates (Crucial for Verification Badge)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-stone-500 dark:text-stone-400">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(Number(e.target.value))}
                        className="w-full mt-1 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 dark:text-stone-400">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={lng}
                        onChange={(e) => setLng(Number(e.target.value))}
                        className="w-full mt-1 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 py-2.5 px-4 text-stone-600 dark:text-stone-300 text-xs font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 py-2.5 px-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-white"
                  >
                    <span>Next: Specifications</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SPECS & FEATURES */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  3. Specifications & Amenities
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Bedrooms</label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      min="0"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Bathrooms</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      min="0"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Parking Spots</label>
                    <input
                      type="number"
                      value={parking}
                      onChange={(e) => setParking(Number(e.target.value))}
                      min="0"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Plot Size (Decimals)</label>
                    <input
                      type="number"
                      value={landSizeDecimals || ''}
                      onChange={(e) => setLandSizeDecimals(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g. 15 decimals"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Floor Area (m²)</label>
                    <input
                      type="number"
                      value={buildingSizeSqm || ''}
                      onChange={(e) => setBuildingSizeSqm(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g. 240 m²"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Title Tenure</label>
                    <select
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value as any)}
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    >
                      <option value="Mailo">Mailo Title</option>
                      <option value="Freehold">Freehold Title</option>
                      <option value="Leasehold">Leasehold Title</option>
                      <option value="Customary">Customary</option>
                    </select>
                  </div>
                </div>

                {/* Amenities checklist */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Amenities & Features</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITY_OPTIONS.map(amenity => (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedFeatures.includes(amenity)
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(amenity)}
                          onChange={() => toggleFeature(amenity)}
                          className="rounded text-emerald-600 focus:ring-0"
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe compound space, proximity to schools, security details, finishes..."
                    className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 py-2.5 px-4 text-stone-600 dark:text-stone-300 text-xs font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 py-2.5 px-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-white"
                  >
                    <span>Next: Photographs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PHOTOGRAPHS */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  4. High-Quality Photography
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Select curated property photos or paste direct image links.
                </p>

                {/* Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {PRESET_IMAGE_OPTIONS.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddImage(img)}
                      className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all ${
                        imageUrls.includes(img)
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                          : 'border-transparent hover:opacity-80'
                      }`}
                    >
                      <img src={img} alt="Preset" className="w-full h-full object-cover" />
                      {imageUrls.includes(img) && (
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste external image URL (https://...)"
                    className="flex-1 text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(customImageUrl)}
                    className="py-2.5 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                    Add
                  </button>
                </div>

                {/* Active images list */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Selected Photos ({imageUrls.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative aspect-4/3 rounded-xl overflow-hidden group border border-stone-200 dark:border-stone-700">
                        <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 py-2.5 px-4 text-stone-600 dark:text-stone-300 text-xs font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="flex items-center gap-2 py-2.5 px-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl hover:bg-stone-800 dark:hover:bg-white"
                  >
                    <span>Next: Representative</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: REPRESENTATIVE & SUBMIT */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  5. Representative Mandate & Direct Contacts
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">I am the:</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Owner', 'Agent', 'Developer'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAdvertiserType(t as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                          advertiserType === t
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Contact Person Name</label>
                    <input
                      type="text"
                      value={advertiserName}
                      onChange={(e) => setAdvertiserName(e.target.value)}
                      placeholder="e.g. Christine Nakato"
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Direct Phone Number</label>
                    <input
                      type="tel"
                      value={advertiserPhone}
                      onChange={(e) => setAdvertiserPhone(e.target.value)}
                      placeholder="+256 772 123 456"
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={advertiserWhatsapp}
                      onChange={(e) => setAdvertiserWhatsapp(e.target.value)}
                      placeholder="+256 701 123 456"
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Agency / Company Name (Optional)</label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="e.g. Pearl Prime Real Estate"
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Verification agreement */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeVerification}
                    onChange={(e) => setAgreeVerification(e.target.checked)}
                    className="rounded text-emerald-600 mt-0.5 focus:ring-0"
                    required
                  />
                  <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    <strong className="text-stone-900 dark:text-white">Request Pearl Prime Verification:</strong> I confirm that I possess legal mandate to advertise this property. Reality Estates verification officers may inspect boundary markers, verify land tenure records, and confirm listing accuracy.
                  </div>
                </label>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 py-2.5 px-4 text-stone-600 dark:text-stone-300 text-xs font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Publish Property Listing
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">
                Live Preview
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Draft Card
              </span>
            </div>

            <PropertyCard
              property={{
                id: 'preview-temp',
                slug: 'preview',
                title: title.trim() || 'Your Property Title Will Appear Here',
                transaction,
                propertyType,
                price: Number(price) || 0,
                currency: 'UGX',
                pricePeriod: transaction === 'rent' ? 'month' : 'total',
                location: location || 'Location',
                district: district || 'District',
                address: address || 'Address',
                bedrooms: Number(bedrooms),
                bathrooms: Number(bathrooms),
                parking: Number(parking),
                landSizeDecimals: landSizeDecimals ? Number(landSizeDecimals) : undefined,
                buildingSizeSqm: buildingSizeSqm ? Number(buildingSizeSqm) : undefined,
                tenure,
                description: description || 'Property description preview...',
                features: selectedFeatures,
                images: imageUrls.length > 0 ? imageUrls : [PRESET_IMAGE_OPTIONS[0]],
                coordinates: { lat, lng },
                advertiser: {
                  id: 'preview-adv',
                  name: advertiserName || 'Representative',
                  type: advertiserType,
                  phone: advertiserPhone,
                  whatsapp: advertiserWhatsapp,
                  email: advertiserEmail,
                  verified: true
                },
                verificationStatus: 'verified',
                listingStatus: 'published',
                availability: 'Available',
                dateAdded: 'Today',
                verificationDetails: {
                  advertiserVerified: true,
                  locationConfirmed: true,
                  priceConfirmed: true,
                  availabilityConfirmed: true
                }
              }}
            />
          </div>
        </div>

      </div>

    </div>
  );
};

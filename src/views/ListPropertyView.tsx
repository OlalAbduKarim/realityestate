import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  AdvertiserType,
  CurrencyCode,
  LandTenure,
  ListingStatus,
  PersistedPropertyImage,
  PricePeriod,
  PropertyType,
  TransactionType
} from '../types/property';
import { LocalSelectedImage, ManagedPersistedImage } from '../types/api';
import { PropertyCard } from '../components/PropertyCard';
import { formatCurrency } from '../utils/formatters';
import {
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Sparkles,
  Upload,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UGANDAN_REGIONS, POPULAR_NEIGHBORHOODS } from '../data/ugandaLocations';

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

interface ListPropertyViewProps {
  editPropertyId?: string;
}

export const ListPropertyView: React.FC<ListPropertyViewProps> = ({ editPropertyId }) => {
  const {
    currentUser,
    isStorageConfigured,
    getPropertyById,
    createProperty,
    updateProperty,
    validatePropertyImageFile,
    uploadPropertyImages,
    removePropertyImage,
    reorderPropertyImages,
    navigateTo,
    showToast
  } = useApp();

  const existingProperty = editPropertyId ? getPropertyById(editPropertyId) : undefined;

  // Tracks the saved property ID once created (or when editing an existing property)
  // so failed image uploads can be retried without recreating the property record.
  const [savedPropertyId, setSavedPropertyId] = useState<string | undefined>(
    existingProperty?.id
  );
  const [savedPropertySlug, setSavedPropertySlug] = useState<string | undefined>(
    existingProperty?.slug
  );

  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectingFiles, setIsSelectingFiles] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [transaction, setTransaction] = useState<TransactionType>(
    existingProperty?.transaction || 'buy'
  );
  const [propertyType, setPropertyType] = useState<PropertyType>(
    existingProperty?.propertyType || 'House'
  );
  const [title, setTitle] = useState(existingProperty?.title || '');
  const [currency, setCurrency] = useState<CurrencyCode>(
    existingProperty?.currency || 'UGX'
  );
  const [price, setPrice] = useState<number>(existingProperty?.price || 350000000);
  const [pricePeriod, setPricePeriod] = useState<PricePeriod>(
    existingProperty?.pricePeriod || 'total'
  );
  const [district, setDistrict] = useState(existingProperty?.district || 'Wakiso');
  const [location, setLocation] = useState(existingProperty?.location || 'Kira');
  const [address, setAddress] = useState(existingProperty?.address || '');
  const [lat, setLat] = useState(existingProperty?.coordinates?.lat ?? 0.4002);
  const [lng, setLng] = useState(existingProperty?.coordinates?.lng ?? 32.6412);
  const [bedrooms, setBedrooms] = useState(existingProperty?.bedrooms ?? 3);
  const [bathrooms, setBathrooms] = useState(existingProperty?.bathrooms ?? 3);
  const [parking, setParking] = useState(existingProperty?.parking ?? 2);
  const [landSizeDecimals, setLandSizeDecimals] = useState<number | undefined>(
    existingProperty?.landSizeDecimals ?? 15
  );
  const [buildingSizeSqm, setBuildingSizeSqm] = useState<number | undefined>(
    existingProperty?.buildingSizeSqm ?? 220
  );
  const [tenure, setTenure] = useState<LandTenure>(existingProperty?.tenure || 'Mailo');
  const [furnished, setFurnished] = useState<boolean>(
    existingProperty?.furnished ?? false
  );
  const [description, setDescription] = useState(existingProperty?.description || '');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    existingProperty?.features || [
      'Perimeter Wall',
      'Water Reservoir',
      'Security Guards',
      'Parking'
    ]
  );

  // B. Persisted Images (permanent URLs or Supabase Storage records - NEVER blob: URLs)
  const [persistedImages, setPersistedImages] = useState<ManagedPersistedImage[]>(() => {
    if (existingProperty) {
      if (existingProperty.propertyImages && existingProperty.propertyImages.length > 0) {
        return [...existingProperty.propertyImages]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((img, idx) => ({
            ...img,
            displayOrder: idx,
            deleteState: 'idle'
          }));
      }
      return (existingProperty.images || []).map((url, idx) => ({
        id: `${existingProperty.id}-img-${idx}`,
        propertyId: existingProperty.id,
        url,
        displayOrder: idx,
        deleteState: 'idle'
      }));
    }
    return [];
  });

  // A. Local Selected Files (temporary object URL previews before upload)
  const [localFiles, setLocalFiles] = useState<LocalSelectedImage[]>([]);
  const localFilesRef = useRef<LocalSelectedImage[]>([]);
  localFilesRef.current = localFiles;

  const [customImageUrl, setCustomImageUrl] = useState('');

  // Revoke all remaining temporary object URLs when component unmounts
  useEffect(() => {
    return () => {
      localFilesRef.current.forEach((item) => {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  // Synchronize state if existingProperty loads asynchronously in edit mode
  useEffect(() => {
    if (!existingProperty) return;
    setSavedPropertyId(existingProperty.id);
    setSavedPropertySlug(existingProperty.slug);
    setTransaction(existingProperty.transaction);
    setPropertyType(existingProperty.propertyType);
    setTitle(existingProperty.title);
    setCurrency(existingProperty.currency);
    setPrice(existingProperty.price);
    setPricePeriod(
      existingProperty.pricePeriod ||
        (existingProperty.transaction === 'rent' ? 'month' : 'total')
    );
    setDistrict(existingProperty.district);
    setLocation(existingProperty.location);
    setAddress(existingProperty.address);
    setLat(existingProperty.coordinates.lat);
    setLng(existingProperty.coordinates.lng);
    setBedrooms(existingProperty.bedrooms);
    setBathrooms(existingProperty.bathrooms);
    setParking(existingProperty.parking);
    setLandSizeDecimals(existingProperty.landSizeDecimals);
    setBuildingSizeSqm(existingProperty.buildingSizeSqm);
    if (existingProperty.tenure) setTenure(existingProperty.tenure);
    setFurnished(Boolean(existingProperty.furnished));
    setDescription(existingProperty.description);
    setSelectedFeatures(existingProperty.features || []);

    const initialPersisted: ManagedPersistedImage[] =
      existingProperty.propertyImages && existingProperty.propertyImages.length > 0
        ? [...existingProperty.propertyImages]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((img, idx) => ({
              ...img,
              displayOrder: idx,
              deleteState: 'idle'
            }))
        : (existingProperty.images || []).map((url, idx) => ({
            id: `${existingProperty.id}-img-${idx}`,
            propertyId: existingProperty.id,
            url,
            displayOrder: idx,
            deleteState: 'idle'
          }));
    setPersistedImages(initialPersisted);
  }, [existingProperty?.id]);

  // Advertiser
  const [advertiserType, setAdvertiserType] = useState<AdvertiserType>(
    existingProperty?.advertiser?.type ||
      (currentUser?.role === 'agent'
        ? 'Agent'
        : currentUser?.role === 'developer'
        ? 'Developer'
        : 'Owner')
  );
  const [advertiserName, setAdvertiserName] = useState(
    existingProperty?.advertiser?.name || currentUser?.name || ''
  );
  const [advertiserPhone, setAdvertiserPhone] = useState(
    existingProperty?.advertiser?.phone || currentUser?.phone || '+256 700 000 000'
  );
  const [advertiserWhatsapp, setAdvertiserWhatsapp] = useState(
    existingProperty?.advertiser?.whatsapp || currentUser?.phone || '+256 700 000 000'
  );
  const [advertiserEmail, setAdvertiserEmail] = useState(
    existingProperty?.advertiser?.email || currentUser?.email || ''
  );
  const [agencyName, setAgencyName] = useState(
    existingProperty?.advertiser?.agencyName || currentUser?.company || ''
  );
  const [agreeVerification, setAgreeVerification] = useState(true);

  const handleTransactionChange = (nextTx: TransactionType) => {
    setTransaction(nextTx);
    setPricePeriod(nextTx === 'rent' ? 'month' : 'total');
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  // Add a permanent hosted URL (preset or external https:// URL)
  const handleAddHostedImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase().startsWith('blob:') || !/^https?:\/\/.+/i.test(trimmed)) {
      showToast('Please enter a permanent http:// or https:// image URL.', 'error');
      return;
    }
    if (!persistedImages.some((img) => img.url === trimmed)) {
      const nextImage: ManagedPersistedImage = {
        id: `hosted-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        propertyId: savedPropertyId || '',
        url: trimmed,
        displayOrder: persistedImages.length,
        deleteState: 'idle'
      };
      setPersistedImages((prev) => [...prev, nextImage]);
      setCustomImageUrl('');
    }
  };

  // Remove a persisted image (from Supabase Storage + property_images if already persisted on a saved property)
  const handleRemovePersistedImage = async (target: ManagedPersistedImage) => {
    if (target.deleteState === 'deleting') return;

    // If this property has not been saved to the database yet and the image has no storagePath, remove locally
    if (!savedPropertyId) {
      setPersistedImages((prev) =>
        prev
          .filter((img) => img.id !== target.id)
          .map((img, idx) => ({ ...img, displayOrder: idx }))
      );
      return;
    }

    setPersistedImages((prev) =>
      prev.map((img) =>
        img.id === target.id
          ? { ...img, deleteState: 'deleting', deleteError: undefined }
          : img
      )
    );

    try {
      await removePropertyImage(savedPropertyId, {
        id: target.id,
        storagePath: target.storagePath,
        url: target.url
      });
      setPersistedImages((prev) =>
        prev
          .filter((img) => img.id !== target.id)
          .map((img, idx) => ({ ...img, displayOrder: idx }))
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete photograph.';
      setPersistedImages((prev) =>
        prev.map((img) =>
          img.id === target.id
            ? { ...img, deleteState: 'delete_failed', deleteError: errorMessage }
            : img
        )
      );
    }
  };

  // Reorder persisted images and update database ordering when editing an existing property
  const handleMovePersistedImage = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= persistedImages.length) return;

    const reordered = [...persistedImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const normalized = reordered.map((img, idx) => ({
      ...img,
      displayOrder: idx
    }));

    setPersistedImages(normalized);

    if (savedPropertyId) {
      try {
        await reorderPropertyImages(savedPropertyId, normalized);
      } catch {
        // Error surfaced by context toast
      }
    }
  };

  // Reorder queued local files before upload
  const handleMoveLocalFile = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= localFiles.length) return;
    setLocalFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  // Select local files from device, validate JPEG/PNG/WebP & max 5MB, create temporary object URLs
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsSelectingFiles(true);
    setFormError(null);

    try {
      const incomingFiles = Array.from(fileList);
      const validSelected: LocalSelectedImage[] = [];
      const errors: string[] = [];

      for (let i = 0; i < incomingFiles.length; i++) {
        const file = incomingFiles[i];
        try {
          validatePropertyImageFile(file);
          const previewUrl = URL.createObjectURL(file);
          validSelected.push({
            id: `local-file-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            file,
            previewUrl,
            uploadState: 'selected',
            uploadProgress: 0,
            altText: `${title.trim() || 'Property'} - ${file.name}`
          });
        } catch (validationErr) {
          const msg =
            validationErr instanceof Error
              ? validationErr.message
              : `Invalid file "${file.name}".`;
          errors.push(msg);
        }
      }

      if (validSelected.length > 0) {
        setLocalFiles((prev) => [...prev, ...validSelected]);
        showToast(
          isStorageConfigured
            ? `${validSelected.length} photo(s) selected for preview. They will be uploaded to Supabase Storage when you save.`
            : `${validSelected.length} photo(s) selected for local preview. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable permanent cloud uploads.`,
          'info'
        );
      }

      if (errors.length > 0) {
        setFormError(errors.join(' '));
        showToast(errors[0], 'error');
      }
    } finally {
      setIsSelectingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove a local file preview and revoke its object URL immediately
  const handleRemoveLocalFile = (id: string) => {
    setLocalFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  /**
   * Uploads all pending/failed local files for a known `propertyId` sequentially,
   * preserving display ordering and transitioning each succeeded file from
   * `localFiles` (revoking its `blob:` URL) into `persistedImages`.
   */
  const uploadQueuedLocalFilesForProperty = async (
    targetPropertyId: string,
    startingDisplayOrder: number
  ): Promise<{ allSucceeded: boolean; failedCount: number }> => {
    const queue = localFiles.filter(
      (f) => f.uploadState === 'selected' || f.uploadState === 'upload_failed'
    );
    if (queue.length === 0) {
      return { allSucceeded: true, failedCount: 0 };
    }

    setIsUploadingFiles(true);
    let currentOrder = startingDisplayOrder;
    let failedCount = 0;

    for (const item of queue) {
      setLocalFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                uploadState: 'uploading',
                uploadProgress: 15,
                errorMessage: undefined
              }
            : f
        )
      );

      try {
        const uploadedList = await uploadPropertyImages(
          targetPropertyId,
          [item.file],
          currentOrder,
          (_fileIdx, pct) => {
            setLocalFiles((prev) =>
              prev.map((f) =>
                f.id === item.id ? { ...f, uploadProgress: pct } : f
              )
            );
          }
        );

        const persistedRecord = uploadedList[0];
        if (persistedRecord) {
          currentOrder += 1;

          // Add to persisted images state
          setPersistedImages((prev) => [
            ...prev,
            {
              ...persistedRecord,
              deleteState: 'idle'
            }
          ]);

          // Revoke temporary blob: URL and remove from localFiles queue
          if (item.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(item.previewUrl);
          }
          setLocalFiles((prev) => prev.filter((f) => f.id !== item.id));
        }
      } catch (uploadErr) {
        failedCount += 1;
        const errMsg =
          uploadErr instanceof Error
            ? uploadErr.message
            : `Failed to upload "${item.file.name}".`;

        setLocalFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  uploadState: 'upload_failed',
                  uploadProgress: 0,
                  errorMessage: errMsg
                }
              : f
          )
        );
      }
    }

    setIsUploadingFiles(false);
    return {
      allSucceeded: failedCount === 0,
      failedCount
    };
  };

  // Retry a single failed local file upload (when property ID already exists)
  const handleRetrySingleUpload = async (localFileId: string) => {
    if (!savedPropertyId || isUploadingFiles || isSubmitting) return;
    const target = localFiles.find((f) => f.id === localFileId);
    if (!target) return;

    setFormError(null);
    setIsUploadingFiles(true);
    setLocalFiles((prev) =>
      prev.map((f) =>
        f.id === localFileId
          ? {
              ...f,
              uploadState: 'uploading',
              uploadProgress: 15,
              errorMessage: undefined
            }
          : f
      )
    );

    try {
      const uploadedList = await uploadPropertyImages(
        savedPropertyId,
        [target.file],
        persistedImages.length,
        (_idx, pct) => {
          setLocalFiles((prev) =>
            prev.map((f) =>
              f.id === localFileId ? { ...f, uploadProgress: pct } : f
            )
          );
        }
      );

      const persistedRecord = uploadedList[0];
      if (persistedRecord) {
        setPersistedImages((prev) => [
          ...prev,
          { ...persistedRecord, deleteState: 'idle' }
        ]);
        if (target.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(target.previewUrl);
        }
        setLocalFiles((prev) => prev.filter((f) => f.id !== localFileId));
        showToast(`Uploaded "${target.file.name}" to Supabase Storage.`, 'success');
      }
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : `Retry failed for "${target.file.name}".`;
      setLocalFiles((prev) =>
        prev.map((f) =>
          f.id === localFileId
            ? {
                ...f,
                uploadState: 'upload_failed',
                uploadProgress: 0,
                errorMessage: errMsg
              }
            : f
        )
      );
      setFormError(errMsg);
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Retry all failed uploads without recreating the property record
  const handleRetryAllFailedUploads = async () => {
    if (!savedPropertyId || isUploadingFiles || isSubmitting) return;
    setFormError(null);
    const { allSucceeded, failedCount } = await uploadQueuedLocalFilesForProperty(
      savedPropertyId,
      persistedImages.length
    );
    if (allSucceeded) {
      showToast('All property photographs uploaded successfully!', 'success');
      if (savedPropertySlug) {
        navigateTo(`/properties/${savedPropertySlug}`);
      }
    } else {
      setFormError(
        `${failedCount} photograph(s) failed to upload. You can retry or remove the failed file(s).`
      );
    }
  };

  // In-memory preview list for the Live Preview Card ONLY (never persisted directly)
  const livePreviewDisplayUrls = [
    ...persistedImages.map((img) => img.url),
    ...localFiles.map((item) => item.previewUrl)
  ];

  const submitWithStatus = async (
    targetListingStatus: Extract<ListingStatus, 'draft' | 'pending'>
  ) => {
    if (isSubmitting || isUploadingFiles) return;
    setFormError(null);

    // 1. Validate the property form
    if (!title.trim()) {
      const msg = 'Please provide a descriptive property title.';
      setFormError(msg);
      showToast(msg, 'error');
      setStep(1);
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      const msg = `Please specify a valid property price in ${currency}.`;
      setFormError(msg);
      showToast(msg, 'error');
      setStep(1);
      return;
    }

    if (!location.trim() || !district.trim()) {
      const msg = 'Please specify both the Ugandan district and neighborhood.';
      setFormError(msg);
      showToast(msg, 'error');
      setStep(2);
      return;
    }

    if (persistedImages.length === 0 && localFiles.length === 0) {
      const msg = 'Please select at least one property photograph or preset image.';
      setFormError(msg);
      showToast(msg, 'error');
      setStep(4);
      return;
    }

    if (!advertiserName.trim() || !advertiserPhone.trim()) {
      const msg = 'Please provide representative contact name and phone number.';
      setFormError(msg);
      showToast(msg, 'error');
      setStep(5);
      return;
    }

    if (targetListingStatus === 'pending' && !agreeVerification) {
      const msg =
        'Please confirm your legal mandate to submit this property for verification.';
      setFormError(msg);
      showToast(msg, 'error');
      setStep(5);
      return;
    }

    setIsSubmitting(true);
    try {
      // Strictly strip any non-persisted URLs: only pass PersistedPropertyImage records with valid permanent URLs
      const cleanPersisted: PersistedPropertyImage[] = persistedImages
        .filter((img) => !img.url.startsWith('blob:'))
        .map((img, idx) => ({
          id: img.id,
          propertyId: savedPropertyId || img.propertyId,
          storagePath: img.storagePath,
          url: img.url,
          displayOrder: idx,
          altText: img.altText
        }));

      let activeId = savedPropertyId;
      let activeSlug = savedPropertySlug;

      // 2 & 3. Create or update the property record and obtain the resulting property ID
      if (!activeId) {
        const created = await createProperty({
          title: title.trim(),
          transaction,
          propertyType,
          price: Number(price),
          currency,
          pricePeriod,
          location: location.trim(),
          district: district.trim(),
          address: address.trim() || `${location.trim()}, ${district.trim()}`,
          bedrooms: Math.max(0, Number(bedrooms) || 0),
          bathrooms: Math.max(0, Number(bathrooms) || 0),
          parking: Math.max(0, Number(parking) || 0),
          landSizeDecimals: landSizeDecimals ? Number(landSizeDecimals) : undefined,
          buildingSizeSqm: buildingSizeSqm ? Number(buildingSizeSqm) : undefined,
          tenure,
          furnished,
          description:
            description.trim() ||
            `Newly listed ${propertyType.toLowerCase()} located in ${location.trim()}, ${district.trim()}. Features modern finishes and reliable road access.`,
          features: selectedFeatures,
          images: cleanPersisted.map((img) => img.url),
          propertyImages: cleanPersisted,
          coordinates: { lat: Number(lat), lng: Number(lng) },
          advertiser: {
            id: currentUser?.id || `adv-${Date.now()}`,
            name: advertiserName.trim(),
            type: advertiserType,
            phone: advertiserPhone.trim(),
            whatsapp: advertiserWhatsapp.trim() || advertiserPhone.trim(),
            email: advertiserEmail.trim() || 'info@realityestates.ug',
            agencyName: agencyName.trim() || undefined,
            verified: Boolean(currentUser?.verifiedIdentity),
            responseRate: 'Replies in ~30 mins'
          },
          listingStatus: targetListingStatus
        });

        activeId = created.id;
        activeSlug = created.slug;
        setSavedPropertyId(created.id);
        setSavedPropertySlug(created.slug);
        if (created.propertyImages) {
          setPersistedImages(
            created.propertyImages.map((img) => ({
              ...img,
              deleteState: 'idle'
            }))
          );
        }
      } else {
        const updated = await updateProperty(activeId, {
          title: title.trim(),
          transaction,
          propertyType,
          price: Number(price),
          currency,
          pricePeriod,
          location: location.trim(),
          district: district.trim(),
          address: address.trim() || `${location.trim()}, ${district.trim()}`,
          bedrooms: Math.max(0, Number(bedrooms) || 0),
          bathrooms: Math.max(0, Number(bathrooms) || 0),
          parking: Math.max(0, Number(parking) || 0),
          landSizeDecimals: landSizeDecimals ? Number(landSizeDecimals) : undefined,
          buildingSizeSqm: buildingSizeSqm ? Number(buildingSizeSqm) : undefined,
          tenure,
          furnished,
          description: description.trim(),
          features: selectedFeatures,
          images: cleanPersisted.map((img) => img.url),
          propertyImages: cleanPersisted,
          coordinates: { lat: Number(lat), lng: Number(lng) },
          advertiser: {
            name: advertiserName.trim(),
            type: advertiserType,
            phone: advertiserPhone.trim(),
            whatsapp: advertiserWhatsapp.trim() || advertiserPhone.trim(),
            email: advertiserEmail.trim() || 'info@realityestates.ug',
            agencyName: agencyName.trim() || undefined
          },
          listingStatus: targetListingStatus
        });

        activeSlug = updated.slug;
        setSavedPropertySlug(updated.slug);
      }

      // 4, 5, 6, 7. Upload selected local image files to Supabase Storage, create property_images rows, preserve ordering
      if (localFiles.length > 0 && activeId) {
        const { allSucceeded, failedCount } = await uploadQueuedLocalFilesForProperty(
          activeId,
          cleanPersisted.length
        );

        // 8. If any upload fails, clearly report failure and stay on Step 4 so the user can retry without losing form work
        if (!allSucceeded) {
          const uploadErrText = `Unable to upload property images (${failedCount} failed). Please try again using the retry button below.`;
          setFormError(uploadErrText);
          setStep(4);
          return;
        }
      }

      if (activeSlug) {
        navigateTo(`/properties/${activeSlug}`);
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not save property listing.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitWithStatus('pending');
  };

  const hasFailedUploads = localFiles.some((f) => f.uploadState === 'upload_failed');

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
            {existingProperty
              ? `Edit Property: ${existingProperty.title}`
              : 'List Your Property on Reality Estates'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Reach thousands of serious verified buyers and tenants. Transparent inquiries, zero hidden portal charges, and on-site GPS verification before certification.
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
              { num: 5, label: 'Representative' }
            ].map((s) => (
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
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === s.num
                      ? 'bg-emerald-600 text-white'
                      : step > s.num
                      ? 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                  }`}
                >
                  {s.num}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
              {hasFailedUploads && savedPropertyId && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isUploadingFiles || isSubmitting}
                    onClick={handleRetryAllFailedUploads}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Failed Uploads</span>
                  </button>
                  {savedPropertySlug && persistedImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => navigateTo(`/properties/${savedPropertySlug}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-[11px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer"
                    >
                      <span>View Saved Listing</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmitListing} className="space-y-6">
            {/* STEP 1: BASICS & PRICE */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  1. Property Type & Pricing
                </h3>

                {/* Transaction Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Listing Purpose
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTransactionChange('buy')}
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
                      onClick={() => handleTransactionChange('rent')}
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
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Property Type
                  </label>
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
                    <option value="Other">Other Property Type</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Listing Headline / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Elegant 4-Bedroom Villa with Swimming Pool in Kololo"
                    className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                {/* Currency, Price, and Period */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                    >
                      <option value="UGX">UGX (Uganda Shillings)</option>
                      <option value="USD">USD (US Dollars)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Asking Price ({currency})
                      </label>
                      <span className="text-xs font-serif font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(price || 0, currency, true)}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min="1"
                      step={currency === 'UGX' ? '100000' : '100'}
                      placeholder={currency === 'UGX' ? '350000000' : '120000'}
                      className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Price Period
                    </label>
                    <select
                      value={pricePeriod}
                      onChange={(e) => setPricePeriod(e.target.value as PricePeriod)}
                      className="w-full text-xs font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none"
                    >
                      <option value="total">Total Price (Outright)</option>
                      <option value="month">Per Month</option>
                      <option value="year">Per Year</option>
                    </select>
                  </div>
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
                      <span className="text-[10px] text-stone-400 font-normal">
                        Ugandan Districts
                      </span>
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
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Neighborhood / Area
                      </label>
                      <span className="text-[10px] text-stone-400 font-normal">
                        Type freely
                      </span>
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
                      {POPULAR_NEIGHBORHOODS.map((nh) => (
                        <option key={nh} value={nh} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Specific Street / Landmark Address
                  </label>
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
                      <label className="text-[11px] text-stone-500 dark:text-stone-400">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(Number(e.target.value))}
                        className="w-full mt-1 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 dark:text-stone-400">
                        Longitude
                      </label>
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
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Math.max(0, Number(e.target.value)))}
                      min="0"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Math.max(0, Number(e.target.value)))}
                      min="0"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Parking Spots
                    </label>
                    <input
                      type="number"
                      value={parking}
                      onChange={(e) => setParking(Math.max(0, Number(e.target.value)))}
                      min="0"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Plot Size (Decimals)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={landSizeDecimals ?? ''}
                      onChange={(e) =>
                        setLandSizeDecimals(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="e.g. 15 decimals"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Floor Area (m²)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={buildingSizeSqm ?? ''}
                      onChange={(e) =>
                        setBuildingSizeSqm(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="e.g. 240 m²"
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Title Tenure
                    </label>
                    <select
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value as LandTenure)}
                      className="w-full p-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    >
                      <option value="Mailo">Mailo Title</option>
                      <option value="Freehold">Freehold Title</option>
                      <option value="Leasehold">Leasehold Title</option>
                      <option value="Customary">Customary</option>
                    </select>
                  </div>
                </div>

                {/* Furnished toggle */}
                <label className="inline-flex items-center gap-2.5 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={furnished}
                    onChange={(e) => setFurnished(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Property is offered furnished</span>
                </label>

                {/* Amenities checklist */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Amenities & Features
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITY_OPTIONS.map((amenity) => (
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
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Description
                  </label>
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
                  Upload JPEG, PNG, or WebP photographs (max 5 MB per photo) to Supabase Storage, or paste permanent hosted image URLs.
                </p>

                {/* Device Image Upload (Local Selected Files -> Uploaded after Property ID exists) */}
                <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      Select Local Image Files (JPEG, PNG, WebP • Max 5 MB)
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Shows an instant preview now and uploads to Supabase Storage (properties/&#123;propertyId&#125;/&#123;uuid&#125;.&#123;ext&#125;) when saved.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFileSelection}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isSelectingFiles || isUploadingFiles || isSubmitting}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 py-2 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSelectingFiles ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                          <span>Selecting...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Choose Image Files</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Custom URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste hosted image URL (https://...)"
                    className="flex-1 text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddHostedImage(customImageUrl)}
                    className="py-2.5 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl"
                  >
                    Add URL
                  </button>
                </div>

                {/* Active Images List (Persisted Images + Queued Local Previews) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Persisted & Queued Photos ({persistedImages.length + localFiles.length})
                    </div>
                    {persistedImages.length > 1 && (
                      <span className="text-[11px] text-stone-400">
                        Use arrows to reorder display sequence
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* B. Persisted Images */}
                    {persistedImages.map((img, i) => {
                      const isDeleting = img.deleteState === 'deleting';
                      const isDeleteFailed = img.deleteState === 'delete_failed';
                      return (
                        <div
                          key={img.id}
                          className={`relative aspect-4/3 rounded-xl overflow-hidden group border ${
                            isDeleteFailed
                              ? 'border-rose-500 ring-1 ring-rose-500/40'
                              : 'border-stone-200 dark:border-stone-700'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.altText || `Photo ${i + 1}`}
                            className={`w-full h-full object-cover ${
                              isDeleting ? 'opacity-40' : ''
                            }`}
                          />

                          {/* Order Badge & Status */}
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-stone-900/80 text-white text-[9px] font-medium flex items-center gap-1">
                            <span>#{i + 1}</span>
                            <span>•</span>
                            <span>
                              {img.storagePath ? 'Supabase Storage' : 'Persisted URL'}
                            </span>
                          </span>

                          {/* Reorder Controls */}
                          {!isDeleting && (
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 opacity-90 group-hover:opacity-100">
                              <button
                                type="button"
                                disabled={i === 0}
                                onClick={() => void handleMovePersistedImage(i, -1)}
                                className="p-1 bg-stone-900/75 text-white rounded-full hover:bg-stone-900 disabled:opacity-30 cursor-pointer"
                                title="Move earlier"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={i === persistedImages.length - 1}
                                onClick={() => void handleMovePersistedImage(i, 1)}
                                className="p-1 bg-stone-900/75 text-white rounded-full hover:bg-stone-900 disabled:opacity-30 cursor-pointer"
                                title="Move later"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Delete / Deleting / Delete Failed */}
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => void handleRemovePersistedImage(img)}
                            className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
                            title={isDeleteFailed ? 'Retry delete' : 'Delete photo'}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isDeleteFailed && (
                            <div className="absolute inset-x-0 bottom-0 bg-rose-950/90 text-rose-100 p-1.5 text-[9px] leading-tight flex items-center justify-between gap-1">
                              <span className="truncate">
                                {img.deleteError || 'Delete failed'}
                              </span>
                              <button
                                type="button"
                                onClick={() => void handleRemovePersistedImage(img)}
                                className="underline font-semibold shrink-0"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* A. Local Selected Files (Temporary Browser Previews) */}
                    {localFiles.map((localItem, idx) => {
                      const isUploading = localItem.uploadState === 'uploading';
                      const isFailed = localItem.uploadState === 'upload_failed';
                      const isUploaded = localItem.uploadState === 'uploaded';
                      const displayIndex = persistedImages.length + idx + 1;

                      return (
                        <div
                          key={localItem.id}
                          className={`relative aspect-4/3 rounded-xl overflow-hidden group border ${
                            isFailed
                              ? 'border-rose-500 ring-2 ring-rose-500/30'
                              : isUploading
                              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                              : 'border-amber-300 dark:border-amber-700'
                          }`}
                        >
                          <img
                            src={localItem.previewUrl}
                            alt={localItem.file.name}
                            className={`w-full h-full object-cover ${
                              isUploading ? 'opacity-60' : ''
                            }`}
                          />

                          {/* Reorder Queued Local Files */}
                          {!isUploading && localFiles.length > 1 && (
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveLocalFile(idx, -1)}
                                className="p-1 bg-stone-900/75 text-white rounded-full hover:bg-stone-900 disabled:opacity-30 cursor-pointer"
                                title="Move earlier"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === localFiles.length - 1}
                                onClick={() => handleMoveLocalFile(idx, 1)}
                                className="p-1 bg-stone-900/75 text-white rounded-full hover:bg-stone-900 disabled:opacity-30 cursor-pointer"
                                title="Move later"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Status Badge */}
                          {!isFailed && (
                            <span
                              className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium flex items-center gap-1 ${
                                isUploading
                                  ? 'bg-emerald-900/90 text-emerald-100'
                                  : isUploaded
                                  ? 'bg-emerald-800/90 text-white'
                                  : 'bg-amber-900/85 text-amber-100'
                              }`}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  <span>Uploading {localItem.uploadProgress}%</span>
                                </>
                              ) : isUploaded ? (
                                <span>Upload Complete</span>
                              ) : (
                                <span>#{displayIndex} • Local Preview</span>
                              )}
                            </span>
                          )}

                          {/* Remove Local File Button */}
                          {!isUploading && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLocalFile(localItem.id)}
                              className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                              title="Remove selected file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Upload Failed Overlay with Retry */}
                          {isFailed && (
                            <div className="absolute inset-x-0 bottom-0 bg-rose-950/95 text-rose-100 p-1.5 text-[9px] leading-tight space-y-1">
                              <div className="line-clamp-2">
                                {localItem.errorMessage || 'Upload failed'}
                              </div>
                              {savedPropertyId && (
                                <button
                                  type="button"
                                  disabled={isUploadingFiles}
                                  onClick={() =>
                                    void handleRetrySingleUpload(localItem.id)
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white font-semibold cursor-pointer"
                                >
                                  <RefreshCw className="w-2.5 h-2.5" />
                                  <span>Retry Upload</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    I am the:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Owner', 'Agent', 'Developer'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAdvertiserType(t)}
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
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Contact Person Name
                    </label>
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
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Direct Phone Number
                    </label>
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
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={advertiserWhatsapp}
                      onChange={(e) => setAdvertiserWhatsapp(e.target.value)}
                      placeholder="+256 701 123 456"
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Agency / Company Name (Optional)
                    </label>
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
                    <strong className="text-stone-900 dark:text-white">
                      Request Pearl Prime Verification:
                    </strong>{' '}
                    I confirm that I possess legal mandate to advertise this property. New submissions enter the verification queue (<code className="text-[11px]">pending</code>) until Reality Estates verification officers inspect boundary markers, verify land tenure records, and approve publication.
                  </div>
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 py-2.5 px-4 text-stone-600 dark:text-stone-300 text-xs font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting || isUploadingFiles}
                      onClick={() => void submitWithStatus('draft')}
                      className="py-2.5 px-5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting || isUploadingFiles ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploadingFiles}
                      className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      {isUploadingFiles
                        ? 'Uploading Photos...'
                        : isSubmitting
                        ? 'Submitting...'
                        : existingProperty
                        ? 'Save & Update Listing'
                        : 'Submit for Verification'}
                    </button>
                  </div>
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
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Pending Verification Preview
              </span>
            </div>

            <PropertyCard
              property={{
                id: savedPropertyId || 'preview-temp',
                slug: savedPropertySlug || 'preview',
                title: title.trim() || 'Your Property Title Will Appear Here',
                transaction,
                propertyType,
                price: Number(price) || 0,
                currency,
                pricePeriod,
                location: location || 'Location',
                district: district || 'District',
                address: address || 'Address',
                bedrooms: Number(bedrooms),
                bathrooms: Number(bathrooms),
                parking: Number(parking),
                landSizeDecimals: landSizeDecimals ? Number(landSizeDecimals) : undefined,
                buildingSizeSqm: buildingSizeSqm ? Number(buildingSizeSqm) : undefined,
                tenure,
                furnished,
                description: description || 'Property description preview...',
                features: selectedFeatures,
                images: livePreviewDisplayUrls,
                coordinates: { lat, lng },
                advertiser: {
                  id: 'preview-adv',
                  name: advertiserName || 'Representative',
                  type: advertiserType,
                  phone: advertiserPhone,
                  whatsapp: advertiserWhatsapp,
                  email: advertiserEmail,
                  verified: false
                },
                verificationStatus: existingProperty?.verificationStatus || 'pending',
                listingStatus: existingProperty?.listingStatus || 'pending',
                availability: existingProperty?.availability || 'Available',
                dateAdded:
                  existingProperty?.dateAdded || new Date().toISOString().split('T')[0],
                verificationDetails: existingProperty?.verificationDetails || {
                  advertiserVerified: false,
                  locationConfirmed: false,
                  priceConfirmed: false,
                  availabilityConfirmed: false
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

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
import { generateUuid } from '../lib/supabase';
import { MAX_PROPERTY_IMAGES_COUNT } from '../services/storageService';
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
  ChevronRight,
  Star,
  Plus
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

  // Add a permanent hosted URL (preset or external https:// URL) up to 4 total photos
  const handleAddHostedImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (persistedImages.length + localFiles.length >= MAX_PROPERTY_IMAGES_COUNT) {
      showToast(
        `Maximum of ${MAX_PROPERTY_IMAGES_COUNT} photos reached (1 Main Photo + 3 Detail Photos). Remove a photo first to add another.`,
        'info'
      );
      return;
    }
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

  // Promote any persisted image to index 0 (Main Display Photo)
  const handleSetPersistedAsMain = async (index: number) => {
    if (index <= 0 || index >= persistedImages.length) return;
    const reordered = [...persistedImages];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    const normalized = reordered.map((img, idx) => ({
      ...img,
      displayOrder: idx
    }));
    setPersistedImages(normalized);
    showToast('Updated Main Display Photo.', 'success');

    if (savedPropertyId) {
      try {
        await reorderPropertyImages(savedPropertyId, normalized);
      } catch {
        // Ignore if reorder is saved on final submit
      }
    }
  };

  // Promote a queued local file to index 0 (Main Display Photo when no persisted images precede it)
  const handleSetLocalFileAsMain = (index: number) => {
    if (index < 0 || index >= localFiles.length) return;
    if (persistedImages.length === 0 && index > 0) {
      setLocalFiles((prev) => {
        const next = [...prev];
        const [selected] = next.splice(index, 1);
        next.unshift(selected);
        return next;
      });
      showToast('Updated Main Display Photo.', 'success');
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
    } catch {
      // Even if remote delete fails due to RLS, allow removing from current listing state
      setPersistedImages((prev) =>
        prev
          .filter((img) => img.id !== target.id)
          .map((img, idx) => ({ ...img, displayOrder: idx }))
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

  // Select local files from device (capped at 4 total images: 1 Main + 3 Detail/Contact photos)
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsSelectingFiles(true);
    setFormError(null);

    try {
      const currentTotal = persistedImages.length + localFiles.length;
      const availableSlots = Math.max(0, MAX_PROPERTY_IMAGES_COUNT - currentTotal);

      if (availableSlots <= 0) {
        showToast(
          `You have already added ${MAX_PROPERTY_IMAGES_COUNT} photos (the maximum per listing). Remove a photo to replace it.`,
          'info'
        );
        return;
      }

      const incomingFiles = Array.from(fileList);
      const filesToProcess = incomingFiles.slice(0, availableSlots);
      const validSelected: LocalSelectedImage[] = [];
      const errors: string[] = [];

      if (incomingFiles.length > availableSlots) {
        showToast(
          `Only ${availableSlots} more photo(s) can be added (maximum ${MAX_PROPERTY_IMAGES_COUNT} photos per listing).`,
          'info'
        );
      }

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
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
            ? `${validSelected.length} photo(s) added (${
                currentTotal + validSelected.length
              }/${MAX_PROPERTY_IMAGES_COUNT}). Photo #1 will be your Main Display Image.`
            : `${validSelected.length} photo(s) selected for preview.`,
          'success'
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
  ): Promise<{
    allSucceeded: boolean;
    failedCount: number;
    uploadedRecords: PersistedPropertyImage[];
  }> => {
    const queue = localFiles.filter(
      (f) => f.uploadState === 'selected' || f.uploadState === 'upload_failed'
    );
    if (queue.length === 0) {
      return { allSucceeded: true, failedCount: 0, uploadedRecords: [] };
    }

    setIsUploadingFiles(true);
    let currentOrder = startingDisplayOrder;
    let failedCount = 0;
    const uploadedRecords: PersistedPropertyImage[] = [];

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
          uploadedRecords.push(persistedRecord);

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
      failedCount,
      uploadedRecords
    };
  };

  // Retry a single failed local file upload (when property ID already exists)
  const handleRetrySingleUpload = async (localFileId: string) => {
    const targetPropertyId = savedPropertyId || generateUuid();
    if (!savedPropertyId) {
      setSavedPropertyId(targetPropertyId);
    }
    if (isUploadingFiles || isSubmitting) return;
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
        targetPropertyId,
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
        showToast(`Uploaded "${target.file.name}".`, 'success');
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
    const targetPropertyId = savedPropertyId || generateUuid();
    if (!savedPropertyId) {
      setSavedPropertyId(targetPropertyId);
    }
    if (isUploadingFiles || isSubmitting) return;
    setFormError(null);
    const { allSucceeded, failedCount } = await uploadQueuedLocalFilesForProperty(
      targetPropertyId,
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

  // In-memory preview list for the Live Preview Card ONLY (capped at 4 images; index 0 is Main Image)
  const livePreviewDisplayUrls = [
    ...persistedImages.map((img) => img.url),
    ...localFiles.map((item) => item.previewUrl)
  ].slice(0, MAX_PROPERTY_IMAGES_COUNT);

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
      const msg = 'Please upload at least 1 property photograph (up to 4 photos).';
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
      const targetPropertyId = savedPropertyId || generateUuid();

      // 2. Upload/process any queued local files FIRST so all 4 image URLs are ready
      // when creating or updating the property record in Supabase.
      const existingCleanPersisted: PersistedPropertyImage[] = persistedImages
        .filter((img) => !img.url.startsWith('blob:'))
        .slice(0, MAX_PROPERTY_IMAGES_COUNT)
        .map((img, idx) => ({
          id: img.id,
          propertyId: targetPropertyId,
          storagePath: img.storagePath,
          url: img.url,
          displayOrder: idx,
          altText: img.altText
        }));

      let newlyUploaded: PersistedPropertyImage[] = [];
      if (localFiles.length > 0) {
        const uploadResult = await uploadQueuedLocalFilesForProperty(
          targetPropertyId,
          existingCleanPersisted.length
        );
        newlyUploaded = uploadResult.uploadedRecords;

        if (!uploadResult.allSucceeded && existingCleanPersisted.length + newlyUploaded.length === 0) {
          const uploadErrText = `Unable to upload property images (${uploadResult.failedCount} failed). Please try again.`;
          setFormError(uploadErrText);
          setStep(4);
          return;
        }
      }

      const finalPersistedImages: PersistedPropertyImage[] = [
        ...existingCleanPersisted,
        ...newlyUploaded
      ]
        .slice(0, MAX_PROPERTY_IMAGES_COUNT)
        .map((img, idx) => ({
          ...img,
          propertyId: targetPropertyId,
          displayOrder: idx
        }));

      let activeSlug = savedPropertySlug;

      // 3. Create or update the property record with all (up to 4) images included
      if (!savedPropertyId) {
        const created = await createProperty({
          id: targetPropertyId,
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
          images: finalPersistedImages.map((img) => img.url),
          propertyImages: finalPersistedImages,
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

        activeSlug = created.slug;
        setSavedPropertyId(created.id);
        setSavedPropertySlug(created.slug);
        if (created.propertyImages && created.propertyImages.length > 0) {
          setPersistedImages(
            created.propertyImages.map((img) => ({
              ...img,
              deleteState: 'idle'
            }))
          );
        }
      } else {
        const updated = await updateProperty(savedPropertyId, {
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
          images: finalPersistedImages.map((img) => img.url),
          propertyImages: finalPersistedImages,
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

      showToast(
        `Property saved with ${finalPersistedImages.length} photo(s)! Main photo is set for listing cards.`,
        'success'
      );

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

            {/* STEP 4: PHOTOGRAPHS (4-IMAGE SYSTEM: 1 MAIN + 3 DETAIL/CONTACT IMAGES) */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white">
                      4. Property Photographs (Up to 4 Images)
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Upload up to <strong>4 photographs</strong> for your {propertyType.toLowerCase()}.{' '}
                      <strong>Photo #1 is your Main Image</strong> displayed on listing cards, while{' '}
                      <strong>Photos #2, #3, and #4</strong> appear when buyers view full details or contact you.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    <span>
                      {persistedImages.length + localFiles.length} / {MAX_PROPERTY_IMAGES_COUNT} Photos Added
                    </span>
                  </span>
                </div>

                {/* Device Image Upload (Local Selected Files -> Uploaded up to 4 images) */}
                <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      Select Up to 4 Photographs (JPEG, PNG, WebP • Max 5 MB each)
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Slot #1 is displayed as the main cover image; Slots #2–#4 are shown in the detailed view and contact modal.
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
                      disabled={
                        isSelectingFiles ||
                        isUploadingFiles ||
                        isSubmitting ||
                        persistedImages.length + localFiles.length >= MAX_PROPERTY_IMAGES_COUNT
                      }
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {isSelectingFiles ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Selecting...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {persistedImages.length + localFiles.length >= MAX_PROPERTY_IMAGES_COUNT
                              ? '4 / 4 Photos Selected'
                              : 'Upload Photos (Max 4)'}
                          </span>
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
                    disabled={
                      persistedImages.length + localFiles.length >= MAX_PROPERTY_IMAGES_COUNT
                    }
                    placeholder="Or paste hosted image URL (https://...)"
                    className="flex-1 text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={
                      persistedImages.length + localFiles.length >= MAX_PROPERTY_IMAGES_COUNT
                    }
                    onClick={() => handleAddHostedImage(customImageUrl)}
                    className="py-2.5 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* 4-Slot Photo Grid (Slot 1 = Main Image, Slots 2-4 = Detail & Contact Photos) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      4-Photo Listing Gallery (Photo #1 = Main Card Display • Photos #2–#4 = Detail & Contact View)
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* B. Persisted Images */}
                    {persistedImages.slice(0, MAX_PROPERTY_IMAGES_COUNT).map((img, i) => {
                      const isMain = i === 0;
                      const isDeleting = img.deleteState === 'deleting';
                      const isDeleteFailed = img.deleteState === 'delete_failed';
                      return (
                        <div
                          key={img.id}
                          className={`relative aspect-4/3 rounded-xl overflow-hidden group border-2 ${
                            isDeleteFailed
                              ? 'border-rose-500 ring-1 ring-rose-500/40'
                              : isMain
                              ? 'border-emerald-600 dark:border-emerald-400 shadow-sm'
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

                          {/* Slot Role Badge */}
                          <span
                            className={`absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              isMain
                                ? 'bg-emerald-700/95 text-white shadow-xs'
                                : 'bg-stone-900/85 text-white'
                            }`}
                          >
                            {isMain ? (
                              <>
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                <span>Main Image (#1)</span>
                              </>
                            ) : (
                              <span>Detail Photo #{i + 1}</span>
                            )}
                          </span>

                          {/* Reorder & Set as Main Controls */}
                          {!isDeleting && (
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => void handleSetPersistedAsMain(i)}
                                  className="px-2 py-0.5 bg-emerald-700/90 hover:bg-emerald-600 text-white rounded-full text-[9px] font-semibold shadow-xs cursor-pointer"
                                  title="Make this the Main Display Photo"
                                >
                                  Set as Main
                                </button>
                              )}
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

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => void handleRemovePersistedImage(img)}
                            className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-white rounded-full hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
                            title={isDeleteFailed ? 'Retry delete' : 'Remove photo'}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {/* A. Local Selected Files (Temporary Browser Previews up to remaining slots) */}
                    {localFiles
                      .slice(0, Math.max(0, MAX_PROPERTY_IMAGES_COUNT - persistedImages.length))
                      .map((localItem, idx) => {
                        const isUploading = localItem.uploadState === 'uploading';
                        const isFailed = localItem.uploadState === 'upload_failed';
                        const isUploaded = localItem.uploadState === 'uploaded';
                        const displayIndex = persistedImages.length + idx + 1;
                        const isMain = displayIndex === 1;

                        return (
                          <div
                            key={localItem.id}
                            className={`relative aspect-4/3 rounded-xl overflow-hidden group border-2 ${
                              isFailed
                                ? 'border-rose-500 ring-2 ring-rose-500/30'
                                : isUploading
                                ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                                : isMain
                                ? 'border-emerald-600 dark:border-emerald-400 shadow-sm'
                                : 'border-stone-300 dark:border-stone-700'
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
                                {persistedImages.length === 0 && idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetLocalFileAsMain(idx)}
                                    className="px-2 py-0.5 bg-emerald-700/90 hover:bg-emerald-600 text-white rounded-full text-[9px] font-semibold shadow-xs cursor-pointer"
                                    title="Make this the Main Display Photo"
                                  >
                                    Set as Main
                                  </button>
                                )}
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
                                className={`absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                  isUploading
                                    ? 'bg-emerald-900/90 text-emerald-100'
                                    : isUploaded
                                    ? 'bg-emerald-800/90 text-white'
                                    : isMain
                                    ? 'bg-emerald-700/95 text-white'
                                    : 'bg-stone-900/85 text-white'
                                }`}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    <span>Uploading {localItem.uploadProgress}%</span>
                                  </>
                                ) : isUploaded ? (
                                  <span>Uploaded</span>
                                ) : isMain ? (
                                  <>
                                    <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                    <span>Main Image (#1)</span>
                                  </>
                                ) : (
                                  <span>Detail Photo #{displayIndex}</span>
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
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Empty Slots (Up to 4 Total Slots) */}
                    {Array.from({
                      length: Math.max(
                        0,
                        MAX_PROPERTY_IMAGES_COUNT - (persistedImages.length + localFiles.length)
                      )
                    }).map((_, emptyIdx) => {
                      const slotNumber = persistedImages.length + localFiles.length + emptyIdx + 1;
                      const isMainSlot = slotNumber === 1;
                      return (
                        <button
                          key={`empty-slot-${slotNumber}`}
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`aspect-4/3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-colors cursor-pointer ${
                            isMainSlot
                              ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-400 dark:hover:border-stone-700'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                              isMainSlot
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                            {isMainSlot ? 'Slot 1: Main Photo' : `Slot ${slotNumber}: Detail Photo`}
                          </span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {isMainSlot
                              ? 'Shown on main listing card'
                              : 'Shown in detail & contact view'}
                          </span>
                        </button>
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

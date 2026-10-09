# Reality Estates — Supabase Backend & Storage Integration Guide

## 1. Environment Variables
Frontend environment variables (documented in `.env.example`):
```env
VITE_SUPABASE_URL=https://lkzqjhlrmogspwvamnvh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_STORAGE_BUCKET=property-images
```

---

## 2. Property Photo Upload Architecture (4-Image Limit)

1. **Up to 4 Photos Per Listing (`MAX_PROPERTY_IMAGES_COUNT = 4`)**
   - Users listing a House/Villa, Apartment, Land/Plot, or Commercial property can upload up to **4 photos**.
   - **Image #1 (`sort_order = 0`, `is_cover = true`)** is the **Main Cover Photo** displayed on all property cards (`HomeView`, `SearchView`, `DashboardView`).
   - **Images #1–#4 (`sort_order = 0..3`)** are displayed in:
     - **Detailed Property View (`PropertyDetailView` / `PropertyGallery`)**: 4-photo hero showcase + interactive full-screen lightbox.
     - **Contact Representative Modal (`ContactAgentModal`)**: Interactive thumbnail strip + cover preview while calling, messaging on WhatsApp, or sending an enquiry.
     - **Schedule Viewing Modal (`ViewingRequestModal`)**: Interactive 4-photo preview strip while booking a viewing.

2. **Storage & Database Flow (`src/services/storageService.ts`)**
   - Bucket: `property-images`
   - Object path format: `properties/{propertyId}/{uuid}.{ext}`
   - Database table: `public.property_images`
     - `id` (`uuid`)
     - `property_id` (`uuid`, references `public.properties(id)`)
     - `storage_path` (`text`)
     - `image_url` (`text`)
     - `alt_text` (`text`, nullable)
     - `sort_order` (`integer`, `0` to `3`)
     - `is_cover` (`boolean`, `true` when `sort_order = 0`)

---

## 3. Backend Developer Action Items: Fixing "Permission Denied" on Listing & Photo Uploads

When a user tries to list a property or upload photos and receives **"You do not have permission to perform this task"**, it is caused by Row-Level Security (RLS) policies on Supabase Storage (`storage.objects`) and/or the PostgreSQL tables (`public.properties`, `public.property_images`, `public.profiles`).

Ask the backend developer to run the following SQL in the **Supabase SQL Editor**:

```sql
-- ============================================================================
-- 1. ENSURE STORAGE BUCKET `property-images` EXISTS AND IS PUBLIC FOR READING
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================================================
-- 2. STORAGE.OBJECTS RLS POLICIES FOR `property-images` BUCKET
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for property-images" ON storage.objects;
CREATE POLICY "Public read access for property-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated users can update own property images" ON storage.objects;
CREATE POLICY "Authenticated users can update own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND (owner = auth.uid() OR owner IS NULL));

DROP POLICY IF EXISTS "Authenticated users can delete own property images" ON storage.objects;
CREATE POLICY "Authenticated users can delete own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND (owner = auth.uid() OR owner IS NULL));

-- ============================================================================
-- 3. PUBLIC.PROPERTIES RLS POLICIES (ALLOW OWNERS TO INSERT, SELECT & UPDATE)
-- ============================================================================
-- Note: INSERT + .select() requires the creator to also pass the SELECT policy
-- even when listing_status is 'draft' or 'pending'.
DROP POLICY IF EXISTS "Public can view published properties or owners view own" ON public.properties;
CREATE POLICY "Public can view published properties or owners view own"
ON public.properties FOR SELECT
TO public
USING (
  listing_status = 'published'
  OR auth.uid() = owner_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Authenticated users can create own properties" ON public.properties;
CREATE POLICY "Authenticated users can create own properties"
ON public.properties FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners and admins can update properties" ON public.properties;
CREATE POLICY "Owners and admins can update properties"
ON public.properties FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = owner_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- 4. PUBLIC.PROPERTY_IMAGES RLS POLICIES (UP TO 4 IMAGES PER PROPERTY)
-- ============================================================================
DROP POLICY IF EXISTS "Public can view property images" ON public.property_images;
CREATE POLICY "Public can view property images"
ON public.property_images FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Property owners can insert property images" ON public.property_images;
CREATE POLICY "Property owners can insert property images"
ON public.property_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND (p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles prof
        WHERE prof.id = auth.uid() AND prof.role = 'admin'
      ))
  )
);

DROP POLICY IF EXISTS "Property owners can update property images" ON public.property_images;
CREATE POLICY "Property owners can update property images"
ON public.property_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND (p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles prof
        WHERE prof.id = auth.uid() AND prof.role = 'admin'
      ))
  )
);

DROP POLICY IF EXISTS "Property owners can delete property images" ON public.property_images;
CREATE POLICY "Property owners can delete property images"
ON public.property_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND (p.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles prof
        WHERE prof.id = auth.uid() AND prof.role = 'admin'
      ))
  )
);

-- ============================================================================
-- 5. ALLOW USERS TO UPGRADE THEIR OWN PROFILE ROLE WHEN LISTING A PROPERTY
-- ============================================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

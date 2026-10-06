# Reality Estates — Production Supabase Backend Integration Guide

This document describes the production architecture, database contracts, authentication flows, Row-Level Security (RLS) requirements, and Supabase Storage configuration for the Reality Estates frontend (`React 19 + TypeScript + Vite`).

---

## 1. Production Architecture Overview

Reality Estates operates exclusively against Supabase as its authoritative single source of truth:

```text
React 19 + TypeScript Frontend
              ↓
Service Layer (src/services/*)
              ↓
Singleton Supabase Client (src/lib/supabase.ts)
              ↓
Supabase Auth  •  Supabase PostgreSQL  •  Supabase Storage
```

There is **no** Demo Mode, **no** mock data fallback, and **no** `localStorage`-based persistence for domain records or user roles.

---

## 2. Required Environment Variables

Configure the following browser-safe variables in `.env` / `.env.local` (or deployment environment):

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-public-publishable-key>
VITE_SUPABASE_STORAGE_BUCKET=property-images
```

### Startup Configuration Check & Security Rules
- On startup, `src/lib/supabase.ts` and `src/App.tsx` verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are present.
- If either variable is missing, the application displays an explicit configuration error screen in development and a safe service-unavailable screen in production. It never switches to a fake or simulated backend.
- **NEVER** add `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, or database credentials to `VITE_*` variables or frontend source code.

---

## 3. Authentication & Roles (`Supabase Auth` + `public.profiles`)

### Authentication Service (`src/services/authService.ts`)
- `signUp(input)` / `register(input)`: Creates an account in `auth.users` via `supabase.auth.signUp()` with metadata (`full_name`, `name`, `phone`, `role`, `company`) and synchronizes `public.profiles` (`id = auth.users.id`).
- `signIn(input)` / `login(input)`: Authenticates with `supabase.auth.signInWithPassword()` and loads the authoritative profile from `public.profiles`.
- `signOut()` / `logout()`: Terminates the session via `supabase.auth.signOut()` and clears user-scoped state.
- `getCurrentSession()`, `getCurrentUser()`, `getCurrentProfile()`, `onAuthStateChange(listener)`, `requestPasswordReset(email)`.

### Roles & Security
- **Public Registration Roles (`PublicRegistrableRole`):** `buyer`, `owner`, `agent`, `developer`.
- **Admin Restriction:** Public registration strictly blocks `admin` creation in the UI (`AuthModal.tsx`), in `authService.ts` (`sanitizePublicRole`), and via the PostgreSQL `on_auth_user_created` trigger.
- **Authorization:** Frontend role checks (`currentUser.role === 'admin'`) are used solely for UX rendering and route guards (`<ProtectedRoute requiredRole="admin">`). Actual data authorization is enforced by PostgreSQL Row-Level Security (RLS).

---

## 4. Public vs. Authenticated Features

### Publicly Accessible (No Account Required)
- Home page (`/`), Search & Map Explorer (`/search`), and Property Detail pages (`/properties/:slug`).
- Viewing published property listings (`listing_status = 'published'`), photographs, pricing, Ugandan district/location details, verification badges, and features.
- When no published properties match or exist in Supabase, a genuine empty state (`"No properties are currently available."`) is displayed.

### Protected Features (Requires Authenticated Supabase Session)
- Saving/favoriting properties (`saved_properties`)
- Submitting enquiries (`enquiries`) and contacting advertisers
- Requesting property viewings (`viewing_requests`)
- Creating, editing, and submitting property listings (`/list-property`, `/edit-property/:id`)
- Viewing user dashboard (`/dashboard`)
- Managing transaction stages (`transactions`)
- Admin Operations Desk (`/admin`, restricted to `profile.role = 'admin'`)

Unauthenticated visitors attempting any protected action are prompted with `"Create an account or sign in to continue."` via `AuthModal` and returned to their attempted action after signing in.

---

## 5. Database Tables & Workflows

### A. Property Workflow (`public.properties` & `public.property_verifications`)
1. **Creation (`propertyService.createProperty`):**
   - Authenticated advertiser submits the listing form.
   - Creates a row in `public.properties` with `advertiser_id = auth.uid()`, `listing_status = 'pending'` (or `'draft'`), and `verification_status = 'pending'`.
   - Returns the created property UUID (`property.id`).
2. **Verification & Publication (`propertyService.updatePropertyVerification`):**
   - Authorized admins inspect the listing in `/admin` (`advertiser_verified`, `location_confirmed`, `price_confirmed`, `availability_confirmed`).
   - Updates `public.properties` (`verification_status`, `listing_status = 'published'`) and upserts the audit record in `public.property_verifications`.

### B. Image Upload Workflow (`property-images` Bucket & `public.property_images`)
1. **Local Selection:** Selecting files in `ListPropertyView` creates temporary browser previews (`URL.createObjectURL(file)`), which are revoked on removal, upload completion, or unmount. `blob:` URLs are never persisted.
2. **Validation:** Accepts only `image/jpeg`, `image/png`, and `image/webp` up to **5 MB** per file.
3. **Storage Upload (`storageService.uploadPropertyImage`):**
   - Uploads to bucket `property-images` at path `properties/{propertyId}/{imageUuid}.{extension}` with `upsert: false`.
   - Resolves the public URL via `getPublicUrl()` and inserts a row into `public.property_images` (`id`, `property_id`, `storage_path`, `public_url`, `sort_order`, `alt_text`).
   - If the database insert fails, the uploaded Storage object is automatically removed.

### C. Saved Properties Workflow (`public.saved_properties`)
- `savedPropertyService` reads, upserts (`onConflict: 'user_id,property_id'`), and deletes rows in `public.saved_properties` (`user_id`, `property_id`, `created_at`).

### D. Enquiry Workflow (`public.enquiries`)
- `enquiryService.createEnquiry` looks up the property's `advertiser_id` as `assigned_rep_id` and inserts a row into `public.enquiries` (`id`, `property_id`, `customer_id`, `assigned_rep_id`, `customer_name`, `customer_phone`, `customer_email`, `subject`, `message`, `status`).

### E. Viewing Request Workflow (`public.viewing_requests`)
- `viewingService.createViewingRequest` looks up the property's `advertiser_id` as `assigned_agent_id` and inserts a row into `public.viewing_requests` (`id`, `property_id`, `customer_id`, `assigned_agent_id`, `customer_name`, `customer_phone`, `customer_email`, `preferred_date`, `preferred_time`, `message`, `status`).

### F. Transaction Workflow (`public.transactions`)
- `transactionService` queries `public.transactions` and updates deal `stage` (`Enquiry`, `Contacted`, `Viewing`, `Negotiation`, `Offer`, `Closed`) while keeping commission and revenue calculations server/database-controlled.

---

## 6. Deployment & Supabase Dashboard Checklist

1. **Environment Variables:** Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are configured in your hosting environment.
2. **Authentication URL Configuration:** In **Supabase Dashboard → Authentication → URL Configuration**, set your production **Site URL** and add `<your-domain>/**` to **Redirect URLs**.
3. **Storage Bucket (`property-images`):** Ensure the `property-images` bucket exists with public read access (`public = true`) and RLS policies allowing authenticated uploads/deletes under `properties/{propertyId}/*`.

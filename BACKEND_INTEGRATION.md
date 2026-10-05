# Reality Estates — Backend, Supabase Auth & Storage Integration Guide

This document describes the architecture, database contracts, authentication flows, environment variables, and Supabase Storage configuration required by the Reality Estates frontend (`React 19 + TypeScript + Vite`).

---

## 1. Environment Variables

Configure the following browser-safe variables in `.env.local` (or deployment environment):

```env
# Optional custom REST API base URL (leave empty when using Supabase directly or Demo Mode)
VITE_API_BASE_URL=

# Supabase Project URL & Public Publishable (or Anon) Key
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-public-anon-or-publishable-key>

# Optional Storage Bucket override (defaults to "property-images")
VITE_SUPABASE_STORAGE_BUCKET=property-images
```

### Security Rules
- **NEVER** add `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, or database credentials to `VITE_*` variables or frontend source code.
- Never store passwords, raw access tokens, refresh tokens, or user roles in custom application `localStorage` keys.
- If `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` is omitted, the frontend automatically runs in **Interactive Demo Mode** using in-memory demo sessions without pretending to be authenticated against Supabase.

---

## 2. Supabase Authentication & `profiles` Architecture

### Single Reusable Supabase Client (`src/lib/supabase.ts`)
- A singleton client is initialized via `createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })`.
- Session tokens and refresh lifecycle are managed exclusively by `@supabase/supabase-js`.

### Authentication Service (`src/services/authService.ts`)
Exposes the authoritative authentication contract:
- `signUp(input)` / `register(input)`
- `signIn(input)` / `login(input)`
- `signOut()` / `logout()`
- `getCurrentSession()`
- `getCurrentUser()`
- `getCurrentProfile()`
- `onAuthStateChange(listener)`
- `requestPasswordReset(email)`

### Registration & Role Restrictions
- Public registration collects: `name`, `email`, `phone`, `password`, and `role`.
- Allowed self-selected roles (`PublicRegistrableRole`):
  - `buyer`
  - `owner`
  - `agent`
  - `developer`
- **Admin Prevention:** Public registration strictly rejects `'admin'` on both the UI (`AuthModal.tsx`) and service validation (`sanitizePublicRole`). Admin accounts can only be promoted server-side in PostgreSQL.

### Profile Synchronization (`public.profiles`)
1. `supabase.auth.signUp()` passes `full_name`, `name`, `phone`, and sanitized `role` in `options.data` so the PostgreSQL `on_auth_user_created` trigger (`handle_new_user()`) immediately populates `public.profiles` with `id = auth.users.id`.
2. When an authenticated session is active, `syncProfileForAuthUser` inspects `public.profiles` for `id = auth.users.id`:
   - If the trigger row already exists, it updates any missing `phone` / `full_name` / `role` fields without overwriting an existing `'admin'` role or creating duplicate rows.
   - If no row exists yet, it inserts the profile linked to `auth.users.id`.
3. `getCurrentProfile()` always reads the authoritative role and verification status from `public.profiles`.

### Centralized React Auth State & Protected Functionality
- `AppContext` maintains `authStatus: 'loading' | 'authenticated' | 'unauthenticated'` and `currentUser: User | null`.
- On initial load, `authService.getCurrentSession()` restores the session and `authService.onAuthStateChange(...)` subscribes to `SIGNED_IN`, `TOKEN_REFRESHED`, `USER_UPDATED`, and `SIGNED_OUT` events.
- `<ProtectedRoute>` guards `/dashboard`, `/list-property`, `/edit-property/:id`, and `/admin` (`requiredRole="admin"`), rendering a verification spinner while `authStatus === 'loading'` so protected content never flashes before session restoration finishes.
- Protected actions (saving properties, submitting enquiries, scheduling viewings, listing/editing properties, transaction management, and admin operations) require an authenticated user. Public browsing of published properties remains open to all visitors.

---

## 3. Supabase Storage Configuration

### Expected Storage Bucket
- **Bucket Name:** `property-images` (configurable via `VITE_SUPABASE_STORAGE_BUCKET`)
- **Public Access:** Public read access (`public = true`) so property cards and galleries can resolve permanent URLs via `supabase.storage.from('property-images').getPublicUrl(path)`.

### Image Path Convention
All uploaded property photographs are stored under a collision-resistant, deterministic folder hierarchy:

```text
properties/{propertyId}/{imageUuid}.{extension}
```

**Example:**
```text
properties/8f9d2a1c-4b3e-4d5a-9c1b-7e6f5a4b3c2d/c4e1f9a0-3b2d-4e8f-a1b2-9d8c7b6a5e4f.webp
```

- Original user filenames are **never** used as the storage object path.
- Uploads use `upsert: false` to prevent accidental file overwrites.

### Accepted Formats & Maximum File Size
- **Accepted MIME Types:**
  - `image/jpeg` / `image/jpg` (`.jpg`)
  - `image/png` (`.png`)
  - `image/webp` (`.webp`)
- **Maximum File Size:** **5 MB** (`5,242,880` bytes) per photograph, enforced on the client before any network transfer begins.

---

## 4. Local Previews vs. Persisted Images

The frontend strictly separates temporary browser previews from persisted property photographs:

### A. Local Selected File (`LocalSelectedImage`)
- Created immediately when a user selects files from their device in `ListPropertyView`.
- Contains:
  - `file`: Browser `File` instance
  - `previewUrl`: Temporary `blob:` URL created via `URL.createObjectURL(file)`
  - `uploadState`: `'selected' | 'uploading' | 'uploaded' | 'upload_failed'`
  - `uploadProgress`: `0–100`
  - `errorMessage`: Optional error message if upload fails
- **Lifecycle Guarantees:**
  - `blob:` URLs are used strictly for immediate in-browser preview.
  - `URL.revokeObjectURL(previewUrl)` is called when a file is removed, once its upload completes, or when the component unmounts.
  - `blob:` and `data:` URLs are **never** sent to PostgreSQL, **never** stored in `property.images`, and **never** persisted to `localStorage`.

### B. Persisted Property Image (`PersistedPropertyImage`)
- Represents a permanently stored image backed by the `property_images` table in Supabase PostgreSQL and/or a permanent `https://` URL.
- Contains:
  - `id`: Database image record UUID
  - `propertyId`: Parent property UUID
  - `storagePath`: Supabase Storage path (`properties/{propertyId}/{uuid}.{ext}`)
  - `url`: Permanent public URL
  - `displayOrder`: Zero-based integer (`0, 1, 2, ...`) controlling gallery order (`0` is the primary cover photo)
  - `altText`: Optional accessible caption

---

## 5. Database Schema Compatibility (`profiles` & `property_images`)

### `public.profiles`
| Frontend Field | Primary DB Column | Supported Fallback Columns | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `id` | — | `uuid` (PK) | References `auth.users(id) ON DELETE CASCADE` |
| `name` | `full_name` | `name` | `text` | User's display name |
| `email` | `email` | — | `text` | User's email address |
| `phone` | `phone` | — | `text` | Ugandan contact phone number |
| `role` | `role` | — | `text` | `'buyer' \| 'owner' \| 'agent' \| 'developer' \| 'admin'` |
| `verified` | `verified` | `is_verified` | `boolean` | Account verification badge status |
| `agencyName` | `agency_name` | — | `text` | Optional agency or developer company name |

### `public.property_images`
| Frontend Field | Primary DB Column | Supported Fallback Columns | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `id` | — | `uuid` (PK) | Unique record identifier |
| `propertyId` | `property_id` | — | `uuid` (FK) | References `properties(id) ON DELETE CASCADE` |
| `storagePath` | `storage_path` | — | `text` | Object path inside `property-images` bucket |
| `url` | `url` | `image_url`, `public_url` | `text` | Permanent public URL |
| `displayOrder` | `display_order` | `sort_order` | `integer` | Zero-based display sequence |
| `altText` | `alt_text` | `caption` | `text` | Optional image description |
| `createdAt` | `created_at` | — | `timestamptz` | Timestamp of record creation |

---

## 6. Recommended Supabase Dashboard Configuration

1. **Authentication -> Providers -> Email:**
   - Enable Email provider.
   - Configure **Confirm email** according to your launch preference (the frontend supports both immediate session creation and pending email confirmation states).
2. **Authentication -> URL Configuration:**
   - Set **Site URL** to your production/preview domain.
   - Add `<your-domain>/**` to **Redirect URLs** for email confirmation and password reset links.
3. **Database RLS Policies (`public.profiles`):**
   - Ensure users can `SELECT` their own profile (`auth.uid() = id`) and public advertiser profiles.
   - Ensure `INSERT` / `UPDATE` policies on `public.profiles` enforce `auth.uid() = id` and prevent users from setting `role = 'admin'` via client-side updates.

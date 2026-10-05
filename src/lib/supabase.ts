import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ServiceError } from '../types/api';

/**
 * Single reusable Supabase client instance for the Reality Estates frontend.
 *
 * Security Rules:
 * - Only public browser-safe variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`)
 *   may be used here.
 * - NEVER place service-role or secret keys in frontend code or `VITE_` variables.
 * - When environment variables are not configured, `supabase` is `null` and the app
 *   operates in offline Demo Mode without crashing on startup.
 */

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawSupabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const PROPERTY_IMAGES_BUCKET =
  (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || '').trim() || 'property-images';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    rawSupabaseUrl &&
      rawSupabasePublishableKey &&
      /^https?:\/\/.+/i.test(rawSupabaseUrl)
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(rawSupabaseUrl, rawSupabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function getRequiredSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new ServiceError(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment to enable cloud storage and database persistence.',
      'STORAGE_NOT_CONFIGURED',
      503
    );
  }
  return supabase;
}

/**
 * Generates an RFC4122 v4 UUID using the browser Web Crypto API with a safe fallback.
 */
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const val = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return val.toString(16);
  });
}

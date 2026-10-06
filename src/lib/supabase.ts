import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ServiceError } from '../types/api';

/**
 * Single reusable Supabase client instance for the Reality Estates production frontend.
 *
 * Security & Production Rules:
 * - Only public browser-safe variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`)
 *   are read here.
 * - NEVER place service-role or secret keys in frontend code or `VITE_` variables.
 * - If environment variables are missing, the application fails honestly with a configuration
 *   error and NEVER falls back to mock or demo data.
 */

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '')
  .trim()
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '');

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

export function getSupabaseConfigurationError(): string | null {
  if (isSupabaseConfigured()) {
    return null;
  }

  const isDev = Boolean(import.meta.env.DEV);
  if (isDev) {
    const missing: string[] = [];
    if (!rawSupabaseUrl) missing.push('VITE_SUPABASE_URL');
    if (!rawSupabasePublishableKey) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
    return `Missing required Supabase environment variable(s): ${
      missing.join(', ') || 'VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY'
    }. Set these in your .env file and restart the Vite development server.`;
  }

  return 'Reality Estates could not initialize its backend connection. Please try again later or contact support.';
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
      getSupabaseConfigurationError() ||
        'Reality Estates could not connect to the server. Please check your configuration.',
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

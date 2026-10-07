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

function isPlaceholderValue(value: string): boolean {
  if (!value) return true;
  return (
    value.includes('your-project-ref.supabase.co') ||
    value.includes('your-public-publishable-key') ||
    value.includes('<project-ref>') ||
    value.includes('<your-publishable-key>')
  );
}

const envVarsValid = Boolean(
  rawSupabaseUrl &&
    rawSupabasePublishableKey &&
    !isPlaceholderValue(rawSupabaseUrl) &&
    !isPlaceholderValue(rawSupabasePublishableKey) &&
    /^https?:\/\/.+/i.test(rawSupabaseUrl)
);

let clientInitError: Error | null = null;
let initializedClient: SupabaseClient | null = null;

if (envVarsValid) {
  try {
    initializedClient = createClient(rawSupabaseUrl, rawSupabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    clientInitError =
      err instanceof Error ? err : new Error(String(err ?? 'Unknown Supabase client error'));
    initializedClient = null;
  }
}

export const supabase: SupabaseClient | null = initializedClient;

export function isSupabaseConfigured(): boolean {
  return Boolean(envVarsValid && supabase && !clientInitError);
}

export interface SupabaseDiagnostics {
  supabaseConfigured: boolean;
  clientCreated: boolean;
  urlPresent: boolean;
  urlValidFormat: boolean;
  publishableKeyPresent: boolean;
  storageBucket: string;
  mode: string;
  isDev: boolean;
  initErrorMessage: string | null;
}

export function getSupabaseDiagnostics(): SupabaseDiagnostics {
  return {
    supabaseConfigured: isSupabaseConfigured(),
    clientCreated: Boolean(supabase),
    urlPresent: Boolean(rawSupabaseUrl && !isPlaceholderValue(rawSupabaseUrl)),
    urlValidFormat: /^https?:\/\/.+/i.test(rawSupabaseUrl),
    publishableKeyPresent: Boolean(
      rawSupabasePublishableKey && !isPlaceholderValue(rawSupabasePublishableKey)
    ),
    storageBucket: PROPERTY_IMAGES_BUCKET,
    mode: String(import.meta.env.MODE || 'unknown'),
    isDev: Boolean(import.meta.env.DEV),
    initErrorMessage: clientInitError ? clientInitError.message : null
  };
}

export function getSupabaseConfigurationError(): string | null {
  if (isSupabaseConfigured()) {
    return null;
  }

  if (clientInitError) {
    return `Supabase client initialization threw an exception: ${clientInitError.message}`;
  }

  const missing: string[] = [];
  if (!rawSupabaseUrl || isPlaceholderValue(rawSupabaseUrl)) {
    missing.push('VITE_SUPABASE_URL');
  } else if (!/^https?:\/\/.+/i.test(rawSupabaseUrl)) {
    missing.push('VITE_SUPABASE_URL (invalid URL format)');
  }

  if (!rawSupabasePublishableKey || isPlaceholderValue(rawSupabasePublishableKey)) {
    missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  return `Missing or invalid required Supabase environment variable(s) in current build (mode="${
    import.meta.env.MODE
  }"): ${
    missing.join(', ') || 'VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY'
  }. Configure these environment variables in your build/runtime environment and rebuild.`;
}

// Development startup diagnostics (never logs secrets, passwords, tokens, or publishable key)
const diagnostics = getSupabaseDiagnostics();
console.info('[RealityEstates Startup] 1. Supabase configured:', diagnostics.supabaseConfigured, {
  urlPresent: diagnostics.urlPresent,
  urlValidFormat: diagnostics.urlValidFormat,
  publishableKeyPresent: diagnostics.publishableKeyPresent,
  storageBucket: diagnostics.storageBucket,
  mode: diagnostics.mode,
  isDev: diagnostics.isDev
});

if (diagnostics.clientCreated) {
  console.info('[RealityEstates Startup] 2. Supabase client creation: succeeded');
} else {
  console.error(
    '[RealityEstates Startup] 2. Supabase client creation: failed',
    diagnostics.initErrorMessage || getSupabaseConfigurationError()
  );
}

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

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Parses a key=value dotenv file directly from disk so non-empty values in `.env`
 * or `.env.local` are not shadowed when a cloud/container runtime injects empty
 * strings (`""`) or `.env.example` placeholders into `process.env`.
 */
function parseDotEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const result: Record<string, string> = {};
  const content = readFileSync(filePath, 'utf-8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) {
      result[key] = value;
    }
  }
  return result;
}

function isPlaceholderValue(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return (
    trimmed.includes('your-project-ref.supabase.co') ||
    trimmed.includes('your-public-publishable-key') ||
    trimmed.includes('<project-ref>') ||
    trimmed.includes('<your-publishable-key>')
  );
}

function resolveEnvValue(
  key: string,
  viteLoaded: Record<string, string>,
  dotEnvValues: Record<string, string>
): string {
  const candidates = [
    process.env[key],
    viteLoaded[key],
    dotEnvValues[key]
  ];

  for (const candidate of candidates) {
    if (candidate && !isPlaceholderValue(candidate)) {
      return candidate.trim();
    }
  }
  return '';
}

export default defineConfig(({ mode }) => {
  const viteLoaded = loadEnv(mode, __dirname, '');
  const dotEnvValues = {
    ...parseDotEnvFile(resolve(__dirname, '.env')),
    ...parseDotEnvFile(resolve(__dirname, '.env.local'))
  };

  const resolvedSupabaseUrl = resolveEnvValue(
    'VITE_SUPABASE_URL',
    viteLoaded,
    dotEnvValues
  )
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');

  const resolvedPublishableKey =
    resolveEnvValue('VITE_SUPABASE_PUBLISHABLE_KEY', viteLoaded, dotEnvValues) ||
    resolveEnvValue('VITE_SUPABASE_ANON_KEY', viteLoaded, dotEnvValues);

  const resolvedStorageBucket =
    resolveEnvValue('VITE_SUPABASE_STORAGE_BUCKET', viteLoaded, dotEnvValues) ||
    'property-images';

  // Ensure process.env also reflects the resolved non-empty values for Vite's internal env plugin
  if (resolvedSupabaseUrl) {
    process.env.VITE_SUPABASE_URL = resolvedSupabaseUrl;
  }
  if (resolvedPublishableKey) {
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY = resolvedPublishableKey;
  }
  if (resolvedStorageBucket) {
    process.env.VITE_SUPABASE_STORAGE_BUCKET = resolvedStorageBucket;
  }

  return {
    root: __dirname,
    envDir: __dirname,
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(resolvedSupabaseUrl),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
        resolvedPublishableKey
      ),
      'import.meta.env.VITE_SUPABASE_STORAGE_BUCKET': JSON.stringify(
        resolvedStorageBucket
      )
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, '.')
      }
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {}
    }
  };
});

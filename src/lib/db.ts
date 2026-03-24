import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * Access the Cloudflare D1 database instance.
 * Note: This only works in environments where Cloudflare bindings are available
 * (e.g. Cloudflare Pages, Wrangler Pages Dev).
 */
export function getDb() {
  try {
    const ctx = getRequestContext();
    const env = ctx.env as unknown as CloudflareEnv;
    return env.DB;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
        // In local development, if not using wrangler, we might want to log a warning
        // but avoid crashing until a query is actually attempted.
        return null;
    }
    throw new Error('Cloudflare D1 Database is not available. Ensure you are running in a Cloudflare environment.');
  }
}

/**
 * Helper to parse JSON columns from SQLite.
 */
export function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.error('Failed to parse JSON column:', e);
    return null;
  }
}

/**
 * Helper to stringify JSON columns for SQLite.
 */
export function stringifyJson(value: any): string {
  return JSON.stringify(value);
}

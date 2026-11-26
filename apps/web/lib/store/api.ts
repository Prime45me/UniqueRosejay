import { cookies, headers } from 'next/headers';
import type { ApiErrorBody } from '@/lib/store/types';

/*
 * Server-side API client for Server Components. Calls Express directly (not through the /api
 * rewrite), forwards the visitor's address for per-visitor rate limiting, never caches, and
 * times out so a stalled API produces an error state instead of a hung page.
 */

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';

export class StoreApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'StoreApiError';
  }
}

interface Options {
  /** Names of cookies to forward to the API (e.g. an order access cookie). */
  forwardCookies?: string[];
}

export async function storeGet<T, M = undefined>(path: string, options: Options = {}): Promise<{ data: T; meta: M }> {
  const incoming = await headers();
  const forwarded = incoming.get('x-forwarded-for') ?? incoming.get('x-real-ip') ?? undefined;
  const requestHeaders: Record<string, string> = { accept: 'application/json' };
  if (forwarded) requestHeaders['x-forwarded-for'] = forwarded;

  if (options.forwardCookies?.length) {
    const jar = await cookies();
    const pairs = options.forwardCookies
      .map((name) => {
        const value = jar.get(name)?.value;
        return value ? `${name}=${encodeURIComponent(value)}` : null;
      })
      .filter(Boolean);
    if (pairs.length) requestHeaders.cookie = pairs.join('; ');
  }

  let response: Response;
  try {
    response = await fetch(`${API_ORIGIN}/api/store${path}`, {
      headers: requestHeaders,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000)
    });
  } catch {
    throw new StoreApiError(503, 'UNAVAILABLE', 'The Store service is not reachable right now.');
  }

  const body = (await response.json().catch(() => null)) as ({ data: T; meta: M } & Partial<ApiErrorBody>) | null;
  if (!response.ok || !body) {
    throw new StoreApiError(response.status, body?.error?.code ?? 'ERROR', body?.error?.message ?? 'The Store request failed.');
  }
  return body;
}

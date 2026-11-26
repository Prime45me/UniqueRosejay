import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, Request, RequestHandler } from 'express';
import { env } from '../config/env.js';
import { ApiError } from './http.js';

/** 256-bit random token, URL-safe. Only its SHA-256 hash is ever stored. */
export function newToken() {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Minimal cookie-header parser (avoids a cookie-parser dependency). */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export function cookieOptions(maxAgeDays: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeDays * 24 * 60 * 60 * 1000
  };
}

/**
 * CSRF defence for cookie-authenticated mutations: when the browser sends an Origin header it
 * must be an allowed origin. (SameSite=Lax cookies are the first layer.)
 */
export const requireAllowedOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.headers.origin;
  if (origin && !env.corsOrigins.includes(origin)) {
    next(ApiError.forbidden('Request origin is not allowed'));
    return;
  }
  next();
};

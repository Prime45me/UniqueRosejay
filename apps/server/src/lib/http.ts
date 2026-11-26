import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';

/*
 * API conventions (docs/API.md):
 *   success → { "data": ..., "meta"?: {...} }
 *   failure → { "error": { "code": "MACHINE_CODE", "message": "Human readable", "details"?: [...] } }
 * Error responses never include stack traces, SQL or internal identifiers.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'You do not have access to this resource') {
    return new ApiError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static conflict(message: string, details?: unknown) {
    return new ApiError(409, 'CONFLICT', message, details);
  }
}

export function sendData<T>(res: Response, data: T, options: { status?: number; meta?: Record<string, unknown> } = {}) {
  res.status(options.status ?? 200).json(options.meta ? { data, meta: options.meta } : { data });
}

/** Wraps an async handler so rejected promises reach the error middleware (Express 4). */
export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

type Source = 'body' | 'query' | 'params';

/**
 * Validates and replaces req[source] with the parsed (typed, coerced, stripped) value.
 * Unknown keys are removed by Zod's default object behaviour.
 */
export function validate<T extends z.ZodType>(source: Source, schema: T): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(
        ApiError.badRequest(
          'The request is invalid',
          result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
        )
      );
      return;
    }
    if (source === 'query') {
      // req.query is a getter in newer Express versions; store parsed values separately.
      (req as Request & { validatedQuery?: unknown }).validatedQuery = result.data;
    } else {
      (req as unknown as Record<Source, unknown>)[source] = result.data;
    }
    next();
  };
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`No route for ${req.method} ${req.path}`));
};

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) }
    });
    return;
  }

  // Malformed JSON bodies raised by express.json().
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Malformed JSON body' } });
    return;
  }

  console.error('Unhandled API error:', error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
}

import type { ApiFailure } from './ApiFailure';

/**
 * The only error the API layer throws. It carries the classified failure so callers
 * branch on `failure.kind` rather than parsing a message.
 */
export class ApiError extends Error {
  readonly failure: ApiFailure;

  constructor(failure: ApiFailure) {
    super(`API request failed: ${failure.kind}`);
    this.name = 'ApiError';
    this.failure = failure;
  }
}

/** Narrows an unknown thrown value to an `ApiError`. */
export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/** An unusable response body is a transport failure: the call may work on a retry. */
export const malformedResponse = (reason: string): ApiError =>
  new ApiError({ kind: 'transport', cause: new Error(reason) });

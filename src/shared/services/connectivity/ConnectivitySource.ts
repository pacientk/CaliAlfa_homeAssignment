import type { ApiFailure } from '@shared/api';

/** The read side: what the drain loop checks and what the offline banner renders. */
export interface ConnectivitySource {
  getIsOnline(): boolean;
  /** Notified on every transition. Returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
}

/** The write side: the outcome of a real request is the only evidence this app has. */
export interface ConnectivityReporter {
  reportSuccess(): void;
  reportFailure(failure: ApiFailure): void;
}

export type ConnectivityService = ConnectivitySource & ConnectivityReporter;

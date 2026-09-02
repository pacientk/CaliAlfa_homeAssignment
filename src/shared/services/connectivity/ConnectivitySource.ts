import type { ApiFailure } from '@shared/api';

/**
 * The read side, and it answers two different questions rather than one.
 *
 * They were a single boolean once, and that is what made the offline banner lie: the drain loop
 * needs permission to try again after a while, the banner needs to know what is actually true,
 * and a flag that flips to "online" on a timer so the queue will probe is a flag that tells the
 * user the connection is back when nothing of the sort has been established.
 */
export interface ConnectivitySource {
  /**
   * What the app believes, and therefore what it is willing to tell the user. Only a real
   * request outcome moves it: a success, or a failure that proves the server was reached.
   */
  getIsOnline(): boolean;
  /**
   * Whether a request is worth making now. True whenever the app believes it is online, and
   * also for the one attempt a probe buys after an outage — which is how a dead connection is
   * ever discovered to have recovered, since only an attempt can produce that evidence.
   */
  getShouldAttempt(): boolean;
  /** Notified when either answer changes. Returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
}

/** The write side: the outcome of a real request is the only evidence this app has. */
export interface ConnectivityReporter {
  reportSuccess(): void;
  reportFailure(failure: ApiFailure): void;
}

export type ConnectivityService = ConnectivitySource & ConnectivityReporter;

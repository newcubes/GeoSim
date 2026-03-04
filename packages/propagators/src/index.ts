/**
 * Minimal stub for sand-only build. Full implementation was removed.
 */
export interface PropagatorOptions {
  [key: string]: unknown;
}

export class Propagator {
  constructor(_options?: PropagatorOptions) {}
  dispose(): void {}
}

export class AsyncPropagator {
  constructor(_options?: PropagatorOptions) {}
  dispose(): void {}
}

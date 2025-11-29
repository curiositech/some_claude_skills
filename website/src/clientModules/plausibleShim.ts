// Plausible shim - provides a no-op function when plausible isn't loaded
// This prevents errors in development or when ad blockers block plausible

if (typeof window !== 'undefined') {
  // Only create the shim if plausible doesn't already exist
  if (typeof (window as any).plausible !== 'function') {
    (window as any).plausible = function(...args: any[]) {
      // No-op in development, silently ignore the call
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Plausible Shim] Tracking skipped:', args);
      }
    };
  }
}

export {};

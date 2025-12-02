"use strict";
// Plausible shim - provides a no-op function when plausible isn't loaded
// This prevents errors in development or when ad blockers block plausible
Object.defineProperty(exports, "__esModule", { value: true });
if (typeof window !== 'undefined') {
    // Only create the shim if plausible doesn't already exist
    if (typeof window.plausible !== 'function') {
        window.plausible = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // No-op in development, silently ignore the call
            if (process.env.NODE_ENV !== 'production') {
                console.debug('[Plausible Shim] Tracking skipped:', args);
            }
        };
    }
}

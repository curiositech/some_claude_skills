/**
 * R2 storage for drawing snapshots. Images live in R2 (built for blobs);
 * only the keys are kept in D1.
 */

import type { Env } from "./env";

/** Decode a data URL or bare base64 PNG into bytes. */
function decodePng(dataUrl: string): Uint8Array | null {
  try {
    const b64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Store a PNG in R2. Returns the key, or null if there's nothing to store /
 * no bucket bound. Never throws — logging must not break generation.
 */
export async function storePng(
  env: Env,
  key: string,
  dataUrl: string | undefined | null
): Promise<string | null> {
  if (!env.MSPAINT_BUCKET || !dataUrl) return null;
  const bytes = decodePng(dataUrl);
  if (!bytes || bytes.length === 0) return null;
  try {
    await env.MSPAINT_BUCKET.put(key, bytes, {
      httpMetadata: { contentType: "image/png" },
    });
    return key;
  } catch {
    return null;
  }
}

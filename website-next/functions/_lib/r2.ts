/**
 * R2 storage for drawing snapshots. Images live in R2 (built for blobs);
 * only the keys are kept in D1.
 */

import type { Env } from "./env";

/** Decode a data URL (any image type) or bare base64 into bytes + mime. */
function decode(dataUrl: string): { bytes: Uint8Array; mime: string } | null {
  try {
    const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/s);
    const mime = match ? match[1] : "image/png";
    const b64 = match ? match[2] : dataUrl;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { bytes, mime };
  } catch {
    return null;
  }
}

const decodePng = (d: string): Uint8Array | null => decode(d)?.bytes ?? null;

/** Store any image data URL (jpeg/png) in R2. Returns key or null. */
export async function storeDataUrl(
  env: Env,
  key: string,
  dataUrl: string | undefined | null
): Promise<string | null> {
  if (!env.MSPAINT_BUCKET || !dataUrl) return null;
  const d = decode(dataUrl);
  if (!d || d.bytes.length === 0) return null;
  try {
    await env.MSPAINT_BUCKET.put(key, d.bytes, { httpMetadata: { contentType: d.mime } });
    return key;
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

/**
 * Reference-image search for the drawing agents ("summon & look at references").
 * Worker-compatible (no Node Buffer/process.env) — fetches from Pexels and
 * returns data URLs ready to hand to a vision model, plus attribution.
 */

import type { Env } from "./env";

export interface RefImage {
  url: string; // original photo url (attribution / logging)
  dataUrl: string; // base64 data URL for the vision model
  query: string;
  photographer?: string;
}

const STOP = new Set([
  "a", "an", "the", "draw", "paint", "create", "make", "sketch", "of", "with",
  "and", "in", "on", "simple", "detailed", "cute", "please", "me", "scene", "style",
]);

export function searchTerms(prompt: string): string {
  const cleaned = prompt.toLowerCase().replace(/[^\w\s-]/g, "");
  const words = cleaned.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  return Array.from(new Set(words)).slice(0, 4).join(" ");
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

/**
 * Fetch up to `count` reference images for a prompt. Returns [] if no key or
 * on any failure (never throws — references are an enhancement, not required).
 */
export async function searchReferences(
  env: Env,
  prompt: string,
  count = 1
): Promise<{ images: RefImage[]; query: string }> {
  const key = env.PEXELS_API_KEY;
  const query = searchTerms(prompt);
  if (!key || !query) return { images: [], query };

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&size=small&orientation=landscape`,
      { headers: { Authorization: key }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return { images: [], query };
    const data = (await res.json()) as {
      photos?: Array<{ src?: { small?: string; tiny?: string; medium?: string }; photographer?: string }>;
    };
    const photos = (data.photos || []).slice(0, count);

    const images: RefImage[] = [];
    for (const p of photos) {
      const imgUrl = p.src?.small || p.src?.tiny;
      if (!imgUrl) continue;
      try {
        const ir = await fetch(imgUrl, { signal: AbortSignal.timeout(6000) });
        if (!ir.ok) continue;
        const bytes = new Uint8Array(await ir.arrayBuffer());
        images.push({
          url: p.src?.medium || imgUrl,
          dataUrl: `data:image/jpeg;base64,${toBase64(bytes)}`,
          query,
          photographer: p.photographer,
        });
      } catch {
        /* skip this image */
      }
    }
    return { images, query };
  } catch {
    return { images: [], query };
  }
}

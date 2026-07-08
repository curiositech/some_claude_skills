/**
 * POST /api/mspaint/snapshot — attach the final rendered drawing (the true
 * "output") to a generation after the client finishes playback.
 *
 * Body: { generationId: string, image: dataURL-png }
 */

import type { Env } from "../../_lib/env";
import { storePng } from "../../_lib/r2";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!env.MSPAINT_DB || !env.MSPAINT_BUCKET) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { generationId?: string; image?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { generationId, image } = body;
  if (!generationId || !image) {
    return new Response(JSON.stringify({ error: "generationId and image required" }), {
      status: 400,
    });
  }

  // Only attach to a row that exists (avoids writing junk keys).
  const exists = await env.MSPAINT_DB.prepare("SELECT id FROM generations WHERE id = ?")
    .bind(generationId)
    .first();
  if (!exists) {
    return new Response(JSON.stringify({ error: "Unknown generationId" }), { status: 404 });
  }

  const key = await storePng(env, `drawings/${generationId}/after.png`, image);
  if (key) {
    await env.MSPAINT_DB.prepare("UPDATE generations SET canvas_after_key = ? WHERE id = ?")
      .bind(key, generationId)
      .run();
  }

  return new Response(JSON.stringify({ ok: true, key }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

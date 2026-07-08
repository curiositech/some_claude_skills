/**
 * GET /api/mspaint/usage — current free-tier quota for this anonymous user.
 * Used by the UI to display "X / N free drawings left" on load.
 */

import type { Env } from "../../_lib/env";
import { freeLimit } from "../../_lib/env";
import { identify, identityCookie } from "../../_lib/identity";
import { readQuota } from "../../_lib/db";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const id = await identify(request, env);
  const cookie = id.isNewCookie ? identityCookie(id.cookieUuid) : undefined;
  const limit = freeLimit(env);

  let used = 0;
  if (env.MSPAINT_DB) {
    const q = await readQuota(env, id);
    used = q.used;
  }
  const remaining = Math.max(0, limit - used);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie) headers["Set-Cookie"] = cookie;

  return new Response(
    JSON.stringify({ usesRemaining: remaining, usesLimit: limit, used }),
    { status: 200, headers }
  );
};

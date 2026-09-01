import * as amplitude from "@amplitude/analytics-node";

/**
 * Server-side tracking for Next.js API routes.
 *
 * Browser events carry the same Prisma user id (see lib/analytics/client.js),
 * so client and server events stitch to one person in Amplitude.
 *
 * Never pass lead emails, SMTP passwords or credential values as properties —
 * counts, ids and error codes only.
 */

let initialized = false;

function ensureInit() {
  if (initialized) return true;

  const apiKey = process.env.AMPLITUDE_API_KEY;
  if (!apiKey) {
    console.warn("Amplitude API key missing — server analytics disabled");
    return false;
  }

  amplitude.init(apiKey, { flushQueueSize: 1, flushIntervalMillis: 0 });
  initialized = true;
  return true;
}

/**
 * Fire-and-forget: analytics must never break a request. Awaiting the flush
 * keeps events from being dropped when the container recycles.
 */
export async function trackServer(event, userId, properties = {}) {
  if (!ensureInit()) return;

  try {
    await amplitude.track(event, properties, {
      user_id: userId ?? undefined,
      // Amplitude needs one of user_id / device_id; anonymous events (a failed
      // login, an unauthenticated import) have no user yet.
      device_id: userId ? undefined : "server",
    }).promise;
  } catch (error) {
    console.warn("Amplitude server track failed:", event, error);
  }
}

/** Pulls the Prisma user id out of the bearer token used across the API routes. */
export function userIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf8"),
    );
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

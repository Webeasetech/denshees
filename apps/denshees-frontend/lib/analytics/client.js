"use client";

import * as amplitude from "@amplitude/unified";

/**
 * Browser-side tracking helpers.
 *
 * Never pass lead emails, SMTP passwords or credential values as properties —
 * counts, ids and error codes only.
 */

export function track(event, properties = {}) {
  try {
    amplitude.track(event, properties);
  } catch (error) {
    console.warn("Amplitude track failed:", event, error);
  }
}

/** Stitches browser events to the Prisma user id so they join server events. */
export function identifyUser(user) {
  if (!user?.id) return;
  try {
    amplitude.setUserId(user.id);
  } catch (error) {
    console.warn("Amplitude identify failed:", error);
  }
}

/** Called on logout so the next session isn't attributed to the old user. */
export function resetAnalytics() {
  try {
    amplitude.reset();
  } catch (error) {
    console.warn("Amplitude reset failed:", error);
  }
}

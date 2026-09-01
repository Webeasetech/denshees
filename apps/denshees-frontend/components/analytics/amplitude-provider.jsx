"use client";

import { useEffect } from "react";
import * as amplitude from "@amplitude/unified";

// Guards against a second init across client-side navigations / fast refresh.
let initialized = false;

export default function AmplitudeProvider() {
  useEffect(() => {
    if (initialized) return;

    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (!apiKey) {
      console.warn("Amplitude API key missing — analytics disabled");
      return;
    }

    amplitude.initAll(apiKey, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
    initialized = true;
  }, []);

  return null;
}

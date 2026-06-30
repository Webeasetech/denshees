"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

// Wraps all auth pages (login, signup, onboarding) so the Google Sign-In
// button has its client ID context. NEXT_PUBLIC_ vars are inlined into the
// browser bundle at build time.
export default function AuthLayout({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}

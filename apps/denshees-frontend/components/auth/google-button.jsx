"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import useAuthStore from "@/store/auth.store";

/**
 * Renders the Google Sign-In button. On success it sends the Google ID token
 * (credentialResponse.credential) to our /api/auth/google route, which verifies
 * it and returns our own { user, token }. Used on both login and signup — the
 * backend creates the account on first sign-in, so the flow is identical.
 */
export default function GoogleButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast(result.message || "Google sign-in failed");
        return;
      }

      setAuth({ user: result.user, token: result.token });
      router.push(result.user.isSetup ? "/" : "/onboarding");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      {isLoading ? (
        <LoadingPlaceholder />
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast("Google sign-in failed")}
          width="320"
          text="continue_with"
          shape="rectangular"
        />
      )}
    </div>
  );
}

// Lightweight loading placeholder so the button area doesn't collapse while the
// request is in flight (GoogleLogin renders its own button otherwise).
function LoadingPlaceholder() {
  return (
    <div className="h-10 w-[320px] flex items-center justify-center border border-gray-300 bg-white text-sm text-gray-500">
      Signing in...
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarsCIcon } from "mage-icons-react/bulk";
import { ReloadIcon } from "mage-icons-react/stroke";
import { SettingsNav } from "@/components/settings/settings-nav";
import { CreditsDisplay } from "@/components/credits-display";
import { Skeleton } from "@/components/ui/skeleton";
import useAuthStore from "@/store/auth.store";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import fetcher from "@/lib/fetcher";
import { post } from "@/lib/apis";
import { toast } from "sonner";

const REPO_URL = "https://github.com/Webeasetech/denshees";
const STAR_CREDIT_AMOUNT = 1000;

export default function CreditsSettingsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SettingsNav />
        </div>

        <div className="md:col-span-3">
          <FreeCreditsSettings />
        </div>
      </div>
    </div>
  );
}

function FreeCreditsSettings() {
  const { user, updateUser } = useAuthStore();
  const [hasVisitedRepo, setHasVisitedRepo] = useState(false);

  const {
    data: claim,
    isLoading: isLoadingClaim,
    mutate: refreshClaim,
  } = useSWR("/api/user/claim-star-credits", fetcher);

  const { trigger: claimCredits, isMutating: isClaiming } = useSWRMutation(
    "/api/user/claim-star-credits",
    post,
    {
      onSuccess: (data) => {
        updateUser({ credits: data.credits });
        refreshClaim();
        toast.success(`${STAR_CREDIT_AMOUNT} credits added. Thanks for the star!`);
      },
      onError: (error) => {
        const message =
          error?.response?.data?.message || "Could not claim your credits";
        toast.error(message);
        // A 409 means it was already claimed elsewhere — resync so the UI agrees.
        refreshClaim();
      },
    },
  );

  const isClaimed = Boolean(claim?.claimed);

  const handleStar = () => {
    window.open(REPO_URL, "_blank", "noopener,noreferrer");
    setHasVisitedRepo(true);
  };

  return (
    <div id="credits-settings" className="space-y-6">
      <div className="border border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-bold mb-6">Current Credits</h2>
        <CreditsDisplay user={user} />
      </div>

      <div className="border border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <StarsCIcon className="h-5 w-5" />
          Star us on GitHub
        </h2>
        <p className="text-gray-600 mb-6">
          Star the Denshees repository and claim{" "}
          <span className="font-bold text-black">
            {STAR_CREDIT_AMOUNT.toLocaleString()} free email credits
          </span>
          . One claim per account.
        </p>

        {isLoadingClaim ? (
          // Claim state decides between two very different blocks, so render a
          // skeleton rather than flashing the wrong one before it resolves.
          <div className="space-y-3">
            <Skeleton className="h-10 w-full sm:w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : isClaimed ? (
          <div className="border-2 border-black bg-gray-50 p-4 flex items-center gap-3">
            <StarsCIcon className="h-5 w-5" />
            <div>
              <p className="font-bold">Credits claimed</p>
              <p className="text-sm text-gray-600">
                {STAR_CREDIT_AMOUNT.toLocaleString()} credits were added to your
                account. Thanks for the star!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleStar}>
              <StarsCIcon className="mr-2 h-4 w-4" />
              Star repository
            </Button>

            <Button
              variant="outline"
              disabled={!hasVisitedRepo || isClaiming}
              onClick={() => claimCredits({})}
            >
              {isClaiming ? (
                <>
                  <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                `Claim ${STAR_CREDIT_AMOUNT.toLocaleString()} credits`
              )}
            </Button>
          </div>
        )}

        {!isLoadingClaim && !isClaimed && !hasVisitedRepo && (
          <p className="text-sm text-gray-500 mt-3">
            Star the repo first — the claim button unlocks once you have opened
            it.
          </p>
        )}
      </div>
    </div>
  );
}

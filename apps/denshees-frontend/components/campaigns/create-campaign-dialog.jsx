"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { post } from "@/lib/apis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTour } from "@/components/tour/tour-provider";

export default function CreateCampaignDialog({ children }) {
  const router = useRouter();
  // A modal dialog traps focus and blocks pointer events outside itself,
  // which would freeze the onboarding tour's tooltip. Non-modal while touring.
  const { isTourActive } = useTour();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const { trigger } = useSWRMutation("/api/campaign/create", post, {
    onSuccess: () => {
      mutate("/api/campaign");
    },
  });

  const handleCreate = async () => {
    if (!title.trim() || !desc.trim()) {
      toast.error("Please fill in a title and description.");
      return;
    }

    setLoading(true);
    try {
      const res = await trigger({
        title: title.trim(),
        desc: desc.trim(),
        email_delivery_period: "MORNING",
      });

      toast.success("Campaign created successfully!");
      setOpen(false);
      router.push(`/campaigns/${res.campaign?.id}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error("Failed to create campaign!");
    } finally {
      setLoading(false);
    }
  };

  // While the tour is active its tooltip lives outside the dialog, so Radix's
  // outside-interaction dismissal (pointer/focus/escape) would close the dialog
  // the moment the tooltip takes focus or its Next button is clicked. Block
  // dismissal during the tour; handleCreate still closes it via setOpen.
  const handleOpenChange = (next) => {
    if (isTourActive && !next) return;
    setOpen(next);
  };
  const blockWhileTouring = (e) => {
    if (isTourActive) e.preventDefault();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={!isTourActive}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        onInteractOutside={blockWhileTouring}
        onFocusOutside={blockWhileTouring}
        onEscapeKeyDown={blockWhileTouring}
      >
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Set up a new email outreach campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="mb-2 block">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Campaign title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-black"
            />
          </div>

          <div>
            <Label htmlFor="desc" className="mb-2 block">
              Description
            </Label>
            <Textarea
              id="desc"
              placeholder="Campaign description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="border-black min-h-[100px]"
            />
          </div>

          <Button
            id="tour-create-campaign-submit"
            onClick={handleCreate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating..." : "Create"}
          </Button>

          <p className="text-xs text-gray-500">
            Starts with a ready-made sequence — 4 emails, 1 day apart, sent between
            6 AM–12 PM. Adjust anytime in Builder and Settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

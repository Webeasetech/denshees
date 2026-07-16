"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { post } from "@/lib/apis";
import CustomCampaignCreation from "@/components/campaigns/create/custom-campaign";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const { trigger } = useSWRMutation("/api/campaign/create", post, {
    onSuccess: () => {
      mutate("/api/campaign");
    },
  });

  const handleSubmit = async () => {
    setLoading(true);

    if (!title || !desc || !time) {
      toast.error("Please fill all the fields!");
      setLoading(false);
      return;
    }

    const apiPromise = trigger({
      title,
      desc,
      email_delivery_period: time,
    });

    const minimumLoadingTimePromise = new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });

    try {
      const [res] = await Promise.all([apiPromise, minimumLoadingTimePromise]);

      setLoading(false);
      toast.success("Campaign created successfully!");
      router.push(`/campaigns/${res.campaign?.id}`);
    } catch (error) {
      console.error("API call failed:", error);
      setLoading(false);
      toast.error("Failed to create campaign!");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <p className="text-gray-600 mt-1">
          Set up a new email outreach campaign
        </p>
      </div>

      <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CustomCampaignCreation
          title={title}
          setTitle={setTitle}
          desc={desc}
          setDesc={setDesc}
          time={time}
          setTime={setTime}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

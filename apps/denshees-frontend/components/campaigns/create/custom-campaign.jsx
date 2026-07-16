"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Stepper from "@/components/campaigns/create/stepper";

const TIME_LABELS = {
  MORNING: "6 AM - 12 PM",
  EVENING: "12 PM - 6 PM",
  NIGHT: "6 PM - 12 AM",
  MIDNIGHT: "12 AM - 6 AM",
};

const IntroductionStep = ({ title, setTitle, desc, setDesc }) => (
  <div className="flex flex-col items-center justify-evenly w-full gap-6 p-4">
    <div className="w-full">
      <Label htmlFor="title" className="text-right pb-2 text-md">
        Title
      </Label>
      <Input
        placeholder="Campaign title"
        name="title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border-black"
      />
    </div>
    <div className="w-full">
      <Label htmlFor="desc" className="text-right pb-2 text-md">
        Description
      </Label>
      <Textarea
        placeholder="Campaign description"
        name="desc"
        id="desc"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="border-black min-h-[150px]"
      />
    </div>
  </div>
);

const SettingsStep = ({ time, setTime }) => (
  <div className="flex flex-col items-start justify-center gap-8 w-full p-4">
    <div className="w-full md:w-[60%] flex items-center justify-start gap-4">
      <Select value={time} onValueChange={(value) => setTime(value)}>
        <SelectTrigger
          id="tour-send-time"
          className="w-full text-md border-black"
        >
          <SelectValue
            className="font-bold"
            placeholder="When should the emails be sent?"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select time of the day...</SelectLabel>
            <SelectItem value="MORNING">{TIME_LABELS.MORNING}</SelectItem>
            <SelectItem value="EVENING">{TIME_LABELS.EVENING}</SelectItem>
            <SelectItem value="NIGHT">{TIME_LABELS.NIGHT}</SelectItem>
            <SelectItem value="MIDNIGHT">{TIME_LABELS.MIDNIGHT}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    <p className="text-sm text-gray-600">
      Your campaign starts with 4 emails, 1 day apart. Change the sequence
      anytime in the Builder tab.
    </p>
  </div>
);

function ReviewStep({ title, desc, time }) {
  return (
    <div className="flex flex-col gap-6 w-full p-4 border border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-bold">Campaign Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-lg font-semibold">Title:</p>
          <p className="text-md bg-gray-50 p-2 rounded border border-gray-200">
            {title}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-semibold">Description:</p>
          <p className="text-md bg-gray-50 p-2 rounded border border-gray-200">
            {desc}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold">Scheduled Time of the day:</p>
        <p className="text-md bg-gray-50 p-2 rounded border border-gray-200">
          {TIME_LABELS[time] ?? time}
        </p>
      </div>
    </div>
  );
}

export default function CustomCampaignCreation({
  title,
  setTitle,
  desc,
  setDesc,
  time,
  setTime,
  loading,
  onSubmit,
}) {
  return (
    <div className="relative">
      <div className="flex w-full items-center mb-6">
        <h2 className="text-2xl font-bold text-center w-full">
          Create Campaign
        </h2>
      </div>

      <Stepper
        loading={loading}
        steps={[
          {
            label: "Introduction",
            content: (
              <IntroductionStep
                title={title}
                setTitle={setTitle}
                desc={desc}
                setDesc={setDesc}
              />
            ),
          },
          {
            label: "Settings",
            content: <SettingsStep time={time} setTime={setTime} />,
          },
          {
            label: "Review & Submit",
            content: <ReviewStep title={title} desc={desc} time={time} />,
          },
        ]}
        onComplete={onSubmit}
      />
    </div>
  );
}

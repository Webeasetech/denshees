"use client";

import { useEffect, useState } from "react";
import { FilterIcon } from "mage-icons-react/bulk";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES } from "@/lib/constants/lead-status";

/**
 * Filters popover for the campaign leads table.
 *
 * Every filter here is applied server-side. Edits are held in local draft state
 * and only lifted to the parent (and so into the fetch query) on Apply — Reset
 * restores the defaults into the draft but likewise waits for Apply.
 *
 * @param {object} props
 * @param {{sentAtSort: string, stageFilter: string, statuses: string[]}} props.filters - Currently applied filters.
 * @param {{sentAtSort: string, stageFilter: string, statuses: string[]}} props.defaultFilters - Values the Reset button restores.
 * @param {(filters: object) => void} props.onApply - Called with the draft when Apply is pressed.
 * @param {number} props.maxStageCount - Number of stages in the campaign.
 */
export default function LeadsFilters({
  filters,
  defaultFilters,
  onApply,
  maxStageCount,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  // Discard an abandoned draft when the popover closes, so reopening always
  // shows what is actually applied.
  useEffect(() => {
    if (!open) setDraft(filters);
  }, [open, filters]);

  const toggleStatus = (value) => {
    setDraft((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(value)
        ? prev.statuses.filter((s) => s !== value)
        : [...prev.statuses, value],
    }));
  };

  const activeCount =
    (draft.statuses.length !== defaultFilters.statuses.length ||
    draft.statuses.some((s) => !defaultFilters.statuses.includes(s))
      ? 1
      : 0) +
    (draft.stageFilter !== defaultFilters.stageFilter ? 1 : 0) +
    (draft.sentAtSort !== defaultFilters.sentAtSort ? 1 : 0);

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <FilterIcon className="w-4 h-4 mr-2" />
          Filters
          {activeCount > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center border border-black bg-black px-1 text-[10px] font-medium text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid gap-4">
          <h4 className="font-medium leading-none">Filters</h4>

          <div className="grid gap-2">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {LEAD_STATUSES.map((status) => (
                <label
                  key={status.value}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={draft.statuses.includes(status.value)}
                    onCheckedChange={() => toggleStatus(status.value)}
                    className="border-black data-[state=checked]:bg-black"
                  />
                  {status.label}
                </label>
              ))}
            </div>
            {draft.statuses.length === 0 && (
              <p className="text-xs text-red-700">
                Select at least one status.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="sent-at-sort">Last Sent At</Label>
            <Select
              value={draft.sentAtSort}
              onValueChange={(sentAtSort) =>
                setDraft((prev) => ({ ...prev, sentAtSort }))
              }
            >
              <SelectTrigger
                id="sent-at-sort"
                className="col-span-2 h-8 border-black"
              >
                <SelectValue placeholder="Sort by sent date" />
              </SelectTrigger>
              <SelectContent className="border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <SelectItem value="NEWEST_FIRST">Newest first</SelectItem>
                <SelectItem value="OLDEST_FIRST">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="stage-filter">Stage</Label>
            <Select
              value={draft.stageFilter}
              onValueChange={(stageFilter) =>
                setDraft((prev) => ({ ...prev, stageFilter }))
              }
            >
              <SelectTrigger
                id="stage-filter"
                className="col-span-2 h-8 border-black"
              >
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent className="border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <SelectItem value="ALL">All stages</SelectItem>
                {Array.from({ length: (maxStageCount || 5) + 1 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    Stage {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDraft(defaultFilters)}
            >
              Reset
            </Button>
            <Button
              size="sm"
              disabled={draft.statuses.length === 0}
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

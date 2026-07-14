"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  MessageSquareIcon,
  EyeIcon,
  CancelIcon,
} from "mage-icons-react/bulk";

const VARIANTS = {
  replied: {
    icon: MessageSquareIcon,
    accent: "text-green-700",
    border: "border-green-700",
    bar: "bg-green-700",
  },
  opened: {
    icon: EyeIcon,
    accent: "text-blue-700",
    border: "border-blue-700",
    bar: "bg-blue-700",
  },
  noReply: {
    icon: CancelIcon,
    accent: "text-gray-600",
    border: "border-gray-600",
    bar: "bg-gray-600",
  },
};

const OutcomeNode = ({ data }) => {
  const { label, count, percentage, type } = data;
  const variant = VARIANTS[type] ?? VARIANTS.noReply;
  const Icon = variant.icon;

  return (
    <div
      className={`h-full px-3 py-2 bg-white border-2 ${variant.border} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-black !border-2 !border-white !w-3 !h-3"
      />

      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 shrink-0 ${variant.accent}`} />
        <span className={`text-xs font-bold ${variant.accent}`}>{label}</span>
      </div>

      <div className="text-2xl font-bold leading-none">{count}</div>

      <div>
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>{percentage}%</span>
        </div>
        <div className="mt-1 h-1 w-full bg-gray-200">
          <div
            className={`h-full ${variant.bar}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(OutcomeNode);

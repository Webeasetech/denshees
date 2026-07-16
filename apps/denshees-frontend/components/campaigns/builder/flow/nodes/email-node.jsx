"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  EmailIcon,
  AeroplaneIcon,
  MessageSquareIcon,
} from "mage-icons-react/bulk";

const EmailNode = ({ data }) => {
  const {
    label,
    pitch,
    isSelected,
    isTerminal,
    isDeletable,
    onOpen,
    onDelete,
    contactCount,
    replyCount,
    totalContacts,
  } = data;

  const contactPercentage =
    totalContacts > 0 ? Math.round((contactCount / totalContacts) * 100) : 0;

  return (
    <div
      onClick={() => onOpen(pitch)}
      className={`relative h-full px-4 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
        isSelected ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-black !border-2 !border-white !w-3 !h-3"
      />

      {isDeletable && (
        <button
          type="button"
          title="Remove this follow-up"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(pitch);
          }}
          className="absolute -top-2.5 -right-2.5 w-5 h-5 flex items-center justify-center bg-white text-black border-2 border-black text-xs font-bold leading-none hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
        >
          ×
        </button>
      )}

      <div className="flex items-center gap-2">
        <EmailIcon className="w-[18px] h-[18px] shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-bold leading-tight">{label}</div>
          <div className="text-xs truncate max-w-[160px] opacity-80">
            {pitch.subject || "No subject"}
          </div>
        </div>
      </div>

      <div
        className={`mt-2 pt-2 border-t space-y-1 ${
          isSelected ? "border-white/25" : "border-black/15"
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <AeroplaneIcon className="w-3 h-3" />
            Contacts
          </span>
          <span className="font-bold">
            {contactCount}
            <span
              className={`ml-1 text-[10px] ${
                isSelected ? "text-white/60" : "text-gray-500"
              }`}
            >
              ({contactPercentage}%)
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span
            className={`flex items-center gap-1 ${
              isSelected ? "text-green-400" : "text-green-700"
            }`}
          >
            <MessageSquareIcon className="w-3 h-3" />
            Replies
          </span>
          <span
            className={`font-bold ${
              isSelected ? "text-green-400" : "text-green-700"
            }`}
          >
            {replyCount}
          </span>
        </div>
      </div>

      <Handle
        id="next"
        type="source"
        position={Position.Right}
        className="!bg-black !border-2 !border-white !w-3 !h-3"
      />

      {isTerminal && (
        <Handle
          id="outcome"
          type="source"
          position={Position.Bottom}
          className="!bg-black !border-2 !border-white !w-3 !h-3"
        />
      )}
    </div>
  );
};

export default memo(EmailNode);

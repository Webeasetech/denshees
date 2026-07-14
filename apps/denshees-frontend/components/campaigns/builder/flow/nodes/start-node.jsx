"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { AeroplaneIcon } from "mage-icons-react/bulk";

const StartNode = ({ data }) => (
  <div className="h-full px-4 py-3 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
    <AeroplaneIcon className="w-5 h-5 shrink-0" />
    <div>
      <div className="text-sm font-bold leading-tight">Campaign start</div>
      <div className="text-xs text-white/70">{data.totalContacts} leads</div>
    </div>

    <Handle
      type="source"
      position={Position.Right}
      className="!bg-black !border-2 !border-white !w-3 !h-3"
    />
  </div>
);

export default memo(StartNode);

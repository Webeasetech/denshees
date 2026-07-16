"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { ClockIcon } from "mage-icons-react/bulk";

const DelayNode = ({ data }) => {
  const { pitch, delayDays, onSave } = data;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(delayDays);
  const inputRef = useRef(null);

  useEffect(() => setValue(delayDays), [delayDays]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const days = Number(value);
    if (!Number.isInteger(days) || days < 0) {
      setValue(delayDays);
      return;
    }
    if (days !== delayDays) onSave(pitch, days);
  };

  return (
    <div className="h-full px-3 py-2 bg-white border-2 border-dashed border-gray-500 flex items-center justify-center gap-2 text-gray-700">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-500 !border-2 !border-white !w-2.5 !h-2.5"
      />

      <ClockIcon className="w-4 h-4 shrink-0" />

      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") {
              setValue(delayDays);
              setEditing(false);
            }
          }}
          className="w-12 px-1 text-sm font-bold text-center text-black border-2 border-black outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-medium hover:text-black transition-colors"
        >
          Wait <span className="font-bold text-black">{delayDays}</span>
          {delayDays === 1 ? " day" : " days"}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-500 !border-2 !border-white !w-2.5 !h-2.5"
      />
    </div>
  );
};

export default memo(DelayNode);

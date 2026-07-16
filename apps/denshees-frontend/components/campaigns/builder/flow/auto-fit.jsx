"use client";

import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

/**
 * The fitView prop only applies to the initial render; when stages are added
 * or removed the graph outgrows the viewport. Re-fit whenever the structure
 * key (derived from node ids) changes.
 */
const AutoFit = ({ structureKey }) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [structureKey, fitView]);

  return null;
};

export default AutoFit;

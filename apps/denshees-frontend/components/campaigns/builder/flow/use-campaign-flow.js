import { useMemo } from "react";
import { MarkerType } from "@xyflow/react";
import { NODE_SIZE, layoutSequence, positionOutcomes } from "./layout";

const SEQUENCE_EDGE = {
  type: "smoothstep",
  style: { stroke: "#000000", strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" },
};

const OUTCOME_EDGES = [
  { id: "replied", label: "Replied", color: "#15803d" },
  { id: "opened", label: "Opened", color: "#1d4ed8" },
  { id: "no-reply", label: "No reply", color: "#4b5563" },
];

const labelFor = (index) =>
  index === 0 ? "First email" : `Follow-up ${index}`;

const sized = (type, node) => ({ ...node, ...NODE_SIZE[type] });

/**
 * Builds the campaign graph from its pitches. A Delay node sits between two
 * emails and carries the delay of the email that follows it, so editing it
 * writes back to that pitch — there is no separate delay record.
 */
export function useCampaignFlow({ pitches, stats, handlers, selectedPitchId }) {
  return useMemo(() => {
    if (!pitches?.length) return { nodes: [], edges: [] };

    const sequenceNodes = [
      sized("start", {
        id: "start",
        type: "start",
        data: { totalContacts: stats.totalContacts },
      }),
    ];
    const sequenceEdges = [];

    pitches.forEach((pitch, index) => {
      const emailId = `email-${pitch.id}`;
      const isTerminal = index === pitches.length - 1;

      if (index > 0) {
        const delayId = `delay-${pitch.id}`;
        const previousId = `email-${pitches[index - 1].id}`;

        sequenceNodes.push(
          sized("delay", {
            id: delayId,
            type: "delay",
            data: {
              pitch,
              delayDays: pitch.delayDays ?? 1,
              onSave: handlers.onSaveDelay,
            },
          }),
        );

        sequenceEdges.push(
          { ...SEQUENCE_EDGE, id: `${previousId}->${delayId}`, source: previousId, target: delayId },
          { ...SEQUENCE_EDGE, id: `${delayId}->${emailId}`, source: delayId, target: emailId },
        );
      } else {
        sequenceEdges.push({
          ...SEQUENCE_EDGE,
          id: `start->${emailId}`,
          source: "start",
          target: emailId,
        });
      }

      sequenceNodes.push(
        sized("email", {
          id: emailId,
          type: "email",
          data: {
            label: labelFor(index),
            pitch,
            isSelected: selectedPitchId === pitch.id,
            isTerminal,
            isDeletable: isTerminal && index > 0,
            onOpen: handlers.onOpenPitch,
            onDelete: handlers.onDeletePitch,
            // A lead's stage is incremented after a send, so those who received
            // email `index` are the ones now sitting at stage `index + 1`.
            contactCount: stats.contactsPerStage[index + 1] ?? 0,
            replyCount: stats.repliesPerStage[index + 1] ?? 0,
            totalContacts: stats.totalContacts,
          },
        }),
      );
    });

    const lastPitch = pitches[pitches.length - 1];
    const lastEmailId = `email-${lastPitch.id}`;

    sequenceNodes.push(
      sized("add", {
        id: "add",
        type: "add",
        data: { onAdd: handlers.onAddPitch, disabled: handlers.busy },
      }),
    );
    sequenceEdges.push({
      ...SEQUENCE_EDGE,
      id: `${lastEmailId}->add`,
      source: lastEmailId,
      target: "add",
      style: { stroke: "#9ca3af", strokeWidth: 1.5, strokeDasharray: "4 4" },
      markerEnd: undefined,
    });

    const laidOut = layoutSequence(sequenceNodes, sequenceEdges);
    const terminalEmail = laidOut.find((node) => node.id === lastEmailId);

    const outcomeNodes = positionOutcomes(
      OUTCOME_EDGES.map(({ id, label }) =>
        sized("outcome", {
          id: `outcome-${id}`,
          type: "outcome",
          data: {
            label,
            type: id === "no-reply" ? "noReply" : id,
            count: stats.outcomes[id].count,
            percentage: stats.outcomes[id].percentage,
          },
        }),
      ),
      terminalEmail,
    );

    const outcomeEdges = OUTCOME_EDGES.map(({ id, label, color }) => ({
      id: `${lastEmailId}->outcome-${id}`,
      source: lastEmailId,
      sourceHandle: "outcome",
      target: `outcome-${id}`,
      type: "smoothstep",
      animated: true,
      label,
      labelStyle: { fontSize: 10, fontWeight: 600, fill: color },
      labelBgStyle: { fill: "#ffffff", fillOpacity: 0.9 },
      style: { stroke: color, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color },
    }));

    return {
      nodes: [...laidOut, ...outcomeNodes],
      edges: [...sequenceEdges, ...outcomeEdges],
    };
  }, [pitches, stats, handlers, selectedPitchId]);
}

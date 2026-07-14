import dagre from "@dagrejs/dagre";

export const NODE_SIZE = {
  start: { width: 190, height: 76 },
  email: { width: 240, height: 116 },
  delay: { width: 150, height: 60 },
  add: { width: 150, height: 52 },
  outcome: { width: 170, height: 96 },
};

const OUTCOME_GAP_Y = 170;
const OUTCOME_GAP_X = 190;

/** Lays the sequence out left-to-right and centres each node on its dagre point. */
export function layoutSequence(nodes, edges) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 48, ranksep: 64 });

  nodes.forEach(({ id, width, height }) =>
    graph.setNode(id, { width, height }),
  );
  edges.forEach(({ source, target }) => graph.setEdge(source, target));

  dagre.layout(graph);

  return nodes.map((node) => {
    const { x, y } = graph.node(node.id);
    return {
      ...node,
      position: { x: x - node.width / 2, y: y - node.height / 2 },
    };
  });
}

/**
 * Outcome nodes are analytics, not sequence steps. Dagre would rank them
 * alongside the "+" node; anchoring them under the terminal email keeps the
 * chain reading as a single straight line.
 */
export function positionOutcomes(outcomeNodes, terminalNode) {
  if (!terminalNode) return outcomeNodes;

  const centerX =
    terminalNode.position.x + terminalNode.width / 2 - NODE_SIZE.outcome.width / 2;
  const baseY = terminalNode.position.y + terminalNode.height + OUTCOME_GAP_Y;
  const offset = (outcomeNodes.length - 1) / 2;

  return outcomeNodes.map((node, index) => ({
    ...node,
    position: { x: centerX + (index - offset) * OUTCOME_GAP_X, y: baseY },
  }));
}

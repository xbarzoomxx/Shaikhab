// Layout constants (pixels, at zoom = 1)
export const NODE_W = 168;
export const NODE_H = 64;
export const SPOUSE_GAP = 8;
export const UNIT_GAP = 36;
export const LEVEL_H = 150;
export const STUB = 28; // vertical stub before the horizontal connector bus

// Width of a single person's "unit" (their box + any spouse boxes beside it)
function unitWidth(node) {
  const spouseCount = node.spouses.length;
  return NODE_W * (1 + spouseCount) + SPOUSE_GAP * spouseCount;
}

function subtreeWidth(node) {
  const own = unitWidth(node);
  if (node.children.length === 0) return own;
  const childrenTotal =
    node.children.reduce((sum, c) => sum + subtreeWidth(c), 0) + UNIT_GAP * (node.children.length - 1);
  return Math.max(own, childrenTotal);
}

/**
 * Lays out a single root node's tree, returning:
 *  - boxes: [{ id, row, kind: 'primary'|'spouse', x, y, w, h, status }]
 *  - edges: [{ points: "x1,y1 x2,y2 ..." }]  (poly-line paths)
 *  - width: total width used by this subtree
 */
export function layoutTree(root, nameColumn) {
  const boxes = [];
  const edges = [];
  let idCounter = 0;

  function place(node, xLeft, depth) {
    const w = subtreeWidth(node);
    const uw = unitWidth(node);

    let childrenSpan = 0;
    const childCenters = [];

    if (node.children.length > 0) {
      const childrenTotal =
        node.children.reduce((sum, c) => sum + subtreeWidth(c), 0) + UNIT_GAP * (node.children.length - 1);
      let childX = xLeft + Math.max(0, (w - childrenTotal) / 2);
      node.children.forEach((child) => {
        const cw = subtreeWidth(child);
        const centerX = place(child, childX, depth + 1);
        childCenters.push(centerX);
        childX += cw + UNIT_GAP;
      });
      childrenSpan = childCenters.length > 0 ? childCenters[childCenters.length - 1] - childCenters[0] : 0;
    }

    // Center this unit either over its children span, or within its own
    // reserved width if it has no children (or is wider than its children).
    const unitCenter =
      node.children.length > 0
        ? (childCenters[0] + childCenters[childCenters.length - 1]) / 2
        : xLeft + w / 2;

    const y = depth * LEVEL_H;
    const unitLeft = unitCenter - uw / 2;

    // Primary box
    idCounter++;
    boxes.push({
      id: `n${idCounter}`,
      row: node.row,
      kind: "primary",
      x: unitLeft,
      y,
      w: NODE_W,
      h: NODE_H,
    });

    // Spouse boxes, placed to the right of the primary box
    let sx = unitLeft + NODE_W + SPOUSE_GAP;
    node.spouses.forEach((s) => {
      idCounter++;
      boxes.push({
        id: `n${idCounter}`,
        row: s.row,
        kind: "spouse",
        status: s.status,
        x: sx,
        y,
        w: NODE_W,
        h: NODE_H,
      });
      sx += NODE_W + SPOUSE_GAP;
    });

    // Connector from this unit down to its children
    if (node.children.length > 0) {
      const parentBottomX = unitCenter;
      const parentBottomY = y + NODE_H;
      const busY = parentBottomY + STUB;
      edges.push({ points: `${parentBottomX},${parentBottomY} ${parentBottomX},${busY}` });
      if (childCenters.length > 1) {
        edges.push({ points: `${childCenters[0]},${busY} ${childCenters[childCenters.length - 1]},${busY}` });
      }
      childCenters.forEach((cx) => {
        edges.push({ points: `${cx},${busY} ${cx},${(depth + 1) * LEVEL_H}` });
      });
    }

    return unitCenter;
  }

  place(root, 0, 0);
  const width = subtreeWidth(root);
  const height = (maxDepth(root) + 1) * LEVEL_H;

  return { boxes, edges, width, height };
}

function maxDepth(node) {
  if (node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(maxDepth));
}

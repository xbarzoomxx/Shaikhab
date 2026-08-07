const PARENT_KEYWORDS = ["اسم الأب", "الأب", "والد", "ولي الأمر"];
const BRANCH_KEYWORDS = ["فرع", "جيل"];

export function findParentColumn(columns) {
  return columns.find((c) => PARENT_KEYWORDS.some((k) => c.includes(k)));
}

export function findBranchColumn(columns) {
  return columns.find((c) => BRANCH_KEYWORDS.some((k) => c.includes(k)));
}

function normalizeName(name) {
  return (name || "").trim().replace(/\s+/g, " ");
}

/**
 * Builds a tree from flat rows.
 *
 * If a parent-name column is found and at least one row references a valid
 * parent, real parent → children links are built (multi-generation tree).
 * Members with no resolvable parent become "roots", grouped under their
 * family branch (if a branch column exists) so the page still reads as a
 * tree of the whole family even before every parent link is filled in.
 *
 * Returns: { hasParentLinks: boolean, groups: [{ label, roots: [node] }] }
 * where node = { row, children: [node, ...] }
 */
export function buildFamilyTree(rows, nameColumn, columns) {
  const parentColumn = findParentColumn(columns);
  const branchColumn = findBranchColumn(columns);

  const byName = new Map();
  rows.forEach((r) => {
    const n = normalizeName(r[nameColumn]);
    if (n) byName.set(n, r);
  });

  const childrenByParent = new Map();
  let linkCount = 0;

  if (parentColumn) {
    rows.forEach((r) => {
      const parentName = normalizeName(r[parentColumn]);
      if (parentName && byName.has(parentName) && parentName !== normalizeName(r[nameColumn])) {
        if (!childrenByParent.has(parentName)) childrenByParent.set(parentName, []);
        childrenByParent.get(parentName).push(r);
        linkCount++;
      }
    });
  }

  function buildNode(row, visited, seen) {
    const name = normalizeName(row[nameColumn]);
    seen.add(name);
    if (visited.has(name)) return { row, children: [] }; // guard against accidental cycles
    const nextVisited = new Set(visited).add(name);
    const kids = (childrenByParent.get(name) || []).map((childRow) =>
      buildNode(childRow, nextVisited, seen)
    );
    return { row, children: kids };
  }

  const isChild = new Set();
  childrenByParent.forEach((kids) => kids.forEach((k) => isChild.add(normalizeName(k[nameColumn]))));

  const rootRows = rows.filter((r) => !isChild.has(normalizeName(r[nameColumn])));
  const seen = new Set();
  const rootNodes = rootRows.map((r) => buildNode(r, new Set(), seen));

  // Rows that never got attached to the tree (e.g. two members mistakenly
  // list each other as parent, so both are "isChild" but neither is
  // reachable from a real root) would otherwise vanish silently. Surface
  // them as their own root nodes instead of hiding real data.
  const orphanRows = rows.filter((r) => !seen.has(normalizeName(r[nameColumn])));
  const orphanNodes = orphanRows.map((r) => buildNode(r, new Set(), seen));
  rootNodes.push(...orphanNodes);

  // Group roots by branch (or a single "كل الأسرة" group if no branch column)
  const groupsMap = new Map();
  rootNodes.forEach((node) => {
    const label = branchColumn ? node.row[branchColumn]?.trim() || "غير محدد" : "شجرة العائلة";
    if (!groupsMap.has(label)) groupsMap.set(label, []);
    groupsMap.get(label).push(node);
  });

  const groups = Array.from(groupsMap.entries())
    .map(([label, roots]) => ({ label, roots }))
    .sort((a, b) => a.label.localeCompare(b.label, "ar"));

  return { hasParentLinks: linkCount > 0, parentColumn, branchColumn, groups };
}

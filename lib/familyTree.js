import { guessNumberColumn } from "@/lib/personCard";

const PARENT_KEYWORDS = ["اسم الأب", "الأب", "والد", "ولي الأمر"];
const SPOUSE_KEYWORDS = ["الزوج", "الزوجة", "زوج/زوجة"];
const MARITAL_STATUS_KEYWORDS = ["حالة الزواج", "سابق"];
const BRANCH_KEYWORDS = ["فرع", "جيل"];

export function findParentColumn(columns) {
  return columns.find((c) => PARENT_KEYWORDS.some((k) => c.includes(k)));
}

export function findSpouseColumn(columns) {
  return columns.find((c) => SPOUSE_KEYWORDS.some((k) => c.includes(k)));
}

export function findMaritalStatusColumn(columns) {
  return columns.find((c) => MARITAL_STATUS_KEYWORDS.some((k) => c.includes(k)));
}

export function findBranchColumn(columns) {
  return columns.find((c) => BRANCH_KEYWORDS.some((k) => c.includes(k)));
}

function normalizeName(name) {
  return (name || "").trim().replace(/\s+/g, " ");
}

/**
 * Builds a family tree from flat rows, supporting both blood descent
 * (father → children, via a "اسم الأب" column) and marriage links (via a
 * "الزوج/الزوجة" column).
 *
 * A person who married into the family (their own father isn't in the
 * data) is NOT rendered as a disconnected root. Instead they're attached
 * as a "spouse" of their blood-line partner, wherever that partner sits in
 * the tree — and any children fathered by that in-law are folded into the
 * same family unit, so a couple + their kids always render together.
 *
 * Returns: { hasParentLinks, hasSpouseLinks, groups: [{ label, roots: [node] }] }
 * where node = { row, spouses: [{ row, status }], children: [node, ...] }
 */
export function buildFamilyTree(rows, nameColumn, columns) {
  const parentColumn = findParentColumn(columns);
  const spouseColumn = findSpouseColumn(columns);
  const maritalStatusColumn = findMaritalStatusColumn(columns);
  const branchColumn = findBranchColumn(columns);

  const byName = new Map();
  rows.forEach((r) => {
    const n = normalizeName(r[nameColumn]);
    if (n) byName.set(n, r);
  });

  const resolvedFather = (row) => {
    if (!parentColumn) return null;
    const fatherName = normalizeName(row[parentColumn]);
    if (!fatherName || fatherName === normalizeName(row[nameColumn])) return null;
    return byName.has(fatherName) ? fatherName : null;
  };

  const resolvedSpouse = (row) => {
    if (!spouseColumn) return null;
    const spouseName = normalizeName(row[spouseColumn]);
    if (!spouseName || spouseName === normalizeName(row[nameColumn])) return null;
    return byName.has(spouseName) ? spouseName : null;
  };

  // father-name -> [childRow, ...]
  const childrenByFather = new Map();
  let parentLinkCount = 0;
  rows.forEach((r) => {
    const fatherName = resolvedFather(r);
    if (fatherName) {
      if (!childrenByFather.has(fatherName)) childrenByFather.set(fatherName, []);
      childrenByFather.get(fatherName).push(r);
      parentLinkCount++;
    }
  });
  const hasChildren = (name) => childrenByFather.has(name);

  // Decide, for every row with no resolvable father, whether it's an
  // independent anchor or a "satellite" that attaches under its spouse.
  const satelliteOf = new Map(); // satellite name -> anchor name
  let spouseLinkCount = 0;

  rows.forEach((r) => {
    if (resolvedFather(r)) return; // blood-positioned already, not a candidate
    const name = normalizeName(r[nameColumn]);
    const spouseName = resolvedSpouse(r);
    if (!spouseName) return;
    spouseLinkCount++;

    const spouseRow = byName.get(spouseName);
    const spouseHasFather = Boolean(resolvedFather(spouseRow));

    if (spouseHasFather) {
      satelliteOf.set(name, spouseName);
      return;
    }

    // Both partners lack a father link (e.g. the couple at the very top of
    // the tree) — whichever one actually has descendants attributed to
    // them becomes the anchor; the other becomes their satellite.
    const meHasKids = hasChildren(name);
    const spouseHasKids = hasChildren(spouseName);
    if (spouseHasKids && !meHasKids) {
      satelliteOf.set(name, spouseName);
    } else if (!spouseHasKids && !meHasKids) {
      // Neither has recorded descendants — keep the later-listed one as
      // the satellite so we don't end up with two disconnected roots for
      // a single couple.
      const myIndex = rows.indexOf(r);
      const spouseIndex = rows.indexOf(spouseRow);
      if (myIndex > spouseIndex) satelliteOf.set(name, spouseName);
    }
    // else: I have kids and spouse doesn't (or both do) — I stay independent.
  });

  function spousesOf(name, seen) {
    return rows
      .filter((r) => satelliteOf.get(normalizeName(r[nameColumn])) === name)
      .map((r) => {
        const sName = normalizeName(r[nameColumn]);
        seen.add(sName);
        const status = maritalStatusColumn ? (r[maritalStatusColumn] || "").trim() : "";
        return { row: r, status };
      });
  }

  function buildNode(row, visited, seen) {
    const name = normalizeName(row[nameColumn]);
    seen.add(name);
    if (visited.has(name)) return { row, spouses: [], children: [] }; // cycle guard
    const nextVisited = new Set(visited).add(name);

    const spouses = spousesOf(name, seen);

    // A satellite spouse's own children (e.g. an in-law husband's kids
    // with the blood-line wife) belong to this same family unit.
    let childRows = (childrenByFather.get(name) || []).slice();
    spouses.forEach((s) => {
      const sName = normalizeName(s.row[nameColumn]);
      childRows = childRows.concat(childrenByFather.get(sName) || []);
    });

    const children = childRows.map((childRow) => buildNode(childRow, nextVisited, seen));
    return { row, spouses, children };
  }

  const rootRows = rows.filter((r) => {
    const name = normalizeName(r[nameColumn]);
    return !resolvedFather(r) && !satelliteOf.has(name);
  });

  const seen = new Set();
  const rootNodes = rootRows.map((r) => buildNode(r, new Set(), seen));

  // Safety net: anything never reached (shouldn't normally happen) still
  // gets shown rather than silently disappearing.
  const orphanRows = rows.filter((r) => !seen.has(normalizeName(r[nameColumn])));
  const orphanNodes = orphanRows.map((r) => buildNode(r, new Set(), seen));
  rootNodes.push(...orphanNodes);

  const groupsMap = new Map();
  rootNodes.forEach((node) => {
    const label = branchColumn ? node.row[branchColumn]?.trim() || "غير محدد" : "شجرة العائلة";
    if (!groupsMap.has(label)) groupsMap.set(label, []);
    groupsMap.get(label).push(node);
  });

  const groups = Array.from(groupsMap.entries())
    .map(([label, roots]) => ({ label, roots }))
    .sort((a, b) => a.label.localeCompare(b.label, "ar"));

  const numberColumn = guessNumberColumn(columns);
  if (numberColumn) {
    const numOf = (row) => {
      const n = parseFloat(row[numberColumn]);
      return Number.isFinite(n) ? n : Infinity;
    };
    const sortNodes = (nodes) => {
      nodes.sort((a, b) => numOf(a.row) - numOf(b.row));
      nodes.forEach((n) => {
        sortNodes(n.children);
        n.spouses.sort((a, b) => numOf(a.row) - numOf(b.row));
      });
    };
    groups.forEach((g) => sortNodes(g.roots));
  }

  return {
    hasParentLinks: parentLinkCount > 0,
    hasSpouseLinks: spouseLinkCount > 0,
    parentColumn,
    spouseColumn,
    branchColumn,
    numberColumn,
    groups,
  };
}

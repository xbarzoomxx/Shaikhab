export function guessNameColumn(columns) {
  const arabicHit = columns.find((c) => c.includes("اسم"));
  if (arabicHit) return arabicHit;
  const englishHit = columns.find((c) => c.toLowerCase().includes("name"));
  if (englishHit) return englishHit;
  return columns[0];
}

export function guessNumberColumn(columns) {
  return columns.find((c) => c.includes("رقم") && !c.includes("هاتف") && !c.toLowerCase().includes("phone"));
}

export function guessPhoneColumn(columns) {
  return columns.find((c) => c.includes("هاتف") || c.toLowerCase().includes("phone"));
}

export function guessSecondaryColumn(columns, exclude) {
  const keywords = ["فرع", "صفة", "دور", "قرابة", "جيل"];
  const hit = columns.find((c) => !exclude.includes(c) && keywords.some((k) => c.includes(k)));
  if (hit) return hit;
  return columns.find((c) => !exclude.includes(c));
}

const STATUS_KEYWORDS = ["حالة", "عضو", "الجمعية"];

// Columns worth rendering as small colored chips: a modest, repeated set of
// distinct values (e.g. "نشط/منتقل/متوفى", "نعم/لا", "مدفوع/متأخر").
export function guessBadgeColumns(columns, rows, exclude) {
  return columns.filter((col) => {
    if (exclude.includes(col)) return false;
    const values = rows.map((r) => (r[col] || "").trim()).filter(Boolean);
    if (values.length === 0) return false;
    const distinct = new Set(values);
    const looksLikeStatus = STATUS_KEYWORDS.some((k) => col.includes(k));
    return distinct.size > 1 && distinct.size <= 6 && (looksLikeStatus || distinct.size <= 4);
  });
}

export function initialOf(name) {
  const trimmed = (name || "").trim();
  return trimmed ? trimmed[0] : "؟";
}

// Deterministic pastel-ish hue for the avatar background, derived from the
// name so the same person always gets the same color.
export function avatarHue(name) {
  const str = name || "";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 360;
  return hash;
}

export function whatsappLink(phone) {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function telLink(phone) {
  const cleaned = String(phone || "").replace(/[^\d+]/g, "");
  if (!cleaned) return null;
  return `tel:${cleaned}`;
}

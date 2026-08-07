"use client";

function findColumn(columns, keywords) {
  return columns.find((c) => keywords.some((k) => c.includes(k)));
}

function parseAmount(val) {
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n) {
  // Force Western (English) digits regardless of server/browser locale.
  return n.toLocaleString("en-US");
}

const CARD_SLOTS = [
  "عدد المشتركين",
  "إجمالي المطلوب",
  "إجمالي المحصّل",
  "اشتراكات مدفوعة",
  "اشتراكات متأخرة",
];

function Spinner() {
  return (
    <span
      className="inline-block w-5 h-5 rounded-full border-2 border-primary/25 border-t-primary animate-spin"
      role="status"
      aria-label="جارِ التحميل"
    />
  );
}

export default function TakafulStats({ rows, columns, loading }) {
  let values = {};

  if (!loading && rows.length > 0) {
    const nameCol = findColumn(columns, ["اسم"]);
    const dueCol = findColumn(columns, ["مطلوب"]);
    const paidCol = findColumn(columns, ["مدفوع"]);
    const statusCol = findColumn(columns, ["حالة"]);

    const distinctMembers = nameCol
      ? new Set(rows.map((r) => (r[nameCol] || "").trim()).filter(Boolean)).size
      : rows.length;

    const totalDue = dueCol ? rows.reduce((sum, r) => sum + parseAmount(r[dueCol]), 0) : null;
    const totalPaid = paidCol ? rows.reduce((sum, r) => sum + parseAmount(r[paidCol]), 0) : null;

    let paidCount = 0;
    let lateCount = 0;
    if (statusCol) {
      rows.forEach((r) => {
        const v = (r[statusCol] || "").trim();
        if (v.includes("مدفوع") && !v.includes("غير")) paidCount++;
        else if (v.includes("متأخر")) lateCount++;
      });
    }

    values = {
      "عدد المشتركين": formatNumber(distinctMembers),
      "إجمالي المطلوب": totalDue !== null ? `${formatNumber(totalDue)} جنيه` : "—",
      "إجمالي المحصّل": totalPaid !== null ? `${formatNumber(totalPaid)} جنيه` : "—",
      "اشتراكات مدفوعة": statusCol ? formatNumber(paidCount) : "—",
      "اشتراكات متأخرة": statusCol ? formatNumber(lateCount) : "—",
    };
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      {CARD_SLOTS.map((label) => (
        <div
          key={label}
          className="bg-surface border border-line rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[86px]"
        >
          <div className="text-2xl font-medium text-teal flex items-center justify-center h-8">
            {loading ? <Spinner /> : values[label] ?? "—"}
          </div>
          <p className="text-xs text-ink-muted mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}

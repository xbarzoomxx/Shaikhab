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
  return n.toLocaleString("ar-EG");
}

export default function TakafulStats({ rows, columns }) {
  if (rows.length === 0) return null;

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

  const cards = [
    { label: "عدد المشتركين", value: formatNumber(distinctMembers) },
  ];
  if (totalDue !== null) cards.push({ label: "إجمالي المطلوب", value: `${formatNumber(totalDue)} جنيه` });
  if (totalPaid !== null) cards.push({ label: "إجمالي المحصّل", value: `${formatNumber(totalPaid)} جنيه` });
  if (statusCol) {
    cards.push({ label: "اشتراكات مدفوعة", value: formatNumber(paidCount) });
    cards.push({ label: "اشتراكات متأخرة", value: formatNumber(lateCount) });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-surface border border-line rounded-xl p-4 text-center">
          <p className="text-2xl font-medium text-teal">{c.value}</p>
          <p className="text-xs text-ink/60 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

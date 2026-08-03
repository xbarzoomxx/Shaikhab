"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SectionTabs from "@/components/SectionTabs";
import { useSectionData } from "@/lib/useSectionData";
import { SECTIONS } from "@/lib/sections";

const SECTION_LIST = Object.values(SECTIONS);

export default function AdminPage() {
  const router = useRouter();
  const [active, setActive] = useState(SECTION_LIST[0].key);
  const { rows, columns, loading, error } = useSectionData(active);
  const [query, setQuery] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");

  const [importRows, setImportRows] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/sheet-url")
      .then((res) => res.json())
      .then((data) => setSheetUrl(data.url || ""))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((r) => columns.some((c) => String(r[c] || "").toLowerCase().includes(q)));
  }, [rows, columns, query]);

  async function handleExport() {
    const XLSX = await import("xlsx");
    const data = filtered.map((r) => {
      const out = {};
      columns.forEach((c) => (out[c] = r[c] || ""));
      return out;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    const sectionLabel = SECTIONS[active].label;
    XLSX.utils.book_append_sheet(workbook, worksheet, sectionLabel.slice(0, 31));
    XLSX.writeFile(workbook, `shaikhab-${active}.xlsx`);
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    setImportRows(data);
    setCopied(false);
  }

  async function handleCopy() {
    if (importRows.length === 0) return;
    const headers = Object.keys(importRows[0]);
    const lines = [headers.join("\t")];
    for (const row of importRows) {
      lines.push(headers.map((h) => String(row[h] ?? "")).join("\t"));
    }
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-xl font-medium">لوحة تحكم المسؤول</h2>
          <div className="flex gap-2">
            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-lg bg-teal text-sand px-4 py-2 text-sm hover:bg-teal-dark transition-colors"
              >
                فتح ملف Google Sheet للتعديل
              </a>
            )}
            <button
              onClick={handleLogout}
              className="focus-ring rounded-lg border border-line px-4 py-2 text-sm hover:bg-red-50 transition-colors"
            >
              خروج
            </button>
          </div>
        </div>

        <div className="bg-teal-light border border-teal/20 rounded-xl p-4 mb-6 text-sm text-teal-dark">
          البيانات تُقرأ مباشرة من تبويبات ملف Google Sheet ولا تُحفظ على الموقع. لإضافة فرد أو
          تعديل بياناته، افتح الملف من الزر أعلاه وعدّل الصف في التبويب المناسب مباشرة.
        </div>

        <div className="bg-white border border-line rounded-xl p-5 mb-6">
          <h3 className="font-medium mb-3">تجهيز كشف جديد للصق في الملف</h3>
          <p className="text-sm text-ink/60 mb-3">
            اختر ملف Excel أو CSV يحتوي على بيانات جديدة (لأي قسم من الأقسام الثلاثة)، وسيتم
            تجهيزه هنا بصيغة يمكن نسخها ولصقها مباشرة كصفوف جديدة داخل التبويب المناسب في
            Google Sheet.
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleImportFile}
            className="text-sm"
          />
          {importRows.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-ink/70">
                  {importFileName} — {importRows.length} صف جاهز للنسخ
                </p>
                <button
                  onClick={handleCopy}
                  className="focus-ring rounded-lg bg-gold text-white px-3 py-1.5 text-sm hover:opacity-90 transition-opacity"
                >
                  {copied ? "تم النسخ ✓" : "نسخ الكل"}
                </button>
              </div>
              <div className="overflow-x-auto border border-line rounded-lg max-h-64">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-line bg-sand">
                      {Object.keys(importRows[0]).map((h) => (
                        <th key={h} className="p-2 text-right">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.map((row, i) => (
                      <tr key={i} className="border-b border-line last:border-0">
                        {Object.keys(importRows[0]).map((h) => (
                          <td key={h} className="p-2 whitespace-nowrap">
                            {String(row[h])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink/50 mt-2">
                بعد الضغط على "نسخ الكل"، افتح ملف Google Sheet، اذهب للتبويب المناسب، اختر خلية
                فارغة أسفل آخر صف، والصق (Ctrl+V).
              </p>
            </div>
          )}
        </div>

        <SectionTabs sections={SECTION_LIST} active={active} onChange={setActive} />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="بحث سريع ضمن كل الأعمدة..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="focus-ring flex-1 min-w-[240px] rounded-lg border border-line px-4 py-3 outline-none bg-white"
          />
          <button
            onClick={handleExport}
            className="focus-ring rounded-lg border border-line px-4 py-3 text-sm hover:bg-teal-light transition-colors bg-white"
          >
            تصدير Excel لهذا القسم
          </button>
        </div>

        {error && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4 mb-4 whitespace-pre-line">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-ink/60">جارِ التحميل...</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-line rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-right text-ink/60">
                  {columns.map((c) => (
                    <th key={c} className="p-3 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._row} className="border-b border-line last:border-0">
                    {columns.map((c) => (
                      <td key={c} className="p-3 whitespace-nowrap text-ink/80">
                        {r[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-ink/60 py-8">لا توجد بيانات بعد في هذا التبويب.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

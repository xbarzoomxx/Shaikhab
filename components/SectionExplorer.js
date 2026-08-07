"use client";

import { useMemo, useState } from "react";
import MemberCard from "@/components/MemberCard";
import CardSkeletonGrid from "@/components/CardSkeletonGrid";
import { guessNameColumn, guessNumberColumn } from "@/lib/personCard";

export default function SectionExplorer({ rows, columns, loading, error, searchLabel }) {
  const [query, setQuery] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const nameColumn = useMemo(() => guessNameColumn(columns), [columns]);
  const numberColumn = useMemo(() => guessNumberColumn(columns), [columns]);
  const [sortField, setSortField] = useState(null); // resolved below once numberColumn is known

  const activeSortField = sortField || (numberColumn ? "number" : "name");

  const filterableColumns = useMemo(() => {
    return columns.filter((col) => {
      const values = rows.map((r) => (r[col] || "").trim()).filter(Boolean);
      const distinct = new Set(values);
      return distinct.size > 1 && distinct.size <= 25 && values.length > 0;
    });
  }, [columns, rows]);

  const filterValues = useMemo(() => {
    if (!filterColumn) return [];
    const set = new Set(rows.map((r) => (r[filterColumn] || "").trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [filterColumn, rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) =>
        columns.some((c) => String(r[c] || "").toLowerCase().includes(q))
      );
    }
    if (filterColumn && filterValue) {
      list = list.filter((r) => (r[filterColumn] || "").trim() === filterValue);
    }
    if (activeSortField === "number" && numberColumn) {
      list = [...list].sort((a, b) => {
        const na = parseFloat(a[numberColumn]);
        const nb = parseFloat(b[numberColumn]);
        const va = Number.isFinite(na) ? na : Infinity;
        const vb = Number.isFinite(nb) ? nb : Infinity;
        return sortAsc ? va - vb : vb - va;
      });
    } else if (nameColumn) {
      list = [...list].sort((a, b) => {
        const res = String(a[nameColumn] || "").localeCompare(String(b[nameColumn] || ""), "ar");
        return sortAsc ? res : -res;
      });
    }
    return list;
  }, [rows, columns, query, filterColumn, filterValue, nameColumn, numberColumn, activeSortField, sortAsc]);

  return (
    <div>
      <div className="bg-surface border border-line rounded-xl p-5 md:p-6 shadow-sm">
        <label className="block text-sm text-ink/70 mb-2">{searchLabel || "ابحث في هذا القسم"}</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="اكتب هنا للبحث..."
          className="focus-ring w-full rounded-lg border border-line px-4 py-3 text-lg outline-none"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          {filterableColumns.length > 0 && (
            <>
              <select
                value={filterColumn}
                onChange={(e) => {
                  setFilterColumn(e.target.value);
                  setFilterValue("");
                }}
                className="focus-ring rounded-lg border border-line px-3 py-2 text-sm bg-surface"
              >
                <option value="">فلترة حسب...</option>
                {filterableColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {filterColumn && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="focus-ring rounded-lg border border-line px-3 py-2 text-sm bg-surface"
                >
                  <option value="">الكل</option>
                  {filterValues.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          {numberColumn && (
            <div className="flex rounded-lg border border-line overflow-hidden">
              <button
                onClick={() => setSortField("number")}
                className={`px-3 py-2 text-sm transition-colors ${
                  activeSortField === "number" ? "bg-primary text-primary-foreground" : "bg-surface"
                }`}
              >
                ترتيب حسب الرقم
              </button>
              <button
                onClick={() => setSortField("name")}
                className={`px-3 py-2 text-sm transition-colors border-r border-line ${
                  activeSortField === "name" ? "bg-primary text-primary-foreground" : "bg-surface"
                }`}
              >
                ترتيب أبجدي
              </button>
            </div>
          )}

          <button
            onClick={() => setSortAsc((s) => !s)}
            className="focus-ring rounded-lg border border-line px-3 py-2 text-sm bg-surface hover:bg-primary-light transition-colors"
          >
            {activeSortField === "number"
              ? `(${sortAsc ? "تصاعدي" : "تنازلي"})`
              : `أبجدي ${sortAsc ? "(أ-ي)" : "(ي-أ)"}`}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading && <CardSkeletonGrid />}
        {error && (
          <p className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-4 whitespace-pre-line">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <p className="text-sm text-ink-muted mb-4">
              {filtered.length} نتيجة من أصل {rows.length}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((r) => (
                <MemberCard
                  key={r._row}
                  row={r}
                  columns={columns}
                  nameColumn={nameColumn}
                  rows={rows}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-ink-muted mt-8 text-center">لا توجد نتائج مطابقة للبحث.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

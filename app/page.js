"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import SectionExplorer from "@/components/SectionExplorer";
import FamilyTree from "@/components/FamilyTree";
import CardSkeletonGrid from "@/components/CardSkeletonGrid";
import { useSectionData } from "@/lib/useSectionData";
import { guessNameColumn } from "@/lib/personCard";
import { buildFamilyTree, findParentColumn } from "@/lib/familyTree";

export default function HomePage() {
  const { rows, columns, loading, error } = useSectionData("members");
  const [view, setView] = useState("tree");

  const nameColumn = useMemo(() => guessNameColumn(columns), [columns]);
  const tree = useMemo(
    () => (rows.length ? buildFamilyTree(rows, nameColumn, columns) : null),
    [rows, nameColumn, columns]
  );
  const parentColumn = useMemo(() => findParentColumn(columns), [columns]);

  return (
    <main className="min-h-screen">
      <Navbar active="/" />

      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="text-3xl md:text-4xl text-teal-dark"
            >
              الدليل العائلي
            </h1>
            <p className="text-ink-muted mt-1">شجرة أسرة الشيخاب — كل الفروع مترابطة ببعضها</p>
          </div>

          <div className="flex gap-1 bg-surface border border-line rounded-lg p-1">
            <button
              onClick={() => setView("tree")}
              className={`focus-ring rounded-md px-3 py-1.5 text-sm transition-colors ${
                view === "tree" ? "bg-primary text-primary-foreground" : "text-ink-muted"
              }`}
            >
              الشجرة العائلية
            </button>
            <button
              onClick={() => setView("list")}
              className={`focus-ring rounded-md px-3 py-1.5 text-sm transition-colors ${
                view === "list" ? "bg-primary text-primary-foreground" : "text-ink-muted"
              }`}
            >
              قائمة وبحث
            </button>
          </div>
        </div>

        {!loading && !error && !parentColumn && (
          <div className="bg-accent-light border border-accent/30 rounded-xl p-4 mb-6 text-sm text-accent-foreground">
            الشجرة معروضة حالياً مجمّعة حسب "الفرع العائلي" فقط. لإظهار الترابط الحقيقي بين
            الأجيال (من هو ابن مَن)، أضف عموداً باسم <strong>"اسم الأب"</strong> في تبويب
            "الأفراد" بملف Google Sheet واملأه لكل فرد — ستتعمّق الشجرة تلقائياً بمجرد إضافته.
          </div>
        )}

        {loading && <CardSkeletonGrid />}
        {error && (
          <p className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-4 whitespace-pre-line">
            {error}
          </p>
        )}

        {!loading && !error && view === "tree" && tree && (
          <FamilyTree groups={tree.groups} nameColumn={nameColumn} columns={columns} />
        )}

        {!loading && !error && view === "list" && (
          <SectionExplorer
            rows={rows}
            columns={columns}
            loading={loading}
            error={error}
            searchLabel="ابحث باسمك أو اسم أي فرد من العائلة"
          />
        )}
      </section>

      <footer className="text-center text-xs text-ink-muted py-8">
        بوابة أسرة الشيخاب — دليل التوثيق العائلي
      </footer>
    </main>
  );
}

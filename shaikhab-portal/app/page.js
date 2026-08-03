"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";

const STATUS_LABELS = {
  active: "نشط",
  moved: "منتقل",
  deceased: "متوفى",
};

export default function HomePage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [societyOnly, setSocietyOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMembers(data.members || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const branches = useMemo(() => {
    const set = new Set(members.map((m) => m.family_branch).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [members]);

  const filtered = useMemo(() => {
    let list = members.filter((m) => m.status !== "deceased" || query || branchFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((m) => (m.full_name || "").toLowerCase().includes(q));
    }
    if (branchFilter) {
      list = list.filter((m) => m.family_branch === branchFilter);
    }
    if (societyOnly) {
      list = list.filter((m) => String(m.is_society_member).toUpperCase() === "TRUE");
    }
    if (sortBy === "name") {
      list = [...list].sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "ar"));
    } else if (sortBy === "newest") {
      list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return list;
  }, [members, query, branchFilter, societyOnly, sortBy]);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border border-line rounded-xl p-5 md:p-6 shadow-sm">
          <label htmlFor="search" className="block text-sm text-ink/70 mb-2">
            ابحث باسمك أو اسم أي فرد من العائلة
          </label>
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثال: محمد أحمد الشيخاب"
            className="focus-ring w-full rounded-lg border border-line px-4 py-3 text-lg outline-none"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="focus-ring rounded-lg border border-line px-3 py-2 text-sm bg-white"
            >
              <option value="">كل الفروع العائلية</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="focus-ring rounded-lg border border-line px-3 py-2 text-sm bg-white"
            >
              <option value="name">ترتيب أبجدي</option>
              <option value="newest">الأحدث تسجيلاً</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-ink/80 px-1">
              <input
                type="checkbox"
                checked={societyOnly}
                onChange={(e) => setSocietyOnly(e.target.checked)}
                className="focus-ring"
              />
              أعضاء الجمعية فقط
            </label>
          </div>
        </div>

        <div className="mt-6">
          {loading && <p className="text-ink/60">جارِ تحميل البيانات...</p>}
          {error && (
            <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
              تعذّر تحميل البيانات: {error}
            </p>
          )}

          {!loading && !error && (
            <>
              <p className="text-sm text-ink/60 mb-4">
                {filtered.length} فرد{filtered.length === 1 ? "" : "اً"} مُدرج
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white border border-line rounded-xl p-4 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-medium text-lg">{m.full_name}</h3>
                      <p className="text-sm text-ink/60 mt-1">
                        {[m.city, m.country].filter(Boolean).join("، ") || "—"}
                      </p>
                      {m.family_branch && (
                        <p className="text-xs text-teal mt-1">{m.family_branch}</p>
                      )}
                    </div>
                    <div className="text-left shrink-0 flex flex-col items-end gap-1">
                      {String(m.is_society_member).toUpperCase() === "TRUE" && (
                        <span className="text-xs bg-gold-light text-gold px-2 py-1 rounded-full">
                          عضو الجمعية
                        </span>
                      )}
                      {m.status && m.status !== "active" && (
                        <span className="text-xs bg-teal-light text-teal px-2 py-1 rounded-full">
                          {STATUS_LABELS[m.status] || m.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="text-ink/60 mt-8 text-center">لا توجد نتائج مطابقة للبحث.</p>
              )}
            </>
          )}
        </div>
      </section>

      <footer className="text-center text-xs text-ink/40 py-8">
        بوابة أسرة الشيخاب — دليل التوثيق العائلي
      </footer>
    </main>
  );
}

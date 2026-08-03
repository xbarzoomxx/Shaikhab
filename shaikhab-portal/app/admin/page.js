"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const EMPTY_FORM = {
  id: null,
  full_name: "",
  gender: "",
  birth_date: "",
  phone: "",
  city: "",
  country: "",
  family_branch: "",
  is_society_member: false,
  society_role: "",
  society_join_date: "",
  status: "active",
  notes: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null); // null = closed, object = open (add or edit)
  const [saving, setSaving] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

  async function loadMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return members;
    const q = query.trim().toLowerCase();
    return members.filter((m) => (m.full_name || "").toLowerCase().includes(q));
  }, [members, query]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch(isEdit ? `/api/members/${form.id}` : "/api/members", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setForm(null);
      await loadMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الفرد؟")) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحذف");
      await loadMembers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الاستيراد");
      setImportResult(data);
      await loadMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen">
      <Header showAdminLink={false} />

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-xl font-medium">لوحة تحكم المسؤول</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...EMPTY_FORM })}
              className="focus-ring rounded-lg bg-teal text-sand px-4 py-2 text-sm hover:bg-teal-dark transition-colors"
            >
              + إضافة فرد
            </button>
            <a
              href="/api/admin/export"
              className="focus-ring rounded-lg border border-line px-4 py-2 text-sm hover:bg-teal-light transition-colors"
            >
              تصدير Excel
            </a>
            <button
              onClick={handleLogout}
              className="focus-ring rounded-lg border border-line px-4 py-2 text-sm hover:bg-red-50 transition-colors"
            >
              خروج
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            {error}
          </p>
        )}

        <div className="bg-white border border-line rounded-xl p-5 mb-6">
          <h3 className="font-medium mb-3">استيراد من ملف Excel / CSV</h3>
          <p className="text-sm text-ink/60 mb-3">
            يجب أن يحتوي الملف على عمود full_name على الأقل. الأعمدة الأخرى المدعومة: gender,
            birth_date, phone, city, country, family_branch, is_society_member, status, notes
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="focus-ring rounded-lg bg-teal text-sand px-4 py-2 text-sm hover:bg-teal-dark transition-colors disabled:opacity-50"
            >
              {importing ? "جارِ الاستيراد..." : "استيراد"}
            </button>
          </div>
          {importResult && (
            <div className="mt-3 text-sm">
              <p className="text-teal">
                تم استيراد {importResult.added} من أصل {importResult.total} صف.
              </p>
              {importResult.errors?.length > 0 && (
                <ul className="text-red-700 mt-1 list-disc pr-5">
                  {importResult.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="بحث سريع بالاسم..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="focus-ring w-full rounded-lg border border-line px-4 py-3 mb-4 outline-none bg-white"
        />

        {loading ? (
          <p className="text-ink/60">جارِ التحميل...</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-line rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-right text-ink/60">
                  <th className="p-3">الاسم</th>
                  <th className="p-3">الهاتف</th>
                  <th className="p-3">الإقامة</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">عضو الجمعية</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0">
                    <td className="p-3 font-medium">{m.full_name}</td>
                    <td className="p-3 text-ink/70">{m.phone}</td>
                    <td className="p-3 text-ink/70">
                      {[m.city, m.country].filter(Boolean).join("، ")}
                    </td>
                    <td className="p-3 text-ink/70">{m.family_branch}</td>
                    <td className="p-3">
                      {String(m.is_society_member).toUpperCase() === "TRUE" ? "نعم" : "لا"}
                    </td>
                    <td className="p-3 text-ink/70">{m.status}</td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() =>
                          setForm({
                            ...EMPTY_FORM,
                            ...m,
                            is_society_member:
                              String(m.is_society_member).toUpperCase() === "TRUE",
                          })
                        }
                        className="focus-ring text-teal hover:underline ml-3"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="focus-ring text-red-700 hover:underline"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-ink/60 py-8">لا توجد بيانات بعد.</p>
            )}
          </div>
        )}
      </section>

      {form && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-medium mb-4">
              {form.id ? "تعديل بيانات فرد" : "إضافة فرد جديد"}
            </h3>

            <div className="grid gap-3">
              <Field label="الاسم الكامل *">
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="الجنس">
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-line px-3 py-2 bg-white"
                  >
                    <option value="">—</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </Field>
                <Field label="تاريخ الميلاد">
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="رقم الهاتف">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                  />
                </Field>
                <Field label="الفرع العائلي">
                  <input
                    value={form.family_branch}
                    onChange={(e) => setForm({ ...form, family_branch: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="مكان الإقامة (المدينة)">
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                  />
                </Field>
                <Field label="الدولة">
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_society_member}
                  onChange={(e) => setForm({ ...form, is_society_member: e.target.checked })}
                  className="focus-ring"
                />
                عضو رسمي في الجمعية
              </label>

              {form.is_society_member && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="الصفة بالجمعية">
                    <input
                      value={form.society_role}
                      onChange={(e) => setForm({ ...form, society_role: e.target.value })}
                      className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                    />
                  </Field>
                  <Field label="تاريخ الانضمام">
                    <input
                      type="date"
                      value={form.society_join_date}
                      onChange={(e) => setForm({ ...form, society_join_date: e.target.value })}
                      className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                    />
                  </Field>
                </div>
              )}

              <Field label="الحالة">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="focus-ring w-full rounded-lg border border-line px-3 py-2 bg-white"
                >
                  <option value="active">نشط</option>
                  <option value="moved">منتقل</option>
                  <option value="deceased">متوفى</option>
                </select>
              </Field>

              <Field label="ملاحظات">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="focus-ring w-full rounded-lg border border-line px-3 py-2"
                />
              </Field>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                disabled={saving}
                className="focus-ring flex-1 rounded-lg bg-teal text-sand py-2.5 font-medium hover:bg-teal-dark transition-colors disabled:opacity-60"
              >
                {saving ? "جارِ الحفظ..." : "حفظ"}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="focus-ring flex-1 rounded-lg border border-line py-2.5 hover:bg-sand transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="block text-ink/70 mb-1">{label}</span>
      {children}
    </label>
  );
}

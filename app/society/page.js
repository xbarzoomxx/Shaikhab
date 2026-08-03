"use client";

import Navbar from "@/components/Navbar";
import PublicDataView from "@/components/PublicDataView";

export default function SocietyPage() {
  return (
    <main className="min-h-screen">
      <Navbar active="/society" />

      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-3xl md:text-4xl text-teal-dark"
          >
            أعضاء الجمعية
          </h1>
          <p className="text-ink/60 mt-1">الأعضاء الرسميون في جمعية الشيخاب الخيرية</p>
        </div>

        <PublicDataView section="officials" searchLabel="ابحث عن أحد أعضاء الجمعية" />
      </section>

      <footer className="text-center text-xs text-ink/40 py-8">
        بوابة أسرة الشيخاب — دليل التوثيق العائلي
      </footer>
    </main>
  );
}

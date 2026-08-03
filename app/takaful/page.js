"use client";

import Navbar from "@/components/Navbar";
import BylawsContent from "@/components/BylawsContent";
import TakafulStats from "@/components/TakafulStats";
import SectionExplorer from "@/components/SectionExplorer";
import { useSectionData } from "@/lib/useSectionData";

export default function TakafulPage() {
  const subs = useSectionData("subscriptions");
  const officials = useSectionData("officials");

  return (
    <main className="min-h-screen">
      <Navbar active="/takaful" />

      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-3xl md:text-4xl text-teal-dark"
          >
            البرنامج التكافلي
          </h1>
          <p className="text-ink/60 mt-1">اللائحة، الاشتراكات، والقائمون على الصندوق</p>
        </div>

        {!subs.loading && !subs.error && (
          <TakafulStats rows={subs.rows} columns={subs.columns} />
        )}

        <BylawsContent />

        <div className="mt-10 mb-6">
          <h2 className="text-xl font-medium text-teal-dark mb-1">سجل الاشتراكات</h2>
          <p className="text-sm text-ink/60">تحقق من حالة اشتراكك أو اشتراك أي فرد من العائلة</p>
        </div>
        <SectionExplorer
          rows={subs.rows}
          columns={subs.columns}
          loading={subs.loading}
          error={subs.error}
          searchLabel="ابحث عن اسم في سجل الاشتراكات"
        />

        <div className="mt-10 mb-6">
          <h2 className="text-xl font-medium text-teal-dark mb-1">اللجنة المسؤولة عن الصندوق</h2>
          <p className="text-sm text-ink/60">أعضاء اللجنة المالية والاجتماعية والقائمون على الجمعية</p>
        </div>
        <SectionExplorer
          rows={officials.rows}
          columns={officials.columns}
          loading={officials.loading}
          error={officials.error}
          searchLabel="ابحث عن أحد أعضاء اللجنة"
        />
      </section>

      <footer className="text-center text-xs text-ink/40 py-8">
        بوابة أسرة الشيخاب — دليل التوثيق العائلي
      </footer>
    </main>
  );
}

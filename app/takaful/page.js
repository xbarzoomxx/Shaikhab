"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SectionTabs from "@/components/SectionTabs";
import SectionExplorer from "@/components/SectionExplorer";
import TakafulStats from "@/components/TakafulStats";
import {
  IntroQuote,
  Overview,
  Beneficiaries,
  FundingAndDisbursement,
  GeneralRules,
} from "@/components/BylawsSections";
import { useSectionData } from "@/lib/useSectionData";

const SUB_SECTIONS = [
  { key: "overview", label: "الرؤية والأهداف" },
  { key: "beneficiaries", label: "الفئات المستفيدة" },
  { key: "funding", label: "طريقة الاشتراك والصرف" },
  { key: "subscriptions", label: "سجل الاشتراكات" },
  { key: "committee", label: "اللجنة المسؤولة" },
  { key: "rules", label: "الضوابط العامة" },
];

export default function TakafulPage() {
  const [active, setActive] = useState(SUB_SECTIONS[0].key);
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

        <SectionTabs sections={SUB_SECTIONS} active={active} onChange={setActive} />

        <div className="mt-2">
          {active === "overview" && (
            <>
              <IntroQuote />
              <Overview />
            </>
          )}

          {active === "beneficiaries" && <Beneficiaries />}

          {active === "funding" && <FundingAndDisbursement />}

          {active === "subscriptions" && (
            <SectionExplorer
              rows={subs.rows}
              columns={subs.columns}
              loading={subs.loading}
              error={subs.error}
              searchLabel="ابحث عن اسم في سجل الاشتراكات"
            />
          )}

          {active === "committee" && (
            <SectionExplorer
              rows={officials.rows}
              columns={officials.columns}
              loading={officials.loading}
              error={officials.error}
              searchLabel="ابحث عن أحد أعضاء اللجنة"
            />
          )}

          {active === "rules" && <GeneralRules />}
        </div>
      </section>

      <footer className="text-center text-xs text-ink/40 py-8">
        بوابة أسرة الشيخاب — دليل التوثيق العائلي
      </footer>
    </main>
  );
}

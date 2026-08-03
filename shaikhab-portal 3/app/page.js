"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SectionTabs from "@/components/SectionTabs";
import PublicDataView from "@/components/PublicDataView";
import { SECTIONS } from "@/lib/sections";

const SECTION_LIST = Object.values(SECTIONS);

export default function HomePage() {
  const [active, setActive] = useState(SECTION_LIST[0].key);

  return (
    <main className="min-h-screen">
      <Header />

      <section className="max-w-5xl mx-auto px-6 py-8">
        <SectionTabs sections={SECTION_LIST} active={active} onChange={setActive} />
        <PublicDataView section={active} />
      </section>

      <footer className="text-center text-xs text-ink/40 py-8">
        بوابة أسرة الشيخاب — دليل التوثيق العائلي
      </footer>
    </main>
  );
}

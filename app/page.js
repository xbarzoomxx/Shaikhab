"use client";

import { useState } from "react";
import Link from "next/link";
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <SectionTabs sections={SECTION_LIST} active={active} onChange={setActive} />
          <Link
            href="/bylaws"
            className="focus-ring text-sm text-teal underline underline-offset-4 hover:text-teal-dark mb-6"
          >
            لائحة الصندوق العلاجي
          </Link>
        </div>
        <PublicDataView section={active} />
      </section>

      <footer className="text-center text-xs text-ink/40 py-8">
        بوابة أسرة الشيخاب — دليل التوثيق العائلي
      </footer>
    </main>
  );
}

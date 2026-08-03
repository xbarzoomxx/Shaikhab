"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "الدليل العائلي" },
  { href: "/takaful", label: "البرنامج التكافلي" },
  { href: "/society", label: "أعضاء الجمعية" },
];

export default function Navbar({ active }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground relative">
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-3xl md:text-4xl leading-tight"
          >
            الشيخاب
          </h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring rounded-md px-4 py-2 text-sm transition-colors ${
                active === item.href
                  ? "bg-primary-foreground/15 text-primary-foreground font-medium"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="focus-ring rounded-md border border-primary-foreground/30 px-4 py-2 text-sm hover:bg-primary-foreground/10 transition-colors mr-1"
          >
            لوحة المسؤول
          </Link>
          <ThemeToggle className="mr-1" />
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="فتح القائمة"
            aria-expanded={open}
            className="focus-ring rounded-md border border-primary-foreground/30 p-2"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="md:hidden border-t border-primary-foreground/15 px-6 py-3 flex flex-col gap-1 bg-primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`focus-ring rounded-md px-3 py-2.5 text-sm ${
                active === item.href
                  ? "bg-primary-foreground/15 text-primary-foreground font-medium"
                  : "text-primary-foreground/85"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="focus-ring rounded-md px-3 py-2.5 text-sm border border-primary-foreground/25 mt-1"
          >
            لوحة المسؤول
          </Link>
        </nav>
      )}

      <div className="rosette-divider" />
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "shaikhab-theme";

export default function ThemeToggle({ className = "" }) {
  const [dark, setDark] = useState(null); // null until mounted, avoids hydration flash

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // ignore (private browsing / storage disabled)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      className={`focus-ring rounded-md border border-primary-foreground/30 w-9 h-9 shrink-0 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors ${className}`}
    >
      {dark === null ? (
        <span className="w-4 h-4" />
      ) : dark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 14.5A8 8 0 119.5 4a6.5 6.5 0 0010.5 10.5z"
          />
        </svg>
      )}
    </button>
  );
}

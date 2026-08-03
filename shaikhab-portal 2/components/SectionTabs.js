"use client";

export default function SectionTabs({ sections, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sections.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`focus-ring rounded-lg px-4 py-2 text-sm border transition-colors ${
            active === s.key
              ? "bg-teal text-sand border-teal"
              : "bg-white border-line hover:bg-teal-light"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

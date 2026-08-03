import Link from "next/link";

export default function Header({ showAdminLink = true }) {
  return (
    <header className="bg-teal-dark text-sand">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl md:text-5xl leading-tight"
          >
            أسرة الشيخاب
          </h1>
          <p className="text-sand/80 mt-1 text-sm md:text-base">
            الدليل العائلي والصندوق التكافولي
          </p>
        </div>
        {showAdminLink && (
          <Link
            href="/admin"
            className="focus-ring shrink-0 rounded-md border border-sand/30 px-4 py-2 text-sm hover:bg-sand/10 transition-colors"
          >
            لوحة المسؤول
          </Link>
        )}
      </div>
      <div className="rosette-divider" />
    </header>
  );
}

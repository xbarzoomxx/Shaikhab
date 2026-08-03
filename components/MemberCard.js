"use client";

import {
  guessPhoneColumn,
  guessSecondaryColumn,
  guessBadgeColumns,
  initialOf,
  avatarHue,
  whatsappLink,
  telLink,
} from "@/lib/personCard";

function Badge({ text }) {
  return (
    <span className="text-xs bg-accent-light text-accent-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
      {text}
    </span>
  );
}

export default function MemberCard({ row, columns, nameColumn, rows }) {
  const name = row[nameColumn] || "—";
  const phoneCol = guessPhoneColumn(columns);
  const phone = phoneCol ? row[phoneCol] : null;
  const badgeCols = guessBadgeColumns(columns, rows, [nameColumn, phoneCol].filter(Boolean));
  const secondaryCol = guessSecondaryColumn(columns, [nameColumn, phoneCol, ...badgeCols].filter(Boolean));
  const restCols = columns.filter(
    (c) => c !== nameColumn && c !== phoneCol && c !== secondaryCol && !badgeCols.includes(c) && row[c]
  );

  const hue = avatarHue(name);
  const tel = telLink(phone);
  const wa = whatsappLink(phone);

  return (
    <div className="bg-surface border border-line rounded-xl p-4 transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-medium text-white"
          style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
        >
          {initialOf(name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg truncate">{name}</h3>
          {secondaryCol && row[secondaryCol] && (
            <p className="text-sm text-ink-muted truncate">{row[secondaryCol]}</p>
          )}
        </div>
      </div>

      {badgeCols.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {badgeCols
            .filter((c) => row[c])
            .map((c) => (
              <Badge key={c} text={row[c]} />
            ))}
        </div>
      )}

      {restCols.length > 0 && (
        <dl className="mt-3 pt-3 border-t border-line grid grid-cols-1 gap-1">
          {restCols.map((c) => (
            <div key={c} className="flex gap-2 text-sm">
              <dt className="text-ink-muted shrink-0">{c}:</dt>
              <dd className="text-ink/90 truncate">{row[c]}</dd>
            </div>
          ))}
        </dl>
      )}

      {(tel || wa) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-line">
          {tel && (
            <a
              href={tel}
              className="focus-ring flex-1 text-center text-sm rounded-lg bg-primary-light text-primary py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              اتصال
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="focus-ring flex-1 text-center text-sm rounded-lg bg-accent-light text-accent-foreground py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              واتساب
            </a>
          )}
        </div>
      )}
    </div>
  );
}

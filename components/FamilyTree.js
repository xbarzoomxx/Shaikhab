"use client";

import { initialOf, avatarHue, guessPhoneColumn, guessNumberColumn, telLink, whatsappLink } from "@/lib/personCard";

function PersonChip({ row, nameColumn, numberCol, phoneCol, small }) {
  const name = row[nameColumn] || "—";
  const number = numberCol ? row[numberCol] : null;
  const hue = avatarHue(name);
  const phone = phoneCol ? row[phoneCol] : null;
  const tel = telLink(phone);
  const wa = whatsappLink(phone);
  const size = small ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-xs";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`${size} rounded-full flex items-center justify-center shrink-0 font-medium text-white`}
        style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
      >
        {initialOf(name)}
      </span>
      {number && (
        <span className="text-[10px] text-primary bg-primary-light rounded-full w-4 h-4 flex items-center justify-center shrink-0">
          {number}
        </span>
      )}
      <span className={small ? "text-sm" : "text-sm md:text-base"}>{name}</span>
      {(tel || wa) && (
        <span className="flex gap-1">
          {tel && (
            <a
              href={tel}
              onClick={(e) => e.stopPropagation()}
              className="focus-ring text-xs text-primary hover:underline"
            >
              اتصال
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="focus-ring text-xs text-accent hover:underline"
            >
              واتساب
            </a>
          )}
        </span>
      )}
    </span>
  );
}

function TreeNode({ node, nameColumn, phoneCol, numberCol, depth }) {
  const hasChildren = node.children.length > 0;

  const nodeLabel = (
    <div className="py-1">
      <PersonChip row={node.row} nameColumn={nameColumn} numberCol={numberCol} phoneCol={phoneCol} />
      {hasChildren && (
        <span className="text-xs text-ink-muted mr-1">({node.children.length})</span>
      )}
      {node.spouses.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 mr-1">
          {node.spouses.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-ink-muted">
              <span className="text-xs">⚭</span>
              <PersonChip
                row={s.row}
                nameColumn={nameColumn}
                numberCol={numberCol}
                phoneCol={phoneCol}
                small
              />
              {s.status && (
                <span className="text-[10px] bg-accent-light text-accent-foreground px-1.5 py-0.5 rounded-full">
                  {s.status}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (!hasChildren) {
    return <div className="pr-4 border-r-2 border-line">{nodeLabel}</div>;
  }

  return (
    <details open={depth < 2} className="group">
      <summary className="cursor-pointer list-none marker:content-none focus-ring rounded">
        <span className="inline-flex items-start gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-ink-muted transition-transform group-open:rotate-90 shrink-0 mt-2.5"
          >
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {nodeLabel}
        </span>
      </summary>
      <div className="pr-5 mr-3.5 border-r-2 border-line space-y-0.5">
        {node.children.map((child, i) => (
          <TreeNode
            key={i}
            node={child}
            nameColumn={nameColumn}
            phoneCol={phoneCol}
            numberCol={numberCol}
            depth={depth + 1}
          />
        ))}
      </div>
    </details>
  );
}

export default function FamilyTree({ groups, nameColumn, columns }) {
  const phoneCol = guessPhoneColumn(columns);
  const numberCol = guessNumberColumn(columns);

  if (groups.length === 0) {
    return <p className="text-ink-muted text-center py-8">لا توجد بيانات لعرضها كشجرة عائلية بعد.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label} className="bg-surface border border-line rounded-xl p-4 md:p-5">
          {group.label !== "شجرة العائلة" && (
            <h3 className="font-medium text-primary mb-3">{group.label}</h3>
          )}
          <div className="space-y-1">
            {group.roots.map((node, i) => (
              <TreeNode
                key={i}
                node={node}
                nameColumn={nameColumn}
                phoneCol={phoneCol}
                numberCol={numberCol}
                depth={0}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

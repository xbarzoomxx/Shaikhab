"use client";

import { initialOf, avatarHue, guessPhoneColumn, telLink, whatsappLink } from "@/lib/personCard";

function TreeNode({ node, nameColumn, phoneCol, depth }) {
  const name = node.row[nameColumn] || "—";
  const hue = avatarHue(name);
  const hasChildren = node.children.length > 0;
  const phone = phoneCol ? node.row[phoneCol] : null;
  const tel = telLink(phone);
  const wa = whatsappLink(phone);

  const nodeLabel = (
    <span className="inline-flex items-center gap-2 py-1.5">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-medium text-white text-xs"
        style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
      >
        {initialOf(name)}
      </span>
      <span className="text-sm md:text-base">{name}</span>
      {hasChildren && (
        <span className="text-xs text-ink-muted">({node.children.length})</span>
      )}
      {(tel || wa) && (
        <span className="flex gap-1 mr-1">
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

  if (!hasChildren) {
    return <div className="pr-4 border-r-2 border-line">{nodeLabel}</div>;
  }

  return (
    <details open={depth < 2} className="group">
      <summary className="cursor-pointer list-none marker:content-none focus-ring rounded">
        <span className="inline-flex items-center gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-ink-muted transition-transform group-open:rotate-90 shrink-0"
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
            depth={depth + 1}
          />
        ))}
      </div>
    </details>
  );
}

export default function FamilyTree({ groups, nameColumn, columns }) {
  const phoneCol = guessPhoneColumn(columns);

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
              <TreeNode key={i} node={node} nameColumn={nameColumn} phoneCol={phoneCol} depth={0} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

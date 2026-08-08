"use client";

import { useMemo } from "react";
import PanZoom from "@/components/PanZoom";
import { layoutTree } from "@/lib/treeLayout";
import { initialOf, avatarHue, guessPhoneColumn, guessNumberColumn, telLink, whatsappLink } from "@/lib/personCard";

function NodeBox({ box, nameColumn, numberCol, phoneCol }) {
  const name = box.row[nameColumn] || "—";
  const number = numberCol ? box.row[numberCol] : null;
  const phone = phoneCol ? box.row[phoneCol] : null;
  const tel = telLink(phone);
  const wa = whatsappLink(phone);
  const hue = avatarHue(name);
  const isSpouse = box.kind === "spouse";

  return (
    <div
      className={`absolute rounded-xl border p-2 flex items-center gap-2 bg-surface ${
        isSpouse ? "border-dashed border-accent/50" : "border-line shadow-sm"
      }`}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-medium text-white text-sm"
        style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
      >
        {initialOf(name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          {number && (
            <span className="text-[10px] text-primary bg-primary-light rounded-full w-4 h-4 flex items-center justify-center shrink-0">
              {number}
            </span>
          )}
          <span className="text-sm font-medium truncate">{name}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {box.status && (
            <span className="text-[10px] bg-accent-light text-accent-foreground px-1.5 rounded-full">
              {box.status}
            </span>
          )}
          {tel && (
            <a
              href={tel}
              className="focus-ring text-[11px] text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              اتصال
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="focus-ring text-[11px] text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              واتساب
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FamilyTreeGraphic({ root, nameColumn, columns }) {
  const phoneCol = guessPhoneColumn(columns);
  const numberCol = guessNumberColumn(columns);

  const { boxes, edges, width, height } = useMemo(() => layoutTree(root), [root]);

  return (
    <PanZoom contentWidth={width} contentHeight={height} className="h-[70vh] min-h-[420px] bg-bg rounded-xl border border-line">
      <svg
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
        style={{ color: "hsl(var(--border))" }}
      >
        {edges.map((e, i) => (
          <polyline key={i} points={e.points} fill="none" stroke="currentColor" strokeWidth={2} />
        ))}
      </svg>
      {boxes.map((box) => (
        <NodeBox key={box.id} box={box} nameColumn={nameColumn} numberCol={numberCol} phoneCol={phoneCol} />
      ))}
    </PanZoom>
  );
}

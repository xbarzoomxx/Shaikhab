import { NextResponse } from "next/server";
import { fetchSheetRows } from "@/lib/sheetsPublic";
import { SECTIONS, tabNameFor } from "@/lib/sections";
import { getSheetId } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");

  if (!section || !SECTIONS[section]) {
    return NextResponse.json(
      { error: `قسم غير معروف. الأقسام المتاحة: ${Object.keys(SECTIONS).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const sheetId = getSheetId();
    const tabName = tabNameFor(section);
    const rows = await fetchSheetRows(sheetId, tabName);
    return NextResponse.json({ section, tabName, rows });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

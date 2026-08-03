import { NextResponse } from "next/server";
import { extractSheetId } from "@/lib/sheetsPublic";
import { getSheetId } from "@/lib/config";

export async function GET() {
  const id = extractSheetId(getSheetId());
  if (!id) {
    return NextResponse.json({ error: "تعذّر تحديد معرّف الملف" }, { status: 500 });
  }
  return NextResponse.json({ url: `https://docs.google.com/spreadsheets/d/${id}/edit` });
}

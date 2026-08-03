import { NextResponse } from "next/server";
import { extractSheetId } from "@/lib/sheetsPublic";

export async function GET() {
  const id = extractSheetId(process.env.GOOGLE_SHEET_ID);
  if (!id) {
    return NextResponse.json({ error: "GOOGLE_SHEET_ID غير مضبوط" }, { status: 500 });
  }
  return NextResponse.json({ url: `https://docs.google.com/spreadsheets/d/${id}/edit` });
}

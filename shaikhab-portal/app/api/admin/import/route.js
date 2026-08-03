import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { addMember, MEMBERS_HEADERS } from "@/lib/sheets";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (rows.length === 0) {
      return NextResponse.json({ error: "الملف فارغ أو غير مقروء" }, { status: 400 });
    }

    let added = 0;
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const full_name = row.full_name || row["الاسم الكامل"] || row["الاسم"];
      if (!full_name || !String(full_name).trim()) {
        errors.push(`الصف ${i + 2}: الاسم مفقود، تم التجاوز`);
        continue;
      }
      const data = {};
      for (const h of MEMBERS_HEADERS) {
        if (h === "id" || h === "created_at" || h === "updated_at") continue;
        if (row[h] !== undefined) data[h] = row[h];
      }
      data.full_name = full_name;
      if (typeof data.is_society_member === "string") {
        data.is_society_member = ["true", "TRUE", "1", "نعم"].includes(
          data.is_society_member.trim()
        );
      }
      try {
        await addMember(data);
        added++;
      } catch (e) {
        errors.push(`الصف ${i + 2}: ${e.message}`);
      }
    }

    return NextResponse.json({ added, total: rows.length, errors });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

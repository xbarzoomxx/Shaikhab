import * as XLSX from "xlsx";
import { listMembers } from "@/lib/sheets";

const ARABIC_LABELS = {
  id: "المعرف",
  full_name: "الاسم الكامل",
  gender: "الجنس",
  birth_date: "تاريخ الميلاد",
  phone: "رقم الهاتف",
  city: "مكان الإقامة",
  country: "الدولة",
  family_branch: "الفرع العائلي",
  is_society_member: "عضو الجمعية",
  society_role: "الصفة بالجمعية",
  society_join_date: "تاريخ الانضمام للجمعية",
  status: "الحالة",
  notes: "ملاحظات",
  created_at: "تاريخ التسجيل",
  updated_at: "آخر تحديث",
};

export async function GET() {
  try {
    const members = await listMembers();
    const rows = members.map((m) => {
      const out = {};
      for (const key of Object.keys(ARABIC_LABELS)) {
        out[ARABIC_LABELS[key]] = m[key] ?? "";
      }
      return out;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الأفراد");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="shaikhab-members.xlsx"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

import { NextResponse } from "next/server";
import { listMembers, addMember } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const members = await listMembers();
    return NextResponse.json({ members });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.full_name || !String(body.full_name).trim()) {
      return NextResponse.json({ error: "الاسم الكامل مطلوب" }, { status: 400 });
    }
    const member = await addMember(body);
    return NextResponse.json({ member }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

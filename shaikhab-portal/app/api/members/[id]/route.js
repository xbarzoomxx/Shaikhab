import { NextResponse } from "next/server";
import { updateMember, deleteMember } from "@/lib/sheets";

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const member = await updateMember(params.id, body);
    return NextResponse.json({ member });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const result = await deleteMember(params.id);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

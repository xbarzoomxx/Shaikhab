import { NextResponse } from "next/server";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { getAdminPassword } from "@/lib/config";

export async function POST(req) {
  try {
    const { password } = await req.json();
    const adminPassword = getAdminPassword();
    if (password !== adminPassword) {
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }
    const token = await createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

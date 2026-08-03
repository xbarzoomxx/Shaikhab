import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "shaikhab_admin_session";

async function isAuthed(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "");
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isProtectedPage = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedPage) {
    const ok = await isAuthed(req);
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

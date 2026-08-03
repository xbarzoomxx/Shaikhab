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
  const isProtectedApi =
    (pathname.startsWith("/api/members") && req.method !== "GET") ||
    pathname.startsWith("/api/admin/import") ||
    pathname.startsWith("/api/admin/export");

  if (isProtectedPage) {
    const ok = await isAuthed(req);
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (isProtectedApi) {
    const ok = await isAuthed(req);
    if (!ok) {
      return NextResponse.json({ error: "غير مصرح، الرجاء تسجيل الدخول" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/members/:path*", "/api/admin/:path*"],
};

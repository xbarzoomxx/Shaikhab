import { SignJWT, jwtVerify } from "jose";
import { getSessionSecret } from "@/lib/config";

const COOKIE_NAME = "shaikhab_admin_session";

function getSecret() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function createSessionToken() {
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export { COOKIE_NAME };

// The Google Sheet ID is NOT a secret — the sheet is shared as
// "Anyone with the link can view", so anyone with this ID can already
// open it directly in a browser. Hardcoding it here means the site works
// immediately after deploy with zero environment variables required.
//
// An environment variable, if set in Vercel, still overrides this value
// (useful if the family ever moves to a different Sheet later without
// touching the code).
export const DEFAULT_SHEET_ID = "1Ra9oSvK9GSY-pCPABhsH3LUUentqXfUYI_gfOuUOjxo";

export function getSheetId() {
  return process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
}

// ADMIN_PASSWORD and SESSION_SECRET protect the admin dashboard. Defaults
// are provided below so the site works with zero configuration, but since
// this source code may end up in a GitHub repo, anyone who can read the
// repo can read these defaults too. If the repo is public, or if you want
// a different admin password, set ADMIN_PASSWORD (and optionally
// SESSION_SECRET) as environment variables in Vercel — they will
// automatically override these fallbacks.
export const DEFAULT_ADMIN_PASSWORD = "shaikhab2026";
export const DEFAULT_SESSION_SECRET =
  "9c05c867855ce2e4c13ac252760dc2eb844d0101b8a5bb4787fc9b99a9c00ea";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function getSessionSecret() {
  return process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

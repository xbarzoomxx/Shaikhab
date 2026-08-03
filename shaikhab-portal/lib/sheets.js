import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const MEMBERS_HEADERS = [
  "id",
  "full_name",
  "gender",
  "birth_date",
  "phone",
  "city",
  "country",
  "family_branch",
  "is_society_member",
  "society_role",
  "society_join_date",
  "status",
  "notes",
  "created_at",
  "updated_at",
];

const SUBSCRIPTIONS_HEADERS = [
  "id",
  "member_id",
  "year",
  "amount_due",
  "amount_paid",
  "status",
  "payment_date",
  "method",
];

let cachedDoc = null;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY environment variables."
    );
  }
  // Vercel env vars store literal \n, convert back to real newlines
  key = key.replace(/\\n/g, "\n");
  return new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getDoc() {
  if (cachedDoc) return cachedDoc;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable.");
  }
  const doc = new GoogleSpreadsheet(sheetId, getAuth());
  await doc.loadInfo();
  cachedDoc = doc;
  return doc;
}

async function ensureSheet(doc, title, headers) {
  let sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    sheet = await doc.addSheet({ title, headerValues: headers });
  } else {
    await sheet.loadHeaderRow().catch(() => null);
    if (!sheet.headerValues || sheet.headerValues.length === 0) {
      await sheet.setHeaderRow(headers);
    }
  }
  return sheet;
}

export async function getMembersSheet() {
  const doc = await getDoc();
  return ensureSheet(doc, "Members", MEMBERS_HEADERS);
}

export async function getSubscriptionsSheet() {
  const doc = await getDoc();
  return ensureSheet(doc, "Subscriptions", SUBSCRIPTIONS_HEADERS);
}

function rowToObject(row, headers) {
  const obj = {};
  for (const h of headers) obj[h] = row.get(h) ?? "";
  obj._rowNumber = row.rowNumber;
  return obj;
}

export async function listMembers() {
  const sheet = await getMembersSheet();
  const rows = await sheet.getRows();
  return rows.map((r) => rowToObject(r, MEMBERS_HEADERS));
}

export async function addMember(data) {
  const sheet = await getMembersSheet();
  const now = new Date().toISOString();
  const id = data.id || `M${Date.now()}`;
  const row = await sheet.addRow({
    id,
    full_name: data.full_name || "",
    gender: data.gender || "",
    birth_date: data.birth_date || "",
    phone: data.phone || "",
    city: data.city || "",
    country: data.country || "",
    family_branch: data.family_branch || "",
    is_society_member: data.is_society_member ? "TRUE" : "FALSE",
    society_role: data.society_role || "",
    society_join_date: data.society_join_date || "",
    status: data.status || "active",
    notes: data.notes || "",
    created_at: now,
    updated_at: now,
  });
  return rowToObject(row, MEMBERS_HEADERS);
}

export async function updateMember(id, data) {
  const sheet = await getMembersSheet();
  const rows = await sheet.getRows();
  const row = rows.find((r) => r.get("id") === id);
  if (!row) throw new Error("Member not found");
  for (const key of Object.keys(data)) {
    if (key === "is_society_member") {
      row.set(key, data[key] ? "TRUE" : "FALSE");
    } else if (MEMBERS_HEADERS.includes(key)) {
      row.set(key, data[key]);
    }
  }
  row.set("updated_at", new Date().toISOString());
  await row.save();
  return rowToObject(row, MEMBERS_HEADERS);
}

export async function deleteMember(id) {
  const sheet = await getMembersSheet();
  const rows = await sheet.getRows();
  const row = rows.find((r) => r.get("id") === id);
  if (!row) throw new Error("Member not found");
  await row.delete();
  return { id };
}

export async function listSubscriptions() {
  const sheet = await getSubscriptionsSheet();
  const rows = await sheet.getRows();
  return rows.map((r) => rowToObject(r, SUBSCRIPTIONS_HEADERS));
}

export async function upsertSubscription(data) {
  const sheet = await getSubscriptionsSheet();
  const rows = await sheet.getRows();
  const existing = rows.find(
    (r) =>
      r.get("member_id") === data.member_id &&
      String(r.get("year")) === String(data.year)
  );
  if (existing) {
    for (const key of Object.keys(data)) {
      if (SUBSCRIPTIONS_HEADERS.includes(key)) existing.set(key, data[key]);
    }
    await existing.save();
    return rowToObject(existing, SUBSCRIPTIONS_HEADERS);
  }
  const id = `S${Date.now()}`;
  const row = await sheet.addRow({ id, ...data });
  return rowToObject(row, SUBSCRIPTIONS_HEADERS);
}

export { MEMBERS_HEADERS, SUBSCRIPTIONS_HEADERS };

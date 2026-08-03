import Papa from "papaparse";

/**
 * Accepts either a raw Google Sheet ID or a full Google Sheets URL and
 * returns just the ID.
 */
export function extractSheetId(idOrUrl) {
  if (!idOrUrl) return null;
  const match = idOrUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return idOrUrl.trim();
}

/**
 * Fetches a tab of a Google Sheet as CSV and parses it into an array of
 * plain objects, keyed by whatever headers are in the first row.
 *
 * Works with NO API key and NO service account — it only requires that the
 * sheet is shared as "Anyone with the link can view".
 *
 * @param {string} sheetIdOrUrl - the Sheet ID, or the full share URL
 * @param {string} [tabName] - optional tab/sheet name. Omit to use the first tab.
 */
export async function fetchSheetRows(sheetIdOrUrl, tabName) {
  const id = extractSheetId(sheetIdOrUrl);
  if (!id) {
    throw new Error("لم يتم ضبط معرّف ملف Google Sheet (GOOGLE_SHEET_ID).");
  }

  const url = new URL(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq`);
  url.searchParams.set("tqx", "out:csv");
  if (tabName) url.searchParams.set("sheet", tabName);

  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    if (res.status === 400 || res.status === 404) {
      throw new Error(
        "تعذّر العثور على الملف أو التبويب المطلوب. تأكد من صحة المعرّف واسم التبويب."
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "لا يمكن الوصول إلى الملف. تأكد من ضبط المشاركة على \"أي شخص لديه الرابط - عرض\"."
      );
    }
    throw new Error(`تعذّر تحميل بيانات الشيت (رمز الحالة ${res.status}).`);
  }

  const csvText = await res.text();

  // A private/unshared sheet responds with an HTML "sign in" page instead
  // of CSV — detect that case and give a clear message.
  if (csvText.trim().startsWith("<")) {
    throw new Error(
      "الملف غير متاح للعرض العام. افتح إعدادات المشاركة في Google Sheet واختر \"أي شخص لديه الرابط - عرض\"."
    );
  }

  const parsed = Papa.parse(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  return parsed.data.map((row, i) => ({ _row: i + 2, ...row }));
}

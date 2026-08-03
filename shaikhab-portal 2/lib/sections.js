export const SECTIONS = {
  members: {
    key: "members",
    label: "الدليل العائلي العام",
    envVar: "GOOGLE_SHEET_TAB_MEMBERS",
    defaultTab: "الأفراد",
  },
  subscriptions: {
    key: "subscriptions",
    label: "الصندوق التكافولي",
    envVar: "GOOGLE_SHEET_TAB_SUBSCRIPTIONS",
    defaultTab: "الصندوق التكافولي",
  },
  officials: {
    key: "officials",
    label: "أعضاء الجمعية",
    envVar: "GOOGLE_SHEET_TAB_OFFICIALS",
    defaultTab: "أعضاء الجمعية",
  },
};

export function tabNameFor(sectionKey) {
  const section = SECTIONS[sectionKey];
  if (!section) return null;
  return process.env[section.envVar] || section.defaultTab;
}

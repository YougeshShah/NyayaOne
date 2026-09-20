import { Language } from "./translations";

// Court.type is a free-text field (extensible, not a rigid enum in the DB),
// but the 95 seeded courts only ever use this fixed set of values. This maps
// those known values to a Nepali display label — anything outside this list
// (a custom type a Company staff member typed in) just displays as-is.
const COURT_TYPE_LABELS: Record<string, { en: string; ne: string }> = {
  "Supreme Court": { en: "Supreme Court", ne: "सर्वोच्च अदालत" },
  "High Court": { en: "High Court", ne: "उच्च अदालत" },
  "District Court": { en: "District Court", ne: "जिल्ला अदालत" },
  "Special Court": { en: "Special Court", ne: "विशेष अदालत" },
  "Labour Court": { en: "Labour Court", ne: "श्रम अदालत" },
  "Debt Recovery Tribunal": { en: "Debt Recovery Tribunal", ne: "ऋण असुली न्यायाधिकरण" },
  "Debt Recovery Appellate Tribunal": { en: "Debt Recovery Appellate Tribunal", ne: "ऋण असुली पुनरावेदन न्यायाधिकरण" },
  "Revenue Tribunal": { en: "Revenue Tribunal", ne: "राजस्व न्यायाधिकरण" },
  "Administrative Court": { en: "Administrative Court", ne: "प्रशासकीय अदालत" },
  "Foreign Employment Tribunal": { en: "Foreign Employment Tribunal", ne: "वैदेशिक रोजगार न्यायाधिकरण" },
};

export function getCourtTypeLabel(type: string, lang: Language): string {
  return COURT_TYPE_LABELS[type]?.[lang] || type;
}

// Nepal's 7 provinces — used to display Bagmati/बागमती etc. bilingually.
const PROVINCE_LABELS: Record<string, { en: string; ne: string }> = {
  Koshi: { en: "Koshi", ne: "कोशी" },
  Madhesh: { en: "Madhesh", ne: "मधेश" },
  Bagmati: { en: "Bagmati", ne: "बागमती" },
  Gandaki: { en: "Gandaki", ne: "गण्डकी" },
  Lumbini: { en: "Lumbini", ne: "लुम्बिनी" },
  Karnali: { en: "Karnali", ne: "कर्णाली" },
  Sudurpaschim: { en: "Sudurpaschim", ne: "सुदूरपश्चिम" },
};

export function getProvinceLabel(province: string | null | undefined, lang: Language): string {
  if (!province) return "";
  return PROVINCE_LABELS[province]?.[lang] || province;
}

// Groups known court types into two headings for a head/subhead dropdown —
// "Regular Courts" (the standard judicial hierarchy) vs "Special Tribunals"
// (specialized bodies for specific subject matter).
export const COURT_TYPE_GROUPS: { label: { en: string; ne: string }; types: string[] }[] = [
  {
    label: { en: "Regular Courts", ne: "नियमित अदालतहरू" },
    types: ["Supreme Court", "High Court", "District Court"],
  },
  {
    label: { en: "Special Tribunals", ne: "विशेष न्यायाधिकरणहरू" },
    types: [
      "Special Court",
      "Labour Court",
      "Debt Recovery Tribunal",
      "Debt Recovery Appellate Tribunal",
      "Revenue Tribunal",
      "Administrative Court",
      "Foreign Employment Tribunal",
    ],
  },
];

export function getCourtTypeGroup(type: string, lang: Language): string {
  const group = COURT_TYPE_GROUPS.find((g) => g.types.includes(type));
  return group ? group.label[lang] : lang === "ne" ? "अन्य" : "Other";
}

// Bilingual display name for a specific court record — uses the stored
// nepaliName when Nepali is selected (if the Company staff filled it in),
// falls back to the English name otherwise.
export function getCourtDisplayName(court: { name: string; nepaliName?: string | null }, lang: Language): string {
  if (lang === "ne" && court.nepaliName) return court.nepaliName;
  return court.name;
}

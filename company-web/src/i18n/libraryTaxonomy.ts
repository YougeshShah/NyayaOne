import { LibraryResourceType } from "../types/library.types";
import { Language } from "./translations";

// Each type's display label in both languages — the enum stays in English
// (CONSTITUTION, ACT, ...) for the database/API, but what the user sees
// switches with the language toggle.
export const LIBRARY_TYPE_LABELS: Record<LibraryResourceType, { en: string; ne: string }> = {
  CONSTITUTION: { en: "Constitution", ne: "संविधान" },
  ACT: { en: "Act", ne: "ऐन" },
  ORDINANCE: { en: "Ordinance", ne: "अध्यादेश" },
  REGULATION: { en: "Regulation", ne: "नियमावली" },
  RULE: { en: "Rule", ne: "नियम" },
  FORMATION_ORDER: { en: "Formation Order", ne: "(गठन) आदेश" },
  POLICY: { en: "Policy", ne: "नीति" },
  INTERNATIONAL_TREATY: { en: "International Treaty", ne: "अन्तर्राष्ट्रिय सन्धि सम्झौता" },
  HISTORICAL_DOCUMENT: { en: "Historical Document", ne: "ऐतिहासिक दस्तावेज" },
  ANNUAL_REPORT: { en: "Annual Report", ne: "बार्षिक प्रतिवेदन" },
  RTI_DISCLOSURE: { en: "RTI Disclosure", ne: "सूचनाको हक बमोजिम सार्वजनिक गरिएको" },
  CIRCULAR: { en: "Circular", ne: "परिपत्र" },
  GOVERNMENT_NOTICE: { en: "Government Notice", ne: "सरकारी सूचना" },
  GAZETTE: { en: "Gazette", ne: "राजपत्र" },
  SUPREME_COURT_DECISION: { en: "Supreme Court Decision", ne: "सर्वोच्च अदालतको फैसला" },
  HIGH_COURT_DECISION: { en: "High Court Decision", ne: "उच्च अदालतको फैसला" },
  ARTICLE: { en: "Article", ne: "लेख" },
  RESEARCH_PAPER: { en: "Research Paper", ne: "अनुसन्धान पत्र" },
  JOURNAL: { en: "Journal", ne: "जर्नल" },
  TEMPLATE: { en: "Template", ne: "टेम्प्लेट" },
  LEGAL_FORM: { en: "Legal Form", ne: "कानुनी फाराम" },
};

export function getLibraryTypeLabel(type: LibraryResourceType, lang: Language): string {
  return LIBRARY_TYPE_LABELS[type]?.[lang] || type.replace(/_/g, " ");
}

// Top-level headings matching Nepal Law Commission's own site structure —
// used to group the Type dropdown instead of showing one long flat list.
// "खारेज भएका कानून" (Repealed Laws) isn't a separate group here — it's the
// isRepealed checkbox on the same types, matching how the Commission itself
// marks existing law as repealed rather than duplicating categories.
export const LIBRARY_TYPE_GROUPS: { key: string; label: { en: string; ne: string }; types: LibraryResourceType[] }[] = [
  {
    key: "existing-law",
    label: { en: "Existing Laws", ne: "मौजुदा कानून" },
    types: ["CONSTITUTION", "ACT", "ORDINANCE", "REGULATION", "RULE", "FORMATION_ORDER"],
  },
  {
    key: "misc",
    label: { en: "Miscellaneous", ne: "विविध" },
    types: ["POLICY", "INTERNATIONAL_TREATY", "HISTORICAL_DOCUMENT"],
  },
  {
    key: "info-center",
    label: { en: "Information Center", ne: "सूचना केन्द्र" },
    types: ["ANNUAL_REPORT", "RTI_DISCLOSURE"],
  },
  {
    key: "other",
    label: { en: "Other Resources", ne: "अन्य स्रोतहरू" },
    types: [
      "CIRCULAR",
      "GOVERNMENT_NOTICE",
      "GAZETTE",
      "SUPREME_COURT_DECISION",
      "HIGH_COURT_DECISION",
      "ARTICLE",
      "RESEARCH_PAPER",
      "JOURNAL",
      "TEMPLATE",
      "LEGAL_FORM",
    ],
  },
];

// Flat, ordered list of {type, groupLabel} pairs for building a grouped Autocomplete.
export function getGroupedTypeOptions(lang: Language): { type: LibraryResourceType; group: string; label: string }[] {
  return LIBRARY_TYPE_GROUPS.flatMap((g) =>
    g.types.map((type) => ({ type, group: g.label[lang], label: getLibraryTypeLabel(type, lang) }))
  );
}

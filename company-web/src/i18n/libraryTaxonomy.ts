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
  NOTE: { en: "Note", ne: "नोट" },
  CASE_SUMMARY: { en: "Case Summary", ne: "मुद्दा सारांश" },
  BOOK: { en: "Book", ne: "पुस्तक" },
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
  {
    key: "student_content",
    label: { en: "Student Learning Content", ne: "विद्यार्थी अध्ययन सामग्री" },
    types: ["NOTE", "CASE_SUMMARY", "BOOK"],
  },
];

// Flat, ordered list of {type, groupLabel} pairs for building a grouped Autocomplete.
// Used by the create/edit dialog's Type field, which must still be able to manage
// every type (portal-web / student-web / portal-mobile read resources of ALL these
// types, so Company Web's admin form keeps them all reachable).
export function getGroupedTypeOptions(lang: Language): { type: LibraryResourceType; group: string; label: string }[] {
  return LIBRARY_TYPE_GROUPS.flatMap((g) =>
    g.types.map((type) => ({ type, group: g.label[lang], label: getLibraryTypeLabel(type, lang) }))
  );
}

// ---------------------------------------------------------------------------
// List-page filter: mirrors the exact 4-heading structure from Nepal Law
// Commission's site (मौजुदा कानून / खारेज भएका कानून / विविध), plus one
// "अन्य स्रोतहरू" catch-all heading so every other type stays filterable —
// nothing is removed from the system, just organised to match the real site.
// "सेवाहरू" (कानून तर्जुमा / खोज तथा अध्ययन) is the Commission's own website
// navigation, not a document category, so it has no heading here.
// ---------------------------------------------------------------------------
export type LibraryHeadingKey = "existing-law" | "repealed" | "misc" | "other";

export const LIBRARY_HEADINGS: {
  key: LibraryHeadingKey;
  label: { en: string; ne: string };
  groupKey?: string;
  isRepealedView?: boolean;
}[] = [
  { key: "existing-law", label: { en: "Existing Laws", ne: "मौजुदा कानून" }, groupKey: "existing-law" },
  { key: "repealed", label: { en: "Repealed Laws", ne: "खारेज भएका कानून" }, groupKey: "existing-law", isRepealedView: true },
  { key: "misc", label: { en: "Miscellaneous", ne: "विविध" }, groupKey: "misc" },
  { key: "other", label: { en: "Other Resources", ne: "अन्य स्रोतहरू" } },
];

export function getLibraryHeadingLabel(key: LibraryHeadingKey, lang: Language): string {
  return LIBRARY_HEADINGS.find((h) => h.key === key)?.label[lang] || key;
}

// Types that fall under a given Level-1 heading (Level-2 of the nested filter).
export function getTypesForHeading(key: LibraryHeadingKey): LibraryResourceType[] {
  const heading = LIBRARY_HEADINGS.find((h) => h.key === key);
  if (!heading) return [];
  if (heading.groupKey) {
    return LIBRARY_TYPE_GROUPS.find((g) => g.key === heading.groupKey)?.types || [];
  }
  // "other" catch-all = every type not already covered by existing-law/misc.
  const covered = new Set<LibraryResourceType>([
    ...(LIBRARY_TYPE_GROUPS.find((g) => g.key === "existing-law")?.types || []),
    ...(LIBRARY_TYPE_GROUPS.find((g) => g.key === "misc")?.types || []),
  ]);
  return LIBRARY_TYPE_GROUPS.flatMap((g) => g.types).filter((t) => !covered.has(t));
}

// Level-3 (sub-subheading) options, scoped per type — matching the exact
// subcategory labels used on Nepal Law Commission's site under ऐन/नियमावली.
// `value` is the canonical string stored in LibraryResource.category (always
// Nepali, so existing data and new data line up regardless of UI language).
export const LIBRARY_CATEGORY_OPTIONS: Partial<Record<LibraryResourceType, { value: string; en: string; ne: string }[]>> = {
  ACT: [
    { value: "हालसालैका ऐन", en: "Recent Acts", ne: "हालसालैका ऐन" },
    { value: "खण्ड अनुसार", en: "By Volume", ne: "खण्ड अनुसार" },
    { value: "खण्ड बाहेकका ऐन", en: "Acts outside the Volume", ne: "खण्ड बाहेकका ऐन" },
    { value: "वर्णानुक्रम अनुसारको सूची", en: "Alphabetical List", ne: "वर्णानुक्रम अनुसारको सूची" },
  ],
  REGULATION: [
    { value: "खण्ड अनुसार", en: "By Volume", ne: "खण्ड अनुसार" },
    { value: "वर्णानुक्रम अनुसारको सूची", en: "Alphabetical List", ne: "वर्णानुक्रम अनुसारको सूची" },
  ],
};

export function getCategoryOptionsForType(
  type: LibraryResourceType | undefined,
  lang: Language
): { value: string; label: string }[] {
  if (!type) return [];
  const opts = LIBRARY_CATEGORY_OPTIONS[type] || [];
  return opts.map((o) => ({ value: o.value, label: o[lang] }));
}

const ALL_CATEGORY_OPTIONS_FLAT: { value: string; en: string; ne: string }[] = Object.values(LIBRARY_CATEGORY_OPTIONS).flatMap(
  (opts) => opts || []
);

// Renders a stored category value in the current UI language when it matches
// a known subcategory; falls back to the raw stored text for anything typed
// freehand outside the suggested list (older data, edge cases).
export function getCategoryDisplayLabel(value: string | undefined | null, lang: Language): string {
  if (!value) return "";
  const match = ALL_CATEGORY_OPTIONS_FLAT.find((o) => o.value === value);
  return match ? match[lang] : value;
}

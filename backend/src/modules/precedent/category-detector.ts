// Category auto-detection for imported precedents. Rules are checked IN
// ORDER, first match wins — this matters because some category keywords
// are substrings of others (e.g. "नामसारी" alone would wrongly match both
// "अंश नामसारी" [Family/Property] and "मोही नामसारी" [Land/Tenancy] if
// checked as a bare word), so the more specific compound phrases are
// listed first within each category, and categories most likely to have
// overlapping vocabulary are ordered deliberately rather than
// alphabetically.
//
// This scans the FULL content text, not just the "मुद्दाः" field --
// testing on the real dataset showed that field is only cleanly
// extractable from about 18% of records (inconsistent formatting from the
// source scrape), so relying on it alone would leave most records
// uncategorized.

interface CategoryRule {
  category: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Family / Property",
    keywords: [
      "अंश चलन", "अंश दर्ता", "अंश नामसारी", "अंश दपोट", "अंशबण्डा", "अपुताली",
      "वैवाहिक सम्बन्ध", "विवाह दर्ता",
      // Bare "अंश" (deliberately removed) matched far too broadly — it's a
      // generic word meaning "part/portion" that appears in unrelated
      // judgments too (e.g. "प्रकरण नं. १३ को अंश"), causing many non-family
      // cases to get mis-tagged. Only the compound terms above are
      // specific enough to reliably signal an inheritance/family dispute.
    ],
  },
  {
    category: "Land / Tenancy",
    keywords: ["मोही नामसारी", "मोही लगत कट्टा", "जग्गा खिचोला", "मोही", "जग्गा दर्ता"],
  },
  {
    category: "Criminal",
    keywords: [
      "कर्तव्य ज्यान", "जबरजस्ती करणी", "जवरजस्ती करणी", "ज्यान मार्ने उद्योग", "सवारी ज्यान",
      "भ्रष्टाचार", "मानव बेचबिखन", "जिउ मास्ने बेच्ने", "लागु औषध", "जालसाजी", "ठगी",
      "चोरी", "डकैती", "अपहरण", "बलात्कार",
    ],
  },
  {
    category: "Constitutional / Writ",
    keywords: [
      "उत्प्रेषणयुक्त परमादेश", "उत्प्रेषण", "परमादेश", "बन्दीप्रत्यक्षीकरण", "निषेधाज्ञा", "अधिकारपृच्छा",
    ],
  },
  {
    category: "Civil / Contract",
    keywords: ["लिखत दर्ता बदर", "लिखत दर्ता वदर", "लिखत वदर", "लिखत बदर", "लेनदेन", "क्षतिपूर्ति", "करार"],
  },
  {
    category: "Tax",
    keywords: ["आयकर", "मूल्य अभिवृद्धि कर", "राजस्व", "भन्सार"],
  },
  {
    category: "Labor",
    keywords: ["वैदेशिक रोजगार कसुर", "वैदेशिक रोजगार", "श्रमिक"],
  },
  {
    category: "Court Procedure",
    keywords: ["अदालतको अवहेलना", "अदालतको अपहेलना", "पुनरावेदन", "पुनरावलोकन"],
  },
];

export function detectCategory(fullContent: string): string | null {
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (fullContent.includes(keyword)) {
        return rule.category;
      }
    }
  }
  return null; // genuinely uncategorized -- still imported and searchable, just filed under no category
}

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Language, TranslationKey } from "./translations";

const STORAGE_KEY = "nyayaone-law-firm-web-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations.en[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ne" ? "ne" : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const t = (key: TranslationKey): string => translations[language][key] || translations.en[key] || key;

  return <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, t }}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "./en";
import ne from "./ne";
import type { Translations } from "./en";

export type Lang = "en" | "ne";

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "skre_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ne" || stored === "en" ? stored : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((prev) => (prev === "en" ? "ne" : "en"));

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, t: lang === "en" ? en : ne, setLang, toggleLang }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

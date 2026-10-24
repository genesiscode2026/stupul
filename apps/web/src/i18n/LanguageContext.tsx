import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language, translations, Translations } from './translations.js';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (path: string, fallback?: string) => string;
  tData: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'stupul_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ro' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'ro';
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ro' ? 'en' : 'ro');
  }, [lang, setLang]);

  const t = useCallback(
    (path: string, fallback?: string): string => {
      const parts = path.split('.');
      let cur: any = translations[lang];
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) {
          cur = cur[p];
        } else {
          return fallback || path;
        }
      }
      return typeof cur === 'string' ? cur : (fallback || path);
    },
    [lang]
  );

  const tData = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, tData }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

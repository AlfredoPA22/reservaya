import { createContext, useContext, useState, type ReactNode } from 'react';
import { es as esTranslations, type TranslationKey } from '../i18n/es';
import { en as enTranslations } from '../i18n/en';
import { es as dateFnsEs, enUS as dateFnsEn, type Locale } from 'date-fns/locale';

export type Lang = 'es' | 'en';

const translations: Record<Lang, Record<TranslationKey, string>> = {
  es: esTranslations,
  en: enTranslations,
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  fnsLocale: Locale;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang');
    return stored === 'en' ? 'en' : 'es';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: TranslationKey): string => translations[lang][key] ?? key;

  const fnsLocale: Locale = lang === 'es' ? dateFnsEs : dateFnsEn;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, fnsLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

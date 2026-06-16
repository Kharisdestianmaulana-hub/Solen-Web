import { useBrowserStore } from '../store/useBrowserStore';
import { translations, TranslationKey } from '../i18n/translations';

export const useTranslation = () => {
  const { language } = useBrowserStore();

  const t = (key: TranslationKey, params?: Record<string, string>) => {
    let text = translations[language][key] || translations['en'][key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }

    return text;
  };

  return { t, language };
};

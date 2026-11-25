import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ar from './ar.json';

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
const lang = saved === 'ar' ? 'ar' : 'en';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: lang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false, prefix: '{{', suffix: '}}' },
});

document.documentElement.lang = lang;
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

export function changeLanguage(next: 'ar' | 'en') {
  i18n.changeLanguage(next);
  document.documentElement.lang = next;
  document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('lang', next);
}

export function getCurrentLanguage(): 'ar' | 'en' {
  return localStorage.getItem('lang') === 'ar' ? 'ar' : 'en';
}

export default i18n;

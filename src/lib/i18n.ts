"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: {
      en: {
        common: en,
      },
      es: {
        common: es,
      },
      // Add other languages here
    },
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    // have a common namespace used around the full app
    ns: ["common"],
    defaultNS: "common",

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;

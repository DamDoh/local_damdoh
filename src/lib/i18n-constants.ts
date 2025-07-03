
import { useTranslations } from 'next-intl';

// The `locales` array is now defined directly in `i18n.ts` and `middleware.ts`
// to prevent build-time resolution issues with next-intl.
export const locales = ['ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'ja', 'km', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'vi', 'zh'];

export const localeNames: Record<string, string> = {
  ar: "العربية",
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  ja: "日本語",
  km: "ភាសាខ្មែរ",
  ko: "한국어",
  ms: "Bahasa Melayu",
  pt: "Português",
  ru: "Русский",
  th: "ไทย",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  zh: "中文"
};

export const getStakeholderRoles = (t: ReturnType<typeof useTranslations>) => [
  { value: 'Farmer', label: t('stakeholderRoles.Farmer') },
  { value: 'Agricultural Cooperative', label: t('stakeholderRoles.AgriculturalCooperative') },
  { value: 'Field Agent/Agronomist (DamDoh Internal)', label: t('stakeholderRoles.FieldAgent') },
  { value: 'Operations/Logistics Team (DamDoh Internal)', label: t('stakeholderRoles.LogisticsTeam') },
  { value: 'Quality Assurance Team (DamDoh Internal)', label: t('stakeholderRoles.QATeam') },
  { value: 'Processing & Packaging Unit', label: t('stakeholderRoles.ProcessingUnit') },
  { value: 'Buyer (Restaurant, Supermarket, Exporter)', label: t('stakeholderRoles.Buyer') },
  { value: 'Input Supplier (Seed, Fertilizer, Pesticide)', label: t('stakeholderRoles.InputSupplier') },
  { value: 'Equipment Supplier (Sales of Machinery/IoT)', label: t('stakeholderRoles.EquipmentSupplier') },
  { value: 'Financial Institution (Micro-finance/Loans)', label: t('stakeholderRoles.FinancialInstitution') },
  { value: 'Government Regulator/Auditor', label: t('stakeholderRoles.Regulator') },
  { value: 'Certification Body (Organic, Fair Trade etc.)', label: t('stakeholderRoles.CertificationBody') },
  { value: 'Consumer', label: t('stakeholderRoles.Consumer') },
  { value: 'Researcher/Academic', label: t('stakeholderRoles.Researcher') },
  { value: 'Logistics Partner (Third-Party Transporter)', label: t('stakeholderRoles.LogisticsPartner') },
  { value: 'Storage/Warehouse Facility', label: t('stakeholderRoles.Warehouse') },
  { value: 'Agronomy Expert/Consultant (External)', label: t('stakeholderRoles.Agronomist') },
  { value: 'Agro-Tourism Operator', label: t('stakeholderRoles.AgroTourism') },
  { value: 'Energy Solutions Provider (Solar, Biogas)', label: t('stakeholderRoles.EnergyProvider') },
  { value: 'Agro-Export Facilitator/Customs Broker', label: t('stakeholderRoles.AgroExporter') },
  { value: 'Agri-Tech Innovator/Developer', label: t('stakeholderRoles.AgriTech') },
  { value: 'Retailer/City Market Seller', label: t('stakeholderRoles.Retailer') },
  { value: 'Waste Management & Compost Facility', label: t('stakeholderRoles.WasteManagement') },
  { value: 'Crowdfunder (Impact Investor, Individual)', label: t('stakeholderRoles.Crowdfunder') },
];

export const getListingTypes = (t: ReturnType<typeof useTranslations>) => [
  { value: 'Product', label: t('listingTypes.Product') },
  { value: 'Service', label: t('listingTypes.Service') },
];

export const getAgriEventTypes = (t: ReturnType<typeof useTranslations>) => [
    { value: 'Conference', label: t('agriEventTypes.Conference') },
    { value: 'Webinar', label: t('agriEventTypes.Webinar') },
    { value: 'Workshop', label: t('agriEventTypes.Workshop') },
    { value: 'Trade Show', label: t('agriEventTypes.TradeShow') },
    { value: 'Field Day', label: t('agriEventTypes.FieldDay') },
    { value: 'Networking Event', label: t('agriEventTypes.NetworkingEvent') },
    { value: 'Online Course Launch', label: t('agriEventTypes.OnlineCourseLaunch') },
    { value: 'Policy Briefing', label: t('agriEventTypes.PolicyBriefing') },
];

export const getFinancialServiceTypes = (t: ReturnType<typeof useTranslations>) => [
    { value: 'loan', label: t('financialServiceTypes.loan') },
    { value: 'credit', label: t('financialServiceTypes.credit') },
    { value: 'grant', label: t('financialServiceTypes.grant') },
    { value: 'savings', label: t('financialServiceTypes.savings') },
];

export const getInsuranceServiceTypes = (t: ReturnType<typeof useTranslations>) => [
    { value: 'crop_insurance', label: t('insuranceServiceTypes.crop_insurance') },
    { value: 'livestock_insurance', label: t('insuranceServiceTypes.livestock_insurance') },
    { value: 'property_insurance', label: t('insuranceServiceTypes.property_insurance') },
];

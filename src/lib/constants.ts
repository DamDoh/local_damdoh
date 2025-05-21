
export const APP_NAME = "DamDoh";

export const STAKEHOLDER_ROLES = [
  'Farmer',
  'Input Supplier',
  'Pre-Harvest Contractor',
  'Collection Agent',
  'Processor',
  'Trader',
  'Retailer',
  'Exporter',
  'Consumer',
  'Government Agency',
  'Agricultural Cooperative',
  'Financial Institution',
  'Trade Association',
  'Development Personnel',
] as const;

export type StakeholderRole = typeof STAKEHOLDER_ROLES[number];

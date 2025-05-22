
import type { LucideIcon } from 'lucide-react';
import {
  Package, Users, Sprout, Wheat, Drumstick, Milk, Carrot, Apple, Box,
  Tractor, Wrench, ShoppingBag, CircleDollarSign, LandPlot, Building,
  Handshake, Briefcase, Truck, Warehouse, Cog, TestTube2, ShieldCheck,
  GraduationCap, DraftingCompass
} from 'lucide-react';

export interface CategoryNode {
  id: string;
  name: string;
  icon?: LucideIcon;
  parent: 'Products' | 'Services';
  href: string;
}

export const ROOT_CATEGORIES = [
  { id: 'products', name: 'Products', icon: Package },
  { id: 'services', name: 'Services', icon: Users },
] as const;

export type RootCategoryId = typeof ROOT_CATEGORIES[number]['id'];

export const AGRICULTURAL_CATEGORIES: CategoryNode[] = [
  // Products
  { id: 'fresh-produce-fruits', name: 'Fruits', icon: Apple, parent: 'Products', href: '/marketplace?category=fresh-produce-fruits' },
  { id: 'fresh-produce-vegetables', name: 'Vegetables', icon: Carrot, parent: 'Products', href: '/marketplace?category=fresh-produce-vegetables' },
  { id: 'grains-cereals', name: 'Grains & Cereals', icon: Wheat, parent: 'Products', href: '/marketplace?category=grains-cereals' },
  { id: 'livestock-poultry', name: 'Livestock & Poultry', icon: Drumstick, parent: 'Products', href: '/marketplace?category=livestock-poultry' },
  { id: 'dairy-alternatives', name: 'Dairy & Alternatives', icon: Milk, parent: 'Products', href: '/marketplace?category=dairy-alternatives' },
  { id: 'processed-packaged', name: 'Processed & Packaged', icon: Box, parent: 'Products', href: '/marketplace?category=processed-packaged' },
  { id: 'seeds-seedlings', name: 'Seeds & Seedlings', icon: Sprout, parent: 'Products', href: '/marketplace?category=seeds-seedlings' },
  { id: 'fertilizers-soil', name: 'Fertilizers & Soil', icon: ShoppingBag, parent: 'Products', href: '/marketplace?category=fertilizers-soil' },
  { id: 'pest-control-products', name: 'Pest Control Products', icon: ShieldCheck, parent: 'Products', href: '/marketplace?category=pest-control-products' },
  { id: 'farm-tools-small-equip', name: 'Farm Tools & Small Equip.', icon: Wrench, parent: 'Products', href: '/marketplace?category=farm-tools-small-equip' },
  { id: 'heavy-machinery-sale', name: 'Heavy Machinery (Sale)', icon: Tractor, parent: 'Products', href: '/marketplace?category=heavy-machinery-sale' },
  { id: 'packaging-solutions', name: 'Packaging Solutions', icon: Box, parent: 'Products', href: '/marketplace?category=packaging-solutions' },

  // Services
  { id: 'farm-labor-staffing', name: 'Farm Labor & Staffing', icon: Users, parent: 'Services', href: '/marketplace?category=farm-labor-staffing' },
  { id: 'consultancy-advisory', name: 'Consultancy & Advisory', icon: Briefcase, parent: 'Services', href: '/marketplace?category=consultancy-advisory' },
  { id: 'equipment-rental-operation', name: 'Equipment Rental & Ops.', icon: Tractor, parent: 'Services', href: '/marketplace?category=equipment-rental-operation' },
  { id: 'logistics-transport', name: 'Logistics & Transport', icon: Truck, parent: 'Services', href: '/marketplace?category=logistics-transport' },
  { id: 'storage-warehousing', name: 'Storage & Warehousing', icon: Warehouse, parent: 'Services', href: '/marketplace?category=storage-warehousing' },
  { id: 'processing-value-addition', name: 'Processing & Value Add', icon: Cog, parent: 'Services', href: '/marketplace?category=processing-value-addition' },
  { id: 'technical-services', name: 'Technical Services', icon: TestTube2, parent: 'Services', href: '/marketplace?category=technical-services' },
  { id: 'financial-insurance', name: 'Financial & Insurance', icon: CircleDollarSign, parent: 'Services', href: '/marketplace?category=financial-insurance' },
  { id: 'land-services', name: 'Land Services (Lease/Sale)', icon: LandPlot, parent: 'Services', href: '/marketplace?category=land-services' },
  { id: 'training-education', name: 'Training & Education', icon: GraduationCap, parent: 'Services', href: '/marketplace?category=training-education' },
  { id: 'surveying-mapping', name: 'Surveying & Mapping', icon: DraftingCompass, parent: 'Services', href: '/marketplace?category=surveying-mapping' },
];

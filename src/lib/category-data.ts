
import type { LucideIcon } from 'lucide-react';
import {
  Package, Users, Sprout, Wheat, Drumstick, Milk, Carrot, Apple, Box,
  Tractor, Wrench, ShoppingBag, CircleDollarSign, LandPlot, Building,
  Handshake, Briefcase, Truck, Warehouse, Cog, TestTube2, ShieldCheck,
  GraduationCap, DraftingCompass, Leaf, ShieldAlert, Brain, TrendingUp, Award,
  Heart, Recycle, FlaskConical, Home, GitBranch, Satellite, Sun, UserCheck
} from 'lucide-react';

export interface CategoryNode {
  id: string;
  name: string;
  icon?: LucideIcon;
  parent: RootCategoryId | string; // Allow string for potential future nesting under non-root parents
  href: string;
  description?: string;
}

export const ROOT_CATEGORIES = [
  { id: 'products', name: 'Products & Goods', icon: Package, description: "Physical goods, produce, inputs, and equipment." },
  { id: 'services', name: 'Services & Expertise', icon: Users, description: "Professional services, labor, consultancy, and rentals." },
] as const;

export type RootCategoryId = typeof ROOT_CATEGORIES[number]['id'];

export const AGRICULTURAL_CATEGORIES: CategoryNode[] = [
  // Products
  { id: 'fresh-produce-fruits', name: 'Fruits', icon: Apple, parent: 'products', href: '/marketplace?category=fresh-produce-fruits' },
  { id: 'fresh-produce-vegetables', name: 'Vegetables', icon: Carrot, parent: 'products', href: '/marketplace?category=fresh-produce-vegetables' },
  { id: 'grains-cereals', name: 'Grains & Cereals', icon: Wheat, parent: 'products', href: '/marketplace?category=grains-cereals' },
  { id: 'livestock-poultry', name: 'Livestock & Poultry', icon: Drumstick, parent: 'products', href: '/marketplace?category=livestock-poultry' },
  { id: 'dairy-alternatives', name: 'Dairy & Alternatives', icon: Milk, parent: 'products', href: '/marketplace?category=dairy-alternatives' },
  { id: 'processed-packaged', name: 'Processed & Packaged Foods', icon: Box, parent: 'products', href: '/marketplace?category=processed-packaged' },
  { id: 'knf-fgw-inputs', name: 'KNF & FGW Inputs (Farmer-Made)', icon: FlaskConical, parent: 'products', href: '/marketplace?category=knf-fgw-inputs', description: "Farmer-produced Korean Natural Farming or Farming God's Way inputs like compost." },
  { id: 'seeds-seedlings', name: 'Seeds & Seedlings', icon: Sprout, parent: 'products', href: '/marketplace?category=seeds-seedlings' },
  { id: 'fertilizers-soil', name: 'Fertilizers & Soil Amendments', icon: ShoppingBag, parent: 'products', href: '/marketplace?category=fertilizers-soil' },
  { id: 'pest-control-products', name: 'Pest Control Products', icon: ShieldCheck, parent: 'products', href: '/marketplace?category=pest-control-products' },
  { id: 'farm-tools-small-equip', name: 'Farm Tools & Small Equipment', icon: Wrench, parent: 'products', href: '/marketplace?category=farm-tools-small-equip' },
  { id: 'heavy-machinery-sale', name: 'Heavy Machinery & Equipment (Sale)', icon: Tractor, parent: 'products', href: '/marketplace?category=heavy-machinery-sale' },
  { id: 'packaging-solutions', name: 'Packaging Solutions & Materials', icon: Box, parent: 'products', href: '/marketplace?category=packaging-solutions' },
  { id: 'iot-sensors-agritech-devices', name: 'IoT Sensors & AgriTech Devices', icon: Satellite, parent: 'products', href: '/marketplace?category=iot-sensors-agritech-devices' },
  { id: 'renewable-energy-equipment', name: 'Renewable Energy Equipment', icon: Sun, parent: 'products', href: '/marketplace?category=renewable-energy-equipment', description: 'Solar panels, biogas digesters, etc., for sale.'},


  // Services
  { id: 'farm-labor-staffing', name: 'Farm Labor & Staffing', icon: Users, parent: 'services', href: '/talent-exchange?category=farm-labor-staffing', description: "Find skilled or general labor for your farm operations." },
  { id: 'agronomy-consultancy', name: 'Agronomy & Consultancy', icon: Briefcase, parent: 'services', href: '/talent-exchange?category=agronomy-consultancy', description: 'Expert advice, soil testing, crop planning by agronomists & consultants.' },
  { id: 'field-agent-services', name: 'Field Agent Services', icon: UserCheck, parent: 'services', href: '/talent-exchange?category=field-agent-services', description: 'On-ground support, data collection, farmer training by field agents.'},
  { id: 'equipment-rental-operation', name: 'Equipment Rental & Operation', icon: Tractor, parent: 'services', href: '/talent-exchange?category=equipment-rental-operation', description: "Rent tractors, harvesters, and other machinery with or without an operator." },
  { id: 'logistics-transport', name: 'Logistics & Transport', icon: Truck, parent: 'services', href: '/talent-exchange?category=logistics-transport', description: "Services for moving goods from farm to market." },
  { id: 'storage-warehousing', name: 'Storage & Warehousing', icon: Warehouse, parent: 'services', href: '/talent-exchange?category=storage-warehousing' },
  { id: 'processing-value-addition-services', name: 'Processing & Value Addition Services', icon: Cog, parent: 'services', href: '/talent-exchange?category=processing-value-addition-services', description: 'Milling, drying, packaging services by processing units.' },
  { id: 'technical-repair-services', name: 'Technical & Repair Services', icon: Wrench, parent: 'services', href: '/talent-exchange?category=technical-repair-services', description: 'Equipment maintenance, irrigation system repair etc.'},
  { id: 'financial-services', name: 'Financial Services', icon: CircleDollarSign, parent: 'services', href: '/talent-exchange?category=financial-services', description: 'Loans, credit, grants by financial institutions.' },
  { id: 'insurance-services', name: 'Insurance Services', icon: ShieldCheck, parent: 'services', href: '/talent-exchange?category=insurance-services', description: 'Crop, livestock, and other agricultural insurance policies.' },
  { id: 'land-services', name: 'Land Services (Lease/Plotting)', icon: LandPlot, parent: 'services', href: '/talent-exchange?category=land-services' },
  { id: 'training-education-services', name: 'Training & Education Services', icon: GraduationCap, parent: 'services', href: '/talent-exchange?category=training-education-services' },
  { id: 'surveying-mapping-services', name: 'Surveying & Mapping Services', icon: DraftingCompass, parent: 'services', href: '/talent-exchange?category=surveying-mapping-services' },
  { id: 'certification-services', name: 'Certification Services', icon: Award, parent: 'services', href: '/talent-exchange?category=certification-services', description: 'Organic, Fair Trade, GAP certification services.'},
  { id: 'export-facilitation-services', name: 'Export Facilitation Services', icon: GitBranch, parent: 'services', href: '/talent-exchange?category=export-facilitation-services', description: 'Services by agro-export facilitators, customs brokers.'},
  { id: 'renewable-energy-services', name: 'Renewable Energy Services', icon: Sun, parent: 'services', href: '/talent-exchange?category=renewable-energy-services', description: 'Installation, maintenance of solar, biogas by energy providers.'},
  { id: 'agri-tourism-services', name: 'Agri-Tourism Services', icon: Home, parent: 'services', href: '/talent-exchange?category=agri-tourism-services', description: 'Farm tours, rural stays offered by agro-tourism operators.'},
  { id: 'research-academic-services', name: 'Research & Academic Services', icon: Brain, parent: 'services', href: '/talent-exchange?category=research-academic-services', description: 'Collaborative research projects, data analysis by researchers.'},
  { id: 'waste-management-composting-services', name: 'Waste Management & Composting Services', icon: Recycle, parent: 'services', href: '/talent-exchange?category=waste-management-composting-services'},
  { id: 'government-regulatory-services', name: 'Government & Regulatory Info Services', icon: ShieldAlert, parent: 'services', href: '/talent-exchange?category=government-regulatory-services', description: 'Information dissemination, compliance guidance by government bodies (non-transactional listing).'},
];

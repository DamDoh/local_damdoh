
import {
  User,
  Building,
  Tractor,
  Banknote,
  ShieldCheck,
  Globe,
  Beaker,
  Plane,
  Warehouse,
  Leaf,
  Users,
  Sun,
  Package,
  HeartHandshake,
  Recycle,
  Rocket,
  Landmark,
  ShieldQuestion,
  Car,
  Hotel
} from 'lucide-react';

export interface Stakeholder {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

export const STAKEHOLDER_ROLES: Stakeholder[] = [
  { id: 'farmer', name: 'Farmer', description: 'Primary producer of agricultural goods.', icon: User },
  { id: 'cooperative', name: 'Agricultural Cooperative', description: 'Represents a group of farmers for collective action.', icon: Users },
  { id: 'field_agent', name: 'Field Agent/Agronomist', description: 'Provides on-the-ground support and data verification.', icon: User },
  { id: 'logistics', name: 'Operations/Logistics Team', description: 'Manages system data flow and integrity.', icon: Car },
  { id: 'qa_team', name: 'Quality Assurance Team', description: 'Audits and ensures data quality.', icon: ShieldCheck },
  { id: 'processor', name: 'Processing & Packaging Unit', description: 'Transforms raw produce into processed goods.', icon: Building },
  { id: 'buyer', name: 'Buyer', description: 'Purchases products for resale or export.', icon: Banknote },
  { id: 'input_supplier', name: 'Input Supplier', description: 'Provides essential agricultural inputs like seeds and fertilizers.', icon: Leaf },
  { id: 'equipment_supplier', name: 'Equipment Supplier', description: 'Provides machinery and technology like tractors and IoT devices.', icon: Tractor },
  { id: 'financial_institution', name: 'Financial Institution', description: 'Offers financial services like loans and credit.', icon: Landmark },
  { id: 'regulator', name: 'Government Regulator/Auditor', description: 'Enforces policies and food safety standards.', icon: ShieldQuestion },
  { id: 'certification_body', name: 'Certification Body', description: 'Certifies products against standards like Organic or Fair Trade.', icon: ShieldCheck },
  { id: 'researcher', name: 'Researcher/Academic', description: 'Conducts research using anonymized platform data.', icon: Beaker },
  { id: 'logistics_partner', name: 'Logistics Partner', description: 'Provides third-party transportation services.', icon: Plane },
  { id: 'warehouse', name: 'Storage/Warehouse Facility', description: 'Offers storage for agricultural products.', icon: Warehouse },
  { id: 'consultant', name: 'Agronomy Expert/Consultant', description: 'Provides specialized paid advisory services.', icon: User },
  { id: 'tourism_operator', name: 'Agro-Tourism Operator', description: 'Facilitates farm-based tourism experiences.', icon: Hotel },
  { id: 'energy_provider', name: 'Energy Solutions Provider', description: 'Offers renewable energy solutions like solar and biogas.', icon: Sun },
  { id: 'export_facilitator', name: 'Agro-Export Facilitator', description: 'Assists with international trade procedures and customs.', icon: Globe },
  { id: 'agritech_innovator', name: 'Agri-Tech Innovator/Developer', description: 'Develops new technologies for the platform.', icon: Rocket },
  { id: 'waste_management', name: 'Waste Management & Compost Facility', description: 'Manages agricultural waste and promotes circularity.', icon: Recycle },
  { id: 'crowdfunder', name: 'Crowdfunder', description: 'Provides alternative financing for projects.', icon: HeartHandshake },
  { id: 'insurance_provider', name: 'Insurance Provider', description: 'Offers agricultural insurance products to mitigate risk.', icon: ShieldCheck },
  { id: 'packaging_supplier', name: 'Packaging Supplier', description: 'Provides packaging materials for produce and processed goods.', icon: Package },
];

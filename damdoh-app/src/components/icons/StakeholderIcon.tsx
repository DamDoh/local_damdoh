
"use client";

import React from 'react';
import type { LucideProps } from 'lucide-react';
import { 
    Sprout, Tractor, Briefcase, Users, BookOpen, Truck,
    Package, ShieldAlert, Brain, Award, LandPlot, Wrench,
    Sparkles, User, ShoppingBag, MessageSquare,
    Home, CircleDollarSign, GraduationCap, DraftingCompass, Warehouse, Apple,
    Carrot, Drumstick, Milk, Box, TestTube2, ShieldCheck, FlaskConical, Satellite,
    Sun, UserCheck, GitBranch, Recycle, Bolt, Banknote, Calendar, Network,
    MessageSquare as ForumIcon, Building2, Medal, Globe, Compass, Clipboard, Factory,
    Lightbulb, Landmark, Scale 
} from 'lucide-react';
import type { StakeholderRole } from '@/lib/constants';

interface StakeholderIconProps extends LucideProps {
  role: StakeholderRole | string;
}

export const StakeholderIcon = ({ role, ...props }: StakeholderIconProps) => {
  switch (role) {
    case 'Farmer': return <Sprout {...props} />;
    case 'Agricultural Cooperative': return <Users {...props} />;
    case 'Field Agent/Agronomist (DamDoh Internal)': return <Compass {...props} />;
    case 'Operations/Logistics Team (DamDoh Internal)': return <Truck {...props} />;
    case 'Quality Assurance Team (DamDoh Internal)': return <Clipboard {...props} />;
    case 'Processing & Packaging Unit': return <Factory {...props} />;
    case 'Buyer (Restaurant, Supermarket, Exporter)': return <Briefcase {...props} />;
    case 'Input Supplier (Seed, Fertilizer, Pesticide)': return <ShoppingBag {...props} />;
    case 'Equipment Supplier (Sales of Machinery/IoT)': return <Tractor {...props} />;
    case 'Financial Institution (Micro-finance/Loans)': return <Landmark {...props} />;
    case 'Government Regulator/Auditor': return <Scale {...props} />;
    case 'Certification Body (Organic, Fair Trade etc.)': return <Medal {...props} />;
    case 'Consumer': return <User {...props} />;
    case 'Researcher/Academic': return <BookOpen {...props} />;
    case 'Logistics Partner (Third-Party Transporter)': return <Truck {...props} />;
    case 'Storage/Warehouse Facility': return <Warehouse {...props} />;
    case 'Agronomy Expert/Consultant (External)': return <BookOpen {...props} />;
    case 'Agro-Tourism Operator': return <Globe {...props} />;
    case 'Energy Solutions Provider (Solar, Biogas)': return <Bolt {...props} />;
    case 'Agro-Export Facilitator/Customs Broker': return <TrendingUp {...props} />;
    case 'Agri-Tech Innovator/Developer': return <Lightbulb {...props} />;
    case 'Waste Management & Compost Facility': return <Recycle {...props} />;
    case 'Crowdfunder (Impact Investor, Individual)': return <Banknote {...props} />;
    case 'Insurance Provider': return <ShieldCheck {...props} />;
    default: return <Briefcase {...props} />;
  }
};

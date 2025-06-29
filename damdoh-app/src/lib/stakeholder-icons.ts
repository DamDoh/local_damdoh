
"use client";

import React from 'react';
import { 
    Sprout, Tractor, ShoppingBag, Briefcase, Users, BookOpen, Bot, TrendingUp,
    Package, Wheat, Truck, Leaf, ShieldAlert, Brain, Award, LandPlot, Wrench,
    Sparkles, CalendarDays, Search, User, MessageSquare, ShoppingCart as MarketIcon,
    Home, CircleDollarSign, GraduationCap, DraftingCompass, Warehouse, Apple,
    Carrot, Drumstick, Milk, Box, TestTube2, ShieldCheck, FlaskConical, Satellite,
    Sun, UserCheck, GitBranch, Recycle, Bolt, Banknote, Calendar, Network,
    MessageSquare as ForumIcon, Building2, Medal, Globe, Compass, Clipboard, Factory,
    Lightbulb, Landmark, Scale 
} from 'lucide-react';
import type { StakeholderRole } from './constants';

export const STAKEHOLDER_ICONS: Record<StakeholderRole, React.ElementType> = {
    'Farmer': Sprout,
    'Agricultural Cooperative': Users,
    'Field Agent/Agronomist (DamDoh Internal)': Compass,
    'Operations/Logistics Team (DamDoh Internal)': Truck,
    'Quality Assurance Team (DamDoh Internal)': Clipboard,
    'Processing & Packaging Unit': Factory,
    'Buyer (Restaurant, Supermarket, Exporter)': Briefcase,
    'Input Supplier (Seed, Fertilizer, Pesticide)': ShoppingBag,
    'Equipment Supplier (Sales of Machinery/IoT)': Tractor,
    'Financial Institution (Micro-finance/Loans)': Landmark,
    'Government Regulator/Auditor': Scale,
    'Certification Body (Organic, Fair Trade etc.)': Medal,
    'Consumer': User,
    'Researcher/Academic': BookOpen,
    'Logistics Partner (Third-Party Transporter)': Truck,
    'Storage/Warehouse Facility': Warehouse,
    'Agronomy Expert/Consultant (External)': BookOpen,
    'Agro-Tourism Operator': Globe,
    'Energy Solutions Provider (Solar, Biogas)': Bolt,
    'Agro-Export Facilitator/Customs Broker': TrendingUp,
    'Agri-Tech Innovator/Developer': Lightbulb,
    'Waste Management & Compost Facility': Recycle,
    'Crowdfunder (Impact Investor, Individual)': Banknote,
    'Insurance Provider': ShieldCheck,
};

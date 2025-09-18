import React from 'react';
import {
  Tractor, Users, ShoppingCart, BarChart3, Settings, Bell,
  FileText, CreditCard, Building2, Microscope, Award,
  Truck, Package, Calculator, Globe, Heart
} from 'lucide-react';
import { StakeholderConfig } from '@/components/dashboard/hubs/StakeholderDashboard';

// Farmer Configuration
export const farmerConfig: StakeholderConfig = {
  profile: {
    name: "John Farmer",
    role: "Farmer",
    location: "Nairobi, Kenya",
    avatar: "/avatars/farmer.jpg",
    verified: true,
    stats: {
      "Farm Size": "5 acres",
      "Crops": "Maize, Beans",
      "Experience": "8 years",
      "Rating": "4.8/5"
    }
  },
  menuItems: [
    { id: 'farm', icon: Tractor, label: 'My Farm' },
    { id: 'market', icon: ShoppingCart, label: 'Marketplace' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ],
  posts: [
    {
      id: 1,
      author: "John Farmer",
      avatar: "/avatars/farmer.jpg",
      verified: true,
      time: "2 hours ago",
      content: "Just harvested my first maize crop this season! The yield was better than expected thanks to the new irrigation system. 🌽",
      type: "general",
      likes: 24,
      comments: [],
      commentCount: 5,
      shares: 3,
      engagement: "89%",
      location: "Nairobi, Kenya",
      tags: ["maize", "harvest", "irrigation"],
      reactions: { like: 20, love: 4 },
      aiGenerated: false,
      expertVerified: true
    }
  ],
  recentActivity: [
    { action: "Completed maize harvest", time: "2h ago", priority: "high" },
    { action: "Updated farm inventory", time: "1d ago", priority: "medium" },
    { action: "Joined farming community", time: "3d ago", priority: "low" }
  ],
  searchPlaceholder: "Search farms, crops, markets...",
  rightSidebarWidgets: [],
  headerColor: "#22c55e",
  brandColor: "#16a34a"
};

// Financial Institution Configuration
export const financialInstitutionConfig: StakeholderConfig = {
  profile: {
    name: "Sarah Finance",
    role: "Financial Institution",
    location: "Nairobi, Kenya",
    avatar: "/avatars/fi.jpg",
    verified: true,
    stats: {
      "Loans Issued": "KSH 2.5M",
      "Farmers Served": "150",
      "Success Rate": "94%",
      "Avg ROI": "12.5%"
    }
  },
  menuItems: [
    { id: 'loans', icon: CreditCard, label: 'Loan Management' },
    { id: 'farmers', icon: Users, label: 'Farmer Portfolio' },
    { id: 'analytics', icon: BarChart3, label: 'Risk Analytics' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ],
  posts: [
    {
      id: 2,
      author: "Sarah Finance",
      avatar: "/avatars/fi.jpg",
      verified: true,
      time: "4 hours ago",
      content: "Excited to announce our new low-interest loan program for smallholder farmers! Apply now for up to KSH 100,000 with flexible repayment terms. 💰",
      type: "announcement",
      likes: 45,
      comments: [],
      commentCount: 12,
      shares: 8,
      engagement: "156%",
      tags: ["loans", "finance", "farmers"],
      reactions: { like: 35, celebrate: 10 },
      aiGenerated: false,
      expertVerified: true
    }
  ],
  recentActivity: [
    { action: "Approved 5 new loans", time: "1h ago", priority: "high" },
    { action: "Portfolio review completed", time: "6h ago", priority: "medium" },
    { action: "Risk assessment updated", time: "1d ago", priority: "medium" }
  ],
  searchPlaceholder: "Search farmers, loans, analytics...",
  rightSidebarWidgets: [],
  headerColor: "#3b82f6",
  brandColor: "#2563eb"
};

// Buyer Configuration
export const buyerConfig: StakeholderConfig = {
  profile: {
    name: "Mike Buyer",
    role: "Buyer",
    location: "Mombasa, Kenya",
    avatar: "/avatars/buyer.jpg",
    verified: true,
    stats: {
      "Orders Placed": "250",
      "Suppliers": "45",
      "Quality Score": "4.9/5",
      "On-time Delivery": "98%"
    }
  },
  menuItems: [
    { id: 'orders', icon: ShoppingCart, label: 'My Orders' },
    { id: 'suppliers', icon: Users, label: 'Suppliers' },
    { id: 'contracts', icon: FileText, label: 'Contracts' },
    { id: 'quality', icon: Award, label: 'Quality Control' },
    { id: 'logistics', icon: Truck, label: 'Logistics' }
  ],
  posts: [
    {
      id: 3,
      author: "Mike Buyer",
      avatar: "/avatars/buyer.jpg",
      verified: true,
      time: "6 hours ago",
      content: "Looking for high-quality maize suppliers in the Rift Valley region. Offering competitive prices and long-term contracts. 📞 DM for details.",
      type: "market",
      likes: 18,
      comments: [],
      commentCount: 7,
      shares: 5,
      engagement: "67%",
      location: "Mombasa, Kenya",
      tags: ["maize", "buying", "contracts"],
      reactions: { like: 15, interested: 3 },
      aiGenerated: false,
      expertVerified: false
    }
  ],
  recentActivity: [
    { action: "Placed order for 2 tons maize", time: "3h ago", priority: "high" },
    { action: "Reviewed supplier quality", time: "8h ago", priority: "medium" },
    { action: "Contract negotiation completed", time: "2d ago", priority: "medium" }
  ],
  searchPlaceholder: "Search suppliers, products, contracts...",
  rightSidebarWidgets: [],
  headerColor: "#f59e0b",
  brandColor: "#d97706"
};

// Crowdfunding Configuration
export const crowdfunderConfig: StakeholderConfig = {
  profile: {
    name: "Alex Impact Investor",
    role: "Crowdfunder",
    location: "Nairobi, Kenya",
    avatar: "/avatars/crowdfunder.jpg",
    verified: true,
    stats: {
      "Projects Funded": "24",
      "Total Invested": "KSH 1.2M",
      "Success Rate": "92%",
      "Farmers Supported": "180"
    }
  },
  menuItems: [
    { id: 'portfolio', icon: BarChart3, label: 'My Portfolio' },
    { id: 'discover', icon: Users, label: 'Discover Projects' },
    { id: 'impact', icon: Heart, label: 'Impact Dashboard' },
    { id: 'campaigns', icon: CreditCard, label: 'My Campaigns' },
    { id: 'network', icon: Globe, label: 'Investor Network' }
  ],
  posts: [
    {
      id: 5,
      author: "Alex Impact Investor",
      avatar: "/avatars/crowdfunder.jpg",
      verified: true,
      time: "3 hours ago",
      content: "Just funded a community irrigation project in Nakuru! This will benefit 50+ smallholder farmers and increase their yields by 40%. Together we're building sustainable agriculture! 💧🌱 #ImpactInvesting #SustainableFarming",
      type: "success",
      likes: 89,
      comments: [],
      commentCount: 34,
      shares: 22,
      engagement: "312%",
      location: "Nakuru, Kenya",
      tags: ["irrigation", "community", "impact", "sustainable"],
      reactions: { like: 67, celebrate: 22 },
      aiGenerated: false,
      expertVerified: false
    }
  ],
  recentActivity: [
    { action: "Funded irrigation project", time: "2h ago", priority: "high" },
    { action: "Received project update", time: "5h ago", priority: "medium" },
    { action: "New investment opportunity", time: "1d ago", priority: "medium" }
  ],
  searchPlaceholder: "Search projects, farmers, impact stories...",
  rightSidebarWidgets: [],
  headerColor: "#10b981",
  brandColor: "#059669"
};

// AgriTech Innovator Configuration
export const agritechConfig: StakeholderConfig = {
  profile: {
    name: "Dr. Tech Innovator",
    role: "AgriTech Innovator",
    location: "Nairobi, Kenya",
    avatar: "/avatars/agritech.jpg",
    verified: true,
    stats: {
      "Solutions": "12",
      "Farmers Helped": "500+",
      "Success Rate": "87%",
      "Patents": "3"
    }
  },
  menuItems: [
    { id: 'solutions', icon: Microscope, label: 'My Solutions' },
    { id: 'research', icon: BarChart3, label: 'Research' },
    { id: 'pilots', icon: Users, label: 'Pilot Programs' },
    { id: 'funding', icon: CreditCard, label: 'Funding' },
    { id: 'publications', icon: FileText, label: 'Publications' }
  ],
  posts: [
    {
      id: 4,
      author: "Dr. Tech Innovator",
      avatar: "/avatars/agritech.jpg",
      verified: true,
      time: "8 hours ago",
      content: "Our new AI-powered crop disease detection system is now available for beta testing! Early results show 95% accuracy in identifying common maize diseases. 🔬",
      type: "innovation",
      likes: 67,
      comments: [],
      commentCount: 23,
      shares: 15,
      engagement: "234%",
      tags: ["AI", "disease-detection", "maize"],
      reactions: { like: 45, insightful: 22 },
      aiGenerated: false,
      expertVerified: true
    }
  ],
  recentActivity: [
    { action: "Published research paper", time: "2h ago", priority: "high" },
    { action: "Pilot program launched", time: "1d ago", priority: "high" },
    { action: "Funding round completed", time: "3d ago", priority: "medium" }
  ],
  searchPlaceholder: "Search research, solutions, pilots...",
  rightSidebarWidgets: [],
  headerColor: "#8b5cf6",
  brandColor: "#7c3aed"
};

// Default/General Configuration
export const generalConfig: StakeholderConfig = {
  profile: {
    name: "Community Member",
    role: "General",
    location: "Kenya",
    avatar: "/avatars/default.jpg",
    verified: false,
    stats: {
      "Posts": "5",
      "Connections": "12",
      "Joined": "2 weeks ago",
      "Activity": "Active"
    }
  },
  menuItems: [
    { id: 'feed', icon: Users, label: 'Community Feed' },
    { id: 'market', icon: ShoppingCart, label: 'Marketplace' },
    { id: 'learn', icon: Globe, label: 'Learning' },
    { id: 'support', icon: Heart, label: 'Support' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ],
  posts: [],
  recentActivity: [
    { action: "Joined DamDoh community", time: "2w ago", priority: "low" },
    { action: "Completed profile setup", time: "1w ago", priority: "low" }
  ],
  searchPlaceholder: "Search community, products, knowledge...",
  rightSidebarWidgets: [],
  headerColor: "#6b7280",
  brandColor: "#4b5563"
};

// Stakeholder Configurations Map
export const stakeholderConfigs: Record<string, StakeholderConfig> = {
  'Farmer': farmerConfig,
  'Financial Institution': financialInstitutionConfig,
  'Buyer': buyerConfig,
  'AgriTech Innovator': agritechConfig,
  'Agronomist': farmerConfig, // Using farmer config as base
  'Agro Export': buyerConfig, // Using buyer config as base
  'Agro Tourism': generalConfig,
  'Certification Body': generalConfig,
  'Consumer': generalConfig,
  'Cooperative': farmerConfig, // Using farmer config as base
  'Credit Scorecard': financialInstitutionConfig,
  'Crowdfunder': crowdfunderConfig,
  'Energy Provider': generalConfig,
  'Equipment Supplier': buyerConfig,
  'Field Agent': farmerConfig,
  'Insurance Provider': financialInstitutionConfig,
  'Logistics': buyerConfig,
  'Operations': generalConfig,
  'Packaging Supplier': buyerConfig,
  'Processing Unit': buyerConfig,
  'QA': generalConfig,
  'Regulator': generalConfig,
  'Researcher': agritechConfig,
  'Trust Score': generalConfig,
  'Warehouse': buyerConfig,
  'Waste Management': generalConfig,
  'General': generalConfig
};
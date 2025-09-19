"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Tractor,
  ShoppingCart,
  DollarSign,
  MapPin,
  Users,
  BarChart3,
  Shield,
  Globe
} from 'lucide-react';

export function I18nDemo() {
  // Use translations from different microservices
  const commonT = useTranslations('common');
  const dashboardT = useTranslations('dashboard');
  const farmT = useTranslations('farmManagement');
  const marketT = useTranslations('marketplace');
  const financialT = useTranslations('financial');

  const demoSections = [
    {
      title: 'Common UI Elements',
      icon: <Globe className="h-5 w-5" />,
      translations: [
        { key: 'navigation.home', value: commonT('navigation.home') },
        { key: 'navigation.dashboard', value: commonT('navigation.dashboard') },
        { key: 'ui.buttons.save', value: commonT('ui.buttons.save') },
        { key: 'time.today', value: commonT('time.today') },
        { key: 'currency.symbol', value: commonT('currency.symbol') },
      ]
    },
    {
      title: 'Dashboard Elements',
      icon: <BarChart3 className="h-5 w-5" />,
      translations: [
        { key: 'title', value: dashboardT('title') },
        { key: 'stats.totalUsers', value: dashboardT('stats.totalUsers') },
        { key: 'widgets.recentActivity', value: dashboardT('widgets.recentActivity') },
        { key: 'filters.today', value: dashboardT('filters.today') },
      ]
    },
    {
      title: 'Farm Management',
      icon: <Tractor className="h-5 w-5" />,
      translations: [
        { key: 'title', value: farmT('title') },
        { key: 'crops.title', value: farmT('crops.title') },
        { key: 'operations.title', value: farmT('operations.title') },
        { key: 'monitoring.weather', value: farmT('monitoring.weather') },
      ]
    },
    {
      title: 'Marketplace',
      icon: <ShoppingCart className="h-5 w-5" />,
      translations: [
        { key: 'title', value: marketT('title') },
        { key: 'listings.title', value: marketT('listings.title') },
        { key: 'orders.title', value: marketT('orders.title') },
        { key: 'negotiations.title', value: marketT('negotiations.title') },
      ]
    },
    {
      title: 'Financial Services',
      icon: <DollarSign className="h-5 w-5" />,
      translations: [
        { key: 'title', value: financialT('title') },
        { key: 'loans.title', value: financialT('loans.title') },
        { key: 'insurance.title', value: financialT('insurance.title') },
        { key: 'analytics.title', value: financialT('analytics.title') },
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            DamDoh Microservice i18n Demo
          </h1>
          <p className="text-gray-600 mt-2">
            Demonstrating the comprehensive internationalization system with microservice-based translations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            <Shield className="h-4 w-4 mr-1" />
            Type-Safe
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="h-4 w-4 mr-1" />
            19 Languages
          </Badge>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoSections.map((section, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {section.icon}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.translations.map((translation, idx) => (
                  <div key={idx} className="border-l-2 border-blue-200 pl-3">
                    <div className="text-xs text-gray-500 font-mono">
                      {translation.key}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {translation.value || 'Translation not available'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Microservice Architecture Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <ul className="space-y-1">
                  <li>• Type-safe translation keys</li>
                  <li>• Independent microservice development</li>
                  <li>• Efficient lazy loading</li>
                  <li>• Cultural adaptation support</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Fallback language chains</li>
                  <li>• ICU message format support</li>
                  <li>• Pluralization handling</li>
                  <li>• RTL language support</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-gray-500 text-sm">
        <p>This demo showcases the DamDoh microservice-based internationalization system.</p>
        <p>Use the language switcher above to see translations in different languages.</p>
      </div>
    </div>
  );
}
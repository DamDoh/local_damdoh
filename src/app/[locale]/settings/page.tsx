
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Lock, Users as ConnectionsIcon, SearchCheck, Save, ShieldOff, Briefcase, Mail, FileText, Sparkles, TrendingUp, Settings as SettingsIconLucide, Globe, Edit, Info } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import Link from "next/link";

function PrivacySetting({ icon, title, description, helpText, children }: { icon: React.ReactNode, title: string, description: string, helpText: string, children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between rounded-lg border p-4">
            <div className="flex items-start gap-4">
                <div className="text-primary">{icon}</div>
                <div>
                    <p className="font-medium flex items-center">{title}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">{helpText}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const t = useTranslations('settingsPage');

  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-2">
        <div className="flex items-center gap-2">
            <SettingsIconLucide className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">{t('title')}</CardTitle>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />{t('profileTab')}</TabsTrigger>
          <TabsTrigger value="account"><Lock className="mr-2 h-4 w-4" />{t('accountTab')}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />{t('notificationsTab')}</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="mr-2 h-4 w-4" />{t('privacyTab')}</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />{t('appearanceTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('stakeholderProfile.title')}</CardTitle>
              <CardDescription>{t('stakeholderProfile.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('stakeholderProfile.explanation')}</p>
                <Button asChild>
                    <Link href="/profiles/me/edit" className="flex items-center">
                         <Edit className="mr-2 h-4 w-4" /> {t('stakeholderProfile.editButton')}
                    </Link>
                </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t('account.title')}</CardTitle>
              <CardDescription>{t('account.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                  <Label htmlFor="current-password">{t('account.currentPasswordLabel')}</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password">{t('account.newPasswordLabel')}</Label>
                  <Input id="new-password" type="password" />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="confirm-password">{t('account.confirmPasswordLabel')}</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button><Save className="mr-2 h-4 w-4" />{t('account.changePasswordButton')}</Button>
                <Separator />
                <Button variant="destructive"><ShieldOff className="mr-2 h-4 w-4" />{t('account.deactivateButton')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>{t('notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PrivacySetting icon={<Mail className="h-6 w-6"/>} title={t('notifications.emailDigestLabel')} description={t('notifications.emailDigestDescription')} helpText={t('notifications.emailDigestHelpText')}>
                  <Switch id="email-notifications" defaultChecked />
              </PrivacySetting>
              <PrivacySetting icon={<ConnectionsIcon className="h-6 w-6"/>} title={t('notifications.connectionRequestsLabel')} description={t('notifications.connectionRequestsDescription')} helpText={t('notifications.connectionRequestsHelpText')}>
                 <Switch id="connection-requests-notifications" defaultChecked />
              </PrivacySetting>
              <PrivacySetting icon={<MessageSquare className="h-6 w-6"/>} title={t('notifications.forumMentionsLabel')} description={t('notifications.forumMentionsDescription')} helpText={t('notifications.forumMentionsHelpText')}>
                <Switch id="forum-mentions-notifications" defaultChecked />
              </PrivacySetting>
              <PrivacySetting icon={<ShoppingCart className="h-6 w-6"/>} title={t('notifications.marketplaceActivityLabel')} description={t('notifications.marketplaceActivityDescription')} helpText={t('notifications.marketplaceActivityHelpText')}>
                 <Switch id="marketplace-updates-notifications" />
              </PrivacySetting>
              <PrivacySetting icon={<Briefcase className="h-6 w-6"/>} title={t('notifications.talentExchangeLabel')} description={t('notifications.talentExchangeDescription')} helpText={t('notifications.talentExchangeHelpText')}>
                  <Switch id="talent-exchange-notifications" defaultChecked/>
              </PrivacySetting>
              <Button><Save className="mr-2 h-4 w-4" />{t('notifications.saveButton')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>{t('privacy.title')}</CardTitle>
              <CardDescription>{t('privacy.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <PrivacySetting icon={<User className="h-6 w-6" />} title={t('privacy.profileVisibilityLabel')} description={t('privacy.profileVisibilityDescription')} helpText={t('privacy.profileVisibilityHelpText')}>
                    <Select defaultValue="everyone">
                        <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="everyone">{t('privacy.profileVisibilityAll')}</SelectItem>
                            <SelectItem value="connections">{t('privacy.profileVisibilityConnections')}</SelectItem>
                            <SelectItem value="private">{t('privacy.profileVisibilityPrivate')}</SelectItem>
                        </SelectContent>
                    </Select>
                </PrivacySetting>
                <PrivacySetting icon={<ConnectionsIcon className="h-6 w-6" />} title={t('privacy.connectionRequestsLabel')} description={t('privacy.connectionRequestsDescription')} helpText={t('privacy.connectionRequestsHelpText')}>
                    <Select defaultValue="everyone">
                        <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="everyone">{t('privacy.connectionRequestsAll')}</SelectItem>
                            <SelectItem value="connections-of-connections">{t('privacy.connectionRequestsConnectionsOfConnections')}</SelectItem>
                        </SelectContent>
                    </Select>
                </PrivacySetting>
                <PrivacySetting icon={<SearchCheck className="h-6 w-6" />} title={t('privacy.searchIndexingLabel')} description={t('privacy.searchIndexingDescription')} helpText={t('privacy.searchIndexingHelpText')}>
                    <Switch id="search-engine-indexing" defaultChecked />
                </PrivacySetting>
              
              <Separator className="my-8" /> 
              
              <CardHeader className="p-0">
                <CardTitle className="text-xl flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />{t('privacy.dataConsentTitle')}</CardTitle>
                <CardDescription>{t('privacy.dataConsentDescription')}</CardDescription>
              </CardHeader>

              <div className="space-y-4 pt-2">
                <PrivacySetting icon={<TrendingUp className="h-6 w-6" />} title={t('privacy.marketplaceHistoryLabel')} description={t('privacy.marketplaceHistoryDescription')} helpText={t('privacy.marketplaceHistoryHelpText')}>
                  <Switch id="consent-marketplace-fi" defaultChecked /> 
                </PrivacySetting>
                 <PrivacySetting icon={<Sparkles className="h-6 w-6" />} title={t('privacy.aiPersonalizationLabel')} description={t('privacy.aiPersonalizationDescription')} helpText={t('privacy.aiPersonalizationHelpText')}>
                   <Switch id="consent-traceability-public" defaultChecked /> 
                 </PrivacySetting>
                 <PrivacySetting icon={<FileText className="h-6 w-6" />} title={t('privacy.financialApplicationDataLabel')} description={t('privacy.financialApplicationDataDescription')} helpText={t('privacy.financialApplicationDataHelpText')}>
                    <Switch id="consent-financial-ai" defaultChecked /> 
                 </PrivacySetting>
              </div>
              <Button><Save className="mr-2 h-4 w-4" />{t('privacy.saveConsentButton')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('appearance.title')}</CardTitle>
              <CardDescription>{t('appearance.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <PrivacySetting icon={<Palette className="h-6 w-6" />} title={t('appearance.themeLabel')} description={t('appearance.themeDescription')} helpText={t('appearance.themeHelpText')}>
                    <ThemeToggle />
                </PrivacySetting>
                 <PrivacySetting icon={<Globe className="h-6 w-6" />} title={t('appearance.languageLabel')} description={t('appearance.languageDescription')} helpText={t('appearance.languageHelpText')}>
                    <LanguageSwitcher />
                </PrivacySetting>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

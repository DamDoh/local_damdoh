
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Lock, Users as ConnectionsIcon, SearchCheck, Save, ShieldOff, Briefcase, Mail, FileText, Sparkles, TrendingUp, Settings as SettingsIconLucide, Globe, Edit } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Textarea } from "@/components/ui/textarea";
import { getStakeholderRoles } from "@/lib/i18n-constants"; 
import { useTranslations } from "next-intl";
import Link from "next/link";

// Super App Vision Note: This Settings page becomes a critical hub for user trust and control.
// The "Privacy & Visibility" section introduces the concept of data consent management,
// which is foundational for a super app that shares data between modules (e.g., sharing
// marketplace history with a financial institution for a loan). This empowers users
// and builds the trust needed for a vibrant digital ecosystem.

export default function SettingsPage() {
    const t = useTranslations('settingsPage');
    const tConstants = useTranslations('constants');
    const stakeholderRoles = getStakeholderRoles(tConstants);
  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-2"> {/* Reduced bottom margin */}
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
                <p className="text-sm text-muted-foreground mb-4">Your profile is your identity on DamDoh. A complete and detailed profile helps build trust and attracts the right connections and opportunities.</p>
                <Button asChild>
                    <Link href="/profiles/me/edit">
                         <Edit className="mr-2 h-4 w-4" /> Go to Profile Editor
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
                  <Label htmlFor="current-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />{t('account.currentPasswordLabel')}</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />{t('account.newPasswordLabel')}</Label>
                  <Input id="new-password" type="password" />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="confirm-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />{t('account.confirmPasswordLabel')}</Label>
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
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('notifications.emailDigestLabel')}</p>
                  <p className="text-sm text-muted-foreground">{t('notifications.emailDigestDescription')}</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('notifications.connectionRequestsLabel')}</p>
                  <p className="text-sm text-muted-foreground">{t('notifications.connectionRequestsDescription')}</p>
                </div>
                <Switch id="connection-requests-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('notifications.forumMentionsLabel')}</p>
                  <p className="text-sm text-muted-foreground">{t('notifications.forumMentionsDescription')}</p>
                </div>
                <Switch id="forum-mentions-notifications" defaultChecked />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('notifications.marketplaceActivityLabel')}</p>
                  <p className="text-sm text-muted-foreground">{t('notifications.marketplaceActivityDescription')}</p>
                </div>
                <Switch id="marketplace-updates-notifications" />
              </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('notifications.talentExchangeLabel')}</p>
                  <p className="text-sm text-muted-foreground">{t('notifications.talentExchangeDescription')}</p>
                </div>
                <Switch id="talent-exchange-notifications" defaultChecked/>
              </div>
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><User className="mr-2 h-4 w-4 text-primary" />{t('privacy.profileVisibilityLabel')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('privacy.profileVisibilityDescription')}</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[220px]"> 
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">{t('privacy.profileVisibilityAll')}</SelectItem>
                        <SelectItem value="connections">{t('privacy.profileVisibilityConnections')}</SelectItem>
                        <SelectItem value="private">{t('privacy.profileVisibilityPrivate')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><ConnectionsIcon className="mr-2 h-4 w-4 text-primary" />{t('privacy.connectionRequestsLabel')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('privacy.connectionRequestsDescription')}</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[220px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">{t('privacy.connectionRequestsAll')}</SelectItem>
                        <SelectItem value="connections-of-connections">{t('privacy.connectionRequestsConnectionsOfConnections')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-primary" />{t('privacy.contactInfoVisibilityLabel')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('privacy.contactInfoVisibilityDescription')}</p>
                </div>
                 <Select defaultValue="connections">
                    <SelectTrigger className="w-[220px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">{t('privacy.contactInfoVisibilityAll')}</SelectItem>
                        <SelectItem value="connections">{t('privacy.contactInfoVisibilityConnections')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>

               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><Bell className="mr-2 h-4 w-4 text-primary" />{t('privacy.activityStatusLabel')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('privacy.activityStatusDescription')}</p>
                </div>
                <Switch id="activity-status" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><SearchCheck className="mr-2 h-4 w-4 text-primary" />{t('privacy.searchIndexingLabel')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('privacy.searchIndexingDescription')}</p>
                </div>
                <Switch id="search-engine-indexing" defaultChecked />
              </div>
              <Button><Save className="mr-2 h-4 w-4" />{t('privacy.saveButton')}</Button>
              
              {/* Super App Vision Note: This section is key for trust. It allows users to control how their data is used across different modules. */}
              <Separator className="my-8" /> 
              <CardTitle className="text-xl flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />{t('privacy.dataConsentTitle')}</CardTitle>
              <CardDescription>{t('privacy.dataConsentDescription')}</CardDescription>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium flex items-center"><FileText className="mr-2 h-4 w-4 text-primary" />{t('privacy.marketplaceHistoryLabel')}</p>
                    <p className="text-sm text-muted-foreground ml-6">{t('privacy.marketplaceHistoryDescription')}</p>
                  </div>
                  <Switch id="consent-marketplace-fi" defaultChecked /> 
                </div>

                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium flex items-center"><SearchCheck className="mr-2 h-4 w-4 text-primary" />{t('privacy.traceabilityDataLabel')}</p>
                    <p className="text-sm text-muted-foreground ml-6">{t('privacy.traceabilityDataDescription')}</p>
                  </div>
                   <Switch id="consent-traceability-public" defaultChecked /> 
                 </div>

                 <div className="flex items-center justify-between rounded-lg border p-4">
                   <div>
                     <p className="font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-primary" />{t('privacy.financialApplicationDataLabel')}</p>
                     <p className="text-sm text-muted-foreground ml-6">{t('privacy.financialApplicationDataDescription')}</p>
                   </div>
                    <Switch id="consent-financial-ai" defaultChecked /> 
                 </div>
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
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">{t('appearance.themeLabel')}</p>
                        <p className="text-sm text-muted-foreground">{t('appearance.themeDescription')}</p>
                    </div>
                    <ThemeToggle />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">{t('appearance.languageLabel')}</p>
                        <p className="text-sm text-muted-foreground">{t('appearance.languageDescription')}</p>
                    </div>
                    <LanguageSwitcher />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Lock, Users as ConnectionsIcon, SearchCheck, Save, ShieldOff, Briefcase, Mail, FileText, Sparkles, TrendingUp, Settings as SettingsIconLucide, Globe } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Textarea } from "@/components/ui/textarea";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { STAKEHOLDER_ICONS } from "@/lib/stakeholder-icons";
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-2">
        <div className="flex items-center gap-2">
            <SettingsIconLucide className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">{t('settingsPage.title')}</CardTitle>
        </div>
        <CardDescription>{t('settingsPage.description')}</CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />{t('settingsPage.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="account"><Lock className="mr-2 h-4 w-4" />{t('settingsPage.tabs.account')}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />{t('settingsPage.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="mr-2 h-4 w-4" />{t('settingsPage.tabs.privacy')}</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />{t('settingsPage.tabs.appearance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('settingsPage.profileTab.title')}</CardTitle>
              <CardDescription>{t('settingsPage.profileTab.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                <div className="space-y-1.5"> 
                  <Label htmlFor="name" className="flex items-center gap-1.5"><User className="h-4 w-4 text-muted-foreground" />{t('settingsPage.profileTab.nameLabel')}</Label>
                  <Input id="name" defaultValue="Aisha Bello / Sahel Organics" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-muted-foreground" />{t('settingsPage.profileTab.emailLabel')}</Label>
                  <Input id="email" type="email" defaultValue="contact@sahelorganics.com" disabled />
                   <p className="text-xs text-muted-foreground pt-1">{t('settingsPage.profileTab.emailDescription')}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role" className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-muted-foreground" />{t('settingsPage.profileTab.roleLabel')}</Label>
                <Select defaultValue="Farmer">
                    <SelectTrigger id="role">
                        <SelectValue placeholder={t('settingsPage.profileTab.rolePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {STAKEHOLDER_ROLES.map(role => (
                            <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-2">
                                    {React.createElement(STAKEHOLDER_ICONS[role] || Briefcase, { className: "h-4 w-4 text-muted-foreground" })}
                                    <span>{role}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-summary" className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-muted-foreground" />{t('settingsPage.profileTab.summaryLabel')}</Label>
                <Textarea id="profile-summary" placeholder={t('settingsPage.profileTab.summaryPlaceholder')} defaultValue="Founder, Sahel Organics | Connecting smallholder farmers to sustainable markets for premium hibiscus and sesame." className="min-h-[80px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio" className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-muted-foreground" />{t('settingsPage.profileTab.bioLabel')}</Label>
                <Textarea id="bio" placeholder={t('settingsPage.profileTab.bioPlaceholder')} defaultValue="Sahel Organics is a social enterprise empowering women farmer cooperatives in Northern Nigeria. We focus on organic certification, quality improvement, and direct market access for hibiscus, sesame, and moringa. Seeking partnerships with international buyers and impact investors." className="min-h-[120px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="areas-of-interest" className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-muted-foreground" />{t('settingsPage.profileTab.interestsLabel')}</Label>
                <Input id="areas-of-interest" placeholder={t('settingsPage.profileTab.interestsPlaceholder')} defaultValue="Organic certification, Fair trade, Hibiscus, Sesame, Women empowerment, Export to EU" />
                 <p className="text-xs text-muted-foreground pt-1">{t('settingsPage.profileTab.commaSeparated')}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="needs" className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-muted-foreground" />{t('settingsPage.profileTab.needsLabel')}</Label>
                <Input id="needs" placeholder={t('settingsPage.profileTab.needsPlaceholder')} defaultValue="Bulk buyers for dried hibiscus, Logistics partners for shipping, Impact investment" />
                 <p className="text-xs text-muted-foreground pt-1">{t('settingsPage.profileTab.commaSeparated')}</p>
              </div>
               <Button><Save className="mr-2 h-4 w-4" />{t('settingsPage.profileTab.saveButton')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t('settingsPage.accountTab.title')}</CardTitle>
              <CardDescription>{t('settingsPage.accountTab.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                  <Label htmlFor="current-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />{t('settingsPage.accountTab.currentPassword')}</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />{t('settingsPage.accountTab.newPassword')}</Label>
                  <Input id="new-password" type="password" />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="confirm-password" className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-muted-foreground" />{t('settingsPage.accountTab.confirmPassword')}</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              <Button><Save className="mr-2 h-4 w-4" />{t('settingsPage.accountTab.changePasswordButton')}</Button>
              <Separator />
              <Button variant="destructive"><ShieldOff className="mr-2 h-4 w-4" />{t('settingsPage.accountTab.deactivateButton')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('settingsPage.notificationsTab.title')}</CardTitle>
              <CardDescription>{t('settingsPage.notificationsTab.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('settingsPage.notificationsTab.emailDigest.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('settingsPage.notificationsTab.emailDigest.description')}</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('settingsPage.notificationsTab.connectionRequests.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('settingsPage.notificationsTab.connectionRequests.description')}</p>
                </div>
                <Switch id="connection-requests-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('settingsPage.notificationsTab.forumMentions.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('settingsPage.notificationsTab.forumMentions.description')}</p>
                </div>
                <Switch id="forum-mentions-notifications" defaultChecked />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('settingsPage.notificationsTab.marketplaceActivity.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('settingsPage.notificationsTab.marketplaceActivity.description')}</p>
                </div>
                <Switch id="marketplace-updates-notifications" />
              </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('settingsPage.notificationsTab.jobListings.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('settingsPage.notificationsTab.jobListings.description')}</p>
                </div>
                <Switch id="talent-exchange-notifications" defaultChecked/>
              </div>
              <Button><Save className="mr-2 h-4 w-4" />{t('settingsPage.notificationsTab.saveButton')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>{t('settingsPage.privacyTab.title')}</CardTitle>
              <CardDescription>{t('settingsPage.privacyTab.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><User className="mr-2 h-4 w-4 text-primary" />{t('settingsPage.privacyTab.profileVisibility.title')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('settingsPage.privacyTab.profileVisibility.description')}</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[220px]"> 
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">{t('settingsPage.privacyTab.profileVisibility.optionAll')}</SelectItem>
                        <SelectItem value="connections">{t('settingsPage.privacyTab.profileVisibility.optionConnections')}</SelectItem>
                        <SelectItem value="private">{t('settingsPage.privacyTab.profileVisibility.optionPrivate')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><ConnectionsIcon className="mr-2 h-4 w-4 text-primary" />{t('settingsPage.privacyTab.connectionRequests.title')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('settingsPage.privacyTab.connectionRequests.description')}</p>
                </div>
                <Select defaultValue="everyone">
                    <SelectTrigger className="w-[220px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">{t('settingsPage.privacyTab.connectionRequests.optionAll')}</SelectItem>
                        <SelectItem value="connections-of-connections">{t('settingsPage.privacyTab.connectionRequests.optionConnectionsOfConnections')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-primary" />{t('settingsPage.privacyTab.contactVisibility.title')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('settingsPage.privacyTab.contactVisibility.description')}</p>
                </div>
                 <Select defaultValue="connections">
                    <SelectTrigger className="w-[220px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="everyone">{t('settingsPage.privacyTab.contactVisibility.optionAll')}</SelectItem>
                        <SelectItem value="connections">{t('settingsPage.privacyTab.contactVisibility.optionConnections')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>

               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><Bell className="mr-2 h-4 w-4 text-primary" />{t('settingsPage.privacyTab.activityStatus.title')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('settingsPage.privacyTab.activityStatus.description')}</p>
                </div>
                <Switch id="activity-status" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium flex items-center"><SearchCheck className="mr-2 h-4 w-4 text-primary" />{t('settingsPage.privacyTab.searchIndexing.title')}</p>
                  <p className="text-sm text-muted-foreground ml-6">{t('settingsPage.privacyTab.searchIndexing.description')}</p>
                </div>
                <Switch id="search-engine-indexing" defaultChecked />
              </div>
              <Button><Save className="mr-2 h-4 w-4" />{t('settingsPage.privacyTab.saveButton')}</Button>
              
              <Separator className="my-8" /> 
              <CardTitle className="text-xl flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />{t('settingsPage.privacyTab.consentManagement.title')}</CardTitle>
              <CardDescription>{t('settingsPage.privacyTab.consentManagement.description')}</CardDescription>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium flex items-center"><FileText className="mr-2 h-4 w-4 text-primary" />{t('settingsPage.privacyTab.consentManagement.marketplaceHistory.title')}</p>
                    <p className="text-sm text-muted-foreground ml-6">{t('settingsPage.privacyTab.consentManagement.marketplaceHistory.description')}</p>
                  </div>
                  <Switch id="consent-marketplace-fi" defaultChecked /> 
                </div>

                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium flex items-center"><SearchCheck className="mr-2 h-4 w-4 text-primary" />{t('settingsPage.privacyTab.consentManagement.traceabilityData.title')}</p>
                    <p className="text-sm text-muted-foreground ml-6">{t('settingsPage.privacyTab.consentManagement.traceabilityData.description')}</p>
                  </div>
                   <Switch id="consent-traceability-public" defaultChecked /> 
                 </div>

                 <div className="flex items-center justify-between rounded-lg border p-4">
                   <div>
                     <p className="font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-primary" />{t('settingsPage.privacyTab.consentManagement.applicationData.title')}</p>
                     <p className="text-sm text-muted-foreground ml-6">{t('settingsPage.privacyTab.consentManagement.applicationData.description')}</p>
                   </div>
                    <Switch id="consent-financial-ai" defaultChecked /> 
                 </div>
              </div>
              <Button><Save className="mr-2 h-4 w-4" />{t('settingsPage.privacyTab.consentSaveButton')}</Button>

            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('settingsPage.appearanceTab.title')}</CardTitle>
              <CardDescription>{t('settingsPage.appearanceTab.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">{t('settingsPage.appearanceTab.theme.title')}</p>
                        <p className="text-sm text-muted-foreground">{t('settingsPage.appearanceTab.theme.description')}</p>
                    </div>
                    <ThemeToggle />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">{t('settingsPage.appearanceTab.language.title')}</p>
                        <p className="text-sm text-muted-foreground">{t('settingsPage.appearanceTab.language.description')}</p>
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

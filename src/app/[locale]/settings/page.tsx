
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Lock, Users as ConnectionsIcon, SearchCheck, Save, ShieldOff, Briefcase, Mail, FileText, Sparkles, TrendingUp, Settings as SettingsIconLucide, Globe, Edit, Info, Loader2, Download } from "lucide-react"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/api-utils";
import { useAuth, logOut } from "@/lib/auth-utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "@/navigation";

interface PrivacySettingProps { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  helpText: string, 
  children: React.ReactNode 
}

function PrivacySetting({ icon, title, description, helpText, children }: PrivacySettingProps) {
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
    const { toast } = useToast();
    const { user, loading } = useAuth();
    const router = useRouter();

    const [notificationPrefs, setNotificationPrefs] = useState({ emailDigest: true, connectionRequests: true, forumMentions: true });
    const [privacyPrefs, setPrivacyPrefs] = useState({ profileVisibility: 'everyone', allowConnectionRequests: 'everyone' });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRequestingData, setIsRequestingData] = useState(false);

    const handleSavePreferences = async () => {
        setIsSaving(true);
        try {
            await apiCall('/users/manage-notification-preferences', {
                method: 'POST',
                body: JSON.stringify({ preferences: { ...notificationPrefs, ...privacyPrefs } })
            });
            toast({ title: t('toast.saveSuccessTitle'), description: t('toast.saveSuccessDescription') });
        } catch (error: any) {
            toast({ title: t('toast.saveErrorTitle'), description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await apiCall('/users/delete-account', {
                method: 'DELETE'
            });
            await logOut();
            toast({ title: t('toast.deleteSuccessTitle'), description: t('toast.deleteSuccessDescription') });
            router.push('/auth/signin');
            router.refresh();
        } catch(error: any) {
             toast({ title: t('toast.deleteErrorTitle'), description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRequestData = async () => {
        setIsRequestingData(true);
        try {
            const result = await apiCall<{ message: string }>('/users/request-data-export', {
                method: 'POST'
            });
            toast({ title: t('toast.dataRequestSuccessTitle'), description: result.message });
        } catch (error: any) {
            toast({ title: t('toast.dataRequestErrorTitle'), description: error.message, variant: 'destructive' });
        } finally {
            setIsRequestingData(false);
        }
    };

    if (loading) {
        return <div>{t('loading')}</div>; // Or a skeleton loader
    }

    if (!user) {
        // This should ideally be handled by middleware, but serves as a backup.
        router.push('/auth/signin');
        return null;
    }

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
                <div className="space-y-2">
                    <h4 className="font-medium">{t('account.dataExportTitle')}</h4>
                    <p className="text-sm text-muted-foreground">{t('account.dataExportDescription')}</p>
                    <Button onClick={handleRequestData} variant="secondary" disabled={isRequestingData}>
                        {isRequestingData && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                        <Download className="mr-2 h-4 w-4" />{t('account.dataExportButton')}
                    </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h4 className="font-medium">{t('account.deactivateTitle')}</h4>
                     <p className="text-sm text-muted-foreground">{t('account.deactivateWarning')}</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive"><ShieldOff className="mr-2 h-4 w-4" />{t('account.deactivateButton')}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('deactivateModal.title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                {t('deactivateModal.description')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>{t('deactivateModal.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                                    {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                                    {t('deactivateModal.confirm')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
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
                  <Switch id="email-notifications" checked={notificationPrefs.emailDigest} onCheckedChange={(checked) => setNotificationPrefs(p => ({...p, emailDigest: checked}))} />
              </PrivacySetting>
              <PrivacySetting icon={<ConnectionsIcon className="h-6 w-6"/>} title={t('notifications.connectionRequestsLabel')} description={t('notifications.connectionRequestsDescription')} helpText={t('notifications.connectionRequestsHelpText')}>
                 <Switch id="connection-requests-notifications" checked={notificationPrefs.connectionRequests} onCheckedChange={(checked) => setNotificationPrefs(p => ({...p, connectionRequests: checked}))} />
              </PrivacySetting>
              <PrivacySetting icon={<MessageSquare className="h-6 w-6"/>} title={t('notifications.forumMentionsLabel')} description={t('notifications.forumMentionsDescription')} helpText={t('notifications.forumMentionsHelpText')}>
                <Switch id="forum-mentions-notifications" checked={notificationPrefs.forumMentions} onCheckedChange={(checked) => setNotificationPrefs(p => ({...p, forumMentions: checked}))} />
              </PrivacySetting>
              <Button onClick={handleSavePreferences} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                <Save className="mr-2 h-4 w-4" />{t('notifications.saveButton')}
              </Button>
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
                    <Select value={privacyPrefs.profileVisibility} onValueChange={(value) => setPrivacyPrefs(p => ({...p, profileVisibility: value}))}>
                        <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="everyone">{t('privacy.profileVisibilityAll')}</SelectItem>
                            <SelectItem value="connections">{t('privacy.profileVisibilityConnections')}</SelectItem>
                            <SelectItem value="private">{t('privacy.profileVisibilityPrivate')}</SelectItem>
                        </SelectContent>
                    </Select>
                </PrivacySetting>
                <PrivacySetting icon={<SearchCheck className="h-6 w-6" />} title={t('privacy.searchIndexingLabel')} description={t('privacy.searchIndexingDescription')} helpText={t('privacy.searchIndexingHelpText')}>
                    <Switch id="search-engine-indexing" defaultChecked />
                </PrivacySetting>
              
              <Button onClick={handleSavePreferences} disabled={isSaving}>
                 {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                 <Save className="mr-2 h-4 w-4" />{t('privacy.saveConsentButton')}
              </Button>
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

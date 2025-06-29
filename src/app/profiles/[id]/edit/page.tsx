
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { editProfileSchema, type EditProfileValues } from "@/lib/form-schemas";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { getProfileByIdFromDB } from "@/lib/db-utils";
import type { UserProfile } from "@/lib/types";
import { ArrowLeft, Save, User, Mail, Briefcase, FileText, MapPin, Sparkles, TrendingUp, Phone, Globe, Loader2 } from "lucide-react";
import React from "react"; 
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useTranslation } from "react-i18next";


function EditProfileSkeleton() {
    const { t } = useTranslation('common');
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
}

export default function EditProfilePage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = useParams();

  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();
  const functions = getFunctions(firebaseApp);
  const upsertStakeholderProfile = useMemo(() => httpsCallable(functions, 'upsertStakeholderProfile'), [functions]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileIdParam = params.id as string;

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: "",
      email: "",
      role: undefined,
      profileSummary: "",
      bio: "",
      location: "",
      areasOfInterest: "",
      needs: "",
      contactInfoPhone: "",
      contactInfoWebsite: "",
    },
  });

  const fetchProfileData = useCallback(async (idToFetch: string) => {
    setIsLoadingData(true);
    try {
      const userProfile = await getProfileByIdFromDB(idToFetch);
      if (userProfile) {
        setProfile(userProfile);
        form.reset({
          displayName: userProfile.name || "",
          email: userProfile.email || "",
          role: userProfile.role,
          profileSummary: userProfile.profileSummary || "",
          bio: userProfile.bio || "",
          location: userProfile.location || "",
          areasOfInterest: Array.isArray(userProfile.areasOfInterest) ? userProfile.areasOfInterest.join(", ") : "",
          needs: Array.isArray(userProfile.needs) ? userProfile.needs.join(", ") : "",
          contactInfoPhone: userProfile.contactInfo?.phone || "",
          contactInfoWebsite: userProfile.contactInfo?.website || "",
        });
      } else {
        toast({ variant: "destructive", title: t('editProfilePage.loadErrorTitle'), description: t('editProfilePage.loadErrorDescription') });
        router.push("/profiles");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ variant: "destructive", title: t('editProfilePage.loadErrorTitle'), description: "There was a problem fetching the profile data." });
    } finally {
      setIsLoadingData(false);
    }
  }, [form, router, toast, t]);

  useEffect(() => {
    if (authLoading) return;

    let idToFetch: string | null = null;
    if (profileIdParam === "me") {
      if (authUser) {
        idToFetch = authUser.uid;
      } else {
        toast({ variant: "destructive", title: t('editProfilePage.notAuthenticatedTitle'), description: t('editProfilePage.notAuthenticatedDescription') });
        router.push("/auth/signin");
        return;
      }
    } else {
      if (!authUser || authUser.uid !== profileIdParam) {
        toast({ variant: "destructive", title: t('editProfilePage.unauthorizedTitle'), description: t('editProfilePage.unauthorizedDescription')});
        router.push(`/profiles/${profileIdParam}`);
        return;
      }
      idToFetch = profileIdParam;
    }

    if (idToFetch) {
      fetchProfileData(idToFetch);
    } else if (!authLoading) {
      setIsLoadingData(false);
    }
  }, [profileIdParam, authUser, authLoading, router, toast, fetchProfileData, t]);

  async function onSubmit(data: EditProfileValues) {
    if (!profile?.id) {
      toast({ variant: "destructive", title: "Error", description: "Profile ID is missing. Cannot save changes." });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        displayName: data.displayName,
        primaryRole: data.role,
        profileSummary: data.profileSummary,
        bio: data.bio,
        location: data.location,
        areasOfInterest: data.areasOfInterest?.split(',').map(s => s.trim()).filter(Boolean) || [],
        needs: data.needs?.split(',').map(s => s.trim()).filter(Boolean) || [],
        contactInfoPhone: data.contactInfoPhone,
        contactInfoWebsite: data.contactInfoWebsite,
        profileData: {}, 
      };

      await upsertStakeholderProfile(payload);
      
      toast({
        title: t('editProfilePage.updateSuccessTitle'),
        description: t('editProfilePage.updateSuccessDescription'),
      });
      router.push(`/profiles/me`);
      router.refresh(); 
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: t('editProfilePage.updateFailTitle'),
        description: error.message || t('editProfilePage.updateFailDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData || authLoading) {
    return <EditProfileSkeleton />;
  }
  
  if (!profile && !isLoadingData) {
    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
            <CardTitle>{t('profilesPage.notFoundTitle')}</CardTitle>
            <CardDescription>{t('profilesPage.notFoundDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" asChild><Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link></Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{t('editProfilePage.title', { name: profile?.name })}</CardTitle>
          <CardDescription>{t('editProfilePage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('signUpPage.namePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} disabled />
                    </FormControl>
                    <FormDescription>{t('editProfilePage.emailDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.roleLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('signUpPage.rolePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAKEHOLDER_ROLES.map((roleOption) => (
                          <SelectItem key={roleOption} value={roleOption}>
                            {roleOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profileSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.summaryLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('editProfilePage.summaryPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>Max 250 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.bioLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('editProfilePage.bioPlaceholder')}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>Max 2000 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.locationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nairobi, Kenya or Central Valley, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="areasOfInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.interestsLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('editProfilePage.interestsPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('editProfilePage.commaSeparated')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="needs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.needsLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('editProfilePage.needsPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('editProfilePage.commaSeparated')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfoPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.phoneLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfoWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />{t('editProfilePage.websiteLabel')}</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || isLoadingData}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('editProfilePage.savingButton')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t('editProfilePage.saveButton')}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()} disabled={isSubmitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t('editProfilePage.cancelButton')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

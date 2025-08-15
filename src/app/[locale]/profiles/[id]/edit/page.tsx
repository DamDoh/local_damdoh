
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
import { getProfileByIdFromDB } from "@/lib/server-actions";
import type { UserProfile } from "@/lib/types";
import { ArrowLeft, Save, User, Mail, Briefcase, FileText, MapPin, Sparkles, TrendingUp, Phone, Globe, Loader2, Info, Settings } from "lucide-react";
import React from "react"; 
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useTranslations, useLocale } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateProfileSummary } from '@/ai/flows/profile-summary-generator';


function EditProfileSkeleton() {
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
  const tEdit = useTranslations('editProfilePage');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();

  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();
  const functions = getFunctions(firebaseApp);
  const upsertStakeholderProfile = useMemo(() => httpsCallable(functions, 'upsertStakeholderProfile'), [functions]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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
      profileData: {},
    },
  });

  const fetchProfileData = useCallback(async (idToFetch: string) => {
    setIsLoadingData(true);
    try {
      const userProfile = await getProfileByIdFromDB(idToFetch);
      if (userProfile) {
        setProfile(userProfile);
        form.reset({
          displayName: userProfile.displayName || "",
          email: userProfile.email || "",
          role: userProfile.primaryRole,
          profileSummary: userProfile.profileSummary || "",
          bio: userProfile.bio || "",
          location: userProfile.location?.address || "",
          areasOfInterest: Array.isArray(userProfile.areasOfInterest) ? userProfile.areasOfInterest.join(", ") : "",
          needs: Array.isArray(userProfile.needs) ? userProfile.needs.join(", ") : "",
          contactInfoPhone: userProfile.contactInfo?.phone || "",
          contactInfoWebsite: userProfile.contactInfo?.website || "",
          profileData: userProfile.profileData || {},
        });
      } else {
        toast({ variant: "destructive", title: tCommon('error'), description: tEdit('toast.profileNotFound') });
        router.push("/profiles");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ variant: "destructive", title: tCommon('error'), description: tEdit('toast.fetchError') });
    } finally {
      setIsLoadingData(false);
    }
  }, [form, router, toast, tCommon, tEdit]);

  useEffect(() => {
    if (authLoading) return;

    let idToFetch: string | null = null;
    if (profileIdParam === "me") {
      if (authUser) {
        idToFetch = authUser.uid;
      } else {
        toast({ variant: "destructive", title: tEdit('toast.notAuthenticatedTitle'), description: tEdit('toast.notAuthenticatedDescription') });
        router.push("/auth/signin");
        return;
      }
    } else {
      if (!authUser || authUser.uid !== profileIdParam) {
        toast({ variant: "destructive", title: tEdit('toast.unauthorizedTitle'), description: tEdit('toast.unauthorizedDescription') });
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
  }, [profileIdParam, authUser, authLoading, router, toast, fetchProfileData, tEdit]);
  
  const handleGenerateSummary = async () => {
    const isValid = await form.trigger(['role', 'location', 'areasOfInterest', 'needs']);
    if (!isValid) {
        toast({
            title: tEdit('toast.missingInfoTitle'),
            description: tEdit('toast.missingInfoDescription'),
            variant: "destructive",
        });
        return;
    }
    
    setIsGeneratingSummary(true);
    try {
        const { role, location, areasOfInterest, needs } = form.getValues();
        const result = await generateProfileSummary({
            stakeholderType: role,
            location: location,
            areasOfInterest: areasOfInterest,
            needs: needs,
            language: locale,
        });
        if (result.summary) {
            form.setValue('profileSummary', result.summary, { shouldValidate: true });
            toast({
                title: tEdit('toast.summaryGeneratedTitle'),
                description: tEdit('toast.summaryGeneratedDescription'),
            });
        }
    } catch (error: any) {
        console.error("Error generating profile summary:", error);
        toast({
            title: tEdit('toast.generationFailedTitle'),
            description: tEdit('toast.generationFailedDescription'),
            variant: "destructive",
        });
    } finally {
        setIsGeneratingSummary(false);
    }
  };

  async function onSubmit(data: EditProfileValues) {
    if (!profile?.id) {
      toast({ variant: "destructive", title: tCommon('error'), description: tEdit('toast.missingIdError') });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        displayName: data.displayName,
        primaryRole: data.role,
        profileSummary: data.profileSummary,
        bio: data.bio,
        location: { address: data.location }, // Assuming simple address for now
        areasOfInterest: data.areasOfInterest?.split(',').map(s => s.trim()).filter(Boolean) || [],
        needs: data.needs?.split(',').map(s => s.trim()).filter(Boolean) || [],
        contactInfoPhone: data.contactInfoPhone,
        contactInfoWebsite: data.contactInfoWebsite,
        profileData: data.profileData, 
      };

      await upsertStakeholderProfile(payload);
      
      toast({
        title: tEdit('toast.profileUpdatedTitle'),
        description: tEdit('toast.profileUpdatedDescription'),
      });
      router.push(`/profiles/me`);
      router.refresh(); 
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: tEdit('toast.updateFailedTitle'),
        description: error.message || tEdit('toast.updateFailedDescription'),
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
            <CardTitle>{tEdit('notFound.title')}</CardTitle>
            <CardDescription>{tEdit('notFound.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" asChild><Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />{tEdit('notFound.backButton')}</Link></Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{tEdit('title', { name: profile?.displayName })}</CardTitle>
          <CardDescription>{tEdit('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />{tEdit('profileTab')}</TabsTrigger>
                        <TabsTrigger value="details"><Info className="mr-2 h-4 w-4" />{tEdit('detailsTab')}</TabsTrigger>
                        <TabsTrigger value="contact"><Phone className="mr-2 h-4 w-4" />{tEdit('contactTab')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-6">
                        <div className="space-y-6">
                            <FormField control={form.control} name="displayName" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{tEdit('nameLabel')}</FormLabel> <FormControl> <Input placeholder={tEdit('namePlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="role" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" />{tEdit('roleLabel')}</FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder={tEdit('rolePlaceholder')} /> </SelectTrigger> </FormControl> <SelectContent> {STAKEHOLDER_ROLES.map((roleOption) => ( <SelectItem key={roleOption} value={roleOption}> {roleOption} </SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="profileSummary" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center justify-between"> <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{tEdit('summaryLabel')}</span> <Button type="button" variant="outline" size="sm" onClick={handleGenerateSummary} disabled={isGeneratingSummary}> {isGeneratingSummary ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">{tEdit('generateWithAI')}</span> </Button> </FormLabel> <FormControl> <Input placeholder={tEdit('summaryPlaceholder')} {...field} /> </FormControl> <FormDescription>{tEdit('summaryDescription')}</FormDescription> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{tEdit('bioLabel')}</FormLabel> <FormControl> <Textarea placeholder={tEdit('bioPlaceholder')} className="min-h-[120px]" {...field} /> </FormControl> <FormDescription>{tEdit('bioDescription')}</FormDescription> <FormMessage /> </FormItem> )} />
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="mt-6">
                         <div className="space-y-6">
                            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{tEdit('locationLabel')}</FormLabel> <FormControl> <Input placeholder={tEdit('locationPlaceholder')} {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="areasOfInterest" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-muted-foreground" />{tEdit('interestsLabel')}</FormLabel> <FormControl> <Input placeholder={tEdit('interestsPlaceholder')} {...field} /> </FormControl> <FormDescription>{tEdit('commaSeparated')}</FormDescription> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="needs" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" />{tEdit('needsLabel')}</FormLabel> <FormControl> <Input placeholder={tEdit('needsPlaceholder')} {...field} /> </FormControl> <FormDescription>{tEdit('commaSeparated')}</FormDescription> <FormMessage /> </FormItem> )} />
                        </div>
                    </TabsContent>

                    <TabsContent value="contact" className="mt-6">
                        <div className="space-y-6">
                            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{tEdit('emailLabel')}</FormLabel> <FormControl> <Input type="email" placeholder="you@example.com" {...field} disabled /> </FormControl> <FormDescription>{tEdit('emailDescription')}</FormDescription> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="contactInfoPhone" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{tEdit('phoneLabel')}</FormLabel> <FormControl> <Input placeholder="+1234567890" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="contactInfoWebsite" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />{tEdit('websiteLabel')}</FormLabel> <FormControl> <Input type="url" placeholder="https://yourwebsite.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        </div>
                    </TabsContent>
                </Tabs>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || isLoadingData}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tEdit('savingButton')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {tEdit('saveButton')}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()} disabled={isSubmitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> {tCommon('cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

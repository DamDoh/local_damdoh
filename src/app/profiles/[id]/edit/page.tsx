
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { getProfileByIdFromDB, updateProfileInDB } from "@/lib/db-utils";
import type { UserProfile } from "@/lib/types";
import { ArrowLeft, Save, User, Mail, Briefcase, FileText, MapPin, Sparkles, TrendingUp, Phone, Globe, Loader2 } from "lucide-react";
import React from "react"; 
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();

  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileIdParam = params.id as string;

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "",
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
          name: userProfile.name,
          email: userProfile.email,
          role: userProfile.roles[0], // Assuming the first role is the primary one for editing
          profileSummary: userProfile.profileSummary || "",
          bio: userProfile.bio || "",
          location: userProfile.location,
          areasOfInterest: Array.isArray(userProfile.areasOfInterest) ? userProfile.areasOfInterest.join(", ") : "",
          needs: Array.isArray(userProfile.needs) ? userProfile.needs.join(", ") : "",
          contactInfoPhone: userProfile.contactInfo?.phone || "",
          contactInfoWebsite: userProfile.contactInfo?.website || "",
        });
      } else {
        toast({ variant: "destructive", title: "Profile Not Found", description: "Could not load profile data to edit." });
        router.push("/profiles");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ variant: "destructive", title: "Error Loading Profile", description: "There was a problem fetching the profile data." });
    } finally {
      setIsLoadingData(false);
    }
  }, [form, router, toast]);

  useEffect(() => {
    if (authLoading) return;

    let idToFetch: string | null = null;
    if (profileIdParam === "me") {
      if (authUser) {
        idToFetch = authUser.uid;
      } else {
        toast({ variant: "destructive", title: "Not Authenticated", description: "Please sign in to edit your profile." });
        router.push("/auth/signin");
        return;
      }
    } else {
      if (!authUser || authUser.uid !== profileIdParam) {
        toast({ variant: "destructive", title: "Unauthorized", description: "You can only edit your own profile."});
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

  }, [profileIdParam, authUser, authLoading, router, toast, fetchProfileData]);


  async function onSubmit(data: EditProfileValues) {
    if (!profile?.id) {
      toast({ variant: "destructive", title: "Error", description: "Profile ID is missing. Cannot save changes." });
      return;
    }
    setIsSubmitting(true);
    try {
      const profileUpdates: Partial<UserProfile> = {
        name: data.name,
        roles: [data.role],
        profileSummary: data.profileSummary,
        bio: data.bio,
        location: data.location,
        areasOfInterest: data.areasOfInterest?.split(",").map(s => s.trim()).filter(s => s) || [],
        needs: data.needs?.split(",").map(s => s.trim()).filter(s => s) || [],
        contactInfo: {
          phone: data.contactInfoPhone,
          website: data.contactInfoWebsite,
          email: profile.email // Keep existing email from profile
        },
      };

      await updateProfileInDB(profile.id, profileUpdates);
      toast({
        title: "Profile Updated Successfully!",
        description: "Your changes have been saved.",
      });
      router.push(`/profiles/me`);
      router.refresh(); // Force a refresh to show updated data on profile page
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save your profile changes. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData || authLoading) {
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
  
  if (!profile) {
    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>The requested profile could not be loaded.</CardDescription>
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
          <CardTitle className="text-2xl">Edit Profile: {profile.name}</CardTitle>
          <CardDescription>Update your public information for the DamDoh network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />Full Name / Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name or organization name" {...field} />
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
                    <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} disabled />
                    </FormControl>
                    <FormDescription>Email cannot be changed here as it's tied to your login.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" />Primary Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary role in the supply chain" />
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Profile Summary / Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="A brief summary of your role and expertise" {...field} />
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Detailed Bio / About</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about yourself, your organization, mission, or services."
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
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Location</FormLabel>
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
                    <FormLabel className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-muted-foreground" />Areas of Interest / Specialties</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Organic farming, Supply chain logistics, Export" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated list.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="needs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" />Currently Seeking / Offering</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Buyers for cocoa, Warehousing space" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated list.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfoPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />Phone Number (Optional)</FormLabel>
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
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />Website (Optional)</FormLabel>
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()} disabled={isSubmitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

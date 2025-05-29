
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
import { dummyUsersData, dummyProfileDetailsPageData, dummyProfiles } from "@/lib/dummy-data";
import type { UserProfile } from "@/lib/types";
import { ArrowLeft, Save, User, Mail, Briefcase, FileText, MapPin, Sparkles, TrendingUp, Phone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const profileId = params.id === "me" ? "aishaBello" : params.id as string;

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
  
  useEffect(() => {
    let userProfile: UserProfile | undefined = undefined;
    if (profileId === dummyProfileDetailsPageData.profile.id) {
      userProfile = dummyProfileDetailsPageData.profile;
    } else {
      userProfile = dummyProfiles.find(p => p.id === profileId);
    }

    if (!userProfile && dummyUsersData[profileId]) {
      const userData = dummyUsersData[profileId];
      userProfile = {
        id: profileId,
        name: userData.name,
        email: `${profileId.toLowerCase().replace(/\s/g, '.')}@damdoh.example.com`,
        role: userData.role as EditProfileValues['role'] || STAKEHOLDER_ROLES[0],
        location: userData.location || 'Location not specified',
        avatarUrl: userData.avatarUrl,
        profileSummary: userData.headline || '',
        bio: '',
        areasOfInterest: [],
        needs: [],
      };
    }

    if (userProfile) {
      setProfile(userProfile);
      form.reset({
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        profileSummary: userProfile.profileSummary || "",
        bio: userProfile.bio || "",
        location: userProfile.location,
        areasOfInterest: userProfile.areasOfInterest?.join(", ") || "",
        needs: userProfile.needs?.join(", ") || "",
        contactInfoPhone: userProfile.contactInfo?.phone || "",
        contactInfoWebsite: userProfile.contactInfo?.website || "",
      });
    }
    setIsLoading(false);
  }, [profileId, form]);


  function onSubmit(data: EditProfileValues) {
    console.log("Updated Profile Data:", data);
    // In a real app, you would send this to your backend to update the user's profile.
    toast({
      title: "Profile Updated (Simulated)",
      description: "Your profile changes have been saved (details logged to console).",
    });
    router.push(`/profiles/${params.id}`); // Redirect back to profile view
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sorry, we couldn't find the profile data to edit for ID: "{profileId}".</p>
           <Button asChild variant="outline" className="mt-4">
            <Link href={`/profiles/${params.id || 'me'}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Profile: {profile?.name}</CardTitle>
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
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              
              {/* Placeholder for Avatar/Image Upload - could be a future enhancement */}
              {/* 
              <FormItem>
                <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4 text-muted-foreground" />Profile Picture</FormLabel>
                <Input type="file" />
                <FormDescription>Upload a new profile picture.</FormDescription>
              </FormItem>
              */}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>
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

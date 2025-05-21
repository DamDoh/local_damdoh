

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CalendarDays, Globe, MapPin, MessageCircle, Plus, UserPlus, Edit, TrendingUp, Leaf, Tractor, Link as LinkIcon, ShoppingCart, FileText, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { dummyProfileDetailsPageData, dummyProfiles, dummyUsersData } from "@/lib/dummy-data"; // Import dummy data
import type { StakeholderRole } from "@/lib/constants";
import { STAKEHOLDER_ROLES } from "@/lib/constants";

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
  const { profile: detailedAgriProcessorProfile, activity: userActivity } = dummyProfileDetailsPageData; 
  
  let profile: UserProfile | undefined = undefined;

  if (params.id === detailedAgriProcessorProfile.id) {
    profile = detailedAgriProcessorProfile;
  } else {
    profile = dummyProfiles.find(p => p.id === params.id);
  }

  // If not found in detailed or dummyProfiles, try to construct from dummyUsersData
  if (!profile && dummyUsersData[params.id]) {
    const userData = dummyUsersData[params.id];
    profile = {
      id: params.id,
      name: userData.name,
      email: `${params.id.toLowerCase().replace(/\s/g, '.')}@damdoh.example.com`, // Placeholder email
      role: userData.role as StakeholderRole || STAKEHOLDER_ROLES[0], // Use existing role or first as default
      location: 'Location not specified', // Placeholder
      avatarUrl: userData.avatarUrl,
      profileSummary: userData.headline || `This is the profile for ${userData.name}. More details coming soon.`,
      // Fill other optional UserProfile fields with defaults or leave undefined
      areasOfInterest: [],
      needs: [],
      connections: [],
      bio: userData.headline ? `More information about ${userData.name}, including their role as ${userData.role || 'a valued stakeholder'}. (${userData.headline})` : `More information about ${userData.name}. They are a ${userData.role || 'valued stakeholder'} in the agricultural supply chain.`,
      yearsOfExperience: Math.floor(Math.random() * 20) + 1, // Random experience for demo
      contactInfo: {
        website: `${params.id.toLowerCase().replace(/\s/g, '')}.damdoh.example.com`
      }
    };
  }
  
  const isCurrentUser = params.id === "me" || (profile && params.id === profile.id); 

  if (!profile) { 
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sorry, we couldn't find a profile for the ID: "{params.id}".</p>
          <p className="text-sm text-muted-foreground mt-2">
            This stakeholder may not have a detailed profile created yet, or the ID might be incorrect.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/profiles">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profiles Directory
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const ActivityIcon = ({ type }: { type: string }) => {
    if (type.includes('Forum') || type.includes('Article')) return <MessageCircle className="h-5 w-5 text-primary" />;
    if (type.includes('Marketplace')) return <ShoppingCart className="h-5 w-5 text-primary" />;
    if (type.includes('Connection')) return <LinkIcon className="h-5 w-5 text-primary" />;
    return <Star className="h-5 w-5 text-primary" />;
  };


  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/30 to-accent/30 relative">
          <Image 
            src={profile.id === detailedAgriProcessorProfile.id ? "https://placehold.co/1200x300.png" : `https://placehold.co/1200x300.png?text=${encodeURIComponent(profile.name)}`} 
            alt={profile.name} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={profile.role ? `${profile.role.toLowerCase()} agriculture background` : "agriculture background"} />
          <div className="absolute bottom-[-50px] left-6">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile business food" />
              <AvatarFallback className="text-4xl">{profile.name.substring(0,1)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardHeader className="pt-[60px] px-6"> 
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{profile.name}</CardTitle>
              <CardDescription className="text-lg">{profile.role}</CardDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" /> {profile.location}
              </div>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              {isCurrentUser ? (
                <Button asChild><Link href={`/profiles/${params.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link></Button>
              ) : (
                <>
                  <Button><LinkIcon className="mr-2 h-4 w-4" /> Connect</Button>
                  <Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" /> Message</Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 space-y-6">
          {profile.profileSummary && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Leaf className="h-5 w-5 mr-2 text-primary" /> Summary</h3>
              <p className="text-muted-foreground">{profile.profileSummary}</p>
            </div>
          )}
          
          {profile.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" />About {profile.name.split(' ')[0]}</h3>
              <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.yearsOfExperience !== undefined && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Industry Experience</h4>
                  <p className="text-muted-foreground">{profile.yearsOfExperience} years in agri-food sector</p>
                </div>
              </div>
            )}
             {profile.contactInfo?.email && (
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Business Email</h4>
                  <a href={`mailto:${profile.contactInfo.email}`} className="text-muted-foreground hover:underline">{profile.contactInfo.email}</a>
                </div>
              </div>
            )}
            {profile.contactInfo?.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Company Website</h4>
                  <a href={profile.contactInfo.website.startsWith('http') ? profile.contactInfo.website : `https://${profile.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">{profile.contactInfo.website}</a>
                </div>
              </div>
            )}
          </div>

          {profile.areasOfInterest && profile.areasOfInterest.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Tractor className="h-5 w-5 mr-2 text-primary" />Areas of Expertise & Interest</h3>
              <div className="flex flex-wrap gap-2">
                {profile.areasOfInterest.map(interest => <Badge key={interest} variant="secondary">{interest}</Badge>)}
              </div>
            </div>
          )}

          {profile.needs && profile.needs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" />Actively Seeking / Offering</h3>
              <div className="flex flex-wrap gap-2">
                {profile.needs.map(need => <Badge key={need}>{need}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Supply Chain Activity</CardTitle>
        </CardHeader>
        <CardContent>
            {/* Use userActivity only if it's the agriProcessorSarah profile, otherwise show placeholder */}
            {(params.id === detailedAgriProcessorProfile.id && userActivity.length > 0) ? (
                <ul className="space-y-4">
                    {userActivity.map(activity => (
                        <li key={activity.id} className="p-4 border rounded-lg shadow-sm hover:bg-accent/30 transition-colors">
                           <div className="flex items-start gap-3">
                                <ActivityIcon type={activity.type} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">{activity.type}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</span>
                                    </div>
                                    <Link href={activity.link} className="text-md font-semibold hover:underline mt-1 block">
                                        {activity.title}
                                    </Link>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-muted-foreground">No recent specific activity to display for this stakeholder. They are active in the DamDoh network!</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CalendarDays, Globe, MapPin, MessageCircle, Plus, UserPlus, Edit, TrendingUp, Leaf, Tractor } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Dummy data for a single profile - replace with actual data fetching
const profile: UserProfile = {
  id: 'farmerAlice', // Consistent ID with other dummy data
  name: 'Alice Greenfarm',
  role: 'Farmer',
  location: 'Greenwood Valley, AgroState',
  avatarUrl: 'https://placehold.co/200x200.png',
  profileSummary: 'Dedicated organic farmer with over 15 years of experience in cultivating high-quality vegetables and herbs. Passionate about sustainable agriculture, soil health, and building direct-to-consumer relationships. Actively seeking new market opportunities and collaborations with eco-conscious partners.',
  bio: "My journey into farming began with a desire to grow nutritious food for my community while respecting the land. At 'Greenwood Organics', we practice regenerative agriculture, focusing on biodiversity, cover cropping, and minimal tillage. We're certified organic and committed to transparent food systems. I'm always eager to learn new techniques and share experiences with fellow farmers and agricultural professionals.",
  yearsOfExperience: 15,
  areasOfInterest: ['Organic Farming', 'Sustainable Agriculture', 'Direct-to-Consumer Sales', 'Soil Health Management', 'Cover Cropping', 'Agri-Tourism'],
  needs: ['Local Restaurant Partnerships', 'Logistics for Farmers Market Delivery', 'Collaboration on Value-Added Products (e.g., jams, pickles)'],
  contactInfo: {
    email: 'alice.greenfarm@example.com',
    phone: '+1-555-0101',
    website: 'www.greenwoodorganics.farm'
  },
  connections: ['seedSupplierBob', 'processorCarol'] // Dummy IDs
};

// Dummy data for user's activity/posts
const userActivity = [
    { id: 'post1', type: 'Forum Post', title: 'My experience with no-till soybean farming', date: '2024-05-15', link: '/forums/sustainable-farming/post/no-till-experience' },
    { id: 'item1', type: 'Marketplace Listing', title: 'Fresh Organic Kale - Bulk Order Available', date: '2024-05-20', link: '/marketplace/item/organic-kale' },
    { id: 'post2', type: 'Shared Article', title: 'Innovations in Drip Irrigation for Small Farms', date: '2024-05-10', link: '/articles/drip-irrigation-innovations'},
];

export default function ProfileDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch profile data based on params.id
  // For now, we use the dummy 'profile' data if params.id matches 'farmerAlice' or "me" (for demo purposes).
  const isCurrentUser = params.id === "me" || params.id === profile.id; 

  if (!profile) { // Or if fetched profile is null
    return <p>Profile not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/30 to-accent/30 relative">
          <Image src="https://placehold.co/1200x300.png" alt="Lush green farm landscape" layout="fill" objectFit="cover" data-ai-hint="farm landscape" />
          <div className="absolute bottom-[-50px] left-6">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile farmer" />
              <AvatarFallback className="text-4xl">{profile.name.substring(0,1)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardHeader className="pt-[60px] px-6"> {/* Adjust padding top to account for avatar overlap */}
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
                  <Button><UserPlus className="mr-2 h-4 w-4" /> Connect</Button>
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
              <h3 className="text-lg font-semibold mb-2 flex items-center"><CalendarDays className="h-5 w-5 mr-2 text-primary" />About</h3>
              <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.yearsOfExperience !== undefined && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Experience</h4>
                  <p className="text-muted-foreground">{profile.yearsOfExperience} years in organic farming</p>
                </div>
              </div>
            )}
             {profile.contactInfo?.email && (
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <a href={`mailto:${profile.contactInfo.email}`} className="text-muted-foreground hover:underline">{profile.contactInfo.email}</a>
                </div>
              </div>
            )}
            {profile.contactInfo?.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">Farm Website</h4>
                  <a href={`https://${profile.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">{profile.contactInfo.website}</a>
                </div>
              </div>
            )}
          </div>

          {profile.areasOfInterest && profile.areasOfInterest.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Tractor className="h-5 w-5 mr-2 text-primary" />Areas of Interest</h3>
              <div className="flex flex-wrap gap-2">
                {profile.areasOfInterest.map(interest => <Badge key={interest} variant="secondary">{interest}</Badge>)}
              </div>
            </div>
          )}

          {profile.needs && profile.needs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" />Currently Seeking</h3>
              <div className="flex flex-wrap gap-2">
                {profile.needs.map(need => <Badge key={need}>{need}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
            {userActivity.length > 0 ? (
                <ul className="space-y-4">
                    {userActivity.map(activity => (
                        <li key={activity.id} className="p-4 border rounded-lg shadow-sm hover:bg-accent/30 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-primary">{activity.type}</span>
                                <span className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</span>
                            </div>
                            <Link href={activity.link} className="text-md font-semibold hover:underline mt-1 block">
                                {activity.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-muted-foreground">No recent activity to display.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

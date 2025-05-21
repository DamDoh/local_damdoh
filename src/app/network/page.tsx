import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { Filter, Search, UserPlus, MessageCircle, Shuffle } from "lucide-react";
// import { suggestConnections, type SuggestedConnectionsInput } from "@/ai/flows/suggested-connections"; // This would be a server action call

// Dummy data for suggested connections - replace with actual AI flow calls
const suggestedConnections: UserProfile[] = [
  { id: 'sc1', name: 'Eleanor Agronomist', role: 'Development Personnel', location: 'Field Research Station', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Expert in soil health and crop rotation. Offers consultation services to improve farm yields sustainably.' },
  { id: 'sc2', name: 'Frank Financier', role: 'Financial Institution', location: 'Metro Business District', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Provides agricultural loans and financial planning for agribusinesses. Specialized in small farm funding.' },
  { id: 'sc3', name: 'Grace Exporter', role: 'Exporter', location: 'International Port', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Facilitates export of specialty crops to European and Asian markets. Looking for reliable suppliers.' },
  { id: 'sc4', name: 'Henry Contractor', role: 'Pre-Harvest Contractor', location: 'Rural Services Hub', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Offers land preparation, planting, and pest control services with modern equipment.' },
  { id: 'sc5', name: 'Isabelle Input', role: 'Input Supplier', location: 'Agri Supply Co.', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Distributor of organic pesticides and advanced irrigation systems.' },
];

const interests = ['All', 'Crop Farming', 'Livestock', 'Aquaculture', 'Agri-Tech', 'Organic', 'Export', 'Local Markets'];

export default async function NetworkPage() {
  // Example of how you might call the AI flow in a real app (server component or server action)
  // const currentUserProfile: SuggestedConnectionsInput = {
  //   profileSummary: "A farmer in Green Valley focused on organic tomatoes, looking for local buyers and sustainable practice advice.",
  //   stakeholderRole: "Farmer",
  //   location: "Green Valley, CA",
  //   preferences: "Connect with local retailers, other organic farmers, and sustainability experts.",
  //   needs: "Find new markets for produce, learn about pest control without chemicals."
  // };
  // const aiSuggestions = await suggestConnections(currentUserProfile);
  // const connectionsToShow = aiSuggestions.suggestedConnections.map((name, index) => ({ // This mapping is naive, needs better data structure from AI
  //   id: `ai-${index}`, name, role: 'Unknown', location: 'Unknown', profileSummary: aiSuggestions.reasoning 
  // }));

  const connectionsToShow = suggestedConnections; // Using dummy data for now

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Expand Your Network</CardTitle>
              <CardDescription>Discover AI-powered connection suggestions tailored to your profile and interests.</CardDescription>
            </div>
             <Button variant="outline"><Shuffle className="mr-2 h-4 w-4" /> Refresh Suggestions</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, role, or interest..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {STAKEHOLDER_ROLES.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by interest" />
              </SelectTrigger>
              <SelectContent>
                {interests.map(interest => (
                  <SelectItem key={interest} value={interest.toLowerCase().replace(' ', '-')}>{interest}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Apply Filters</Button> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectionsToShow.map(profile => (
              <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="items-center text-center">
                  <Avatar className="h-24 w-24 border-2 border-primary mb-2">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile person agriculture" />
                    <AvatarFallback className="text-3xl">{profile.name.substring(0,1)}</AvatarFallback>
                  </Avatar>
                  <Link href={`/profiles/${profile.id}`}>
                    <CardTitle className="text-lg hover:text-primary transition-colors">{profile.name}</CardTitle>
                  </Link>
                  <CardDescription>{profile.role} - {profile.location}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                  <p className="text-sm text-muted-foreground line-clamp-3">{profile.profileSummary}</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 p-4">
                  <Button className="w-full sm:flex-1"><UserPlus className="mr-2 h-4 w-4" /> Connect</Button>
                  <Button variant="outline" className="w-full sm:flex-1"><MessageCircle className="mr-2 h-4 w-4" /> Message</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {connectionsToShow.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No connection suggestions at this time.</p>
              <p className="text-sm text-muted-foreground">Complete your profile to get better recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

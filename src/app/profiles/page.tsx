import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { UserProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAKEHOLDER_ROLES } from "@/lib/constants";
import { Filter, PlusCircle, Search } from "lucide-react";

// Dummy data for profiles - replace with actual data fetching
const profiles: UserProfile[] = [
  { id: '1', name: 'Alice Farmer', role: 'Farmer', location: 'Green Valley', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Experienced organic farmer specializing in tomatoes and cucumbers. Looking for direct buyers.' },
  { id: '2', name: 'Bob Supplier', role: 'Input Supplier', location: 'Central City', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Provides high-quality, non-GMO seeds and organic fertilizers. Open to partnerships.' },
  { id: '3', name: 'Carol Processor', role: 'Processor', location: 'Industrial Park', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Transforms raw produce into value-added packaged goods. Seeking reliable farm suppliers.' },
  { id: '4', name: 'David Trader', role: 'Trader', location: 'Port City', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Connects local farmers with international markets for various grains and pulses.' },
  { id: '5', name: 'Eve Retailer', role: 'Retailer', location: 'Suburbia', avatarUrl: 'https://placehold.co/150x150.png', profileSummary: 'Local grocery store owner committed to sourcing fresh, local produce.' },
];

export default function ProfilesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Stakeholder Profiles</CardTitle>
              <CardDescription>Discover and connect with individuals and organizations in the agricultural supply chain.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/profiles/create"> {/* Assuming a create profile page */}
                <PlusCircle className="mr-2 h-4 w-4" /> Create Profile
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search profiles by name, role, location..." className="pl-10" />
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
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Apply Filters</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => (
              <Card key={profile.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="profile agriculture" />
                    <AvatarFallback>{profile.name.substring(0,1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <CardDescription>{profile.role} - {profile.location}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{profile.profileSummary}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/profiles/${profile.id}`}>View Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {profiles.length === 0 && (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No profiles found.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </CardContent>
        {/* Pagination could go here */}
      </Card>
    </div>
  );
}

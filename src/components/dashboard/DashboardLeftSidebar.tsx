
"use client"; // Added to allow onClick handler

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Users, Newspaper, CalendarDays, BarChart2, Landmark, Sprout, Link2 } from "lucide-react";
import { dummyUsersData } from "@/lib/dummy-data"; // Import dummy data

// Dummy data for current user, focused on agriculture
const currentUser = {
  name: dummyUsersData['aishaBello']?.name || "Aisha Bello",
  title: dummyUsersData['aishaBello']?.headline || "Founder, Sahel Organics | Connecting smallholder farmers to sustainable markets.",
  location: "Kano, Nigeria", // Assuming location is not in dummyUsersData for this specific user
  avatarUrl: dummyUsersData['aishaBello']?.avatarUrl || "https://placehold.co/80x80.png",
  damDohLink: "My DamDoh Stakeholder Profile",
  profileViewers: 48,
  postImpressions: 230,
};

export function DashboardLeftSidebar() {
  const handleTryProClick = () => {
    console.log("Try DamDoh Pro button clicked - placeholder action.");
    alert("DamDoh Pro features coming soon!");
  };

  return (
    <div className="space-y-4 sticky top-20"> {/* top-20 to offset header height */}
      <Card>
        <CardContent className="pt-6 text-center">
          <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-primary">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="profile farmer woman" />
            <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Link href="/profiles/me">
            <h3 className="text-lg font-semibold hover:underline">{currentUser.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground px-2">{currentUser.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{currentUser.location}</p>
          {currentUser.damDohLink && (
            <Link href="/profiles/me" className="text-xs text-primary hover:underline block mt-1">
              {currentUser.damDohLink}
            </Link>
          )}
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs space-y-1">
          <div className="flex justify-between items-center p-1 rounded-sm">
            <span>Profile viewers</span>
            <span className="text-primary font-semibold">{currentUser.profileViewers}</span>
          </div>
          <div className="flex justify-between items-center p-1 rounded-sm">
            <span>Post impressions</span>
            <span className="text-primary font-semibold">{currentUser.postImpressions}</span>
          </div>
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs">
          <p className="text-muted-foreground">Unlock premium supply chain analytics & tools</p>
          <Button variant="link" className="p-0 h-auto text-xs font-semibold" onClick={handleTryProClick}>
            <BarChart2 className="h-3 w-3 mr-1 text-accent" /> Try DamDoh Pro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-md font-semibold">Recent</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1 text-sm">
          <Link href="/pinboard" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Bookmark className="h-4 w-4" /> My Pin Board
          </Link>
          <Link href="/forums" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Users className="h-4 w-4" /> Agricultural Forums
          </Link>
          <Link href="/industry-news" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Newspaper className="h-4 w-4" /> Industry News & Reports
          </Link>
          <Link href="/agri-events" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <CalendarDays className="h-4 w-4" /> Agri-Business Events
          </Link>
           <Link href="/network" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Link2 className="h-4 w-4" /> My Supply Chain Network
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

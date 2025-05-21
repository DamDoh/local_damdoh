
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Users, Newspaper, CalendarDays, BarChart2, Landmark } from "lucide-react";

// Dummy data for current user
const currentUser = {
  name: "Manil Ek",
  title: "Championing smallholder farmers in adopting sustainable regenerative...",
  location: "Cambodia",
  avatarUrl: "https://placehold.co/80x80.png",
  damDohLink: "DamDoh App (damdoh.org)",
  profileViewers: 17,
  postImpressions: 11,
};

export function DashboardLeftSidebar() {
  return (
    <div className="space-y-4 sticky top-20"> {/* top-20 to offset header height */}
      <Card>
        <CardContent className="pt-6 text-center">
          <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-primary">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="profile person" />
            <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <Link href="/profiles/me">
            <h3 className="text-lg font-semibold hover:underline">{currentUser.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground px-2">{currentUser.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{currentUser.location}</p>
          {currentUser.damDohLink && (
            <a href={`https://${currentUser.damDohLink}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block mt-1">
              {currentUser.damDohLink}
            </a>
          )}
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs space-y-1">
          <Link href="#" className="flex justify-between items-center hover:bg-accent/50 p-1 rounded-sm">
            <span>Profile viewers</span>
            <span className="text-primary font-semibold">{currentUser.profileViewers}</span>
          </Link>
          <Link href="#" className="flex justify-between items-center hover:bg-accent/50 p-1 rounded-sm">
            <span>Post impressions</span>
            <span className="text-primary font-semibold">{currentUser.postImpressions}</span>
          </Link>
        </CardContent>
        <hr className="my-2"/>
        <CardContent className="text-xs">
          <p className="text-muted-foreground">Access exclusive sales tools & insights</p>
          <Button variant="link" className="p-0 h-auto text-xs font-semibold">
            <Landmark className="h-3 w-3 mr-1 text-amber-600" /> Try Sales Nav for $0
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-1 text-sm">
          <Link href="#" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Bookmark className="h-4 w-4" /> Saved Items
          </Link>
          <Link href="/forums" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Users className="h-4 w-4" /> Groups (Forums)
          </Link>
          <Link href="#" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <Newspaper className="h-4 w-4" /> Newsletters
          </Link>
          <Link href="#" className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md text-muted-foreground hover:text-foreground">
            <CalendarDays className="h-4 w-4" /> Events
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

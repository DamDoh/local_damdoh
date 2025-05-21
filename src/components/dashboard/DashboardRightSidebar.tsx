
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Info, TrendingUp } from "lucide-react";
import Image from "next/image";
import { MessagingPanel } from "./MessagingPanel"; // Import the new panel

// Dummy data for "Add to your feed" - agricultural focus
const feedSuggestions = [
  { id: 'sug1', name: 'Global Alliance for Food Security', role: 'Non-profit • Sustainable Agriculture', avatarUrl: 'https://placehold.co/50x50.png', dataAiHint: 'organization agriculture' },
  { id: 'sug2', name: 'AgriLogistics Innovators', role: 'Company • Supply Chain Tech', avatarUrl: 'https://placehold.co/50x50.png', dataAiHint: 'company logistics' },
  { id: 'sug3', name: 'DroughtResist Seeds Corp.', role: 'Company • Seed Technology', avatarUrl: 'https://placehold.co/50x50.png', dataAiHint: 'company seeds' },
];

export function DashboardRightSidebar() {
  return (
    <div className="space-y-4 sticky top-20"> {/* top-20 to offset header height */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-semibold">Grow Your Network</CardTitle>
          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {feedSuggestions.map(sug => (
              <li key={sug.id} className="flex items-start gap-3">
                <Avatar className="h-12 w-12 rounded-md">
                  <AvatarImage src={sug.avatarUrl} alt={sug.name} data-ai-hint={sug.dataAiHint}/>
                  <AvatarFallback>{sug.name.substring(0,1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{sug.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{sug.role}</p>
                  <Button variant="outline" size="sm" className="mt-1 h-7 px-2 text-xs">
                    <Plus className="mr-1 h-3 w-3" /> Follow
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="link" className="px-0 text-xs text-muted-foreground hover:text-primary mt-2">
            View all suggestions <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-2 text-right">
            <span className="text-xs text-muted-foreground">Ad <MoreHorizontal className="inline h-3 w-3" /></span>
          </div>
          <p className="text-xs text-muted-foreground text-center px-4">Stay ahead with DamDoh Market Trends!</p>
          <div className="flex justify-center items-center gap-2 my-2 px-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src="https://placehold.co/50x50.png" alt="DamDoh Market Trends Ad" data-ai-hint="market chart agriculture"/>
                <AvatarFallback>DT</AvatarFallback>
            </Avatar>
             <TrendingUp className="h-10 w-10 text-primary" />
          </div>
          <p className="text-sm font-semibold text-center px-4 my-1">Get exclusive insights on commodity prices and supply chain dynamics.</p>
          <div className="px-4 py-3">
            <Button variant="outline" className="w-full">Explore DamDoh Pro Trends</Button>
          </div>
        </CardContent>
      </Card>
      <MessagingPanel />
    </div>
  );
}

// Minimal MoreHorizontal icon as inline SVG if not readily available or for simplicity
const MoreHorizontal = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

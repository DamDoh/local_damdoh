
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Info } from "lucide-react";
import Image from "next/image";
import { MessagingPanel } from "./MessagingPanel"; // Import the new panel

// Dummy data for "Add to your feed"
const feedSuggestions = [
  { id: 'sug1', name: 'Australia Awards Cambodia', role: 'Company • Education Administration Programs', avatarUrl: 'https://placehold.co/50x50.png' },
  { id: 'sug2', name: 'Alex Hormozi', role: 'Day Job: I invest and scale companies at Acquistion.com | Co-Owner, Skool.co...', avatarUrl: 'https://placehold.co/50x50.png' },
  { id: 'sug3', name: 'UNDP Cambodia', role: 'Company • Non-profit Organizations', avatarUrl: 'https://placehold.co/50x50.png' },
];

export function DashboardRightSidebar() {
  return (
    <div className="space-y-4 sticky top-20"> {/* top-20 to offset header height */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-semibold">Add to your feed</CardTitle>
          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {feedSuggestions.map(sug => (
              <li key={sug.id} className="flex items-start gap-3">
                <Avatar className="h-12 w-12 rounded-md">
                  <AvatarImage src={sug.avatarUrl} alt={sug.name} data-ai-hint="company logo person"/>
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
            View all recommendations <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-2 text-right">
            <span className="text-xs text-muted-foreground">Ad <MoreHorizontal className="inline h-3 w-3" /></span>
          </div>
          <p className="text-xs text-muted-foreground text-center px-4">The 2025 Workplace Learning Report is here!</p>
          <div className="flex justify-center items-center gap-2 my-2 px-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src="https://placehold.co/50x50.png" alt="User Ad" data-ai-hint="profile person"/>
                <AvatarFallback>AD</AvatarFallback>
            </Avatar>
             <svg viewBox="0 0 48 48" className="h-10 w-10 text-[#0A66C2]" fill="currentColor" >
                <g>
                    <path d="M41,4H7A3,3,0,0,0,4,7V41a3,3,0,0,0,3,3H41a3,3,0,0,0,3-3V7A3,3,0,0,0,41,4ZM17.1,36.9H11.8V19.7h5.3Zm-2.6-19A3.1,3.1,0,1,1,17.6,15,3.1,3.1,0,0,1,14.5,17.9ZM37,36.9H31.7V27.5c0-2.2-.8-3.8-2.8-3.8s-3.1,1.8-3.1,3.8V36.9H20.6V19.7h5.1V22a5.4,5.4,0,0,1,4.8-2.7c3.5,0,6.1,2.3,6.1,7.2Z"></path>
                </g>
            </svg>
          </div>
          <p className="text-sm font-semibold text-center px-4 my-1">Great companies are built on great careers</p>
          <div className="px-4 py-3">
            <Button variant="outline" className="w-full">Explore Report Now</Button>
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

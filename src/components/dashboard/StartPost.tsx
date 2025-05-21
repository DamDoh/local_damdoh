
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Video, Image as ImageIcon, FileText, Mic } from "lucide-react";

export function StartPost() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40.png" alt="Demo Farmer" data-ai-hint="profile farmer" />
            <AvatarFallback>DF</AvatarFallback> 
          </Avatar>
          <Input 
            placeholder="Share an update, ask about farming, or try writing with AI..." 
            className="flex-grow rounded-full hover:bg-muted/80 focus:bg-muted/90 transition-colors" 
          />
        </div>
        <div className="mt-4 flex justify-around">
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary">
            <ImageIcon className="mr-2 h-5 w-5 text-green-500" /> Photo / Video
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary">
            <CalendarDays className="mr-2 h-5 w-5 text-red-500" /> Farm Event {/* Changed from Video */}
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:bg-accent/50 hover:text-primary">
            <FileText className="mr-2 h-5 w-5 text-orange-500" /> Write article
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Added CalendarDays, assuming it might be needed elsewhere or for future use
import { CalendarDays } from "lucide-react";

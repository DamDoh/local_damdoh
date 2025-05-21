
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, Edit, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import type { DirectMessage } from "@/lib/types";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dummyMessages: DirectMessage[] = [
  { id: 'msg1', senderName: 'AgriLogistics Co-op', lastMessage: 'AgriLogistics Co-op: Your grain shipment is confirmed for Tuesday.', timestamp: '10:30 AM', senderAvatarUrl: 'https://placehold.co/40x40.png', unread: true, dataAiHint: "logistics company" },
  { id: 'msg2', senderName: 'Dr. Chen (Soil Scientist)', lastMessage: 'Dr. Chen sent the soil analysis report for your West field.', timestamp: 'Yesterday', senderAvatarUrl: 'https://placehold.co/40x40.png', dataAiHint: "scientist profile" },
  { id: 'msg3', senderName: 'Export Africa Group', lastMessage: 'Export Africa Group: New RFP for organic cashews posted.', timestamp: 'May 12', senderAvatarUrl: 'https://placehold.co/40x40.png', dataAiHint: "trade group" },
  { id: 'msg4', senderName: 'Fertilizer Direct', lastMessage: 'Sponsored: Early bird discount on potassium sulfate this week!', timestamp: 'May 10', senderAvatarUrl: 'https://placehold.co/40x40.png', dataAiHint: "fertilizer product" },
  { id: 'msg5', senderName: 'SunValley Tractors', lastMessage: 'SunValley Tractors: Your maintenance appointment for the harvester is due.', timestamp: 'May 8', senderAvatarUrl: 'https://placehold.co/40x40.png', dataAiHint: "tractor service" },
  { id: 'msg6', senderName: 'Local Farmers Market Hub', lastMessage: 'Local Farmers Market Hub: Stall applications for next season are open.', timestamp: 'May 5', senderAvatarUrl: 'https://placehold.co/40x40.png', dataAiHint: "market group" },
];


export function MessagingPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMessages = dummyMessages.filter(msg => 
    msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) {
    return (
      <Card className="fixed bottom-0 right-4 w-72 shadow-xl rounded-t-lg z-40">
        <CardHeader className="p-3 flex flex-row items-center justify-between cursor-pointer border-b" onClick={() => setIsOpen(true)}>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="Current User" data-ai-hint="profile farmer"/>
              <AvatarFallback>CU</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-sm">Messaging</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ChevronUp className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-0 right-4 w-80 h-[60vh] max-h-[700px] shadow-xl rounded-t-lg flex flex-col z-40">
      <CardHeader className="p-3 flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2">
           <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/40x40.png" alt="Current User" data-ai-hint="profile agricultural" />
            <AvatarFallback>CU</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-sm">Messaging</h3>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}><ChevronDown className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col overflow-hidden">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search messages (e.g., 'soybean prices')" 
              className="pl-8 h-8 text-xs rounded-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
             <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6">
                <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <Tabs defaultValue="focused" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-9">
            <TabsTrigger value="focused" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Focused</TabsTrigger>
            <TabsTrigger value="other" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">Other</TabsTrigger>
          </TabsList>
          <TabsContent value="focused" className="flex-grow overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="py-2">
                {filteredMessages.map(msg => (
                  <div key={msg.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent/50 cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={msg.senderAvatarUrl} alt={msg.senderName} data-ai-hint={msg.dataAiHint || "profile person"} />
                      <AvatarFallback>{msg.senderName.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <p className={`text-sm font-medium truncate ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{msg.senderName}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{msg.timestamp}</p>
                      </div>
                      <p className={`text-xs truncate ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{msg.lastMessage}</p>
                    </div>
                  </div>
                ))}
                {filteredMessages.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No messages found.</p>}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="other" className="flex-grow overflow-hidden m-0">
             <ScrollArea className="h-full">
                <p className="p-4 text-center text-sm text-muted-foreground">Automated notifications and less critical messages will appear here.</p>
             </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      {/* Footer can be added if needed */}
    </Card>
  );
}

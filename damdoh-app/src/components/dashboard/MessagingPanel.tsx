
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Search, MoreHorizontal, Edit, ChevronDown, ChevronUp, Settings2, Send, ArrowLeft } from "lucide-react";
import type { DirectMessage } from "@/lib/types";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dummyDirectMessages, dummyUsersData } from "@/lib/dummy-data";
import { cn } from '@/lib/utils';
import { useTranslation } from "react-i18next";

interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
}

interface DummyConversation {
  id: string;
  name: string;
  messages: ChatMessage[];
}

const dummyConversations: Record<string, DummyConversation> = {
  'msg1': {
    id: 'msg1',
    name: 'AgriLogistics Co-op',
    messages: [
      { id: 'm1-1', sender: 'other', text: 'Your grain shipment is confirmed for Tuesday.', timestamp: '10:30 AM' },
      { id: 'm1-2', sender: 'user', text: 'Great, thanks for the update!', timestamp: '10:32 AM' },
    ]
  },
  'msg2': {
    id: 'msg2',
    name: 'Dr. Chen (Soil Scientist)',
    messages: [
      { id: 'm2-1', sender: 'other', text: 'Dr. Chen sent the soil analysis report for your West field.', timestamp: 'Yesterday' },
    ]
  },
  'msg3': {
    id: 'msg3',
    name: 'Export Africa Group',
    messages: [
      { id: 'm3-1', sender: 'other', text: 'New RFP for organic cashews posted.', timestamp: 'May 12' },
      { id: 'm3-2', sender: 'user', text: 'Interesting, I will take a look.', timestamp: 'May 12' },
      { id: 'm3-3', sender: 'other', text: 'Let me know if you have any questions.', timestamp: 'May 12' },
    ]
  },
};

export function MessagingPanel() {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const messagesToDisplay = dummyDirectMessages;
  const currentUserAvatar = dummyUsersData['currentUser']?.avatarUrl || "https://placehold.co/40x40.png";
  const currentUserName = dummyUsersData['currentUser']?.name || "Current User";


  const filteredMessages = messagesToDisplay.filter(msg => 
    msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;
    console.log(`Sending message to ${selectedConversationId}: ${newMessage}`);
    setNewMessage("");
  };

  const renderConversationList = () => (
    <>
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder={t('messagingPanel.searchPlaceholder')} 
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
          <TabsTrigger value="focused" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">{t('messagingPanel.focusedTab')}</TabsTrigger>
          <TabsTrigger value="other" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">{t('messagingPanel.otherTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="focused" className="flex-grow overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="py-2">
              {filteredMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "p-3 flex gap-3 cursor-pointer hover:bg-accent",
                    selectedConversationId === msg.id && "bg-accent"
                  )}
                  onClick={() => handleSelectConversation(msg.id)}
                >
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
              {filteredMessages.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t('messagingPanel.noMessages')}</p>}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="other" className="flex-grow overflow-hidden m-0">
           <ScrollArea className="h-full">
              <p className="p-4 text-center text-sm text-muted-foreground">{t('messagingPanel.otherTabDescription')}</p>
           </ScrollArea>
        </TabsContent>
      </Tabs>
    </>
  );

  const selectedConversation = selectedConversationId ? dummyConversations[selectedConversationId] : null;

  const renderChatView = () => {
    if (!selectedConversation) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="p-3 flex items-center border-b">
          <Button variant="ghost" size="icon" className="h-7 w-7 mr-2" onClick={() => setSelectedConversationId(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={dummyDirectMessages.find(dm => dm.id === selectedConversationId)?.senderAvatarUrl} alt={selectedConversation.name} data-ai-hint="profile agriculture" />
            <AvatarFallback>{selectedConversation.name.substring(0,1)}</AvatarFallback>
          </Avatar>
          <h4 className="font-semibold text-sm truncate">{selectedConversation.name}</h4>
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto"><MoreHorizontal className="h-4 w-4" /></Button>
        </div>

        <ScrollArea className="flex-grow p-3 space-y-3">
          {selectedConversation.messages.map(message => (
            <div 
              key={message.id} 
              className={cn(
                "flex w-full", 
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className="flex items-end gap-2 max-w-[75%]">
                {message.sender === 'other' && (
                  <Avatar className="h-6 w-6 self-end shrink-0">
                    <AvatarImage src={dummyDirectMessages.find(dm => dm.id === selectedConversationId)?.senderAvatarUrl} alt={selectedConversation.name} data-ai-hint="profile user person"/>
                    <AvatarFallback>{selectedConversation.name.substring(0,1)}</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={cn(
                    "p-2 rounded-lg text-sm shadow-sm",
                    message.sender === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                  )}
                >
                  <p className="break-words whitespace-pre-line">{message.text}</p>
                  <p className={cn(
                      "text-xs mt-1",
                      message.sender === 'user' ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left"
                    )}>{message.timestamp}</p>
                </div>
                {message.sender === 'user' && (
                   <Avatar className="h-6 w-6 self-end shrink-0">
                    <AvatarImage src={currentUserAvatar} alt={currentUserName} data-ai-hint="profile farmer business"/>
                    <AvatarFallback>{currentUserName.substring(0,1)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-2 border-t flex items-center gap-2">
          <Textarea
            placeholder={t('messagingPanel.textareaPlaceholder')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={1}
            className="min-h-[40px] max-h-[100px] resize-none text-sm flex-grow rounded-full px-4 py-2 focus-visible:ring-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button type="submit" size="icon" className="rounded-full w-9 h-9" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  };


  if (!isOpen) {
    return (
      <Card className="fixed bottom-0 right-4 w-72 shadow-xl rounded-t-lg z-40">
        <CardHeader 
          className="p-3 flex flex-row items-center justify-between cursor-pointer border-b bg-[#6ec33f] text-primary-foreground rounded-t-lg" 
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-white/50">
              <AvatarImage src={currentUserAvatar} alt={currentUserName} data-ai-hint="profile farmer"/>
              <AvatarFallback>{currentUserName.substring(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-sm">{t('messagingPanel.headerTitle')}</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-white/20">
            <ChevronUp className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-0 right-4 w-80 h-[60vh] max-h-[700px] shadow-xl rounded-t-lg flex flex-col z-40 bg-background">
      <CardHeader className="p-3 flex flex-row items-center justify-between border-b bg-[#6ec33f] text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
           <Avatar className="h-8 w-8 border border-white/50">
            <AvatarImage src={currentUserAvatar} alt={currentUserName} data-ai-hint="profile agricultural" />
            <AvatarFallback>{currentUserName.substring(0,1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-sm">{t('messagingPanel.headerTitle')}</h3>
        </div>
        <div className="flex items-center">
          {!selectedConversationId && <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-white/20"><Edit className="h-4 w-4" /></Button>}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-white/20" onClick={() => setIsOpen(false)}><ChevronDown className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col overflow-hidden">
        {selectedConversationId ? renderChatView() : renderConversationList()}
      </CardContent>
    </Card>
  );
}

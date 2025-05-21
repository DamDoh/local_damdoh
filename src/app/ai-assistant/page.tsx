
"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Leaf, Info, Send, Volume2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { askFarmingAssistant, type FarmingAssistantOutput } from '@/ai/flows/farming-assistant-flow';
import { APP_NAME } from '@/lib/constants';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | FarmingAssistantOutput;
  timestamp: Date;
}

export default function AiAssistantPage() {
  const [inputQuery, setInputQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [chatHistory]);
  
  useEffect(() => {
    // Initial welcome message
    setChatHistory([
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: {
          summary: `Welcome to ${APP_NAME} AI Knowledge! How can I help you today with sustainable farming, agricultural supply chains, farming business, or navigating the ${APP_NAME} app?`,
          detailedPoints: [],
        },
        timestamp: new Date(),
      },
    ]);
  }, []);


  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const aiResponse = await askFarmingAssistant({ query });
      const newAssistantMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorAssistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now() + 1}`,
        role: 'assistant',
        content: {
          summary: "Sorry, I encountered an error trying to process your request. Please try again.",
          detailedPoints: [],
        },
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto">
      <Card className="flex-grow flex flex-col overflow-hidden shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="h-6 w-6 text-primary" />
            <span>{APP_NAME} AI Farming Assistant</span>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow p-4 space-y-6" ref={scrollAreaRef}>
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <Avatar className="h-8 w-8 self-start border">
                  <AvatarImage src="/placeholder-logo.png" alt="AI Avatar" data-ai-hint="logo damdoh" />
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-lg rounded-br-none p-3 shadow' : ''}`}>
                {msg.role === 'user' && typeof msg.content === 'string' && (
                  <p className="text-sm">{msg.content}</p>
                )}
                {msg.role === 'assistant' && typeof msg.content === 'object' && (
                  <Card className="bg-card/80 shadow-md">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center text-md gap-1.5 text-primary">
                          <Leaf className="h-5 w-5" /> DamDoh AI's Knowledge
                        </CardTitle>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => alert("Audio playback feature coming soon!")}>
                          <Volume2 className="mr-1.5 h-3.5 w-3.5" /> Play Audio
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm mb-3 whitespace-pre-line">{msg.content.summary}</p>
                      {msg.content.detailedPoints && msg.content.detailedPoints.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                          {msg.content.detailedPoints.map((point, index) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-muted-foreground/20">
                              <AccordionTrigger className="text-sm hover:no-underline py-2.5">
                                <div className="flex items-center gap-2">
                                  <Info className="h-4 w-4 text-primary/80" />
                                  <span>{point.title}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-muted-foreground pt-1 pb-3 whitespace-pre-line">
                                {point.content}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
               {msg.role === 'user' && (
                <Avatar className="h-8 w-8 self-start border">
                   <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="profile person" />
                  <AvatarFallback><User size={18}/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 self-start border">
                  <AvatarImage src="/placeholder-logo.png" alt="AI Avatar" data-ai-hint="logo damdoh" />
                  <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
                <div className="max-w-[80%]">
                    <Card className="bg-card/80 shadow-md">
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[220px]" />
                        </CardContent>
                    </Card>
                </div>
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Ask about farming, the supply chain, or DamDoh features..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-grow text-sm"
              disabled={isLoading}
              autoFocus
            />
            <Button type="submit" disabled={isLoading || !inputQuery.trim()}>
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

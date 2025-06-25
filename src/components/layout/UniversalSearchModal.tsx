"use client";

import { useState, useEffect, FormEvent, Fragment } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, User, Search, Send, Sparkles, ShoppingCart, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';

import { askFarmingAssistant, type FarmingAssistantOutput } from '@/ai/flows/farming-assistant-flow';
import { interpretSearchQuery, type SmartSearchInterpretation } from '@/ai/flows/query-interpreter-flow';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | FarmingAssistantOutput;
  interpretation?: SmartSearchInterpretation | null;
}

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function UniversalSearchModal({ isOpen, onClose, initialQuery = "" }: UniversalSearchModalProps) {
  const [currentQuery, setCurrentQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialQuery && chatHistory.length === 0) {
      // If the modal is opened with an initial query, start the conversation
      handleQuerySubmit(initialQuery);
    } else if (!isOpen) {
      // Reset when closed
      setChatHistory([]);
      setCurrentQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuery]);

  const handleQuerySubmit = async (queryToSubmit: string) => {
    if (!queryToSubmit.trim()) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryToSubmit,
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setCurrentQuery("");
    setIsLoading(true);

    try {
      // For a universal search, we can run two things in parallel:
      // 1. Get a direct conversational answer.
      // 2. Interpret the query for structured results (which we can render later).
      const [aiResponse, interpretation] = await Promise.all([
        askFarmingAssistant({ query: queryToSubmit }),
        interpretSearchQuery({ rawQuery: queryToSubmit })
      ]);
      
      const newAssistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        interpretation: interpretation,
      };
      setChatHistory(prev => [...prev, newAssistantMessage]);

    } catch (error) {
      console.error("Error in universal search:", error);
      const errorAssistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: {
          summary: "Sorry, I encountered an error. Please try again.",
          detailedPoints: [],
          suggestedQueries: [],
        },
      };
      setChatHistory(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleQuerySubmit(currentQuery);
  }

  const renderAssistantMessage = (message: ChatMessage) => {
    if (typeof message.content === 'string') return null;

    const { summary, detailedPoints, suggestedQueries } = message.content;
    const interpretation = message.interpretation;

    return (
      <div className='space-y-4'>
        <p className="text-sm whitespace-pre-line">{summary}</p>
        
        {interpretation && interpretation.suggestedFilters && interpretation.suggestedFilters.length > 0 && (
          <div className="p-3 border bg-muted/50 rounded-lg">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Suggested Filters</h4>
            <div className="flex flex-wrap gap-2">
              {interpretation.suggestedFilters.map((filter, idx) => (
                <Button key={idx} variant="outline" size="sm" className="text-xs h-auto" asChild>
                  <Link href={`/search?q=${interpretation.originalQuery}&filter_${filter.type}=${filter.value}`}>
                    {filter.type}: {filter.value}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}

        {detailedPoints && detailedPoints.length > 0 && (
            <div className="space-y-2">
                {detailedPoints.map((point, index) => (
                    <div key={index} className="p-3 border rounded-md">
                        <h4 className="font-semibold text-sm">{point.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{point.content}</p>
                    </div>
                ))}
            </div>
        )}
        
        {suggestedQueries && suggestedQueries.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Related Topics</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((query, index) => (
                <Button key={index} variant="secondary" size="sm" className="text-xs h-auto" onClick={() => handleQuerySubmit(query)}>
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className='p-4 border-b'>
          <DialogTitle className='flex items-center gap-2'><Sparkles className="h-5 w-5 text-primary" /> Universal Search Assistant</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-grow px-4">
          <div className='space-y-6 py-4'>
            {chatHistory.map(msg => (
               <div key={msg.id} className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback><Bot size={18}/></AvatarFallback>
                  </Avatar>
                 )}
                 <div className={`p-3 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.role === 'user' && typeof msg.content === 'string' && <p className="text-sm">{msg.content}</p>}
                  {msg.role === 'assistant' && renderAssistantMessage(msg)}
                 </div>
                 {msg.role === 'user' && (
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback><User size={18}/></AvatarFallback>
                  </Avatar>
                 )}
               </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted space-y-2 w-1/2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmitForm} className="flex items-center gap-2">
            <Input 
              placeholder="Ask the AI or search for anything..."
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              className="h-10 text-sm"
              disabled={isLoading}
              autoFocus
            />
            <Button type="submit" disabled={isLoading || !currentQuery.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import type { Conversation, Message } from '@/lib/types';
import { dummyDirectMessages, dummyUsersData } from '@/lib/dummy-data';

// Mock function to simulate fetching conversations
const getMockConversations = async (): Promise<Conversation[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return dummyDirectMessages.map(dm => ({
        id: dm.id,
        participant: {
            id: dm.id.replace('msg', 'user'), // Create a user id from message id
            name: dm.senderName,
            avatarUrl: dm.senderAvatarUrl,
        },
        lastMessage: dm.lastMessage,
        timestamp: dm.timestamp,
        unreadCount: dm.unread ? Math.floor(Math.random() * 3) + 1 : 0,
    }));
};

// Mock function to simulate fetching messages for a conversation
const getMockMessages = async (conversationId: string): Promise<Message[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const convData = dummyDirectMessages.find(dm => dm.id === conversationId);
    // In a real app, you'd fetch messages for the specific conversationId
    return [
        { id: "msg1", senderId: "user1", content: "Hi there! I saw your marketplace listing for organic ginger.", timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: "msg2", senderId: "currentUser", content: "Hey there! Glad you found it. Are you interested in placing an order?", timestamp: new Date(Date.now() - 7100000).toISOString() },
        { id: "msg3", senderId: "user1", content: convData?.lastMessage || "Yes, can you confirm the pricing for 50kg?", timestamp: new Date(Date.now() - 300000).toISOString() },
    ];
};

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const searchParams = useSearchParams();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleConversationSelect = useCallback(async (conversation: Conversation) => {
        if (selectedConversation?.id === conversation.id) return;

        setSelectedConversation(conversation);
        setIsLoadingMessages(true);
        setMessages([]); // Clear previous messages
        try {
            const data = await getMockMessages(conversation.id);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [selectedConversation?.id]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
    }, [messages]);


    useEffect(() => {
        const fetchAndSelectConversation = async () => {
            const data = await getMockConversations();
            setConversations(data);
            setIsLoadingConversations(false);
            
            const sellerIdQuery = searchParams.get('with');
            if (sellerIdQuery) {
                // In a real app, you might need to check if a conversation exists
                // or create a new one. For this mock, we'll find a matching user if possible.
                const targetConvo = data.find(c => c.participant.id === sellerIdQuery);
                if (targetConvo) {
                    handleConversationSelect(targetConvo);
                } else {
                    // Create a temporary conversation for the UI
                    const sellerProfile = dummyUsersData[sellerIdQuery];
                    if (sellerProfile) {
                        const newConvo: Conversation = {
                            id: `temp-${sellerIdQuery}`,
                            participant: { id: sellerIdQuery, name: sellerProfile.name, avatarUrl: sellerProfile.avatarUrl },
                            lastMessage: `Start a conversation with ${sellerProfile.name}`,
                            timestamp: new Date().toISOString(),
                            unreadCount: 0
                        };
                        setConversations(prev => [newConvo, ...prev]);
                        setSelectedConversation(newConvo);
                        setMessages([]); // Start with empty messages
                        setIsLoadingMessages(false);
                    }
                }
            } else if (data.length > 0) {
                handleConversationSelect(data[0]);
            }
        };
        fetchAndSelectConversation();
    }, [searchParams, handleConversationSelect]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newMessage.trim() || !selectedConversation) return;
        
        const message: Message = {
            id: `msg-${Math.random()}`,
            senderId: 'currentUser',
            content: newMessage,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        // Here you would call the `sendMessage` backend function
    };

    return (
        <Card className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-[300px_1fr] overflow-hidden">
            {/* Conversations List Panel */}
            <div className="flex flex-col border-r h-full">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Messages</h2>
                    <div className="relative mt-2">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder="Search messages..." className="pl-10"/>
                    </div>
                </div>
                <ScrollArea className="flex-grow">
                    {isLoadingConversations ? (
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        conversations.map(convo => (
                            <div 
                                key={convo.id} 
                                className={cn(
                                    "p-4 flex gap-3 cursor-pointer hover:bg-accent",
                                    selectedConversation?.id === convo.id && "bg-accent"
                                )}
                                onClick={() => handleConversationSelect(convo)}
                            >
                                <Avatar>
                                    <AvatarImage src={convo.participant.avatarUrl} data-ai-hint="profile agriculture" />
                                    <AvatarFallback>{convo.participant.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold truncate">{convo.participant.name}</h3>
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(convo.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </div>

            {/* Active Chat Panel */}
            <div className="flex flex-col h-full bg-muted/30">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3 bg-background">
                            <Avatar>
                                <AvatarImage src={selectedConversation.participant.avatarUrl} data-ai-hint="profile person agriculture" />
                                <AvatarFallback>{selectedConversation.participant.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
                        </div>
                        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                            {isLoadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={cn(
                                            "flex gap-2 items-end",
                                            msg.senderId === 'currentUser' ? "justify-end" : "justify-start"
                                        )}>
                                            {msg.senderId !== 'currentUser' && <Avatar className="h-6 w-6"><AvatarImage src={selectedConversation.participant.avatarUrl}/><AvatarFallback>{selectedConversation.participant.name.substring(0,1)}</AvatarFallback></Avatar>}
                                            <div className={cn(
                                                "p-3 rounded-lg max-w-xs lg:max-w-md shadow-sm",
                                                msg.senderId === 'currentUser' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background rounded-bl-none"
                                            )}>
                                                {msg.content}
                                            </div>
                                             {msg.senderId === 'currentUser' && <Avatar className="h-6 w-6"><AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="profile person" /><AvatarFallback>ME</AvatarFallback></Avatar>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input 
                                    placeholder="Type your message..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button type="submit" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        {isLoadingConversations ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                        ) : (
                            <>
                                <MessageSquare className="h-12 w-12 mb-4"/>
                                <p>Select a conversation to start chatting</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}

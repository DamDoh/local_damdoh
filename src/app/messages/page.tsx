
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import type { Conversation, Message } from '@/lib/types'; // Assuming these types exist

// Mock function to simulate fetching conversations
const getMockConversations = async (): Promise<Conversation[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: "conv1", participant: { id: "user1", name: "Jane Doe", avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }, lastMessage: "That's a great idea, let's connect tomorrow.", timestamp: new Date().toISOString(), unreadCount: 2 },
        { id: "conv2", participant: { id: "user2", name: "John Smith", avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026705d" }, lastMessage: "Can you send over the soil analysis report?", timestamp: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0 },
        { id: "conv3", participant: { id: "user3", name: "AgriCorp Supplies", avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026706d" }, lastMessage: "Your order has been shipped.", timestamp: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0 },
    ];
};

// Mock function to simulate fetching messages for a conversation
const getMockMessages = async (conversationId: string): Promise<Message[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: "msg1", senderId: "user1", content: "Hi there! I saw your post about organic pesticides.", timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: "msg2", senderId: "currentUser", content: "Hey Jane! Yes, glad you found it useful.", timestamp: new Date(Date.now() - 7100000).toISOString() },
        { id: "msg3", senderId: "user1", content: "That's a great idea, let's connect tomorrow.", timestamp: new Date(Date.now() - 300000).toISOString() },
    ];
};


export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const fetchConversations = async () => {
            const data = await getMockConversations();
            setConversations(data);
            setIsLoadingConversations(false);
            if (data.length > 0) {
                handleConversationSelect(data[0]);
            }
        };
        fetchConversations();
    }, []);

    const handleConversationSelect = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setIsLoadingMessages(true);
        const data = await getMockMessages(conversation.id);
        setMessages(data);
        setIsLoadingMessages(false);
    };
    
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
        <div className="container mx-auto h-[calc(100vh-8rem)] py-8">
            <Card className="h-full grid grid-cols-1 md:grid-cols-[300px_1fr]">
                {/* Conversations List Panel */}
                <div className="flex flex-col border-r">
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
                                        <AvatarImage src={convo.participant.avatarUrl} />
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
                <div className="flex flex-col h-full">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={selectedConversation.participant.avatarUrl} />
                                    <AvatarFallback>{selectedConversation.participant.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
                            </div>
                            <ScrollArea className="flex-grow p-4 bg-muted/50">
                                {isLoadingMessages ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-12 w-3/4" />
                                        <Skeleton className="h-12 w-3/4 ml-auto" />
                                        <Skeleton className="h-12 w-3/4" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map(msg => (
                                            <div key={msg.id} className={cn(
                                                "flex gap-2",
                                                msg.senderId === 'currentUser' ? "justify-end" : "justify-start"
                                            )}>
                                                <div className={cn(
                                                    "p-3 rounded-lg max-w-xs lg:max-w-md",
                                                    msg.senderId === 'currentUser' ? "bg-primary text-primary-foreground" : "bg-background border"
                                                )}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                            <div className="p-4 border-t">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input 
                                        placeholder="Type your message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <Button type="submit">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mb-4"/>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

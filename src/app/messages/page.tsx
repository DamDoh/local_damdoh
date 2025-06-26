"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import type { Conversation, Message } from '@/lib/types';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';

const functions = getFunctions(firebaseApp);
const getConversationsCallable = httpsCallable(functions, 'getConversationsForUser');
const getMessagesCallable = httpsCallable(functions, 'getMessagesForConversation');
const sendMessageCallable = httpsCallable(functions, 'sendMessage');
const getOrCreateConversationCallable = httpsCallable(functions, 'getOrCreateConversation');

function MessagingContent() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleConversationSelect = useCallback(async (conversation: Conversation) => {
        if (selectedConversation?.id === conversation.id && messages.length > 0) return;

        setSelectedConversation(conversation);
        setIsLoadingMessages(true);
        setMessages([]);
        try {
            const result = await getMessagesCallable({ conversationId: conversation.id });
            const data = result.data as { messages: Message[] };
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Failed to fetch messages", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load messages for this conversation." });
        } finally {
            setIsLoadingMessages(false);
        }
    }, [selectedConversation?.id, messages.length, toast]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
    }, [messages]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setIsLoadingConversations(false);
            return;
        }

        const fetchInitialData = async () => {
            setIsLoadingConversations(true);
            try {
                const convResult = await getConversationsCallable();
                const convos = (convResult.data as { conversations: Conversation[] }).conversations || [];
                setConversations(convo);

                const recipientId = searchParams.get('with');
                if (recipientId) {
                    const existingConvo = convos.find(c => c.participant?.id === recipientId);
                    if (existingConvo) {
                        await handleConversationSelect(existingConvo);
                    } else {
                        const result = await getOrCreateConversationCallable({ recipientId });
                        const { conversationId } = result.data as { conversationId: string };
                        const newConvResult = await getConversationsCallable();
                        const newConvos = (newConvResult.data as { conversations: Conversation[] }).conversations || [];
                        setConversations(newConvos);
                        const newCreatedConvo = newConvos.find(c => c.id === conversationId);
                        if (newCreatedConvo) {
                            await handleConversationSelect(newCreatedConvo);
                        }
                    }
                } else if (convos.length > 0) {
                    await handleConversationSelect(convos[0]);
                }
            } catch (error) {
                console.error("Error fetching initial conversations:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load your conversations." });
            } finally {
                setIsLoadingConversations(false);
            }
        };

        fetchInitialData();
    }, [user, authLoading, searchParams, toast, handleConversationSelect]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newMessage.trim() || !selectedConversation || !user) return;
        
        const tempId = `temp-${Date.now()}`;
        const message: Message = {
            id: tempId,
            conversationId: selectedConversation.id,
            senderId: user.uid,
            content: newMessage,
            timestamp: new Date().toISOString()
        };
        
        const originalMessage = newMessage;
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        setIsSending(true);

        try {
            await sendMessageCallable({ conversationId: selectedConversation.id, content: originalMessage });
        } catch (error) {
            console.error("Failed to send message", error);
            toast({ variant: "destructive", title: "Send Failed", description: "Your message could not be sent." });
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove optimistic message on failure
            setNewMessage(originalMessage);
        } finally {
             setIsSending(false);
        }
    };
    
    if (authLoading) {
        return <MessagingSkeleton />;
    }

    if (!user) {
        return (
            <Card className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Please sign in to view your messages.</p>
                    <Button asChild className="mt-4"><Link href="/auth/signin">Sign In</Link></Button>
                </div>
            </Card>
        );
    }

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
                    ) : conversations.length > 0 ? (
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
                                            {convo.lastMessageTimestamp ? new Date(convo.lastMessageTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">No conversations yet.</div>
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
                                            msg.senderId === user.uid ? "justify-end" : "justify-start"
                                        )}>
                                            {msg.senderId !== user.uid && <Avatar className="h-6 w-6"><AvatarImage src={selectedConversation.participant.avatarUrl}/><AvatarFallback>{selectedConversation.participant.name.substring(0,1)}</AvatarFallback></Avatar>}
                                            <div className={cn(
                                                "p-3 rounded-lg max-w-xs lg:max-w-md shadow-sm",
                                                msg.senderId === user.uid ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background rounded-bl-none"
                                            )}>
                                                {msg.content}
                                            </div>
                                             {msg.senderId === user.uid && <Avatar className="h-6 w-6"><AvatarImage src={user.photoURL || undefined} data-ai-hint="profile person" /><AvatarFallback>ME</AvatarFallback></Avatar>}
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
                                    disabled={isSending}
                                />
                                <Button type="submit" disabled={!newMessage.trim() || isSending}>
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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

const MessagingSkeleton = () => (
    <Card className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-[300px_1fr] overflow-hidden">
        <div className="flex flex-col border-r h-full">
            <div className="p-4 border-b space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-9 w-full" />
            </div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
        <div className="flex flex-col h-full bg-muted/30">
             <div className="p-4 border-b flex items-center gap-3 bg-background">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex-grow p-4"></div>
            <div className="p-4 border-t bg-background">
                 <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </Card>
)

export default function MessagesPage() {
    return (
        <Suspense fallback={<MessagingSkeleton />}>
            <MessagingContent />
        </Suspense>
    )
}
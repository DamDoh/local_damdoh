
"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import type { UserProfile, Conversation, Message } from '@/lib/types';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { getProfileByIdFromDB } from '@/lib/server-actions';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { getFirestore, collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';


const functions = getFunctions(firebaseApp);
const db = getFirestore(firebaseApp);


function MessagingContent() {
    const t = useTranslations('messagingPage');
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
    const [recipientProfile, setRecipientProfile] = useState<UserProfile | null>(null);

    const getConversationsCallable = useCallback(() => httpsCallable(functions, 'messages-getConversationsForUser')(), [functions]);
    const sendMessageCallable = useCallback((conversationId: string, content: string) => httpsCallable(functions, 'messages-sendMessage')({ conversationId, content }), [functions]);
    const getOrCreateConversationCallable = useCallback((recipientId: string) => httpsCallable(functions, 'messages-getOrCreateConversation')({ recipientId }), [functions]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = useCallback(async () => {
        if (!user) {
            setIsLoadingConversations(false);
            return [];
        }
        setIsLoadingConversations(true);
        try {
            const convResult = await getConversationsCallable();
            const convos = (convResult.data as any)?.conversations ?? [];
            setConversations(convos);
            return convos;
        } catch (error) {
            console.error("Error fetching conversations:", error);
            toast({ variant: "destructive", title: t('error'), description: t('couldNotLoadConversations') });
            return [];
        } finally {
            setIsLoadingConversations(false);
        }
    }, [getConversationsCallable, user, toast, t]);
    
    // Real-time listener for messages of the selected conversation
    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        setIsLoadingMessages(true);
        const messagesQuery = query(
            collection(db, 'conversations', selectedConversation.id, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages: Message[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    conversationId: selectedConversation.id,
                    senderId: data.senderId,
                    content: data.content,
                    timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString()
                };
            });
            setMessages(fetchedMessages);
            setIsLoadingMessages(false);
        }, (error) => {
            console.error("Error listening to messages:", error);
            toast({ variant: "destructive", title: "Connection Error", description: "Could not listen for new messages." });
            setIsLoadingMessages(false);
        });

        // Cleanup listener when conversation changes or component unmounts
        return () => unsubscribe();

    }, [selectedConversation, toast]);

    // This useEffect is for INITIAL load and handling deep links
    useEffect(() => {
        if (authLoading || !user) {
            setIsLoadingConversations(false);
            return;
        }
        
        const initializeMessaging = async () => {
            const allConvos = await fetchConversations();
            const recipientId = searchParams.get('with');

            if (recipientId) {
                const existingConvo = allConvos.find((c: Conversation) => c.participant?.id === recipientId);
                if (existingConvo) {
                    setSelectedConversation(existingConvo);
                } else {
                    try {
                        const profile = await getProfileByIdFromDB(recipientId);
                        setRecipientProfile(profile);
                        const result = await getOrCreateConversationCallable(recipientId);
                        const { conversationId } = result.data as { conversationId: string };
                        const newConvos = await fetchConversations();
                        const newCreatedConvo = newConvos.find((c: any) => c.id === conversationId);
                        if (newCreatedConvo) {
                            setSelectedConversation(newCreatedConvo);
                        }
                    } catch (error) {
                        console.error("Error creating new conversation:", error);
                        toast({ variant: "destructive", title: t('error'), description: t('couldNotStartConversation') });
                    }
                }
            } else if (allConvos.length > 0 && !selectedConversation) {
                setSelectedConversation(allConvos[0]);
            }
        };

        initializeMessaging();
    // We only want this to run once on initial load, or if user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentConvo = selectedConversation;
        if (!newMessage.trim() || !currentConvo || !user) return;
        
        const messageToSend = newMessage;
        setNewMessage("");
        setIsSending(true);

        try {
            await sendMessageCallable(currentConvo.id, messageToSend);
            // The onSnapshot listener will update the messages automatically.
            // We just need to refetch the conversation list to update the lastMessage preview.
            fetchConversations();
        } catch (error) {
            console.error("Failed to send message", error);
            toast({ variant: "destructive", title: t('sendFailed'), description: t('couldNotSendMessage') });
            setNewMessage(messageToSend); // Restore message on failure
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
                    <p className="text-muted-foreground">{t('signInToView')}</p>
                    <Button asChild className="mt-4"><Link href="/auth/signin">{t('signIn')}</Link></Button>
                </div>
            </Card>
        );
    }

    const conversationHeaderProfile = selectedConversation?.participant || recipientProfile;
    const showChatPanel = !!conversationHeaderProfile;

    return (
        <Card className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] overflow-hidden">
            <div className={cn("flex flex-col border-r h-full", showChatPanel && "hidden md:flex")}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">{t('title')}</h2>
                    <div className="relative mt-2">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input placeholder={t('searchPlaceholder')} className="pl-10"/>
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
                                onClick={() => setSelectedConversation(convo)}
                            >
                                <Avatar>
                                    <AvatarImage src={convo.participant.avatarUrl} data-ai-hint="profile agriculture" />
                                    <AvatarFallback>{convo.participant.name?.substring(0,2) ?? '??'}</AvatarFallback>
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
                        <div className="p-8 text-center text-sm text-muted-foreground">{t('noConversations')}</div>
                    )}
                </ScrollArea>
            </div>

            <div className={cn("flex flex-col h-full bg-muted/30", !showChatPanel && "flex")}>
                {showChatPanel ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3 bg-background">
                            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 mr-2" onClick={() => setSelectedConversation(null)}>
                                <ArrowLeft className="h-4 w-4"/>
                            </Button>
                            <Avatar>
                                <AvatarImage src={conversationHeaderProfile?.avatarUrl} data-ai-hint="profile person agriculture" />
                                <AvatarFallback>{conversationHeaderProfile?.name?.substring(0,2) ?? '??'}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{conversationHeaderProfile?.name}</h3>
                        </div>
                        <ScrollArea className="flex-grow p-4">
                            {isLoadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages && messages.length > 0 ? (
                                        messages.map(msg => (
                                            <div key={msg.id} className={cn("flex gap-2 items-end", msg.senderId === user.uid ? "justify-end" : "justify-start")}>
                                                {msg.senderId !== user.uid && <Avatar className="h-6 w-6 self-end"><AvatarImage src={conversationHeaderProfile?.avatarUrl}/><AvatarFallback>{conversationHeaderProfile?.name?.substring(0,1) ?? '?'}</AvatarFallback></Avatar>}
                                                <div className={cn("p-3 rounded-lg max-w-xs lg:max-w-md shadow-sm", msg.senderId === user.uid ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background rounded-bl-none")}>
                                                    <p className="whitespace-pre-line break-words">{msg.content}</p>
                                                </div>
                                                 {msg.senderId === user.uid && <Avatar className="h-6 w-6 self-end"><AvatarImage src={user.photoURL || undefined} data-ai-hint="profile person" /><AvatarFallback>ME</AvatarFallback></Avatar>}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm text-muted-foreground pt-10">{t('noMessages')}</div>
                                    )}
                                     <div ref={messagesEndRef} />
                                </div>
                            )}
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input placeholder={t('typeMessagePlaceholder')} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isSending} />
                                <Button type="submit" disabled={!newMessage.trim() || isSending}>
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                 </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4"/>
                        <p>{t('selectConversation')}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}

function MessagingSkeleton() {
    return (
        <Card className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] overflow-hidden">
            <div className="flex flex-col border-r h-full">
                <div className="p-4 border-b space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="flex-grow p-4 space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
            <div className="hidden md:flex flex-col h-full bg-muted/30">
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            </div>
        </Card>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<MessagingSkeleton />}>
            <MessagingContent />
        </Suspense>
    );
}

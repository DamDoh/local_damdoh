"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-utils";
import { app as firebaseApp } from "@/lib/firebase/client";
import { collection, query, where, orderBy, onSnapshot, getFirestore, doc, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ThumbsUp, MessageSquare, Bell } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Notification {
  id: string;
  actorId: string;
  userId: string;
  type: 'like' | 'comment';
  postId: string;
  postContentSnippet: string;
  read: boolean;
  createdAt: any; // Firestore Timestamp
}

const userProfileCache: Record<string, UserProfile> = {};

// Using useMemo to memoize the callable function might not be ideal in this component structure
// since it might get re-created. A higher-level provider or singleton could be better.
const functions = getFunctions(firebaseApp);
const getProfilesCallable = httpsCallable(functions, 'getProfilesByIds'); 


const fetchNotificationUserProfiles = async (userIds: string[]): Promise<Record<string, UserProfile>> => {
    const profilesToReturn: Record<string, UserProfile> = {};
    const idsToFetch = [...new Set(userIds)].filter(id => !userProfileCache[id]);

    if (idsToFetch.length > 0) {
        try {
            const result = await getProfilesCallable({ uids: idsToFetch });
            const fetchedProfiles = result.data as Record<string, UserProfile>;
            for (const id in fetchedProfiles) {
                userProfileCache[id] = fetchedProfiles[id];
            }
        } catch (error) {
            console.error("Error fetching user profiles:", error);
        }
    }

    userIds.forEach(id => {
        profilesToReturn[id] = userProfileCache[id] || { displayName: "Someone", photoURL: "" } as UserProfile;
    });

    return profilesToReturn;
};

const NotificationIcon = ({ type }: { type: 'like' | 'comment' }) => {
    const commonClasses = "h-5 w-5 absolute -bottom-1 -right-1 bg-background rounded-full p-0.5"
    switch (type) {
        case 'like':
            return <ThumbsUp className={cn(commonClasses, "text-blue-500")} />;
        case 'comment':
            return <MessageSquare className={cn(commonClasses, "text-green-500")} />;
        default:
            return null;
    }
};

export default function NotificationsPage() {
    const { t } = useTranslation('common');
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [actorProfiles, setActorProfiles] = useState<Record<string, UserProfile>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const db = getFirestore(firebaseApp);
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const newNotifications: Notification[] = [];
            snapshot.forEach((doc) => {
                newNotifications.push({ id: doc.id, ...doc.data() } as Notification);
            });
            
            if(newNotifications.length > 0) {
                const actorIds = newNotifications.map(n => n.actorId);
                const profiles = await fetchNotificationUserProfiles(actorIds);
                setActorProfiles(profiles);
            }

            setNotifications(newNotifications);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary"/>
                        <CardTitle>{t('notificationsPage.title')}</CardTitle>
                    </div>
                    <CardDescription>{t('notificationsPage.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                           <Skeleton className="h-20 w-full" />
                           <Skeleton className="h-20 w-full" />
                           <Skeleton className="h-20 w-full" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map((notification) => {
                                const actor = actorProfiles[notification.actorId];
                                const message = notification.type === 'like' 
                                    ? t('notificationsPage.likeNotification', { name: actor?.displayName ?? "Someone" })
                                    : t('notificationsPage.commentNotification', { name: actor?.displayName ?? "Someone" });
                                
                                return (
                                <Link href={`/feed?postId=${notification.postId}`} key={notification.id} passHref>
                                    <div className={cn('flex items-start gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer', !notification.read && 'bg-accent/50')}>
                                        <div className="relative">
                                            <Avatar className="h-11 w-11">
                                                <AvatarImage src={actor?.photoURL ?? undefined} alt={actor?.displayName ?? "User"}/>
                                                <AvatarFallback>{actor?.displayName?.substring(0,1) ?? 'A'}</AvatarFallback>
                                            </Avatar>
                                            <NotificationIcon type={notification.type} />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className="text-sm">
                                                <span className="font-semibold">{actor?.displayName ?? "Someone"}</span>
                                                {` ${message}`}
                                            </p>
                                             <p className="text-xs text-muted-foreground mt-1 italic border-l-2 pl-2">
                                                "{notification.postContentSnippet}"
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.createdAt.toDate()).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )})}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">{t('notificationsPage.noNotifications')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-utils";
import { firebaseApp } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, getFirestore } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ThumbsUp, MessageSquare } from "lucide-react";
import type { Notification, UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

// This is a simplified version of the fetchUserProfiles from the dashboard
// In a real app, this would be a shared, robust utility
const userProfileCache: Record<string, UserProfile> = {};
const fetchNotificationUserProfiles = async (userIds: string[]) => {
    const db = getFirestore(firebaseApp);
    const profiles: Record<string, UserProfile> = {};
    const usersToFetch = [...new Set(userIds)].filter(id => !userProfileCache[id]);

    for (const userId of usersToFetch) {
        const userDoc = await getFirestore(firebaseApp).collection('users').doc(userId).get();
        if (userDoc.exists()) {
            userProfileCache[userId] = userDoc.data() as UserProfile;
        } else {
            userProfileCache[userId] = { id: userId, name: "Someone", avatarUrl: "", headline: "" };
        }
    }
    
    userIds.forEach(id => {
        profiles[id] = userProfileCache[id];
    });

    return profiles;
};

const NotificationIcon = ({ type }: { type: 'like' | 'comment' }) => {
    switch (type) {
        case 'like':
            return <ThumbsUp className="h-5 w-5 text-blue-500" />;
        case 'comment':
            return <MessageSquare className="h-5 w-5 text-green-500" />;
        default:
            return null;
    }
};

export default function NotificationsPage() {
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
                    <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                           <Skeleton className="h-16 w-full" />
                           <Skeleton className="h-16 w-full" />
                           <Skeleton className="h-16 w-full" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map((notification) => {
                                const actor = actorProfiles[notification.actorId];
                                return (
                                <Link href={`/posts/${notification.postId}`} key={notification.id}>
                                    <div className={`flex items-center gap-4 p-3 rounded-lg hover:bg-accent ${!notification.read ? 'bg-accent/50' : ''}`}>
                                        <Avatar>
                                            <AvatarImage src={actor?.avatarUrl}/>
                                            <AvatarFallback>{actor?.name?.substring(0,1) ?? 'A'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm">
                                                <span className="font-semibold">{actor?.name ?? "Someone"}</span>
                                                {notification.type === 'like' ? ' liked your post.' : ' commented on your post.'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(notification.createdAt.toDate()).toLocaleString()}
                                            </p>
                                        </div>
                                        <NotificationIcon type={notification.type as 'like' | 'comment'} />
                                    </div>
                                </Link>
                            )})}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">You have no new notifications.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

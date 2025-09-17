
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ThumbsUp, MessageSquare, Bell, User, ShoppingCart, UserCheck, Calendar } from "lucide-react";
import type { Notification, UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { apiCall } from '@/lib/api-utils';

// A simple cache to avoid refetching the same user profiles within a session
const userProfileCache: Record<string, UserProfile> = {};

const fetchNotificationUserProfiles = async (userIds: string[]): Promise<Record<string, UserProfile>> => {
    if (userIds.length === 0) return {};
    
    const profiles: Record<string, UserProfile> = {};
    const usersToFetch = [...new Set(userIds)].filter(id => !userProfileCache[id] && id !== 'system');

    if (usersToFetch.length === 0) {
        return userProfileCache;
    }

    try {
        // Fetch user profiles using our new API
        const result = await apiCall('/user/profiles', {
            method: 'POST',
            body: JSON.stringify({ userIds: usersToFetch }),
        });
        const fetchedProfiles = result as UserProfile[];
        
        // Update cache with fetched profiles
        fetchedProfiles.forEach(profile => {
            userProfileCache[profile.id] = profile;
        });
    } catch(error) {
        console.error("Error fetching user profiles for notifications:", error);
    }

    userIds.forEach(id => {
        profiles[id] = userProfileCache[id];
    });

    return profiles;
};

const NotificationIcon = ({ type }: { type: string }) => {
    const iconProps = { className: "h-5 w-5" };
    switch (type) {
        case 'like': return <ThumbsUp {...iconProps} style={{ color: 'hsl(var(--primary))' }} />;
        case 'comment': return <MessageSquare {...iconProps} style={{ color: 'hsl(var(--chart-2))' }} />;
        case 'profile_view': return <User {...iconProps} style={{ color: 'hsl(var(--chart-5))' }} />;
        case 'new_order': return <ShoppingCart {...iconProps} style={{ color: 'hsl(var(--chart-3))' }} />;
        case 'new_connection_request': return <UserCheck {...iconProps} style={{ color: 'hsl(var(--chart-4))' }} />;
        case 'event_reminder': return <Calendar {...iconProps} style={{ color: 'hsl(var(--accent))' }} />;
        default: return <Bell {...iconProps} style={{ color: 'hsl(var(--muted-foreground))' }} />;
    }
};

const getNotificationLink = (notification: Notification): string => {
    if (!notification.linkedEntity) return '#';
    const { collection: coll, documentId } = notification.linkedEntity;
    switch (coll) {
        case 'profiles': return `/profiles/${documentId}`;
        case 'marketplace_orders': return `/marketplace/my-orders`; // Link to all orders for now
        case 'network': return `/network/my-network`;
        case 'agri_events': return `/agri-events/${documentId}`;
        // The link for posts is tricky as we need a topicId.
        // For now, we'll link to the author's profile who liked/commented.
        case 'posts': return `/profiles/${notification.actorId}`;
        default: return '#';
    }
};

const getNotificationText = (notification: Notification, actorName: string, t: any) => {
    const nameSpan = <span className="font-semibold">{actorName}</span>;
    switch (notification.type) {
        case 'like': return t('likedYourPost', { name: nameSpan });
        case 'comment': return t('commentedOnYourPost', { name: nameSpan });
        case 'profile_view': return t('viewedYourProfile', { name: nameSpan });
        case 'new_order': return t('placedNewOrder', { name: nameSpan });
        case 'new_connection_request': return t('sentConnectionRequest', { name: nameSpan });
        default: return <>{notification.body_en}</>; // Fallback to the body from the backend
    }
};


export default function NotificationsPage() {
    const t = useTranslations('notificationsPage');
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [actorProfiles, setActorProfiles] = useState<Record<string, UserProfile>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        // Polling for notifications
        const fetchNotifications = async () => {
            try {
                // Fetch notifications using our new API
                const result = await apiCall(`/notifications/${user.id}`);
                const newNotifications = result as Notification[];
                
                if(newNotifications.length > 0) {
                    const actorIds = newNotifications.map(n => n.actorId);
                    const profiles = await fetchNotificationUserProfiles(actorIds);
                    setActorProfiles(profiles);
                }

                setNotifications(newNotifications);
            } catch(error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchNotifications();
        
        // Set up polling interval
        const intervalId = setInterval(fetchNotifications, 5000); // Poll every 5 seconds
        
        return () => clearInterval(intervalId);
    }, [user]);

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
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
                                const actor = actorProfiles[notification.actorId] || { displayName: 'Someone' };
                                const link = getNotificationLink(notification);

                                return (
                                <Link href={link} key={notification.id}>
                                    <div className={`flex items-center gap-4 p-3 rounded-lg hover:bg-accent ${!notification.isRead ? 'bg-accent/50' : ''}`}>
                                        <div className="p-2 bg-background rounded-full border">
                                            <NotificationIcon type={notification.type} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm">
                                                {getNotificationText(notification, actor.displayName, t)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.createdAt.toDate()), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )})}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">{t('noNotifications')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

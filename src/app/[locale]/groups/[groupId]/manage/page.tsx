
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, X, Loader2, Users, Mail, Clock, Send, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import type { JoinRequest } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const functions = getFunctions(firebaseApp);

function JoinRequestsTab() {
    const t = useTranslations('GroupsPage.manage');
    const { toast } = useToast();
    const params = useParams();
    const groupId = params.groupId as string;

    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResponding, setIsResponding] = useState<string | null>(null);

    const getRequestsCallable = useMemo(() => httpsCallable(functions, 'getGroupJoinRequests'), []);
    const respondCallable = useMemo(() => httpsCallable(functions, 'respondToJoinRequest'), []);
    
    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getRequestsCallable({ groupId });
            setRequests((result.data as any).requests || []);
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.loadError') });
        } finally {
            setIsLoading(false);
        }
    }, [groupId, getRequestsCallable, toast, t]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleResponse = async (requestId: string, requesterId: string, action: 'accept' | 'decline') => {
        setIsResponding(requestId);
        try {
            await respondCallable({ groupId, requestId, requesterId, action });
            toast({ title: t('toast.success'), description: t(`toast.${action}Success`) });
            fetchRequests(); // Refresh the list
        } catch (error: any) {
             toast({ variant: 'destructive', title: t('toast.error'), description: error.message });
        } finally {
            setIsResponding(null);
        }
    };

    if (isLoading) {
        return <Skeleton className="h-40 w-full" />;
    }

    return (
        <div className="space-y-3">
            {requests.length > 0 ? (
                requests.map(req => (
                    <div key={req.id} className="p-3 border rounded-lg flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar>
                                <AvatarImage src={req.requesterAvatarUrl} />
                                <AvatarFallback>{req.requesterName.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{req.requesterName}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3"/>
                                    {t('requestedTimeAgo', { timeAgo: formatDistanceToNow(new Date(req.createdAt), { addSuffix: true }) })}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleResponse(req.id, req.requesterId, 'decline')} disabled={!!isResponding}>
                                <X className="h-4 w-4"/>
                            </Button>
                                <Button size="sm" onClick={() => handleResponse(req.id, req.requesterId, 'accept')} disabled={isResponding === req.id}>
                                {isResponding === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-8">{t('noRequests')}</p>
            )}
        </div>
    );
}

function InvitesTab() {
    const t = useTranslations('GroupsPage.manage.invitesTab');
    const { toast } = useToast();
    const params = useParams();
    const groupId = params.groupId as string;

    const [inviteEmail, setInviteEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const inviteUserCallable = useMemo(() => httpsCallable(functions, 'inviteUserToGroup'), []);

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) {
            toast({ variant: 'destructive', title: t('toast.emailRequired') });
            return;
        }
        setIsSending(true);
        try {
            await inviteUserCallable({ groupId, email: inviteEmail });
            toast({ title: t('toast.inviteSent'), description: t('toast.inviteSentDescription', { email: inviteEmail }) });
            setInviteEmail('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: t('toast.error'), description: error.message });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{t('description')}</p>
            <form onSubmit={handleSendInvite} className="flex gap-2 items-end">
                <div className="flex-grow space-y-1.5">
                    <Label htmlFor="invite-email">{t('emailLabel')}</Label>
                    <Input 
                        id="invite-email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        disabled={isSending}
                    />
                </div>
                <Button type="submit" disabled={isSending || !inviteEmail}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}


export default function ManageGroupPage() {
    const t = useTranslations('GroupsPage.manage');
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;
    
    if (authLoading) {
        return <Skeleton className="h-96 max-w-2xl mx-auto" />;
    }
    
    if (!user) {
        router.push('/auth/signin');
        return null;
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Link href={`/groups/${groupId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        {t('title')}
                    </CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="requests">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="requests">{t('requestsTab')}</TabsTrigger>
                            <TabsTrigger value="invites">{t('invitesTab')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="requests" className="pt-4">
                           <JoinRequestsTab />
                        </TabsContent>
                        <TabsContent value="invites" className="pt-4">
                           <InvitesTab />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

```
  </change>
  <change>
    <file>/src/firebase/functions/src/groups.ts</file>
    <content><![CDATA[

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { UserProfile, JoinRequest } from './types';

const db = admin.firestore();

const checkAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const createGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { name, description, isPublic } = data;

    if (!name || !description) {
        throw new functions.https.HttpsError('invalid-argument', 'Group name and description are required.');
    }

    const userProfileDoc = await db.collection('users').doc(uid).get();
    if (!userProfileDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }
    const userProfile = userProfileDoc.data() as UserProfile;

    const groupRef = db.collection('groups').doc();
    
    const batch = db.batch();

    batch.set(groupRef, {
        name,
        description,
        isPublic,
        ownerId: uid,
        memberCount: 1,
        postCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const memberRef = groupRef.collection('members').doc(uid);
    batch.set(memberRef, {
        displayName: userProfile.displayName,
        avatarUrl: userProfile.avatarUrl || null,
        role: 'owner',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return { groupId: groupRef.id };
});

export const getGroups = functions.https.onCall(async (data, context) => {
    const groupsSnapshot = await db.collection('groups')
        .where('isPublic', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

    const groups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
    }));
    return { groups };
});

export const getGroupDetails = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError('invalid-argument', 'A groupId must be provided.');
    }
    
    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Group not found.');
    }

    const groupData = groupDoc.data()!;

    return {
        id: groupDoc.id,
        ...groupData,
        createdAt: (groupData.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
    };
});

export const getGroupMembers = functions.https.onCall(async (data, context) => {
    const { groupId } = data;
     if (!groupId) {
        throw new functions.https.HttpsError('invalid-argument', 'A groupId must be provided.');
    }
    
    const membersSnapshot = await db.collection(`groups/${groupId}/members`).limit(50).get();
    
    const members = membersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            joinedAt: (data.joinedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        }
    });

    return { members };
});

const modifyMembership = async (groupId: string, userId: string, join: boolean) => {
    const groupRef = db.collection('groups').doc(groupId);
    const memberRef = groupRef.collection('members').doc(userId);

    await db.runTransaction(async (transaction) => {
        const groupDoc = await transaction.get(groupRef);
        if (!groupDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Group not found.');
        }

        const memberDoc = await transaction.get(memberRef);

        if (join) {
            if (memberDoc.exists) {
                throw new functions.https.HttpsError('already-exists', 'You are already a member of this group.');
            }
            
            const userProfileDoc = await db.collection('users').doc(userId).get();
             if (!userProfileDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Your user profile could not be found.');
            }
            const userProfile = userProfileDoc.data() as UserProfile;

            transaction.set(memberRef, {
                displayName: userProfile.displayName,
                avatarUrl: userProfile.avatarUrl || null,
                role: 'member',
                joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            transaction.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(1) });
        } else {
             if (!memberDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'You are not a member of this group.');
            }
            transaction.delete(memberRef);
            transaction.update(groupRef, { memberCount: admin.firestore.FieldValue.increment(-1) });
        }
    });
};


export const joinGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId } = data;
    await modifyMembership(groupId, uid, true);
    return { success: true, message: 'Successfully joined the group.' };
});

export const leaveGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId } = data;
    await modifyMembership(groupId, uid, false);
    return { success: true, message: 'Successfully left the group.' };
});

export const requestToJoinGroup = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId } = data;

    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists || groupDoc.data()?.isPublic) {
        throw new functions.https.HttpsError('failed-precondition', 'This group does not accept join requests.');
    }
    
    const requestRef = groupRef.collection('join_requests').doc(uid);
    const requestDoc = await requestRef.get();
    if (requestDoc.exists) {
        throw new functions.https.HttpsError('already-exists', 'You have already requested to join this group.');
    }

    const userProfile = await db.collection('users').doc(uid).get();
    if (!userProfile.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
    }

    await requestRef.set({
        status: 'pending',
        requesterId: uid,
        requesterName: userProfile.data()?.displayName,
        requesterAvatarUrl: userProfile.data()?.avatarUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Your request to join has been sent." };
});

export const getGroupJoinRequests = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { groupId } = data;
    if (!groupId) {
        throw new functions.https.HttpsError('invalid-argument', 'A groupId must be provided.');
    }

    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists || groupDoc.data()?.ownerId !== ownerId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not the owner of this group.');
    }

    const requestsSnapshot = await groupRef.collection('join_requests').where('status', '==', 'pending').get();
    const requests = requestsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
        };
    }) as JoinRequest[];

    return { requests };
});


export const respondToJoinRequest = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { groupId, requestId, requesterId, action } = data;

    if (!groupId || !requestId || !requesterId || !action) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters.');
    }
    if (action !== 'accept' && action !== 'decline') {
        throw new functions.https.HttpsError('invalid-argument', 'Action must be "accept" or "decline".');
    }

    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists || groupDoc.data()?.ownerId !== ownerId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not authorized to manage this group.');
    }

    const requestRef = groupRef.collection('join_requests').doc(requestId);
    
    if (action === 'accept') {
        await modifyMembership(groupId, requesterId, true); // Use our existing helper
        await requestRef.delete(); // Remove the request after accepting
    } else { // 'decline'
        await requestRef.delete();
    }

    return { success: true, message: `Request has been ${action}ed.` };
});

export const inviteUserToGroup = functions.https.onCall(async (data, context) => {
    const ownerId = checkAuth(context);
    const { groupId, email } = data;
    if (!groupId || !email) {
        throw new functions.https.HttpsError('invalid-argument', 'Group ID and email are required.');
    }

    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists || groupDoc.data()?.ownerId !== ownerId) {
        throw new functions.https.HttpsError('permission-denied', 'You are not the owner of this group.');
    }

    // This is a placeholder for sending an email. In a real app, you would integrate
    // with an email service (e.g., SendGrid, Firebase Trigger Email extension).
    console.log(`Simulating sending an invite to ${email} for group ${groupId} by owner ${ownerId}.`);

    // Optionally, you could store the invite in Firestore to track its status
    const inviteRef = groupRef.collection('invites').doc(email);
    await inviteRef.set({
        email: email,
        inviterId: ownerId,
        status: 'sent',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true, message: `An invitation has been sent to ${email}.` };
});


// --- NEW FUNCTIONS FOR GROUP DISCUSSIONS ---

export const createGroupPost = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId, title, content } = data;
    if (!groupId || !title || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'Group ID, title, and content are required.');
    }

    const memberRef = db.collection(`groups/${groupId}/members`).doc(uid);
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You must be a member of this group to post.');
    }

    const postRef = db.collection(`groups/${groupId}/posts`).doc();
    const groupRef = db.collection('groups').doc(groupId);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const userProfile = await db.collection('users').doc(uid).get();

    const batch = db.batch();

    batch.set(postRef, {
        title,
        content,
        authorRef: uid,
        authorName: userProfile.data()?.displayName || 'Unknown User',
        authorAvatarUrl: userProfile.data()?.avatarUrl || null,
        createdAt: timestamp,
        replyCount: 0,
        likes: 0,
    });
    
    batch.update(groupRef, {
        postCount: admin.firestore.FieldValue.increment(1),
        lastActivityAt: timestamp
    });
    
    await batch.commit();

    return { postId: postRef.id };
});

export const getGroupPosts = functions.https.onCall(async (data, context) => {
    const { groupId, lastVisible } = data;
    if (!groupId) throw new functions.https.HttpsError('invalid-argument', 'Group ID is required.');

    const POSTS_PER_PAGE = 10;
    let query = db.collection(`groups/${groupId}/posts`).orderBy('createdAt', 'desc').limit(POSTS_PER_PAGE);

    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`groups/${groupId}/posts`).doc(lastVisible).get();
        if(lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }
    
    const postsSnapshot = await query.get();
    
    const posts = postsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString()
    }));

    const newLastVisible = posts.length > 0 ? posts[posts.length - 1].id : null;

    return { posts, lastVisible: newLastVisible };
});

export const addGroupPostReply = functions.https.onCall(async (data, context) => {
    const uid = checkAuth(context);
    const { groupId, postId, content } = data;
    if (!groupId || !postId || !content) {
        throw new functions.https.HttpsError('invalid-argument', 'Group ID, post ID, and content are required.');
    }
    
    const memberRef = db.collection(`groups/${groupId}/members`).doc(uid);
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You must be a member of this group to reply.');
    }

    const replyRef = db.collection(`groups/${groupId}/posts/${postId}/replies`).doc();
    const postRef = db.collection(`groups/${groupId}/posts`).doc(postId);

    const batch = db.batch();
    const userProfile = await db.collection('users').doc(uid).get();

    batch.set(replyRef, {
        content,
        authorRef: uid,
        authorName: userProfile.data()?.displayName || 'Unknown User',
        authorAvatarUrl: userProfile.data()?.avatarUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(postRef, {
        replyCount: admin.firestore.FieldValue.increment(1),
    });

    await batch.commit();
    return { replyId: replyRef.id };
});

export const getGroupPostReplies = functions.https.onCall(async (data, context) => {
    const { groupId, postId, lastVisible } = data;
    if (!groupId || !postId) throw new functions.https.HttpsError('invalid-argument', 'Group ID and Post ID are required.');

    const REPLIES_PER_PAGE = 15;
    let query = db.collection(`groups/${groupId}/posts/${postId}/replies`).orderBy('createdAt', 'asc').limit(REPLIES_PER_PAGE);
    
    if (lastVisible) {
        const lastDocSnapshot = await db.collection(`groups/${groupId}/posts/${postId}/replies`).doc(lastVisible).get();
        if(lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }

    const repliesSnapshot = await query.get();

    const replies = repliesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString()
    }));
    
    const newLastVisible = replies.length > 0 ? replies[replies.length - 1].id : null;
    
    return { replies, lastVisible: newLastVisible };
});

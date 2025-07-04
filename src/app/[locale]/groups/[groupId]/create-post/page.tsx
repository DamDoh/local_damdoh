
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';

export default function CreateGroupPostPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const groupId = params.groupId as string;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const createGroupPostCallable = useMemo(() => httpsCallable(functions, 'createGroupPost'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: "Authentication Required",
                description: "You must be logged in and a member of the group to create a post.",
                variant: "destructive"
            });
            return;
        }

        if (!title.trim() || !content.trim()) {
            toast({
                title: "Incomplete Post",
                description: "Please provide both a title and content for your post.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            await createGroupPostCallable({ groupId, title, content });
            
            toast({
                title: "Post Created!",
                description: "Your discussion has been started in the group.",
            });
            
            router.push(`/groups/${groupId}`);
        } catch (error: any) {
            console.error("Error creating post:", error);
            toast({
                title: "Error Creating Post",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href={`/groups/${groupId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Group
            </Link>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Start a New Discussion</CardTitle>
                        <CardDescription>Share your thoughts, ask questions, or start a conversation with other group members.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="post-title">Post Title</Label>
                            <Input 
                                id="post-title" 
                                placeholder="A clear and engaging title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="post-content">Your Message</Label>
                            <Textarea 
                                id="post-content"
                                placeholder="Share details, ask questions, or provide context for your discussion..."
                                className="min-h-[200px]"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                           {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Post Discussion
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}


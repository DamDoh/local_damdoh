
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function CreatePostPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const topicId = params.topicId as string;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const createForumPost = useMemo(() => httpsCallable(functions, 'createForumPost'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast({
                title: "Incomplete Post",
                description: "Please fill out both the title and content fields.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            await createForumPost({ topicId, title, content });
            
            toast({
                title: "Post Created!",
                description: "Your post has been successfully created.",
            });
            
            router.push(`/forums/${topicId}`);
        } catch (error) {
            console.error("Error creating post:", error);
            toast({
                title: "Error",
                description: "An error occurred while creating the post. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href={`/forums/${topicId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to topic
            </Link>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Post</CardTitle>
                        <CardDescription>Share your knowledge or ask a question to the community.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="post-title">Post Title</Label>
                            <Input 
                                id="post-title" 
                                placeholder="Enter a clear and concise title" 
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
                                placeholder="Write your message here. You can include details, ask questions, or share insights."
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
                            {isSubmitting ? "Submitting..." : "Submit Post"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

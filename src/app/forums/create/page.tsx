
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';


export default function CreateTopicPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const functions = getFunctions(firebaseApp);
    const createTopicCallable = useMemo(() => httpsCallable(functions, 'createTopic'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to create a topic.",
                variant: "destructive"
            });
            return;
        }

        if (!name.trim() || !description.trim()) {
            toast({
                title: "Incomplete Form",
                description: "Please fill out both the topic name and description.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            await createTopicCallable({ name, description });
            toast({
                title: "Topic Created!",
                description: "The new topic has been successfully created.",
            });
            router.push('/forums');
        } catch (error: any) {
            console.error("Error creating topic:", error);
            toast({
                title: "Error",
                description: error.message || "An error occurred while creating the topic.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href="/forums" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Forums
            </Link>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Topic</CardTitle>
                        <CardDescription>Start a new discussion by creating a topic for the community.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topic-name">Topic Name</Label>
                            <Input 
                                id="topic-name" 
                                placeholder="e.g., Sustainable Farming Practices" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="topic-description">Description</Label>
                            <Textarea 
                                id="topic-description"
                                placeholder="A brief description of what this topic will be about."
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Topic"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

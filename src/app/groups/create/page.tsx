
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

export default function CreateGroupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const functions = getFunctions(firebaseApp);
    const createGroup = useMemo(() => httpsCallable(functions, 'createGroup'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            toast({
                title: "Incomplete Form",
                description: "Please fill out the group name and description.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            const result = await createGroup({ name, description, isPublic });
            const groupId = (result.data as { groupId: string }).groupId;
            toast({
                title: "Group Created!",
                description: "Your group has been successfully created.",
            });
            router.push(`/groups/${groupId}`);
        } catch (error) {
            console.error("Error creating group:", error);
            toast({
                title: "Error",
                description: "An error occurred while creating the group. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href="/groups" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Groups
            </Link>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Group</CardTitle>
                        <CardDescription>Bring people together around a common interest.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Group Name</Label>
                            <Input 
                                id="group-name" 
                                placeholder="e.g., Organic Farmers of Kenya" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-description">Description</Label>
                            <Textarea 
                                id="group-description"
                                placeholder="A brief description of what this group is about."
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="is-public" 
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                                disabled={isSubmitting}
                            />
                            <Label htmlFor="is-public">Public Group (anyone can see and join)</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Group"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

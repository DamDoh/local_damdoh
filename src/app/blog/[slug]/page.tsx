
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BlogPost {
  id: string;
  title_en: string;
  author: string;
  createdAt: string;
  content_markdown_en: string;
  category: string;
  imageUrl?: string;
  dataAiHint?: string;
  tags?: string[];
}

const getArticleCallable = httpsCallable(functions, 'getKnowledgeArticleById');

function PostPageSkeleton() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-3/4" />
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
            <Skeleton className="h-80 w-full" />
            <div className="space-y-4 mt-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    );
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const result = await getArticleCallable({ articleId: slug });
        const data = result.data as { success: boolean, article: BlogPost };
        if (data.success) {
          setPost(data.article);
        } else {
          setPost(null);
          notFound(); // Trigger 404 if post not found
        }
      } catch (error: any) {
        console.error("Error fetching post:", error);
        toast({ title: "Error", description: error.message || "Could not load the blog post.", variant: "destructive" });
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, toast]);
  
  if (isLoading) {
    return <PostPageSkeleton />;
  }

  if (!post) {
    return (
        <Card className="max-w-3xl mx-auto text-center">
            <CardHeader><CardTitle>Post Not Found</CardTitle></CardHeader>
            <CardContent>
                <p>The post you are looking for does not exist or has been moved.</p>
                <Button asChild variant="outline" className="mt-4"><Link href="/blog">Back to Blog</Link></Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <article className="max-w-3xl mx-auto space-y-6">
        <Link href="/blog" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4"/> Back to All Posts
        </Link>
      
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title_en}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        {/* Placeholder avatar for now */}
                        <AvatarImage src="https://placehold.co/40x40.png" alt={post.author} data-ai-hint="author profile" />
                        <AvatarFallback>{post.author.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4"/>
                    <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
                </div>
            </div>
        </div>

      {post.imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.imageUrl}
            alt={post.title_en}
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint={post.dataAiHint || "agriculture blog image"}
          />
        </div>
      )}

      {/* For now, we'll render markdown content in a pre-formatted block.
          A library like react-markdown would be needed for full rendering. */}
      <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-base">
              {post.content_markdown_en}
          </pre>
      </div>
    </article>
  );
}

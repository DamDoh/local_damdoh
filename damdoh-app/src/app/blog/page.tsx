
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Rss, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

interface BlogPost {
  id: string;
  title_en: string;
  excerpt_en: string;
  title_km?: string;
  excerpt_km?: string;
  author: string;
  createdAt: string;
  category: string;
  imageUrl?: string;
  dataAiHint?: string;
}

const functions = getFunctions(firebaseApp);
const getArticlesCallable = httpsCallable(functions, 'getKnowledgeArticles');

function PostCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
        <Skeleton className="h-56 w-full" />
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="flex-grow">
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </CardContent>
        <CardContent className="pt-2">
            <Skeleton className="h-10 w-full" />
        </CardContent>
    </Card>
  );
}

export default function BlogPage() {
  const { t, i18n } = useTranslation('common');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const result = await getArticlesCallable();
        const data = result.data as { success: boolean, articles: any[] };
        if (data.success) {
          const blogPosts = data.articles.filter(article => article.category === 'Blog');
          setPosts(blogPosts);
        } else {
          throw new Error("Failed to fetch articles.");
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        toast({ title: t('blogPage.errorTitle'), description: t('blogPage.errorDescription'), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [toast, t]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
           <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Rss className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('blogPage.title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('blogPage.description')}
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const currentLang = i18n.language;
            const postTitle = currentLang === 'km' && post.title_km ? post.title_km : post.title_en;
            const postExcerpt = currentLang === 'km' && post.excerpt_km ? post.excerpt_km : post.excerpt_en;
            return (
                <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {post.imageUrl && (
                    <Link href={`/blog/${post.id}`} className="block">
                      <div className="relative h-56 w-full">
                        <Image
                          src={post.imageUrl}
                          alt={post.title_en}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{objectFit: 'cover'}}
                          data-ai-hint={post.dataAiHint || "agriculture blog image"}
                        />
                      </div>
                    </Link>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors h-14">
                      <Link href={`/blog/${post.id}`}>{postTitle}</Link>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t('blogPage.authorLabel')} {post.author} on {new Date(post.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{postExcerpt}</p>
                  </CardContent>
                  <CardContent className="pt-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/blog/${post.id}`}>{t('blogPage.readMoreButton')}</Link>
                    </Button>
                  </CardContent>
                </Card>
            )
            })}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
              <Feather className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">{t('blogPage.noPostsTitle')}</h3>
              <p className="text-muted-foreground max-w-md">
                {t('blogPage.noPostsDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Rss, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from '@/navigation';
import Image from "next/image";
import { apiCall } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useLocale, useTranslations, useFormatter } from 'next-intl';
import type { KnowledgeArticle } from '@/lib/types';

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
  const t = useTranslations('blogPage');
  const [posts, setPosts] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const locale = useLocale();
  const format = useFormatter();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const data = await apiCall<{ success: boolean, articles: any[] }>('/knowledge/articles');
        if (data.success) {
          const blogPosts = data.articles.filter(article => (article.category === 'Blog' || article.category === 'Industry News') && article.status === 'Published');
          setPosts(blogPosts);
        } else {
          throw new Error("Failed to fetch articles.");
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        toast({ title: t('error.title'), description: t('error.description'), variant: "destructive" });
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
            <CardTitle className="text-4xl">{t('title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('description')}
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
            const displayTitle = locale === 'km' && post.title_km ? post.title_km : post.title_en;
            const displayExcerpt = locale === 'km' && post.excerpt_km ? post.excerpt_km : post.excerpt_en;
            const originalExcerpt = locale === 'km' ? post.excerpt_en : post.excerpt_km;

            return (
              <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {post.imageUrl && (
                  <Link href={`/blog/${post.id}`} className="block">
                    <div className="relative h-56 w-full">
                      <Image
                        src={post.imageUrl}
                        alt={displayTitle}
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
                    <Link href={`/blog/${post.id}`}>{displayTitle}</Link>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('meta', { author: post.author, date: format.dateTime(new Date(post.createdAt), {dateStyle: 'long'}) })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{displayExcerpt}</p>
                  {originalExcerpt && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-sm text-muted-foreground line-clamp-3 font-serif">{originalExcerpt}</p>
                    </>
                  )}
                </CardContent>
                <CardContent className="pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/blog/${post.id}`}>{t('readMore')}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
              <Feather className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">{t('noPosts.title')}</h3>
              <p className="text-muted-foreground max-w-md">
                {t.rich('noPosts.description', {
                  link: (chunks) => <Link href="/admin/content" className="text-primary hover:underline">{chunks}</Link>
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

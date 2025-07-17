
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from '@/navigation';
import Image from "next/image";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useLocale, useTranslations, useFormatter } from 'next-intl';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface BlogPost {
  id: string;
  title_en: string;
  content_markdown_en: string;
  title_km?: string;
  content_markdown_km?: string;
  title_fr?: string;
  content_markdown_fr?: string;
  title_de?: string;
  content_markdown_de?: string;
  title_th?: string;
  content_markdown_th?: string;
  author: string;
  createdAt: string;
  category: string;
  imageUrl?: string;
  dataAiHint?: string;
  tags?: string[];
}

const functions = getFunctions(firebaseApp);
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
  const t = useTranslations('blogPage');
  const locale = useLocale();
  const format = useFormatter();

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
        toast({ title: t('error.title'), description: error.message || t('error.description'), variant: "destructive" });
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, toast, t]);
  
  if (isLoading) {
    return <PostPageSkeleton />;
  }

  if (!post) {
    return (
        <Card className="max-w-3xl mx-auto text-center">
            <CardHeader><CardTitle>{t('notFound.title')}</CardTitle></CardHeader>
            <CardContent>
                <p>{t('notFound.description')}</p>
                <Button asChild variant="outline" className="mt-4"><Link href="/blog">{t('notFound.backButton')}</Link></Button>
            </CardContent>
        </Card>
    );
  }

  const getLocalized = (fieldPrefix: string) => {
    const key = `${fieldPrefix}_${locale}`;
    // @ts-ignore
    return post[key] || post[`${fieldPrefix}_en`]; // Fallback to English
  }

  const displayTitle = getLocalized('title');
  const displayContent = getLocalized('content_markdown');

  return (
    <article className="max-w-3xl mx-auto space-y-6">
        <Link href="/blog" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4"/> {t('backLink')}
        </Link>
      
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{displayTitle}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40.png" alt={post.author} data-ai-hint="author profile" />
                        <AvatarFallback>{post.author.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4"/>
                    <time dateTime={post.createdAt}>{format.dateTime(new Date(post.createdAt), {dateStyle: 'long'})}</time>
                </div>
            </div>
        </div>

      {post.imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.imageUrl}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint={post.dataAiHint || "agriculture blog image"}
          />
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap font-sans text-base">
              {displayContent}
          </p>
      </div>
      
      {locale !== 'en' && post.title_en && post.content_markdown_en && (
         <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>{t('originalContentTitle')}</AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                        <h2 className="text-2xl font-bold leading-tight">{post.title_en}</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap font-sans text-base text-muted-foreground">
                                {post.content_markdown_en}
                            </p>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      )}
    </article>
  );
}

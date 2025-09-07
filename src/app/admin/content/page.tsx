
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { PlusCircle, Edit, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the structure of an article for the frontend
interface Article {
  id: string;
  title_en?: string;
  title_km?: string;
  category: string;
  status: 'Published' | 'Draft';
  createdAt: string;
  author: string;
}

// Create callable references to our content creation functions
const createArticleFunction = httpsCallable(functions, 'knowledgeHub-createKnowledgeArticle');
const getArticlesFunction = httpsCallable(functions, 'knowledgeHub-getKnowledgeArticles');

export default function ContentManagementPage() {
  const t = useTranslations('admin.contentManagement');
  const [articleSubmitting, setArticleSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
        const result = await getArticlesFunction();
        const data = (result.data as { success: boolean, articles: any[] });
        if(data.success && data.articles) {
            setArticles(data.articles);
        } else {
            throw new Error("Failed to fetch articles.");
        }
    } catch (error: any) {
        toast({ title: t('toast.loadErrorTitle'), description: error.message || t('toast.loadErrorDescription'), variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [getArticlesFunction, toast, t]);

  useEffect(() => {
      fetchArticles();
  }, [fetchArticles]);


  const handleCreateArticle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setArticleSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const articleData = {
        title_en: formData.get('article_title_en'),
        excerpt_en: formData.get('article_excerpt_en'),
        content_markdown_en: formData.get('article_content_en'),
        title_km: formData.get('article_title_km'),
        excerpt_km: formData.get('article_excerpt_km'),
        content_markdown_km: formData.get('article_content_km'),
        category: formData.get('article_category'),
        author: formData.get('article_author'),
        tags: (formData.get('article_tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
        imageUrl: formData.get('article_image_url'),
        dataAiHint: formData.get('article_data_ai_hint'),
        status: formData.get('article_status'),
      };

      console.log("Calling 'knowledgeHub-createKnowledgeArticle' with payload:", articleData);
      const result = await createArticleFunction(articleData);

      if (!(result.data as any).success) throw new Error((result.data as any).message);

      toast({
        title: t('toast.createSuccessTitle'),
        description: t('toast.createSuccessDescription'),
      });
      (event.target as HTMLFormElement).reset();
      fetchArticles(); // Refresh the list
    } catch (error: any) {
       toast({
        title: t('toast.createErrorTitle'),
        description: error.message || 'Failed to create article.',
        variant: "destructive"
      });
    } finally {
      setArticleSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 space-y-6">
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>{t('allArticles.title')}</CardTitle>
                <CardDescription>{t('allArticles.description')}</CardDescription>
              </div>
              <Button size="sm" onClick={() => fetchArticles()} disabled={isLoading}><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />{t('allArticles.refreshButton')}</Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </div>
              ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.title')}</TableHead>
                            <TableHead>{t('table.category')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead>{t('table.created')}</TableHead>
                            <TableHead className="text-right">{t('table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles.length > 0 ? articles.map(article => (
                            <TableRow key={article.id}>
                                <TableCell className="font-medium">{article.title_en || article.title_km}</TableCell>
                                <TableCell><Badge variant="outline">{article.category}</Badge></TableCell>
                                <TableCell><Badge variant={article.status === 'Published' ? 'default' : 'secondary'}>{article.status}</Badge></TableCell>
                                <TableCell>{format(new Date(article.createdAt), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/blog/${article.id}`} target="_blank"><Edit className="h-4 w-4" /></Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">{t('table.noArticles')}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
              )}
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('createArticle.title')}</CardTitle>
            <CardDescription>{t('createArticle.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateArticle} className="space-y-4">
                <h4 className="font-semibold text-primary">{t('createArticle.englishContent')}</h4>
                <div className="space-y-1.5"><Label htmlFor="article_title_en">{t('createArticle.titleEnLabel')}</Label><Input id="article_title_en" name="article_title_en" /></div>
                <div className="space-y-1.5"><Label htmlFor="article_excerpt_en">{t('createArticle.excerptEnLabel')}</Label><Textarea id="article_excerpt_en" name="article_excerpt_en" className="h-24" /></div>
                <div className="space-y-1.5"><Label htmlFor="article_content_en">{t('createArticle.contentEnLabel')}</Label><Textarea id="article_content_en" name="article_content_en" className="h-40" /></div>
              
                <Separator />

                <h4 className="font-semibold text-primary">{t('createArticle.khmerContent')}</h4>
                <div className="space-y-1.5"><Label htmlFor="article_title_km">{t('createArticle.titleKmLabel')}</Label><Input id="article_title_km" name="article_title_km" /></div>
                <div className="space-y-1.5"><Label htmlFor="article_excerpt_km">{t('createArticle.excerptKmLabel')}</Label><Textarea id="article_excerpt_km" name="article_excerpt_km" className="h-24" /></div>
                <div className="space-y-1.5"><Label htmlFor="article_content_km">{t('createArticle.contentKmLabel')}</Label><Textarea id="article_content_km" name="article_content_km" className="h-40" /></div>

                <Separator />

                <h4 className="font-semibold text-primary">{t('createArticle.metadataTitle')}</h4>
                <div className="space-y-1.5"><Label htmlFor="article_category">{t('createArticle.categoryLabel')}</Label><Input id="article_category" name="article_category" placeholder={t('createArticle.categoryPlaceholder')} required /></div>
                <div className="space-y-1.5"><Label htmlFor="article_author">{t('createArticle.authorLabel')}</Label><Input id="article_author" name="article_author" placeholder={t('createArticle.authorPlaceholder')} defaultValue="DamDoh Team" /></div>
                <div className="space-y-1.5"><Label htmlFor="article_status">{t('createArticle.statusLabel')}</Label><Select name="article_status" defaultValue="Published"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Published">Published</SelectItem><SelectItem value="Draft">Draft</SelectItem></SelectContent></Select></div>
                <div className="space-y-1.5"><Label htmlFor="article_tags">{t('createArticle.tagsLabel')}</Label><Input id="article_tags" name="article_tags" /></div>
                <div className="space-y-1.5"><Label htmlFor="article_image_url">{t('createArticle.imageUrlLabel')}</Label><Input id="article_image_url" name="article_image_url" placeholder={t('createArticle.imageUrlPlaceholder')} /></div>
                <div className="space-y-1.5"><Label htmlFor="article_data_ai_hint">{t('createArticle.aiHintLabel')}</Label><Input id="article_data_ai_hint" name="article_data_ai_hint" placeholder={t('createArticle.aiHintPlaceholder')} /></div>
                <Button type="submit" disabled={articleSubmitting}>
                    {articleSubmitting ? t('createArticle.publishingButton') : t('createArticle.publishButton')}
                </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-utils';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

// Define the structure of an article
interface Article {
  id: string;
  title_en: string;
  excerpt_en: string;
  imageUrl?: string;
  dataAiHint?: string;
  createdAt: string; // Add createdAt to sort by
}

const KnowledgeHubPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Get authenticated user
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions(firebaseApp);
  const getFeaturedKnowledge = useMemo(() => httpsCallable(functions, 'getFeaturedKnowledge'), [functions]);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getFeaturedKnowledge({ userId: user?.uid });
        const data = result.data as { success: boolean, articles: Article[] };
        if (data.success) {
          setFeaturedArticles(data.articles);
        } else {
          throw new Error('Failed to fetch featured articles.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [user, getFeaturedKnowledge]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          {t('knowledgeHub.title')}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          The central source for agricultural knowledge and insights on DamDoh.
        </p>
      </header>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t('knowledgeHub.courses.title')}</CardTitle>
            <CardDescription>{t('knowledgeHub.courses.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p>{t('knowledgeHub.courses.body')}</p>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/knowledge-hub/courses" passHref>
              <Button className="w-full">{t('knowledgeHub.courses.cta')}</Button>
            </Link>
          </div>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t('knowledgeHub.blog.title')}</CardTitle>
            <CardDescription>{t('knowledgeHub.blog.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p>{t('knowledgeHub.blog.body')}</p>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/blog" passHref>
              <Button className="w-full">{t('knowledgeHub.blog.cta')}</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Featured Articles */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">{t('knowledgeHub.featured.title')}</h2>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
        )}
        {error && <p className="text-center text-red-500">{t('knowledgeHub.featured.error')}: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <Link key={article.id} href={`/blog/${article.id}`} passHref>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {article.imageUrl && (
                    <div className="relative h-48 w-full">
                       <Image src={article.imageUrl} alt={article.title_en} fill style={{objectFit: 'cover'}} data-ai-hint={article.dataAiHint || 'agriculture education'}/>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 h-14">{article.title_en}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{article.excerpt_en}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

// Define the structure of an article
interface Article {
  id: string;
  title_en: string;
  excerpt_en: string;
  imageUrl?: string;
  // Add other fields if necessary
}

const functions = getFunctions(firebaseApp);

const KnowledgeHubPage = () => {
  const t = useTranslations('knowledgeHub');
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFeaturedKnowledge = useMemo(() => httpsCallable(functions, 'getFeaturedKnowledge'), []);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentUserId = 'placeholderUserId'; // TODO: Replace with actual user ID fetching logic
        const result = await getFeaturedKnowledge({ userId: currentUserId });
        const data = result.data as { success: boolean, articles: Article[] };
        if (data.success) {
          setFeaturedArticles(data.articles ?? []); // Safeguard against undefined articles
        } else {
          throw new Error('Failed to fetch featured articles.');
        }
      } catch (err: any) {
        setError(err.message);
        setFeaturedArticles([]); // Ensure it's an array on error
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [getFeaturedKnowledge]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>
      </header>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t('courses.title')}</CardTitle>
            <CardDescription>{t('courses.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p>{t('courses.body')}</p>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/knowledge-hub/courses" passHref>
              <Button className="w-full">{t('courses.cta')}</Button>
            </Link>
          </div>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t('blog.title')}</CardTitle>
            <CardDescription>{t('blog.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p>{t('blog.body')}</p>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/blog" passHref>
              <Button className="w-full">{t('blog.cta')}</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Featured Articles */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">{t('featured.title')}</h2>
        {loading && <p className="text-center">{t('featured.loading')}</p>}
        {error && <p className="text-center text-red-500">{t('featured.error')}: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.length > 0 ? (
                featuredArticles.map((article) => (
                <Link key={article.id} href={`/blog/${article.id}`} passHref>
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    {article.imageUrl && (
                        <img src={article.imageUrl} alt={article.title_en} className="w-full h-48 object-cover" />
                    )}
                    <CardHeader>
                        <CardTitle>{article.title_en}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">{article.excerpt_en}</p>
                    </CardContent>
                    </Card>
                </Link>
                ))
            ) : (
                <p className="col-span-full text-center text-muted-foreground">{t('featured.noArticles')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

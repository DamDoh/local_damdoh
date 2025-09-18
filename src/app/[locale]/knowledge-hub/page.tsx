
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiCall } from '@/lib/api-utils';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { BookOpen, ArrowRight, Brain, Newspaper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Course {
  id: string;
  titleEn: string;
  descriptionEn: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CourseCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="flex-grow">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);


const KnowledgeHubPage = () => {
  const t = useTranslations('knowledgeHub');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiCall<{ success: boolean, courses: Course[] }>('/knowledge/courses');
        if (data.success) {
          setCourses(data.courses ?? []);
        } else {
          throw new Error('Failed to fetch courses.');
        }
      } catch (err: any) {
        setError(err.message);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl flex items-center justify-center gap-3">
          <BookOpen className="h-10 w-10 text-primary"/>
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('description')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5 text-primary"/>{t('blog.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{t('blog.description')}</CardDescription>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="outline" className="w-full"><Link href="/blog">{t('blog.cta')}</Link></Button>
            </CardFooter>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/>{t('aiAssistant.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{t('aiAssistant.description')}</CardDescription>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="outline" className="w-full"><Link href="/ai-assistant">{t('aiAssistant.cta')}</Link></Button>
            </CardFooter>
          </Card>
           <Card className="hover:shadow-lg transition-shadow bg-primary/10 border-primary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">{t('contribute.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{t('contribute.description')}</CardDescription>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full"><Link href="/admin/content">{t('contribute.cta')}</Link></Button>
            </CardFooter>
          </Card>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-center mb-8">{t('courses.title')}</h2>
        {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
            </div>
        )}
        {error && <p className="text-center text-red-500">{t('courses.error')}: {error}</p>}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
                courses.map((course) => (
                    <Card key={course.id} className="flex flex-col h-full">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="w-fit">{course.category}</Badge>
                                <Badge variant={course.level === 'Beginner' ? 'default' : 'outline'}>{course.level}</Badge>
                            </div>
                            <CardTitle className="pt-2">{course.titleEn}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">{course.descriptionEn}</p>
                        </CardContent>
                        <CardFooter>
                             <Button asChild className="w-full">
                                <Link href={`/knowledge-hub/courses/${course.id}`}>{t('courses.cta')} <ArrowRight className="ml-2 h-4 w-4"/></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <p className="col-span-full text-center text-muted-foreground">{t('courses.noCourses')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeHubPage;

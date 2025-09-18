
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, notFound } from 'next/navigation';
import { apiCall } from '@/lib/api-utils';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, BookOpen, Clock, Layers, PlayCircle } from 'lucide-react';
import { Link } from '@/navigation';

interface Module {
  id: string;
  title: string;
  content: { type: 'video' | 'article' | 'quiz'; url: string }[];
}

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  instructor: { name: string; title: string };
  modules: Module[];
}

function CoursePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

function CourseDetailPageContent() {
  const t = useTranslations('knowledgeHub');
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiCall<{ success: boolean; course?: CourseDetails }>(`/knowledge/courses/${courseId}`);
        const courseData = data.course;
        if (!courseData) throw new Error('Course not found.');
        setCourse(courseData);
      } catch (err: any) {
        console.error("Error fetching course details:", err);
        setError(err.message || 'Failed to load course details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (isLoading) {
    return <CoursePageSkeleton />;
  }

  if (error) {
    return <div className="text-center py-10"><p className="text-destructive">{error}</p></div>;
  }

  if (!course) {
    return notFound();
  }

  const totalModules = course.modules.length;
  // This is a placeholder, a real app would track progress
  const completedModules = Math.floor(totalModules / 3); 

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/knowledge-hub" className="inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4"/> {t('courses.backLink')}
      </Link>

      <div className="space-y-2">
        <Badge variant="secondary">{course.category}</Badge>
        <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
        <p className="text-lg text-muted-foreground">{course.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('courses.courseContentTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="item-0">
                {course.modules.map((module, index) => (
                  <AccordionItem value={`item-${index}`} key={module.id}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <Layers className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-left">{t('courses.module', { number: index + 1 })}: {module.title}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-4">
                        {module.content.map((contentItem, contentIndex) => (
                          <li key={contentIndex} className="flex items-center gap-2">
                            <PlayCircle className="h-4 w-4 text-muted-foreground" />
                            <a href={contentItem.url} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground hover:underline">
                              {contentItem.type}: {t('courses.lesson', { number: contentIndex + 1 })}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:sticky md:top-24">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('courses.instructorTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="https://placehold.co/80x80.png" alt={course.instructor.name} />
                        <AvatarFallback>{course.instructor.name.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{course.instructor.name}</p>
                        <p className="text-xs text-muted-foreground">{course.instructor.title}</p>
                    </div>
                </CardContent>
            </Card>
             <Button size="lg" className="w-full">{t('courses.enrollButton')}</Button>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPageWrapper() {
  return (
    <Suspense fallback={<CoursePageSkeleton />}>
      <CourseDetailPageContent />
    </Suspense>
  );
}

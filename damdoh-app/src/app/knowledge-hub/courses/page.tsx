
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';
import { useTranslation } from 'react-i18next';

const getCoursesFunction = httpsCallable(functions, 'getAvailableCourses');

const CourseCard = ({ course }: { course: any }) => {
    const { t } = useTranslation('common');
    return (
        <Card className="flex flex-col">
            <CardHeader>
            <div className="flex justify-between items-center mb-2">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge>{course.level}</Badge>
            </div>
            <CardTitle className="text-xl h-16">{course.titleEn}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
            <CardDescription>{course.descriptionEn}</CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/knowledge-hub/courses/${course.id}`}>{t('knowledgeHub.courses.viewButton')}</Link>
                </Button>
            </div>
        </Card>
    );
};

const CourseCardSkeleton = () => (
    <Card className="flex flex-col justify-between">
        <CardHeader>
            <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-6 w-full mt-2" />
            <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="flex-grow">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
        </CardContent>
        <div className="p-6 pt-0"><Skeleton className="h-10 w-full" /></div>
    </Card>
);

export default function KnowledgeHubCoursesPage() {
  const { t } = useTranslation('common');
  const [coursesState, setCoursesState] = useState<{ courses: any[], isLoading: boolean, error: string | null }>({ courses: [], isLoading: true, error: null });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await getCoursesFunction();
        if ((result.data as any).success) {
          setCoursesState({ courses: (result.data as any).courses, isLoading: false, error: null });
        } else {
          throw new Error((result.data as any).message || t('knowledgeHub.courses.errorLoad'));
        }
      } catch (err: any) {
        setCoursesState({ courses: [], isLoading: false, error: err.message });
      }
    };
    loadCourses();
  }, [t]);
  
  return (
    <div className="p-4 md:p-8">
      {/* ... Header and Search ... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {coursesState.isLoading ? (
          <>
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </>
        ) : coursesState.error ? (
          <p className="col-span-full text-center text-red-600">{coursesState.error}</p>
        ) : (
          coursesState.courses.map(course => <CourseCard key={course.id} course={course} />)
        )}
      </div>
    </div>
  );
}

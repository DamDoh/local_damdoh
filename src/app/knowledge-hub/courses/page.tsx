
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';

const getCoursesFunction = httpsCallable(functions, 'getAvailableCourses');

const CourseCard = ({ course }) => (
  <Card className="flex flex-col">
    <CardHeader>
      <div className="flex justify-between items-center mb-2">
        <Badge variant="secondary">{course.category}</Badge>
        <Badge>{course.level}</Badge>
      </div>
      <CardTitle className="text-xl h-16">{course.title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <CardDescription>{course.description}</CardDescription>
    </CardContent>
    <div className="p-6 pt-0"><Button className="w-full">View Course</Button></div>
  </Card>
);

const CourseCardSkeleton = () => ( /* ... */ );

export default function KnowledgeHubCoursesPage() {
  const [coursesState, setCoursesState] = useState({ courses: [], isLoading: true, error: null });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await getCoursesFunction();
        if ((result.data as any).success) {
          setCoursesState({ courses: (result.data as any).courses, isLoading: false, error: null });
        } else {
          throw new Error((result.data as any).message || "Failed to fetch courses.");
        }
      } catch (err) {
        setCoursesState({ courses: [], isLoading: false, error: err.message });
      }
    };
    loadCourses();
  }, []);
  
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

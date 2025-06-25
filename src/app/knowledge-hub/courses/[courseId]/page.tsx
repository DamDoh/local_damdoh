
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';

const getCourseDetailsFunction = httpsCallable(functions, 'getCourseDetails');

const CourseDetailSkeleton = () => ( /* ... */ );
const ModuleListItem = ({ moduleItem }) => (
  <li className="p-4 border rounded-lg">
    <h3 className="font-semibold">{moduleItem.title}</h3>
  </li>
);

export default function CourseDetailPage({ params }) {
  const [courseState, setCourseState] = useState({ course: null, isLoading: true, error: null });
  const { courseId } = params;

  useEffect(() => {
    if (!courseId) return;

    const loadCourse = async () => {
      setCourseState({ course: null, isLoading: true, error: null });
      try {
        const result = await getCourseDetailsFunction({ courseId });
        
        if ((result.data as any).success) {
          setCourseState({ course: (result.data as any).course, isLoading: false, error: null });
        } else {
          throw new Error((result.data as any).message || "Failed to fetch course details.");
        }
      } catch (err) {
        setCourseState({ course: null, isLoading: false, error: err.message });
      }
    };
    loadCourse();
  }, [courseId]);

  if (courseState.isLoading) {
    return <div className="p-8"><CourseDetailSkeleton /></div>;
  }

  if (courseState.error) {
    return <div className="p-8 text-red-600">{courseState.error}</div>;
  }
  
  const { course } = courseState;
  if (!course) return <div className="p-8">Course not found.</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold">{course.title}</h1>
        <p className="mt-4 text-lg">{course.description}</p>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
          <ul>
            {course.modules.map((mod, index) => (
              <ModuleListItem key={mod.id} moduleItem={mod} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

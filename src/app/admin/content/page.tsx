
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';

// Create callable references to our content creation functions
const createCourseFunction = httpsCallable(functions, 'createCourse');
const createArticleFunction = httpsCallable(functions, 'createKnowledgeArticle');

export default function ContentManagementPage() {
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [articleSubmitting, setArticleSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setCourseSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const formData = new FormData(event.target);
      const courseData = {
        title_en: formData.get('course_title'),
        description_en: formData.get('course_description'),
        category: formData.get('course_category'),
        level: 'Beginner',
        targetRoles: ['farmer'],
      };
      
      console.log("Calling 'createCourse' with payload:", courseData);
      const result = await createCourseFunction(courseData);

      if (!(result.data as any).success) throw new Error((result.data as any).message);

      setFeedback({ type: 'success', message: 'Course created successfully!' });
      event.target.reset();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to create course.' });
    } finally {
      setCourseSubmitting(false);
    }
  };

  const handleCreateArticle = async (event) => {
    event.preventDefault();
    setArticleSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const formData = new FormData(event.target);
      const articleData = {
        title_en: formData.get('article_title'),
        content_markdown_en: formData.get('article_content'),
        tags: formData.get('article_tags').split(',').map(tag => tag.trim()),
      };

      console.log("Calling 'createKnowledgeArticle' with payload:", articleData);
      const result = await createArticleFunction(articleData);

      if (!(result.data as any).success) throw new Error((result.data as any).message);

      setFeedback({ type: 'success', message: 'Article created successfully!' });
      event.target.reset();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to create article.' });
    } finally {
      setArticleSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* ... The rest of the component's JSX ... */}
       {feedback.message && (
        <div className={`mb-4 p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
          {feedback.message}
        </div>
      )}
      {/* ... The rest of the form JSX ... */}
    </div>
  );
}

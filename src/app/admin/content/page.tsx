
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { functions } from '@/lib/firebase/client';
import { httpsCallable } from 'firebase/functions';
import { Separator } from '@/components/ui/separator';

// Create callable references to our content creation functions
const createCourseFunction = httpsCallable(functions, 'createCourse');
const createArticleFunction = httpsCallable(functions, 'createKnowledgeArticle');

export default function ContentManagementPage() {
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [articleSubmitting, setArticleSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCourseSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const formData = new FormData(event.target as HTMLFormElement);
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
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message || 'Failed to create course.' });
    } finally {
      setCourseSubmitting(false);
    }
  };

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
      };

      console.log("Calling 'createKnowledgeArticle' with payload:", articleData);
      const result = await createArticleFunction(articleData);

      if (!(result.data as any).success) throw new Error((result.data as any).message);

      setFeedback({ type: 'success', message: 'Article created successfully!' });
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message || 'Failed to create article.' });
    } finally {
      setArticleSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
       {feedback.message && (
        <div className={`md:col-span-2 mb-4 p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {feedback.message}
        </div>
      )}
      
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
          <CardDescription>Develop a new course for the Knowledge Hub.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCourse} className="space-y-4">
             <div className="space-y-1.5">
                <Label htmlFor="course_title">Course Title</Label>
                <Input id="course_title" name="course_title" required />
            </div>
             <div className="space-y-1.5">
                <Label htmlFor="course_description">Course Description</Label>
                <Textarea id="course_description" name="course_description" required />
            </div>
             <div className="space-y-1.5">
                <Label htmlFor="course_category">Category</Label>
                <Input id="course_category" name="course_category" required />
            </div>
            <Button type="submit" disabled={courseSubmitting}>
                {courseSubmitting ? 'Creating...' : 'Create Course'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Create Knowledge Article</CardTitle>
          <CardDescription>Write a blog post or news update.</CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleCreateArticle} className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-primary">English Content</h4>
                <div className="space-y-1.5">
                    <Label htmlFor="article_title_en">Article Title (EN)</Label>
                    <Input id="article_title_en" name="article_title_en" required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_excerpt_en">Excerpt (EN)</Label>
                    <Textarea id="article_excerpt_en" name="article_excerpt_en" required className="h-24" />
                    <p className="text-xs text-muted-foreground">A short summary for the article preview.</p>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_content_en">Full Content (EN, Markdown supported)</Label>
                    <Textarea id="article_content_en" name="article_content_en" required className="h-40" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-primary">Khmer Content (ភាសាខ្មែរ)</h4>
                 <div className="space-y-1.5">
                    <Label htmlFor="article_title_km">Article Title (KM)</Label>
                    <Input id="article_title_km" name="article_title_km" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_excerpt_km">Excerpt (KM)</Label>
                    <Textarea id="article_excerpt_km" name="article_excerpt_km" className="h-24" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_content_km">Full Content (KM)</Label>
                    <Textarea id="article_content_km" name="article_content_km" className="h-40" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-primary">Metadata</h4>
                <div className="space-y-1.5">
                    <Label htmlFor="article_category">Category</Label>
                    <Input id="article_category" name="article_category" placeholder="e.g., Blog, Industry News, Sustainability" required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_author">Author</Label>
                    <Input id="article_author" name="article_author" placeholder="e.g., Dr. Green Thumb" defaultValue="DamDoh Team" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_tags">Tags (comma-separated)</Label>
                    <Input id="article_tags" name="article_tags" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_image_url">Image URL (Optional)</Label>
                    <Input id="article_image_url" name="article_image_url" placeholder="https://placehold.co/600x400.png" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_data_ai_hint">Image AI Hint (Optional)</Label>
                    <Input id="article_data_ai_hint" name="article_data_ai_hint" placeholder="e.g., sustainable farming field" />
                </div>
              </div>
              <Button type="submit" disabled={articleSubmitting}>
                {articleSubmitting ? 'Publishing...' : 'Publish Article'}
              </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}

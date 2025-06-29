
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
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

// Create callable references to our content creation functions
const createCourseFunction = httpsCallable(functions, 'createCourse');
const createArticleFunction = httpsCallable(functions, 'createKnowledgeArticle');

export default function ContentManagementPage() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [articleSubmitting, setArticleSubmitting] = useState(false);

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCourseSubmitting(true);

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const courseData = {
        title_en: formData.get('course_title'),
        description_en: formData.get('course_description'),
        category: formData.get('course_category'),
        level: 'Beginner',
        targetRoles: ['farmer'],
      };
      
      const result = await createCourseFunction(courseData);
      if (!(result.data as any).success) throw new Error((result.data as any).message);

      toast({ title: t('adminPage.content.courseSuccess') });
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: t('adminPage.content.failMessage'), description: error.message || t('adminPage.content.courseFail')});
    } finally {
      setCourseSubmitting(false);
    }
  };

  const handleCreateArticle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setArticleSubmitting(true);

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

      const result = await createArticleFunction(articleData);
      if (!(result.data as any).success) throw new Error((result.data as any).message);
      
      toast({ title: t('adminPage.content.articleSuccess') });
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: t('adminPage.content.failMessage'), description: error.message || t('adminPage.content.articleFail') });
    } finally {
      setArticleSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t('adminPage.content.createCourseTitle')}</CardTitle>
          <CardDescription>{t('adminPage.content.createCourseDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCourse} className="space-y-4">
             <div className="space-y-1.5">
                <Label htmlFor="course_title">{t('adminPage.content.courseTitleLabel')}</Label>
                <Input id="course_title" name="course_title" required />
            </div>
             <div className="space-y-1.5">
                <Label htmlFor="course_description">{t('adminPage.content.courseDescriptionLabel')}</Label>
                <Textarea id="course_description" name="course_description" required />
            </div>
             <div className="space-y-1.5">
                <Label htmlFor="course_category">{t('adminPage.content.categoryLabel')}</Label>
                <Input id="course_category" name="course_category" required />
            </div>
            <Button type="submit" disabled={courseSubmitting}>
                {courseSubmitting ? t('adminPage.content.creatingCourseButton') : t('adminPage.content.createCourseButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t('adminPage.content.createArticleTitle')}</CardTitle>
          <CardDescription>{t('adminPage.content.createArticleDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleCreateArticle} className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-primary">{t('adminPage.content.englishContent')}</h4>
                <div className="space-y-1.5">
                    <Label htmlFor="article_title_en">{t('adminPage.content.articleTitleEn')}</Label>
                    <Input id="article_title_en" name="article_title_en" required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_excerpt_en">{t('adminPage.content.excerptEn')}</Label>
                    <Textarea id="article_excerpt_en" name="article_excerpt_en" required className="h-24" />
                    <p className="text-xs text-muted-foreground">{t('adminPage.content.excerptDescription')}</p>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_content_en">{t('adminPage.content.fullContentEn')}</Label>
                    <Textarea id="article_content_en" name="article_content_en" required className="h-40" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-primary">{t('adminPage.content.khmerContent')}</h4>
                 <div className="space-y-1.5">
                    <Label htmlFor="article_title_km">{t('adminPage.content.articleTitleKm')}</Label>
                    <Input id="article_title_km" name="article_title_km" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_excerpt_km">{t('adminPage.content.excerptKm')}</Label>
                    <Textarea id="article_excerpt_km" name="article_excerpt_km" className="h-24" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_content_km">{t('adminPage.content.fullContentKm')}</Label>
                    <Textarea id="article_content_km" name="article_content_km" className="h-40" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-primary">{t('adminPage.content.metadataTitle')}</h4>
                <div className="space-y-1.5">
                    <Label htmlFor="article_category">{t('adminPage.content.articleCategoryLabel')}</Label>
                    <Input id="article_category" name="article_category" placeholder={t('adminPage.content.categoryPlaceholder')} required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_author">{t('adminPage.content.authorLabel')}</Label>
                    <Input id="article_author" name="article_author" placeholder={t('adminPage.content.authorPlaceholder')} defaultValue={t('adminPage.content.defaultAuthor')} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_tags">{t('adminPage.content.tagsLabel')}</Label>
                    <Input id="article_tags" name="article_tags" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_image_url">{t('adminPage.content.imageUrlLabel')}</Label>
                    <Input id="article_image_url" name="article_image_url" placeholder={t('adminPage.content.imageUrlPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="article_data_ai_hint">{t('adminPage.content.imageAiHintLabel')}</Label>
                    <Input id="article_data_ai_hint" name="article_data_ai_hint" placeholder={t('adminPage.content.aiHintPlaceholder')} />
                </div>
              </div>
              <Button type="submit" disabled={articleSubmitting}>
                {articleSubmitting ? t('adminPage.content.publishingButton') : t('adminPage.content.publishButton')}
              </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}

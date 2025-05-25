
"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createForumTopicSchema, type CreateForumTopicValues } from "@/lib/form-schemas";
import { ArrowLeft, Send, MessageSquare, CaseUpper, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateForumTopicPage() {
  const { toast } = useToast();

  const form = useForm<CreateForumTopicValues>({
    resolver: zodResolver(createForumTopicSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(data: CreateForumTopicValues) {
    console.log("New Forum Topic Data:", data);
    // In a real app, you would submit this data to your backend
    // and then likely redirect the user to the new topic or the forums list.
    toast({
      title: "Topic Submitted (Simulated)",
      description: "Your new forum topic has been created (details logged to console).",
    });
    // Optionally, redirect or clear form:
    // form.reset(); 
    // router.push('/forums');
  }

  return (
    <div className="space-y-6">
      <Link href="/forums" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Agri-Supply Chain Forums
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">Start a New Discussion</CardTitle>
          </div>
          <CardDescription>Share your insights, ask questions, or propose solutions related to the agricultural supply chain.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><CaseUpper className="h-4 w-4 text-muted-foreground" />Discussion Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Best practices for reducing post-harvest losses in maize" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear and concise title helps others understand the topic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Opening Post / Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Elaborate on your discussion topic. Provide context, specific questions, or points you'd like to cover..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be the first post in your new discussion topic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Optionally, add category selection here if implemented */}
              <Button type="submit" className="w-full md:w-auto">
                <Send className="mr-2 h-4 w-4" /> Post New Discussion
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

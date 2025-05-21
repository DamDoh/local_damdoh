

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ForumTopic, ForumPost as ForumPostType } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquare, ThumbsUp, Send, UserCircle, Truck } from "lucide-react";
import { dummyForumTopicDetail, dummyForumPosts, dummyUsersData } from "@/lib/dummy-data"; // Import dummy data

export default function ForumTopicPage({ params }: { params: { topicId: string } }) {
  // In a real app, you would fetch topic and posts data based on params.topicId
  // Using dummy data for 'agri-logistics' (or a specific topic if params.topicId matches)
  const forumTopic = dummyForumTopicDetail; // Assuming this is the specific topic being viewed
  const forumPosts = dummyForumPosts.filter(post => post.topicId === forumTopic.id);
  const users = dummyUsersData; // Using the centralized user data

  if (!forumTopic) {
    return <p>Forum topic not found.</p>;
  }
  const creator = users[forumTopic.creatorId] || { name: 'Unknown Creator' };

  function ForumPost({ post }: { post: ForumPostType }) {
    const author = users[post.authorId] || { name: 'Unknown User', role: 'Stakeholder' };
    return (
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={author.avatarUrl} alt={author.name} data-ai-hint="profile agriculture" />
              <AvatarFallback>{author.name.substring(0,1)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/profiles/${post.authorId}`} className="font-semibold text-sm hover:underline">{author.name}</Link>
                  {author.role && <p className="text-xs text-muted-foreground">{author.role}</p>}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-2 text-sm text-foreground/90 whitespace-pre-line">{post.content}</p>
              <div className="mt-3 flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <ThumbsUp className="mr-1 h-4 w-4" /> {post.likes} Likes
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <MessageSquare className="mr-1 h-4 w-4" /> Reply
                </Button>
              </div>
            </div>
          </div>
          {post.replies && post.replies.length > 0 && (
            <div className="ml-10 mt-4 space-y-3 border-l pl-4">
              {post.replies.map(reply => <ForumPost key={reply.id} post={reply} />)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/forums" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Agri-Supply Chain Forums
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {forumTopic.icon === 'Truck' && <Truck className="h-7 w-7 text-primary" />}
            <CardTitle className="text-3xl">{forumTopic.title}</CardTitle>
          </div>
          <CardDescription className="text-md mt-1">{forumTopic.description}</CardDescription>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>{forumTopic.postCount} contributions</span>
            <span>Created by: <Link href={`/profiles/${forumTopic.creatorId}`} className="text-primary hover:underline">{creator.name}</Link></span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contribute to Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-start">
             <Avatar className="h-10 w-10 border mt-1">
                <AvatarImage src={users['currentUser']?.avatarUrl} alt={users['currentUser']?.name} data-ai-hint="profile supply chain" />
                <AvatarFallback><UserCircle /></AvatarFallback>
            </Avatar>
            <Textarea placeholder="Share your experience, ask a question, or offer a solution..." className="min-h-[100px] flex-grow" />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button><Send className="mr-2 h-4 w-4" />Post Contribution</Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contributions</h2>
        {forumPosts.map(post => (
          <ForumPost key={post.id} post={post} />
        ))}
        {forumPosts.length === 0 && <p className="text-muted-foreground">No contributions in this topic yet. Be the first to share your insights!</p>}
      </div>
    </div>
  );
}

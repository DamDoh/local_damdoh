import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ForumTopic, ForumPost as ForumPostType } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquare, ThumbsUp, Send, UserCircle } from "lucide-react";

// Dummy data for a single forum topic and its posts - replace with actual data fetching
const forumTopic: ForumTopic = {
  id: 'ft1',
  title: 'Sustainable Farming Practices',
  description: 'A dedicated space to discuss, share, and learn about eco-friendly farming methods, soil health improvement, water conservation techniques, and biodiversity in agriculture. All members are encouraged to contribute their experiences, ask questions, and collaborate on sustainable solutions.',
  postCount: 125,
  lastActivityAt: new Date(Date.now() - 3600000).toISOString(),
  creatorId: 'user1',
  icon: 'Leaf',
};

const forumPosts: ForumPostType[] = [
  {
    id: 'post1',
    topicId: 'ft1',
    authorId: 'user2',
    content: "Has anyone tried using cover crops for nitrogen fixation? I'm looking for recommendations for a clay-heavy soil type. Any insights on specific species or planting times would be greatly appreciated!",
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    likes: 15,
    replies: [
      { id: 'reply1', topicId: 'ft1', authorId: 'user3', content: "Yes, I've had great success with crimson clover on similar soil. Planted it in early fall.", createdAt: new Date(Date.now() - 7200000).toISOString(), likes: 5 },
      { id: 'reply2', topicId: 'ft1', authorId: 'user4', content: "Hairy vetch is another good option. It's quite resilient.", createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 3 },
    ]
  },
  {
    id: 'post2',
    topicId: 'ft1',
    authorId: 'user5',
    content: "I'm interested in learning more about no-till farming. What are the main benefits and challenges I should be aware of before transitioning? Are there any specific equipment recommendations for small-scale farms?",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    likes: 22,
  },
];

// Dummy user data for author lookup
const users: { [key: string]: { name: string, avatarUrl?: string } } = {
  'user1': { name: 'Admin User', avatarUrl: 'https://placehold.co/40x40.png' },
  'user2': { name: 'Alice Farmer', avatarUrl: 'https://placehold.co/40x40.png' },
  'user3': { name: 'Bob Supplier', avatarUrl: 'https://placehold.co/40x40.png' },
  'user4': { name: 'Carol Processor', avatarUrl: 'https://placehold.co/40x40.png' },
  'user5': { name: 'David Trader', avatarUrl: 'https://placehold.co/40x40.png' },
};

function ForumPost({ post }: { post: ForumPostType }) {
  const author = users[post.authorId] || { name: 'Unknown User' };
  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={author.avatarUrl} alt={author.name} data-ai-hint="profile person" />
            <AvatarFallback>{author.name.substring(0,1)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Link href={`/profiles/${post.authorId}`} className="font-semibold text-sm hover:underline">{author.name}</Link>
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


export default function ForumTopicPage({ params }: { params: { topicId: string } }) {
  // In a real app, you would fetch topic and posts data based on params.topicId
  
  if (!forumTopic) {
    return <p>Forum topic not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/forums" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Forums
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{forumTopic.title}</CardTitle>
          <CardDescription className="text-md mt-1">{forumTopic.description}</CardDescription>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>{forumTopic.postCount} posts</span>
            <span>Created by: <Link href={`/profiles/${forumTopic.creatorId}`} className="text-primary hover:underline">{users[forumTopic.creatorId]?.name || 'Unknown'}</Link></span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-start">
             <Avatar className="h-10 w-10 border mt-1">
                <AvatarImage src={users['user1']?.avatarUrl} alt={users['user1']?.name} data-ai-hint="profile person" />
                <AvatarFallback><UserCircle /></AvatarFallback>
            </Avatar>
            <Textarea placeholder="Write your post here..." className="min-h-[100px] flex-grow" />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button><Send className="mr-2 h-4 w-4" />Post Reply</Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Posts</h2>
        {forumPosts.map(post => (
          <ForumPost key={post.id} post={post} />
        ))}
        {forumPosts.length === 0 && <p className="text-muted-foreground">No posts in this topic yet. Be the first to contribute!</p>}
      </div>
      {/* Pagination for posts could go here */}
    </div>
  );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ForumTopic, ForumPost as ForumPostType } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquare, ThumbsUp, Send, UserCircle, Truck } from "lucide-react"; // Changed Leaf to Truck

// Dummy data for a single forum topic and its posts - supply chain focus
const forumTopic: ForumTopic = {
  id: 'agri-logistics',
  title: 'Agri-Logistics & Cold Chain Management',
  description: 'A forum for discussing challenges and solutions in transporting perishable goods, warehouse optimization, last-mile delivery strategies, and cold chain technologies to reduce post-harvest losses and ensure quality.',
  postCount: 250,
  lastActivityAt: new Date(Date.now() - 900000).toISOString(),
  creatorId: 'logisticsGuru',
  icon: 'Truck', // Relevant icon
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), 
};

const forumPosts: ForumPostType[] = [
  {
    id: 'post1',
    topicId: 'agri-logistics',
    authorId: 'freshProduceExporter',
    content: "We're facing challenges with maintaining consistent temperature for mango shipments from West Africa to Europe. Any recommendations for affordable and reliable reefer container monitoring solutions? Also, looking for partners for shared container space.",
    createdAt: new Date(Date.now() - 10800000).toISOString(), 
    likes: 28,
    replies: [
      { id: 'reply1', topicId: 'agri-logistics', authorId: 'coldChainTech', content: "For monitoring, check out 'TempSure IoT'. We offer real-time tracking with alerts. Regarding shared space, we might have some capacity on routes from Lagos. DM me your volume and destination.", createdAt: new Date(Date.now() - 7200000).toISOString(), likes: 12 },
      { id: 'reply2', topicId: 'agri-logistics', authorId: 'logisticsConsultant', content: "Beyond tech, ensure your pre-cooling protocols are robust. Improper pre-cooling is a common culprit. Happy to share a checklist if interested. Also, explore vacuum sealing for certain mango varieties.", createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 9 },
    ]
  },
  {
    id: 'post2',
    topicId: 'agri-logistics',
    authorId: 'warehouseManagerAnna',
    content: "Seeking advice on optimizing warehouse layout for a multi-commodity storage facility (grains, pulses, some horticulture). How do you balance accessibility, FIFO, and pest control in a mixed-use space?",
    createdAt: new Date(Date.now() - 86400000).toISOString(), 
    likes: 19,
     replies: [
      { id: 'reply3', topicId: 'agri-logistics', authorId: 'storageSolutionsInc', content: "Consider mobile racking systems for flexibility. We also provide hermetic storage bags for grains/pulses which can be very effective for pest control. We have case studies from similar facilities in East Africa.", createdAt: new Date(Date.now() - 80000000).toISOString(), likes: 7 },
    ]
  },
];

// Dummy user data for author lookup - supply chain roles
const users: { [key: string]: { name: string, avatarUrl?: string, role?: string } } = {
  'logisticsGuru': { name: 'Logistics Expert Mod', avatarUrl: 'https://placehold.co/40x40.png', role: 'Moderator' },
  'freshProduceExporter': { name: 'Amina Exports Ltd.', avatarUrl: 'https://placehold.co/40x40.png', role: 'Fruit Exporter' },
  'coldChainTech': { name: 'CoolTech Solutions', avatarUrl: 'https://placehold.co/40x40.png', role: 'Cold Chain Technology Provider' },
  'logisticsConsultant': { name: 'Dr. Raj Singh', avatarUrl: 'https://placehold.co/40x40.png', role: 'Supply Chain Consultant' },
  'warehouseManagerAnna': { name: 'Anna Petrova', avatarUrl: 'https://placehold.co/40x40.png', role: 'Warehouse Manager' },
  'storageSolutionsInc': { name: 'StoreSafe Systems', avatarUrl: 'https://placehold.co/40x40.png', role: 'Storage Solutions Provider' },
  'currentUser': { name: 'My AgriBusiness', avatarUrl: 'https://placehold.co/40x40.png', role: 'Agri-Entrepreneur'}, 
};

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


export default function ForumTopicPage({ params }: { params: { topicId: string } }) {
  // In a real app, you would fetch topic and posts data based on params.topicId
  // Using dummy data for 'agri-logistics'
  
  if (!forumTopic) {
    return <p>Forum topic not found.</p>;
  }
  const creator = users[forumTopic.creatorId] || { name: 'Unknown Creator' };

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
      {/* Pagination for posts could go here */}
    </div>
  );
}

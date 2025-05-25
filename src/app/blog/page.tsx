
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rss, Feather, TrendingUp, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const dummyBlogPosts = [
  {
    id: "blog1",
    title: "5 Sustainable Farming Practices to Boost Your Yield and Soil Health",
    author: "Dr. Green Thumb",
    date: "October 28, 2023",
    excerpt: "Discover proven techniques like cover cropping, no-till farming, and integrated pest management that can transform your farm...",
    category: "Sustainable Agriculture",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "sustainable farming field",
    slug: "/blog/sustainable-farming-practices"
  },
  {
    id: "blog2",
    title: "The Future of Agri-Tech: AI and Automation in Farming",
    author: "Tech Savvy Farmer",
    date: "October 25, 2023",
    excerpt: "Explore how artificial intelligence, drones, and robotics are revolutionizing farming operations, from planting to harvest...",
    category: "Agri-Tech",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "drone agriculture technology",
    slug: "/blog/future-of-agritech"
  },
  {
    id: "blog3",
    title: "Navigating Market Volatility: Tips for Smallholder Farmers",
    author: "Market Analyst Pro",
    date: "October 22, 2023",
    excerpt: "Understand the factors driving price fluctuations and learn strategies to mitigate risks and secure better prices for your produce...",
    category: "Market Insights",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "market chart graph",
    slug: "/blog/market-volatility-tips"
  }
];


export default function BlogPage() {
  const posts = dummyBlogPosts; // In a real app, this would be fetched data

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
           <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Rss className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">DamDoh Agri-Insights Blog</CardTitle>
          </div>
          <CardDescription className="text-lg">
            News, insights, success stories, and expert advice from the DamDoh community and agricultural experts.
          </CardDescription>
        </CardHeader>
      </Card>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {post.imageUrl && (
                <div className="relative h-56 w-full">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{objectFit: 'cover'}}
                    data-ai-hint={post.dataAiHint || "agriculture blog image"}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                  <Link href={post.slug}>{post.title}</Link>
                </CardTitle>
                <CardDescription className="text-xs">
                  By {post.author} on {post.date} | Category: {post.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardContent className="pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href={post.slug}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
              <Feather className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">Blog Posts Coming Soon!</h3>
              <p className="text-muted-foreground max-w-md">
                Our team and community experts are busy preparing insightful articles. Check back soon for the latest updates on sustainable agriculture, market trends, and agri-tech innovations!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

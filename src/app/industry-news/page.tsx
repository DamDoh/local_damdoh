
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, TrendingUp, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

// Dummy data for news/reports - replace with actual data fetching
const dummyNewsItems = [
  {
    id: "news1",
    title: "Global Grain Prices Surge Amidst Supply Chain Disruptions",
    source: "AgriMarket Insights",
    date: "October 29, 2023",
    excerpt: "An in-depth analysis of the factors contributing to the recent volatility in global grain markets, including logistical challenges and weather patterns...",
    category: "Market Trends",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "grain market chart",
    link: "#news1-detail"
  },
  {
    id: "news2",
    title: "New EU Regulations on Sustainable Packaging for Food Products",
    source: "FoodPolicy Watch",
    date: "October 27, 2023",
    excerpt: "Understanding the implications of the upcoming EU directives on sustainable packaging and how they will affect agricultural exporters...",
    category: "Regulations",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "packaging food eco",
    link: "#news2-detail"
  },
  {
    id: "news3",
    title: "Report: The Rise of Regenerative Agriculture in North America",
    source: "Sustainable Farming Today",
    date: "October 25, 2023",
    excerpt: "A comprehensive report highlighting the growth of regenerative farming practices, their impact on soil health, and market opportunities for producers...",
    category: "Sustainability",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "regenerative agriculture field",
    link: "#news3-detail"
  }
];

const newsCategories = ["All", "Market Trends", "Technology", "Sustainability", "Regulations", "Research"];

export default function IndustryNewsPage() {
  const newsItems = dummyNewsItems; // In a real app, this would be fetched and filterable

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
           <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Newspaper className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">Industry News & Reports</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Stay informed with the latest updates, research, and market analysis relevant to the agricultural supply chain.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end sticky top-20 bg-background/90 p-4 rounded-lg shadow z-10 -mx-4 md:mx-0"> {/* Added sticky positioning and background */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search news by keyword or source..." 
            className="pl-10" 
          />
        </div>
        <Select defaultValue="All">
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {newsCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {newsItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {item.imageUrl && (
                <div className="relative h-56 w-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{objectFit: 'cover'}}
                    data-ai-hint={item.dataAiHint || "agriculture news image"}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                  <Link href={item.link}>{item.title}</Link>
                </CardTitle>
                <CardDescription className="text-xs">
                  Source: {item.source} | Published: {item.date} | Category: {item.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>
              </CardContent>
              <CardContent className="pt-2">
                 <Button asChild variant="outline" className="w-full">
                  <Link href={item.link}>Read Full Article</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
              <TrendingUp className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">Latest News & Reports Coming Soon!</h3>
              <p className="text-muted-foreground max-w-md">
                Our team is curating the most relevant agricultural news, market analysis, and research findings. Check back regularly for insights to help you make informed decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

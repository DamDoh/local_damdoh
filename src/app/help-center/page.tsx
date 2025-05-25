
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Search, BookOpen, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HelpCenterPage() {
  const faqCategories = [
    { name: "Getting Started", icon: <BookOpen className="h-5 w-5 text-primary" />, description: "Learn the basics of using DamDoh.", link: "#getting-started" },
    { name: "Marketplace Guide", icon: <ListChecks className="h-5 w-5 text-primary" />, description: "How to buy, sell, and list products/services.", link: "#marketplace-guide" },
    { name: "Account Management", icon: <HelpCircle className="h-5 w-5 text-primary" />, description: "Manage your profile and settings.", link: "#account-management" },
    { name: "Troubleshooting", icon: <HelpCircle className="h-5 w-5 text-primary" />, description: "Common issues and how to resolve them.", link: "#troubleshooting" },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <HelpCircle className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">DamDoh Help Center</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Find answers to your questions, tutorials, and guides to get the most out of DamDoh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          <section className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-3">How can we help you today?</h2>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search our knowledge base (e.g., 'how to list product', 'change password')" className="pl-10 h-12 text-md" />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">Browse Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqCategories.map((category) => (
                <Link href={category.link} key={category.name} className="block hover:no-underline">
                  <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 h-full">
                    <CardHeader className="flex flex-row items-center gap-3">
                      {category.icon}
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
          
          <section className="text-center">
             <h2 className="text-2xl font-semibold text-foreground mb-3">Still Need Help?</h2>
             <p className="text-muted-foreground mb-4">
                If you can't find what you're looking for, our support team is ready to assist you.
             </p>
             <Button asChild>
                <Link href="/contact">Contact Support</Link>
             </Button>
          </section>

          <section id="getting-started" className="pt-6">
             <h3 className="text-xl font-semibold text-foreground mb-3">Getting Started (Placeholder)</h3>
             <p className="text-muted-foreground">This section will cover creating your account, setting up your profile, and navigating the DamDoh platform for the first time. Tutorials and step-by-step guides will be available here.</p>
          </section>
           <section id="marketplace-guide" className="pt-6">
             <h3 className="text-xl font-semibold text-foreground mb-3">Marketplace Guide (Placeholder)</h3>
             <p className="text-muted-foreground">Learn how to create listings for products and services, search the marketplace, connect with buyers/sellers, and manage your transactions. Tips for effective listings and safe trading will be included.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

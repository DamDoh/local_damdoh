
"use client"; // Changed to client component to simulate data fetching

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { termsOfServiceData, type PolicyContent } from "@/lib/policy-data"; // Import dummy data
import { Skeleton } from "@/components/ui/skeleton";

export default function TermsOfServicePage() {
  const [policy, setPolicy] = useState<PolicyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching policy data
    const fetchPolicy = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setPolicy(termsOfServiceData);
      setIsLoading(false);
    };

    fetchPolicy();
  }, []);

  if (isLoading || !policy) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              <Skeleton className="h-7 w-48" />
            </div>
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            <CardTitle className="text-3xl">{policy.title}</CardTitle>
          </div>
          <CardDescription>Last Updated: {policy.lastUpdated}</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
          <p>{policy.introduction}</p>
          {policy.sections.map((section, index) => (
            <div key={index} className="mt-6">
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              {Array.isArray(section.content) ? (
                section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="mt-2 text-muted-foreground">{paragraph}</p>
                ))
              ) : (
                <p className="mt-2 text-muted-foreground">{section.content}</p>
              )}
            </div>
          ))}
          {policy.conclusion && <p className="mt-6">{policy.conclusion}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

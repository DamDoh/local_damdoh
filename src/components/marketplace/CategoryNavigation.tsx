
"use client";

import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CategoryNode, RootCategoryId } from "@/lib/category-data";
import { ROOT_CATEGORIES, AGRICULTURAL_CATEGORIES } from "@/lib/category-data";
import { cn } from "@/lib/utils";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export function CategoryNavigation() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentCategory = searchParams.get('category');

  const handleCategorySelect = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === currentCategory) {
      params.delete('category'); // Toggle: if same category clicked, remove filter
    } else {
      params.set('category', categoryId);
    }
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Determine open accordions based on currentCategory
  const openAccordionItems: string[] = [];
  if (currentCategory) {
    const selectedCat = AGRICULTURAL_CATEGORIES.find(cat => cat.id === currentCategory);
    if (selectedCat) {
      openAccordionItems.push(selectedCat.parent.toLowerCase());
    }
  }


  return (
    <Card className="sticky top-20 shadow-md h-[calc(100vh-6rem)] flex flex-col">
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg">All Categories</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-0">
          <Accordion type="multiple" defaultValue={openAccordionItems} className="w-full">
            {ROOT_CATEGORIES.map((rootCat) => {
              const subCategories = AGRICULTURAL_CATEGORIES.filter(
                (subCat) => subCat.parent.toLowerCase() === rootCat.id.toLowerCase()
              );
              return (
                <AccordionItem value={rootCat.id} key={rootCat.id} className="border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-sm font-semibold hover:no-underline [&[data-state=open]>svg]:text-primary">
                    <div className="flex items-center gap-2">
                      <rootCat.icon className="h-5 w-5 text-primary/80" />
                      {rootCat.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <ul className="space-y-0.5 pl-4 pr-2 pb-2">
                      {subCategories.map((subCat) => (
                        <li key={subCat.id}>
                          <button
                            onClick={() => handleCategorySelect(subCat.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-accent transition-colors",
                              currentCategory === subCat.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {subCat.icon && <subCat.icon className="h-4 w-4 shrink-0" />}
                            <span className="flex-grow">{subCat.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

// Need to import Card, CardHeader, CardTitle, CardContent
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

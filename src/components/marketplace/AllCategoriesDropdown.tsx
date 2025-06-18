
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LayoutGrid, LucideIcon } from "lucide-react";
import { ROOT_CATEGORIES, AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function AllCategoriesDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get("category");
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null || categoryId === currentCategory) {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 min-w-[180px] justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>All Categories</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-[70vh] overflow-y-auto">
        <DropdownMenuItem
          onSelect={() => handleCategorySelect(null)}
          className={cn(!currentCategoryId && "bg-accent")}
        >
          View All Items
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {AGRICULTURAL_CATEGORIES
          .filter(cat => !cat.parent) // Only show top-level categories
          .map((topLevelCat) => {
            if (topLevelCat.children && topLevelCat.children.length > 0) {
              // Handle categories with children as submenus
              return (
                <DropdownMenuSub key={topLevelCat.id}>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    {topLevelCat.icon && <topLevelCat.icon className="h-4 w-4 text-muted-foreground" />}
                    <span>{topLevelCat.name}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-48">
                      {topLevelCat.children.map((subCatId) => {
                        const subCat = AGRICULTURAL_CATEGATEGORIES.find(cat => cat.id === subCatId);
                        if (!subCat) return null;
                        return (
                          <DropdownMenuItem
                            key={subCat.id}
                            onSelect={() => handleCategorySelect(subCat.id)}
                            className={cn(currentCategoryId === subCat.id && "bg-accent")}
                          >
                            {subCat.icon && <subCat.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                            <span>{subCat.name}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              );
            } else {
              // Handle top-level categories without children as simple menu items
              return (
                <DropdownMenuItem
                  key={topLevelCat.id}
                  onSelect={() => handleCategorySelect(topLevelCat.id)}
                  className={cn(currentCategoryId === topLevelCat.id && "bg-accent")}
                >
                  {topLevelCat.icon && <topLevelCat.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                  <span>{topLevelCat.name}</span>
                </DropdownMenuItem>
              );
            }
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


            <DropdownMenuSub key={rootCat.id}>
              <DropdownMenuSubTrigger className="flex items-center gap-2">
 {rootCat.icon && <rootCat.icon className="h-4 w-4 text-muted-foreground" />}
                <span>{rootCat.name}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48">
                  {AGRICULTURAL_CATEGORIES
                    .filter((subCat) => subCat.parent === rootCat.id)
 .map((subCat) => (
                      <DropdownMenuItem
                        key={subCat.id}
                        onSelect={() => handleCategorySelect(subCat.id)}
                        className={cn(currentCategory === subCat.id && "bg-accent")}
                      >
 {subCat.icon && <subCat.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                        <span>{subCat.name}</span>
                      </DropdownMenuItem>
 ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
 })}
 {AGRICULTURAL_CATEGORIES
 .filter((cat) => !cat.parent)
 .map((topLevelCat) => (
                <DropdownMenuItem
 key={topLevelCat.id}
 onSelect={() => handleCategorySelect(topLevelCat.id)}
 className={cn(currentCategory === topLevelCat.id && "bg-accent")}
 >
 {topLevelCat.icon && <topLevelCat.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                  <span>{topLevelCat.name}</span>
                </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


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
import { ChevronDown, LayoutGrid, Package, Users } from "lucide-react";
import { ROOT_CATEGORIES, AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function AllCategoriesDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
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
          className={cn(!currentCategory && "bg-accent")}
        >
          View All Items
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {ROOT_CATEGORIES.map((rootCat) => {
          const subCategories = AGRICULTURAL_CATEGORIES.filter(
            (subCat) => subCat.parent.toLowerCase() === rootCat.id.toLowerCase()
          );
          return (
            <DropdownMenuGroup key={rootCat.id}>
              <DropdownMenuLabel className="flex items-center gap-2 text-muted-foreground px-2 py-1.5">
                <rootCat.icon className="h-4 w-4" />
                {rootCat.name}
              </DropdownMenuLabel>
              {subCategories.map((subCat) => (
                <DropdownMenuItem
                  key={subCat.id}
                  onSelect={() => handleCategorySelect(subCat.id)}
                  className={cn(currentCategory === subCat.id && "bg-accent")}
                >
                  {subCat.icon && <subCat.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                  <span>{subCat.name}</span>
                </DropdownMenuItem>
              ))}
              {ROOT_CATEGORIES.indexOf(rootCat) < ROOT_CATEGORIES.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </DropdownMenuGroup>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

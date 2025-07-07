
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
import { AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { useRouter } from "@/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function AllCategoriesDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get("category");
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Marketplace.categories');

  const handleCategorySelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null || categoryId === currentCategoryId) {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false); // Close dropdown after selection
  };

  // Helper function to find children of a category
  const getChildrenOf = (parentId: string): CategoryNode[] => {
    return AGRICULTURAL_CATEGORIES.filter(cat => cat.parent === parentId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 min-w-[180px] justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>{t('allCategories')}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-[70vh] overflow-y-auto">
        <DropdownMenuItem
          onSelect={() => handleCategorySelect(null)}
          className={cn(!currentCategoryId && "bg-accent")}
        >
          {t('viewAllItems')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {AGRICULTURAL_CATEGORIES
          .filter(cat => cat.parent === 'products' || cat.parent === 'services') // Filter for top-level categories under 'products' or 'services'
          .map((topLevelCat) => {
            const children = getChildrenOf(topLevelCat.id); // Check if this category itself has children
            if (children.length > 0) {
              // This topLevelCat is a parent itself, render as SubMenu
              return (
                <DropdownMenuSub key={topLevelCat.id}>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    {topLevelCat.icon && <topLevelCat.icon className="h-4 w-4 text-muted-foreground" />}
                    <span>{topLevelCat.name}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-56"> {/* Increased width for sub-sub-menu */}
                      {/* Option to select the parent category itself */}
                       <DropdownMenuItem
                        key={`${topLevelCat.id}-parent`}
                        onSelect={() => handleCategorySelect(topLevelCat.id)}
                        className={cn(currentCategoryId === topLevelCat.id && "bg-accent", "flex items-center gap-2")}
                      >
                        {topLevelCat.icon && <topLevelCat.icon className="h-4 w-4 text-muted-foreground" />}
                        {t('viewAllCategory', { categoryName: topLevelCat.name })}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator/>
                      {children.map((subCat) => {
                        // Check if this subCat also has children (for 3rd level)
                        const grandChildren = getChildrenOf(subCat.id);
                        if (grandChildren.length > 0) {
                          return (
                            <DropdownMenuSub key={subCat.id}>
                               <DropdownMenuSubTrigger className="flex items-center gap-2">
                                {subCat.icon && <subCat.icon className="h-4 w-4 text-muted-foreground" />}
                                <span>{subCat.name}</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-56">
                                   <DropdownMenuItem
                                    key={`${subCat.id}-parent`}
                                    onSelect={() => handleCategorySelect(subCat.id)}
                                    className={cn(currentCategoryId === subCat.id && "bg-accent", "flex items-center gap-2")}
                                  >
                                    {subCat.icon && <subCat.icon className="h-4 w-4 text-muted-foreground" />}
                                    {t('viewAllCategory', { categoryName: subCat.name })}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator/>
                                  {grandChildren.map(grandChild => (
                                     <DropdownMenuItem
                                      key={grandChild.id}
                                      onSelect={() => handleCategorySelect(grandChild.id)}
                                      className={cn(currentCategoryId === grandChild.id && "bg-accent", "flex items-center gap-2")}
                                    >
                                      {grandChild.icon && <grandChild.icon className="h-4 w-4 text-muted-foreground" />}
                                      <span>{grandChild.name}</span>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          );
                        }
                        // Render as simple item if no grandchildren
                        return (
                          <DropdownMenuItem
                            key={subCat.id}
                            onSelect={() => handleCategorySelect(subCat.id)}
                            className={cn(currentCategoryId === subCat.id && "bg-accent", "flex items-center gap-2")}
                          >
                            {subCat.icon && <subCat.icon className="h-4 w-4 text-muted-foreground" />}
                            <span>{subCat.name}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              );
            } else {
              // This topLevelCat has no children, render as a simple menu item
              return (
                <DropdownMenuItem
                  key={topLevelCat.id}
                  onSelect={() => handleCategorySelect(topLevelCat.id)}
                  className={cn(currentCategoryId === topLevelCat.id && "bg-accent", "flex items-center gap-2")}
                >
                  {topLevelCat.icon && <topLevelCat.icon className="h-4 w-4 text-muted-foreground" />}
                  <span>{topLevelCat.name}</span>
                </DropdownMenuItem>
              );
            }
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
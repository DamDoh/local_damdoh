
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { AGRICULTURAL_CATEGORIES, type CategoryNode } from "@/lib/category-data";
import { useRouter } from '@/navigation';
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

  const getChildrenOf = (parentId: string): CategoryNode[] => {
    return AGRICULTURAL_CATEGORIES.filter(cat => cat.parent === parentId);
  };
  
  const topLevelCategories = AGRICULTURAL_CATEGORIES.filter(cat => cat.parent === 'products' || cat.parent === 'services');

  const renderCategoryItem = (category: CategoryNode, isSubItem: boolean = false) => {
    const children = getChildrenOf(category.id);
    if (children.length > 0) {
      return (
        <DropdownMenuSub key={category.id}>
          <DropdownMenuSubTrigger className={cn("flex items-center gap-2", currentCategoryId?.startsWith(category.id) && "bg-accent/80")}>
            {category.icon && <category.icon className="h-4 w-4 text-muted-foreground" />}
            <span>{category.name}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-56">
               <DropdownMenuItem
                onSelect={() => handleCategorySelect(category.id)}
                className={cn(currentCategoryId === category.id && "bg-accent", "flex items-center gap-2")}
               >
                 {t('viewAllCategory', { categoryName: category.name })}
               </DropdownMenuItem>
               <DropdownMenuSeparator/>
               {children.map(child => renderCategoryItem(child, true))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }

    return (
      <DropdownMenuItem
        key={category.id}
        onSelect={() => handleCategorySelect(category.id)}
        className={cn(currentCategoryId === category.id && "bg-accent", "flex items-center gap-2")}
      >
        {category.icon && <category.icon className="h-4 w-4 text-muted-foreground" />}
        <span>{category.name}</span>
      </DropdownMenuItem>
    );
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
        {topLevelCategories.map(cat => renderCategoryItem(cat))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


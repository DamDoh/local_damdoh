
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Edit, Trash2, Loader2, LayoutGrid } from 'lucide-react';

// Mock functions for now - these would call your backend
const getCategoriesFromDB = async () => {
  console.log("Fetching categories...");
  await new Promise(res => setTimeout(res, 500));
  // Return a simplified, flat list for this management UI
  return [
    { id: 'fresh-produce-fruits', name: 'Fruits', parent: 'products', icon: 'Apple' },
    { id: 'fresh-produce-vegetables', name: 'Vegetables', parent: 'products', icon: 'Carrot' },
    { id: 'logistics-transport', name: 'Logistics & Transport', parent: 'services', icon: 'Truck' },
  ];
};
const saveCategoryToDB = async (category) => {
  console.log("Saving category:", category);
  await new Promise(res => setTimeout(res, 500));
  return { ...category, id: category.id || `new-${Math.random()}` };
};
const deleteCategoryFromDB = async (categoryId) => {
  console.log("Deleting category:", categoryId);
  await new Promise(res => setTimeout(res, 500));
  return true;
};

const categoryFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  parent: z.enum(['products', 'services']),
  icon: z.string().optional(),
});
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFormValues | null>(null);
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", parent: "products", icon: "" },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategoriesFromDB();
      setCategories(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to load categories" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpen = (category: CategoryFormValues | null = null) => {
    setEditingCategory(category);
    form.reset(category || { name: "", parent: "products", icon: "" });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await saveCategoryToDB(data);
      toast({ title: `Category "${data.name}" saved successfully!` });
      setIsDialogOpen(false);
      loadCategories(); // Refresh list
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to save category" });
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        await deleteCategoryFromDB(categoryId);
        toast({ title: "Category deleted." });
        loadCategories(); // Refresh list
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to delete category" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2"><LayoutGrid className="h-6 w-6 text-primary" />Marketplace Category Management</CardTitle>
            <CardDescription>Add, edit, or remove categories for marketplace listings.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogOpen()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogDescription>
                  Manage a category for your marketplace.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Fresh Fruits" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="parent" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="products">Products</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="icon" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Name (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., Apple (from lucide-react)" {...field} /></FormControl>
                      <FormDescription>Enter a valid Lucide icon name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Category
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            {isLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="font-medium">{cat.name} <span className="text-xs text-muted-foreground font-mono">({cat.id})</span></div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDialogOpen(cat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

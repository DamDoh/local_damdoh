/**
 * Dashboard Customization Page
 * Allows users to create and customize their personal dashboard layouts
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Settings } from "lucide-react";
import { DashboardBuilder } from "@/components/ui/DashboardBuilder";
import { DashboardConfigService, DashboardLayout } from "@/services/dashboard/DashboardConfigService";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function DashboardCustomizePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  const dashboardService = DashboardConfigService.getInstance();

  useEffect(() => {
    const loadCurrentLayout = async () => {
      try {
        const layout = await dashboardService.getCurrentLayout();
        setCurrentLayout(layout);
      } catch (error) {
        console.error('Error loading current layout:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard layout.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentLayout();
  }, [dashboardService, toast]);

  const handleSaveLayout = async (layout: DashboardLayout) => {
    try {
      dashboardService.setCurrentLayout(layout.id);
      setCurrentLayout(layout);
      setShowBuilder(false);

      toast({
        title: "Dashboard Updated",
        description: "Your custom dashboard has been saved and activated.",
      });

      // Redirect back to main dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast({
        title: "Save Failed",
        description: "Unable to activate the dashboard layout.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setShowBuilder(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="container mx-auto py-8">
        <DashboardBuilder
          initialLayout={currentLayout || undefined}
          onSave={handleSaveLayout}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Customize Dashboard</h1>
              <p className="text-muted-foreground">
                Personalize your dashboard by adding and configuring widgets
              </p>
            </div>
          </div>
          <Button onClick={() => setShowBuilder(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Customize Layout
          </Button>
        </div>

        {/* Current Layout Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current Dashboard Layout
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentLayout?.name || 'Default Dashboard'} • {currentLayout?.widgets.length || 0} widgets
            </p>
          </CardHeader>
          <CardContent>
            {currentLayout && currentLayout.widgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentLayout.widgets.map(widget => (
                  <div key={widget.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{widget.title}</h4>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {widget.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Position: ({widget.position.x}, {widget.position.y}) •
                      Size: {widget.size.width}x{widget.size.height}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        widget.visible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {widget.visible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No custom layout configured yet.</p>
                <p className="text-sm">Click "Customize Layout" to add widgets and personalize your dashboard.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setShowBuilder(true)}
              >
                <Plus className="h-6 w-6" />
                <span>Add Widgets</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={async () => {
                  const defaultLayout = dashboardService.createDefaultLayout();
                  await handleSaveLayout(defaultLayout);
                }}
              >
                <Settings className="h-6 w-6" />
                <span>Reset to Default</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                asChild
              >
                <Link href="/dashboard">
                  <ArrowLeft className="h-6 w-6" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
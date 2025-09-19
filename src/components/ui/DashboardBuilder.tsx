/**
 * DashboardBuilder Component - Dashboard customization interface
 * Allows users to create personalized dashboards by selecting and arranging widgets
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Settings, Save, X, Grid3X3, Eye, EyeOff,
  Palette, Layout, Trash2, RotateCcw
} from "lucide-react";
import { DashboardConfigService, WidgetDefinition, DashboardLayout, WidgetConfig } from "@/services/dashboard/DashboardConfigService";
import { useToast } from "@/hooks/use-toast";

interface DashboardBuilderProps {
  onSave?: (layout: DashboardLayout) => void;
  onCancel?: () => void;
  initialLayout?: DashboardLayout;
}

export const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  onSave,
  onCancel,
  initialLayout
}) => {
  const { toast } = useToast();
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(
    initialLayout || {
      id: `layout-${Date.now()}`,
      name: 'My Custom Dashboard',
      widgets: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );
  const [availableWidgets, setAvailableWidgets] = useState<WidgetDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  const dashboardService = DashboardConfigService.getInstance();

  useEffect(() => {
    const widgets = dashboardService.getAvailableWidgets();
    setAvailableWidgets(widgets);
  }, [dashboardService]);

  const categories = [
    { value: 'all', label: 'All Widgets' },
    { value: 'farm-management', label: 'Farm Management' },
    { value: 'business-intelligence', label: 'Business Intelligence' },
    { value: 'communication', label: 'Communication' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'social', label: 'Social' }
  ];

  const filteredWidgets = selectedCategory === 'all'
    ? availableWidgets
    : availableWidgets.filter(widget => widget.category === selectedCategory);

  const handleAddWidget = (widget: WidgetDefinition) => {
    const newWidget: WidgetConfig = {
      id: `${widget.type}-${Date.now()}`,
      type: widget.type,
      title: widget.name,
      position: { x: 0, y: 0 }, // Simple positioning for now
      size: widget.defaultSize,
      visible: true
    };

    setCurrentLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updatedAt: new Date()
    }));

    setShowWidgetLibrary(false);

    toast({
      title: "Widget Added",
      description: `${widget.name} has been added to your dashboard.`,
    });
  };

  const handleWidgetUpdate = (widgetId: string, updates: Partial<WidgetConfig>) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
      updatedAt: new Date()
    }));
  };

  const handleWidgetRemove = (widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId),
      updatedAt: new Date()
    }));

    toast({
      title: "Widget Removed",
      description: "Widget has been removed from your dashboard.",
    });
  };

  const handleSave = async () => {
    try {
      const savedLayout = await dashboardService.saveLayout(currentLayout);
      onSave?.(savedLayout);
      toast({
        title: "Dashboard Saved",
        description: "Your custom dashboard has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save dashboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    const defaultLayout = dashboardService.createDefaultLayout();
    setCurrentLayout({
      ...defaultLayout,
      name: currentLayout.name // Keep the current name
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Builder</h2>
          <p className="text-muted-foreground">Customize your dashboard by adding and arranging widgets</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Choose a Widget</DialogTitle>
              </DialogHeader>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="farm-management">Farm</TabsTrigger>
                  <TabsTrigger value="business-intelligence">Business</TabsTrigger>
                </TabsList>
                <TabsContent value={selectedCategory} className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-1 gap-3">
                      {filteredWidgets.map(widget => (
                        <div
                          key={widget.type}
                          className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => handleAddWidget(widget)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{widget.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-medium">{widget.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {widget.description}
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {widget.category.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Dashboard
          </Button>
        </div>
      </div>

      {/* Layout Name */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Dashboard Name</label>
              <Input
                value={currentLayout.name}
                onChange={(e) => setCurrentLayout(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {currentLayout.widgets.length} widget{currentLayout.widgets.length !== 1 ? 's' : ''} added
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Widgets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Current Widgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentLayout.widgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No widgets added yet. Click "Add Widget" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentLayout.widgets.map(widget => (
                <WidgetCard
                  key={widget.id}
                  widget={widget}
                  onUpdate={handleWidgetUpdate}
                  onRemove={handleWidgetRemove}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Widget Card Component for the grid
interface WidgetCardProps {
  widget: WidgetConfig;
  onUpdate: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  onRemove: (widgetId: string) => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ widget, onUpdate, onRemove }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm truncate">{widget.title}</h4>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={() => onRemove(widget.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Widget Content Placeholder */}
      <div className="text-xs text-muted-foreground">
        {widget.type} widget
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg p-2 shadow-lg z-10 mt-1">
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium">Title</label>
              <Input
                value={widget.title}
                onChange={(e) => onUpdate(widget.id, { title: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`visible-${widget.id}`}
                checked={widget.visible}
                onChange={(e) => onUpdate(widget.id, { visible: e.target.checked })}
                className="rounded"
              />
              <label htmlFor={`visible-${widget.id}`} className="text-xs">Visible</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
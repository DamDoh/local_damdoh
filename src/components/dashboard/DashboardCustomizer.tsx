/**
 * DashboardCustomizer - Widget management interface
 * Provides drag-and-drop, visibility controls, and layout management
 */

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  X,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { WidgetConfig } from '@/hooks/useWidgetCustomization'

interface DashboardCustomizerProps {
  isOpen: boolean
  onClose: () => void
  widgets: WidgetConfig[]
  onUpdateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void
  onResetToDefault: () => void
  onExportLayout: () => string
  onImportLayout: (layoutJson: string) => boolean
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  isOpen,
  onClose,
  widgets,
  onUpdateWidget,
  onResetToDefault,
  onExportLayout,
  onImportLayout
}) => {
  const { toast } = useToast()
  const [importText, setImportText] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id)
      const newIndex = widgets.findIndex((widget) => widget.id === over.id)

      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex)

      // Update priorities based on new order
      reorderedWidgets.forEach((widget, index) => {
        onUpdateWidget(widget.id, { priority: index + 1 })
      })
    }
  }

  const handleVisibilityToggle = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId)
    if (widget) {
      onUpdateWidget(widgetId, { visible: !widget.visible })
      toast({
        title: widget.visible ? 'Widget hidden' : 'Widget shown',
        description: `${widget.title} is now ${widget.visible ? 'hidden' : 'visible'} on your dashboard.`,
      })
    }
  }

  const handleExport = () => {
    const layoutJson = onExportLayout()
    navigator.clipboard.writeText(layoutJson).then(() => {
      toast({
        title: 'Layout exported',
        description: 'Dashboard layout copied to clipboard.',
      })
    })
  }

  const handleImport = () => {
    if (importText.trim()) {
      const success = onImportLayout(importText.trim())
      if (success) {
        toast({
          title: 'Layout imported',
          description: 'Dashboard layout has been updated.',
        })
        setImportText('')
      } else {
        toast({
          title: 'Import failed',
          description: 'Invalid layout format or version mismatch.',
          variant: 'destructive'
        })
      }
    }
  }

  const handleReset = () => {
    onResetToDefault()
    toast({
      title: 'Layout reset',
      description: 'Dashboard has been reset to default layout.',
    })
  }

  if (!isOpen) return null

  const visibleWidgets = widgets.filter(w => w.visible)
  const hiddenWidgets = widgets.filter(w => !w.visible)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Dashboard
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Layout
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Import Layout</h4>
            <div className="flex gap-2">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste layout JSON here..."
                className="flex-1 min-h-[80px] p-2 border rounded-md text-sm font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
                disabled={!importText.trim()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          <Separator />

          {/* Widget Management */}
          <div className="space-y-6">
            {/* Visible Widgets */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-600" />
                Visible Widgets ({visibleWidgets.length})
                <Badge variant="secondary" className="text-xs">
                  Drag to reorder
                </Badge>
              </h4>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={visibleWidgets.map(w => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {visibleWidgets.map((widget) => (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-green-800">{widget.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {widget.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVisibilityToggle(widget.id)}
                          className="text-green-700 hover:text-green-800"
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Hidden Widgets */}
            {hiddenWidgets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-gray-400" />
                  Hidden Widgets ({hiddenWidgets.length})
                </h4>

                <div className="space-y-2">
                  {hiddenWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="font-medium text-gray-600">{widget.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {widget.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVisibilityToggle(widget.id)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              <Check className="h-4 w-4 mr-2" />
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
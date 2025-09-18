/**
 * DraggableWidget - Interactive widget with drag-and-drop support
 * Enables users to reorder and reposition dashboard widgets
 */

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { WidgetConfig } from '@/hooks/useWidgetCustomization'

interface DraggableWidgetProps {
  widget: WidgetConfig
  children: React.ReactNode
  isEditMode: boolean
  onToggleVisibility: (widgetId: string) => void
  onSettingsClick?: (widgetId: string) => void
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  children,
  isEditMode,
  onToggleVisibility,
  onSettingsClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 ${
        isEditMode ? 'ring-2 ring-blue-300 shadow-lg' : ''
      } ${!widget.visible ? 'opacity-50' : ''}`}
    >
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0 bg-white shadow-md hover:bg-gray-50"
            onClick={() => onToggleVisibility(widget.id)}
          >
            {widget.visible ? (
              <Eye className="h-3 w-3 text-green-600" />
            ) : (
              <EyeOff className="h-3 w-3 text-gray-400" />
            )}
          </Button>

          {onSettingsClick && (
            <Button
              size="sm"
              variant="secondary"
              className="h-6 w-6 p-0 bg-white shadow-md hover:bg-gray-50"
              onClick={() => onSettingsClick(widget.id)}
            >
              <Settings className="h-3 w-3 text-blue-600" />
            </Button>
          )}
        </div>
      )}

      {/* Drag Handle */}
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing"
        >
          <div className="bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50">
            <GripVertical className="h-3 w-3 text-gray-500" />
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={isEditMode ? 'pointer-events-none' : ''}>
        {children}
      </div>

      {/* Edit Mode Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 bg-blue-500/5 rounded-lg pointer-events-none" />
      )}
    </Card>
  )
}
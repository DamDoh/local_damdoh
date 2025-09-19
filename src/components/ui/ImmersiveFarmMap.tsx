/**
 * Immersive 3D Farm Map - Interactive satellite view with crop health overlays
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Play, Pause, Layers } from 'lucide-react';

interface FarmField {
  id: string;
  name: string;
  crop: string;
  area: number; // in hectares
  coordinates: [number, number][];
  health: number; // 0-100
  ndvi: number; // Normalized Difference Vegetation Index
  irrigation: boolean;
  lastWatered: Date;
  yield: number;
  status: 'healthy' | 'stressed' | 'critical' | 'harvested';
}

interface ImmersiveFarmMapProps {
  fields: FarmField[];
  onFieldClick?: (field: FarmField) => void;
  className?: string;
}

const ImmersiveFarmMap: React.FC<ImmersiveFarmMapProps> = ({
  fields,
  onFieldClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState<'satellite' | 'ndvi' | 'health' | 'irrigation'>('satellite');
  const [hoveredField, setHoveredField] = useState<FarmField | null>(null);

  // Mock satellite imagery data
  const satelliteImage = '/api/placeholder/800/600'; // Replace with actual satellite imagery

  // Color mapping for different data layers
  const getHealthColor = (health: number): string => {
    if (health >= 80) return '#22c55e'; // Green
    if (health >= 60) return '#f59e0b'; // Yellow
    if (health >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getNDVIColor = (ndvi: number): string => {
    // NDVI ranges from -1 to 1, healthy vegetation is 0.3-0.8
    if (ndvi >= 0.6) return '#166534'; // Dark green
    if (ndvi >= 0.4) return '#22c55e'; // Green
    if (ndvi >= 0.2) return '#84cc16'; // Light green
    if (ndvi >= 0) return '#eab308'; // Yellow
    return '#dc2626'; // Red
  };

  const getIrrigationColor = (hasIrrigation: boolean, lastWatered: Date): string => {
    const daysSinceWatered = Math.floor((Date.now() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));

    if (!hasIrrigation) return '#6b7280'; // Gray
    if (daysSinceWatered <= 1) return '#3b82f6'; // Blue
    if (daysSinceWatered <= 3) return '#06b6d4'; // Cyan
    if (daysSinceWatered <= 7) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  // Draw field on canvas
  const drawField = (ctx: CanvasRenderingContext2D, field: FarmField, isHovered: boolean) => {
    if (field.coordinates.length < 3) return;

    ctx.save();

    // Apply zoom and rotation
    ctx.scale(zoom, zoom);
    ctx.rotate((rotation * Math.PI) / 180);

    // Set field color based on selected layer
    let fillColor = '#22c55e';
    switch (selectedLayer) {
      case 'health':
        fillColor = getHealthColor(field.health);
        break;
      case 'ndvi':
        fillColor = getNDVIColor(field.ndvi);
        break;
      case 'irrigation':
        fillColor = getIrrigationColor(field.irrigation, field.lastWatered);
        break;
      default:
        fillColor = '#22c55e';
    }

    // Draw field polygon
    ctx.beginPath();
    ctx.moveTo(field.coordinates[0][0], field.coordinates[0][1]);
    field.coordinates.forEach(coord => {
      ctx.lineTo(coord[0], coord[1]);
    });
    ctx.closePath();

    // Fill with color
    ctx.fillStyle = fillColor + (isHovered ? '80' : 'CC'); // Add transparency for hover
    ctx.fill();

    // Draw border
    ctx.strokeStyle = isHovered ? '#ffffff' : '#000000';
    ctx.lineWidth = isHovered ? 3 : 1;
    ctx.stroke();

    // Draw field label
    const centerX = field.coordinates.reduce((sum, coord) => sum + coord[0], 0) / field.coordinates.length;
    const centerY = field.coordinates.reduce((sum, coord) => sum + coord[1], 0) / field.coordinates.length;

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(field.name, centerX, centerY);

    // Draw crop type
    ctx.font = '10px Arial';
    ctx.fillText(field.crop, centerX, centerY + 15);

    ctx.restore();
  };

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw satellite background (simplified)
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines for reference
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw fields
    fields.forEach(field => {
      const isHovered = hoveredField?.id === field.id;
      drawField(ctx, field, isHovered);
    });

  }, [fields, zoom, rotation, selectedLayer, hoveredField]);

  // Handle mouse interactions
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Check if mouse is over a field
    const hovered = fields.find(field => {
      // Simple point-in-polygon test (simplified)
      return field.coordinates.some(coord => {
        const distance = Math.sqrt(Math.pow(coord[0] - x, 2) + Math.pow(coord[1] - y, 2));
        return distance < 30; // 30px radius for simplicity
      });
    });

    setHoveredField(hovered || null);
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredField && onFieldClick) {
      onFieldClick(hoveredField);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
            <MapPin className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
            3D Farm Command Center
          </h3>

          {/* Layer Controls */}
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" style={{ color: 'var(--color-textSecondary)' }} />
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <option value="satellite">Satellite</option>
              <option value="ndvi">NDVI Health</option>
              <option value="health">Crop Health</option>
              <option value="irrigation">Irrigation</option>
            </select>
          </div>
        </div>

        {/* Field Info */}
        {hoveredField && (
          <div className="mt-2 p-2 rounded bg-gray-50">
            <div className="text-sm font-medium">{hoveredField.name}</div>
            <div className="text-xs text-gray-600">
              {hoveredField.crop} • {hoveredField.area} ha • Health: {hoveredField.health}%
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
          className="p-2 rounded bg-white shadow hover:bg-gray-50"
          style={{ color: 'var(--color-text)' }}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom / 1.2, 0.5))}
          className="p-2 rounded bg-white shadow hover:bg-gray-50"
          style={{ color: 'var(--color-text)' }}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setRotation(rotation + 45)}
          className="p-2 rounded bg-white shadow hover:bg-gray-50"
          style={{ color: 'var(--color-text)' }}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded bg-white shadow hover:bg-gray-50"
          style={{ color: 'var(--color-text)' }}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto cursor-pointer"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ backgroundColor: 'var(--color-background)' }}
        />

        {/* Loading overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity">
          <div className="text-white">Loading satellite imagery...</div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {selectedLayer === 'health' && (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span>Stressed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                  <span>Critical</span>
                </div>
              </>
            )}

            {selectedLayer === 'ndvi' && (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#166534' }}></div>
                  <span>Very Healthy</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
                  <span>Stressed</span>
                </div>
              </>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Zoom: {(zoom * 100).toFixed(0)}% • Rotation: {rotation}°
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveFarmMap;
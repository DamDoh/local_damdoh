/**
 * Crop Growth Timeline - Animated visualization of crop development stages
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Calendar, Droplets, Sun, Wind } from 'lucide-react';

interface GrowthStage {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  startDay: number;
  endDay: number;
  color: string;
  icon: string;
  conditions: {
    temperature: string;
    rainfall: string;
    sunlight: string;
  };
  tasks: string[];
}

interface CropData {
  id: string;
  name: string;
  variety: string;
  plantingDate: Date;
  expectedHarvest: Date;
  currentStage: string;
  progress: number; // 0-100
  stages: GrowthStage[];
  weatherData: {
    temperature: number;
    rainfall: number;
    humidity: number;
  };
}

interface CropGrowthTimelineProps {
  cropData: CropData;
  onStageClick?: (stage: GrowthStage) => void;
  className?: string;
}

const CropGrowthTimeline: React.FC<CropGrowthTimelineProps> = ({
  cropData,
  onStageClick,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedStage, setSelectedStage] = useState<GrowthStage | null>(null);
  const animationRef = useRef<number>();
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalDays = cropData.stages.reduce((sum, stage) => sum + stage.duration, 0);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setCurrentDay(prev => {
          const next = prev + 0.5; // Speed control
          return next >= totalDays ? 0 : next;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, totalDays]);

  // Calculate current stage based on day
  const getCurrentStage = (day: number): GrowthStage | null => {
    let cumulativeDays = 0;
    for (const stage of cropData.stages) {
      cumulativeDays += stage.duration;
      if (day <= cumulativeDays) {
        return stage;
      }
    }
    return null;
  };

  const currentStage = getCurrentStage(currentDay);
  const progressPercentage = (currentDay / totalDays) * 100;

  // Handle stage click
  const handleStageClick = (stage: GrowthStage) => {
    setSelectedStage(stage);
    setCurrentDay(stage.startDay + stage.duration / 2); // Center on stage
    if (onStageClick) {
      onStageClick(stage);
    }
  };

  // Get weather icon based on conditions
  const getWeatherIcon = (stage: GrowthStage) => {
    if (stage.conditions.rainfall.includes('high')) return <Droplets className="h-4 w-4 text-blue-500" />;
    if (stage.conditions.temperature.includes('high')) return <Sun className="h-4 w-4 text-yellow-500" />;
    return <Wind className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              🌱 {cropData.name} Growth Timeline
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              {cropData.variety} • Planted: {cropData.plantingDate.toLocaleDateString()}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDay(0)}
              className="p-2 rounded hover:bg-gray-100"
              style={{ color: 'var(--color-text)' }}
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded hover:bg-gray-100"
              style={{ color: 'var(--color-text)' }}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setCurrentDay(totalDays)}
              className="p-2 rounded hover:bg-gray-100"
              style={{ color: 'var(--color-text)' }}
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: 'var(--color-textSecondary)' }}>Day {Math.floor(currentDay)} of {totalDays}</span>
            <span style={{ color: 'var(--color-textSecondary)' }}>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: 'var(--color-primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="p-4">
        <div ref={timelineRef} className="relative">
          {/* Timeline line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded"></div>

          {/* Current position indicator */}
          <div
            className="absolute top-6 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300"
            style={{
              left: `${(currentDay / totalDays) * 100}%`,
              backgroundColor: 'var(--color-primary)',
              transform: 'translateX(-50%)'
            }}
          />

          {/* Growth stages */}
          <div className="flex justify-between relative">
            {cropData.stages.map((stage, index) => {
              const stageStart = stage.startDay;
              const stageEnd = stage.endDay;
              const isActive = currentDay >= stageStart && currentDay <= stageEnd;
              const isPast = currentDay > stageEnd;
              const isFuture = currentDay < stageStart;

              return (
                <div
                  key={stage.id}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => handleStageClick(stage)}
                  style={{ flex: stage.duration / totalDays }}
                >
                  {/* Stage circle */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-md transition-all duration-300 group-hover:scale-110 ${
                      isActive ? 'ring-4 ring-opacity-50' : ''
                    }`}
                    style={{
                      backgroundColor: stage.color,
                      boxShadow: isActive ? `0 0 0 4px ${stage.color}50` : undefined
                    }}
                  />

                  {/* Stage info */}
                  <div className="mt-2 text-center max-w-24">
                    <div
                      className={`text-xs font-medium transition-colors ${
                        isActive ? 'text-blue-600' : isPast ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {stage.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stage.duration}d
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage Details */}
        {currentStage && (
          <div className="mt-6 p-4 rounded-lg border" style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)'
          }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: currentStage.color }}
                  />
                  {currentStage.name}
                </h4>
                <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                  {currentStage.description}
                </p>

                {/* Conditions */}
                <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center">
                    <Sun className="h-3 w-3 mr-1 text-yellow-500" />
                    <span>{currentStage.conditions.temperature}</span>
                  </div>
                  <div className="flex items-center">
                    <Droplets className="h-3 w-3 mr-1 text-blue-500" />
                    <span>{currentStage.conditions.rainfall}</span>
                  </div>
                  <div className="flex items-center">
                    {getWeatherIcon(currentStage)}
                    <span className="ml-1">{currentStage.conditions.sunlight}</span>
                  </div>
                </div>
              </div>

              {/* Weather data */}
              <div className="text-right text-sm">
                <div className="flex items-center mb-1">
                  <Calendar className="h-3 w-3 mr-1" style={{ color: 'var(--color-textSecondary)' }} />
                  <span style={{ color: 'var(--color-textSecondary)' }}>
                    Days {currentStage.startDay}-{currentStage.endDay}
                  </span>
                </div>
                <div style={{ color: 'var(--color-text)' }}>
                  🌡️ {cropData.weatherData.temperature}°C
                </div>
                <div style={{ color: 'var(--color-text)' }}>
                  💧 {cropData.weatherData.rainfall}mm
                </div>
              </div>
            </div>

            {/* Tasks */}
            {currentStage.tasks.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Recommended Tasks:
                </h5>
                <ul className="text-xs space-y-1">
                  {currentStage.tasks.map((task, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span style={{ color: 'var(--color-textSecondary)' }}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with quick stats */}
      <div className="px-4 py-3 border-t bg-gray-50" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex justify-between text-xs">
          <div>
            <span style={{ color: 'var(--color-textSecondary)' }}>Expected Harvest: </span>
            <span style={{ color: 'var(--color-text)' }} className="font-medium">
              {cropData.expectedHarvest.toLocaleDateString()}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--color-textSecondary)' }}>Current Health: </span>
            <span style={{ color: 'var(--color-text)' }} className="font-medium">
              {cropData.progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropGrowthTimeline;
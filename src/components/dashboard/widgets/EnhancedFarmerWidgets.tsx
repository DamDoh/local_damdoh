/**
 * Enhanced Farmer Widgets - Immersive and gamified farmer dashboard components
 */

import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Droplets, Thermometer, Wind, Trophy, Star, Target, Zap } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useGamification } from '@/hooks/useGamification';
import ImmersiveFarmMap from '@/components/ui/ImmersiveFarmMap';
import CropGrowthTimeline from '@/components/ui/CropGrowthTimeline';

interface FarmField {
  id: string;
  name: string;
  crop: string;
  area: number;
  coordinates: [number, number][];
  health: number;
  ndvi: number;
  irrigation: boolean;
  lastWatered: Date;
  yield: number;
  status: 'healthy' | 'stressed' | 'critical' | 'harvested';
}

interface CropData {
  id: string;
  name: string;
  variety: string;
  plantingDate: Date;
  expectedHarvest: Date;
  currentStage: string;
  progress: number;
  stages: any[];
  weatherData: {
    temperature: number;
    rainfall: number;
    humidity: number;
  };
}

// Enhanced Farm Command Center Widget
export const FarmCommandCenterWidget: React.FC = () => {
  const { theme } = useTheme();
  const { trackAction } = useGamification();
  const [selectedField, setSelectedField] = useState<FarmField | null>(null);

  // Mock farm data - in real app, this would come from API
  const mockFields: FarmField[] = [
    {
      id: 'field-1',
      name: 'North Field',
      crop: 'Corn',
      area: 25,
      coordinates: [[100, 100], [150, 100], [150, 150], [100, 150]],
      health: 85,
      ndvi: 0.75,
      irrigation: true,
      lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      yield: 8.5,
      status: 'healthy'
    },
    {
      id: 'field-2',
      name: 'South Field',
      crop: 'Soybeans',
      area: 30,
      coordinates: [[200, 200], [250, 200], [250, 250], [200, 250]],
      health: 72,
      ndvi: 0.68,
      irrigation: false,
      lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      yield: 6.2,
      status: 'stressed'
    }
  ];

  const handleFieldClick = (field: FarmField) => {
    setSelectedField(field);
    trackAction('field_inspected', { fieldId: field.id, crop: field.crop });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <MapPin className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Farm Command Center
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          Real-time farm monitoring and management
        </p>
      </div>

      <div className="p-4">
        <ImmersiveFarmMap
          fields={mockFields}
          onFieldClick={handleFieldClick}
          className="mb-4"
        />

        {selectedField && (
          <div className="mt-4 p-4 rounded-lg border" style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)'
          }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              {selectedField.name} - {selectedField.crop}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span style={{ color: 'var(--color-textSecondary)' }}>Health:</span>
                <span className="ml-2 font-medium" style={{ color: 'var(--color-text)' }}>
                  {selectedField.health}%
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-textSecondary)' }}>Area:</span>
                <span className="ml-2 font-medium" style={{ color: 'var(--color-text)' }}>
                  {selectedField.area} ha
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-textSecondary)' }}>Yield:</span>
                <span className="ml-2 font-medium" style={{ color: 'var(--color-text)' }}>
                  {selectedField.yield} t/ha
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-textSecondary)' }}>Irrigation:</span>
                <span className={`ml-2 font-medium ${selectedField.irrigation ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedField.irrigation ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Crop Growth Monitor Widget
export const CropGrowthMonitorWidget: React.FC = () => {
  const { theme } = useTheme();
  const { trackAction } = useGamification();

  // Mock crop data
  const mockCropData: CropData = {
    id: 'corn-2024',
    name: 'Corn',
    variety: 'Pioneer P1197',
    plantingDate: new Date('2024-04-15'),
    expectedHarvest: new Date('2024-09-15'),
    currentStage: 'Reproductive',
    progress: 78,
    stages: [
      {
        id: 'germination',
        name: 'Germination',
        description: 'Seed sprouting and early root development',
        duration: 10,
        startDay: 1,
        endDay: 10,
        color: '#22c55e',
        icon: '🌱',
        conditions: { temperature: '15-25°C', rainfall: 'moderate', sunlight: 'partial' },
        tasks: ['Monitor soil moisture', 'Check for pests']
      },
      {
        id: 'vegetative',
        name: 'Vegetative',
        description: 'Leaf and stem growth phase',
        duration: 40,
        startDay: 11,
        endDay: 50,
        color: '#84cc16',
        icon: '🌿',
        conditions: { temperature: '20-30°C', rainfall: 'regular', sunlight: 'full' },
        tasks: ['Apply nitrogen fertilizer', 'Scout for weeds']
      },
      {
        id: 'reproductive',
        name: 'Reproductive',
        description: 'Flowering and grain development',
        duration: 35,
        startDay: 51,
        endDay: 85,
        color: '#eab308',
        icon: '🌽',
        conditions: { temperature: '25-35°C', rainfall: 'adequate', sunlight: 'full' },
        tasks: ['Monitor pollination', 'Irrigate as needed']
      },
      {
        id: 'maturation',
        name: 'Maturation',
        description: 'Grain filling and drying',
        duration: 20,
        startDay: 86,
        endDay: 105,
        color: '#f97316',
        icon: '🌾',
        conditions: { temperature: '20-25°C', rainfall: 'minimal', sunlight: 'full' },
        tasks: ['Test grain moisture', 'Prepare for harvest']
      }
    ],
    weatherData: {
      temperature: 28,
      rainfall: 45,
      humidity: 65
    }
  };

  const handleStageClick = (stage: any) => {
    trackAction('growth_stage_viewed', { stageId: stage.id, crop: mockCropData.name });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <TrendingUp className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Crop Growth Monitor
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          Track your crops through every growth stage
        </p>
      </div>

      <div className="p-4">
        <CropGrowthTimeline
          cropData={mockCropData}
          onStageClick={handleStageClick}
        />
      </div>
    </div>
  );
};

// Weather Intelligence Widget
export const WeatherIntelligenceWidget: React.FC = () => {
  const { theme } = useTheme();

  // Mock weather data
  const weatherData = {
    current: {
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      rainfall: 2.5,
      condition: 'Partly Cloudy'
    },
    forecast: [
      { day: 'Today', temp: 28, rain: 20, condition: 'Rain' },
      { day: 'Tomorrow', temp: 30, rain: 10, condition: 'Sunny' },
      { day: 'Day 3', temp: 27, rain: 60, condition: 'Storm' },
      { day: 'Day 4', temp: 26, rain: 30, condition: 'Cloudy' }
    ],
    alerts: [
      { type: 'warning', message: 'Heavy rain expected in 2 days', icon: '🌧️' },
      { type: 'info', message: 'Optimal irrigation window: 6-8 AM', icon: '💧' }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <Thermometer className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Weather Intelligence
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          AI-powered weather insights for farming decisions
        </p>
      </div>

      <div className="p-4">
        {/* Current Weather */}
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>Current Conditions</span>
            <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              {weatherData.current.condition}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Thermometer className="h-4 w-4 mr-1" style={{ color: 'var(--color-warning)' }} />
              <span style={{ color: 'var(--color-textSecondary)' }}>{weatherData.current.temperature}°C</span>
            </div>
            <div className="flex items-center">
              <Droplets className="h-4 w-4 mr-1" style={{ color: 'var(--color-info)' }} />
              <span style={{ color: 'var(--color-textSecondary)' }}>{weatherData.current.humidity}%</span>
            </div>
            <div className="flex items-center">
              <Wind className="h-4 w-4 mr-1" style={{ color: 'var(--color-textSecondary)' }} />
              <span style={{ color: 'var(--color-textSecondary)' }}>{weatherData.current.windSpeed} km/h</span>
            </div>
            <div className="flex items-center">
              <Droplets className="h-4 w-4 mr-1" style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--color-textSecondary)' }}>{weatherData.current.rainfall} mm</span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="mb-4">
          <h4 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>4-Day Forecast</h4>
          <div className="space-y-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--color-surface)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{day.day}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span style={{ color: 'var(--color-textSecondary)' }}>{day.temp}°C</span>
                  <span style={{ color: 'var(--color-textSecondary)' }}>{day.rain}% rain</span>
                  <span style={{ color: 'var(--color-textSecondary)' }}>{day.condition}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <h4 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>Smart Alerts</h4>
          <div className="space-y-2">
            {weatherData.alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start">
                  <span className="mr-2">{alert.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Gamification Progress Widget
export const FarmerProgressWidget: React.FC = () => {
  const { theme } = useTheme();
  const { userProgress, achievements, unlockedAchievements } = useGamification();

  if (!userProgress) return null;

  const nextLevelPoints = (userProgress.level) * 100;
  const pointsToNextLevel = nextLevelPoints - (userProgress.totalPoints % 100);
  const levelProgress = ((userProgress.totalPoints % 100) / 100) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <Trophy className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Farming Progress
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          Level up your farming skills and earn rewards
        </p>
      </div>

      <div className="p-4">
        {/* Level Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Level {userProgress.level}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              {pointsToNextLevel} points to next level
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${levelProgress}%`,
                backgroundColor: 'var(--color-primary)'
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {userProgress.totalPoints}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
              {unlockedAchievements.length}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
              {userProgress.currentStreak}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>Day Streak</div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div>
          <h4 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>Recent Achievements</h4>
          <div className="space-y-2">
            {unlockedAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center p-2 rounded" style={{ backgroundColor: 'var(--color-background)' }}>
                <span className="text-lg mr-3">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {achievement.title}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                    +{achievement.points} points
                  </div>
                </div>
                <Star className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
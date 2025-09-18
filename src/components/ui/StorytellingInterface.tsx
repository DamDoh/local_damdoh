/**
 * Storytelling Interface - Creates impact narratives and success showcases
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Heart, Share2, BookOpen, TrendingUp, Users, Award } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface Story {
  id: string;
  title: string;
  subtitle: string;
  category: 'success' | 'impact' | 'innovation' | 'community' | 'sustainability';
  stakeholder: string;
  duration: number; // seconds
  thumbnail: string;
  content: {
    introduction: string;
    challenge: string;
    solution: string;
    results: string;
    impact: string;
    future: string;
  };
  metrics: {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  quotes: {
    text: string;
    author: string;
    role: string;
  }[];
  images: string[];
  video?: string;
  tags: string[];
}

interface StorytellingInterfaceProps {
  stories: Story[];
  autoplay?: boolean;
  className?: string;
}

const StorytellingInterface: React.FC<StorytellingInterfaceProps> = ({
  stories,
  autoplay = false,
  className = ''
}) => {
  const { theme } = useTheme();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const currentStory = stories[currentStoryIndex];
  const sections = [
    { key: 'introduction', title: 'The Beginning', duration: 8 },
    { key: 'challenge', title: 'The Challenge', duration: 10 },
    { key: 'solution', title: 'The Solution', duration: 12 },
    { key: 'results', title: 'The Results', duration: 10 },
    { key: 'impact', title: 'The Impact', duration: 15 },
    { key: 'future', title: 'Looking Ahead', duration: 8 }
  ];

  // Auto-advance through story sections
  useEffect(() => {
    if (!isPlaying) return;

    const sectionDuration = sections[currentSection]?.duration || 10;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (sectionDuration * 10)); // Update every 100ms
        if (newProgress >= 100) {
          // Move to next section
          setCurrentSection(prevSection => {
            if (prevSection < sections.length - 1) {
              return prevSection + 1;
            } else {
              // Move to next story
              setCurrentStoryIndex(prevStory => (prevStory + 1) % stories.length);
              return 0;
            }
          });
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentSection, sections, stories.length]);

  // Reset progress when section changes
  useEffect(() => {
    setProgress(0);
  }, [currentSection, currentStoryIndex]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setCurrentStoryIndex((currentStoryIndex + 1) % stories.length);
      setCurrentSection(0);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setCurrentSection(sections.length - 1);
    }
  };

  const handleSectionClick = (index: number) => {
    setCurrentSection(index);
    setProgress(0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success': return <Award className="h-5 w-5" />;
      case 'impact': return <TrendingUp className="h-5 w-5" />;
      case 'innovation': return <BookOpen className="h-5 w-5" />;
      case 'community': return <Users className="h-5 w-5" />;
      case 'sustainability': return <Heart className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success': return 'var(--color-success)';
      case 'impact': return 'var(--color-primary)';
      case 'innovation': return 'var(--color-warning)';
      case 'community': return 'var(--color-info)';
      case 'sustainability': return 'var(--color-secondary)';
      default: return 'var(--color-primary)';
    }
  };

  if (!currentStory) return null;

  const currentSectionData = sections[currentSection];
  const currentContent = currentStory.content[currentSectionData.key as keyof typeof currentStory.content];

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: getCategoryColor(currentStory.category) }}
            >
              {getCategoryIcon(currentStory.category)}
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                {currentStory.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                {currentStory.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm px-2 py-1 rounded" style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-textSecondary)'
            }}>
              {currentStory.stakeholder}
            </span>
            <span className="text-sm px-2 py-1 rounded" style={{
              backgroundColor: getCategoryColor(currentStory.category),
              color: 'white'
            }}>
              {currentStory.category}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: 'var(--color-textSecondary)' }}>
              {currentSectionData.title}
            </span>
            <span style={{ color: 'var(--color-textSecondary)' }}>
              {currentSection + 1} of {sections.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: getCategoryColor(currentStory.category)
              }}
            />
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="relative min-h-96">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url(${currentStory.thumbnail})`
          }}
        />

        {/* Content Overlay */}
        <div className="relative p-6 flex flex-col justify-center min-h-96">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              {currentSectionData.title}
            </h2>

            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-textSecondary)' }}>
              {currentContent}
            </p>

            {/* Quote if available */}
            {currentStory.quotes[currentSection] && (
              <blockquote className="border-l-4 pl-4 italic text-left" style={{
                borderColor: getCategoryColor(currentStory.category),
                color: 'var(--color-text)'
              }}>
                "{currentStory.quotes[currentSection].text}"
                <footer className="mt-2 text-sm font-medium" style={{ color: 'var(--color-textSecondary)' }}>
                  — {currentStory.quotes[currentSection].author}, {currentStory.quotes[currentSection].role}
                </footer>
              </blockquote>
            )}
          </div>
        </div>

        {/* Section Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => handleSectionClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSection ? 'scale-125' : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: index === currentSection
                  ? getCategoryColor(currentStory.category)
                  : 'var(--color-border)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t bg-gray-50" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              className="p-2 rounded hover:bg-white transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full hover:scale-105 transition-transform"
              style={{
                backgroundColor: getCategoryColor(currentStory.category),
                color: 'white'
              }}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded hover:bg-white transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              <SkipForward className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded hover:bg-white transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="px-3 py-1 text-sm rounded hover:bg-white transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              {showMetrics ? 'Hide' : 'Show'} Impact
            </button>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded hover:bg-white transition-colors" style={{ color: 'var(--color-text)' }}>
                <Heart className="h-4 w-4" />
              </button>
              <button className="p-2 rounded hover:bg-white transition-colors" style={{ color: 'var(--color-text)' }}>
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        {showMetrics && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {currentStory.metrics.map((metric, index) => (
              <div key={index} className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  {metric.value}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  {metric.label}
                </div>
                <div className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Story Navigation */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-center gap-2">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => {
                setCurrentStoryIndex(index);
                setCurrentSection(0);
                setProgress(0);
              }}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentStoryIndex ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{
                borderColor: index === currentStoryIndex ? getCategoryColor(story.category) : 'var(--color-border)'
              }}
            >
              <img
                src={story.thumbnail}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorytellingInterface;
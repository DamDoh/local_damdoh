/**
 * Stories Widget - Instagram-style stories for project updates and highlights
 * Displays recent photos, achievements, and project milestones
 * Single Responsibility: Visual storytelling and engagement
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Camera, MapPin, TrendingUp, Award, Users,
  ChevronLeft, ChevronRight, X, BookOpen
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Story {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  type: 'photo' | 'achievement' | 'milestone' | 'location';
  content: string;
  mediaUrl?: string;
  timestamp: string;
  location?: string;
  reactions: number;
  viewed: boolean;
}

interface StoriesWidgetProps {
  userRole?: string;
}

export const StoriesWidget: React.FC<StoriesWidgetProps> = ({ userRole = 'farmer' }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate API call to fetch stories
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        // Mock stories data - in real app, this would come from API
        const mockStories: Story[] = [
          {
            id: '1',
            author: {
              name: 'John Farmer',
              avatar: '/avatars/farmer.jpg',
              role: 'Farmer'
            },
            type: 'photo',
            content: 'First harvest of the season! [Corn]',
            mediaUrl: '/stories/harvest1.jpg',
            timestamp: '2h ago',
            location: 'Nairobi, Kenya',
            reactions: 24,
            viewed: false
          },
          {
            id: '2',
            author: {
              name: 'Sarah Finance',
              avatar: '/avatars/fi.jpg',
              role: 'Financial Institution'
            },
            type: 'achievement',
            content: 'Approved 50 new loans this month! [TrendingUp]',
            timestamp: '4h ago',
            reactions: 18,
            viewed: true
          },
          {
            id: '3',
            author: {
              name: 'Alex Investor',
              avatar: '/avatars/crowdfunder.jpg',
              role: 'Crowdfunder'
            },
            type: 'milestone',
            content: 'Irrigation project reached 80% funding! [Droplets]',
            mediaUrl: '/stories/project.jpg',
            timestamp: '6h ago',
            reactions: 32,
            viewed: false
          },
          {
            id: '4',
            author: {
              name: 'Maria Cooperativa',
              avatar: '/avatars/coop.jpg',
              role: 'Cooperative'
            },
            type: 'location',
            content: 'Farmers market day in Eldoret! [Store]',
            timestamp: '1d ago',
            location: 'Eldoret, Kenya',
            reactions: 15,
            viewed: true
          }
        ];

        // Filter stories based on user role and relevance
        const filteredStories = mockStories.filter(story => {
          if (userRole === 'farmer') return story.author.role !== 'Crowdfunder';
          if (userRole === 'crowdfunder') return story.type === 'milestone' || story.author.role === 'Farmer';
          return true;
        });

        setStories(filteredStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [userRole]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const openStory = (story: Story) => {
    setSelectedStory(story);
  };

  const closeStory = () => {
    setSelectedStory(null);
  };

  const getStoryIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera className="h-3 w-3" />;
      case 'achievement': return <Award className="h-3 w-3" />;
      case 'milestone': return <TrendingUp className="h-3 w-3" />;
      case 'location': return <MapPin className="h-3 w-3" />;
      default: return <Camera className="h-3 w-3" />;
    }
  };

  const getStoryColor = (type: string) => {
    switch (type) {
      case 'photo': return 'ring-blue-500';
      case 'achievement': return 'ring-yellow-500';
      case 'milestone': return 'ring-green-500';
      case 'location': return 'ring-purple-500';
      default: return 'ring-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-pink-800">
            <div className="w-6 h-6 bg-pink-200 rounded-full animate-pulse mr-2"></div>
            Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-pink-800">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
              <BookOpen className="h-3 w-3" />
            </div>
            Stories & Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md h-8 w-8"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md h-8 w-8"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Stories Scroll Container */}
            <div
              ref={scrollRef}
              className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Add Story Button */}
              <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-2 border-dashed border-pink-300 cursor-pointer hover:border-pink-500 transition-colors">
                    <AvatarFallback className="bg-pink-50">
                      <Plus className="h-6 w-6 text-pink-500" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                </div>
                <span className="text-xs text-center text-pink-700 font-medium">Add Story</span>
              </div>

              {/* Story Items */}
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
                  onClick={() => openStory(story)}
                >
                  <div className="relative">
                    <Avatar className={`w-16 h-16 ring-2 ${getStoryColor(story.type)} ${story.viewed ? 'ring-gray-300' : ''}`}>
                      <AvatarImage src={story.author.avatar} alt={story.author.name} />
                      <AvatarFallback>{story.author.name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white">
                      {getStoryIcon(story.type)}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className={`text-xs font-medium block ${story.viewed ? 'text-gray-500' : 'text-pink-700'}`}>
                      {story.author.name.split(' ')[0]}
                    </span>
                    <span className="text-xs text-gray-500">{story.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Story Stats */}
          <div className="mt-4 pt-3 border-t border-pink-200">
            <div className="flex justify-between text-sm">
              <span className="text-pink-700">
                {stories.filter(s => !s.viewed).length} new stories
              </span>
              <span className="text-pink-600">
                {stories.reduce((acc, story) => acc + story.reactions, 0)} reactions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full max-h-[80vh] bg-white rounded-2xl overflow-hidden">
            {/* Story Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedStory.author.avatar} />
                  <AvatarFallback>{selectedStory.author.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedStory.author.name}</h3>
                  <p className="text-sm opacity-90">{selectedStory.timestamp}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeStory} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Story Content */}
            <div className="p-6">
              {selectedStory.mediaUrl && (
                <div className="mb-4">
                  <img
                    src={selectedStory.mediaUrl}
                    alt="Story content"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex items-start space-x-3 mb-4">
                <div className={`p-2 rounded-full ${getStoryColor(selectedStory.type)} bg-opacity-20`}>
                  {getStoryIcon(selectedStory.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{selectedStory.content}</p>
                  {selectedStory.location && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedStory.location}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {selectedStory.type}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {selectedStory.reactions} reactions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
/**
 * Storytelling Widget - Showcases success stories and impact narratives
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Users, Award, Heart, Star } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import StorytellingInterface from '@/components/ui/StorytellingInterface';

interface SuccessStory {
  id: string;
  title: string;
  subtitle: string;
  category: 'success' | 'impact' | 'innovation' | 'community' | 'sustainability';
  stakeholder: string;
  duration: number;
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
  tags: string[];
}

// Mock success stories data
const mockStories: SuccessStory[] = [
  {
    id: 'farmer-success-1',
    title: 'From Traditional to Tech-Savvy Farming',
    subtitle: 'How Maria transformed her family farm with DamDoh',
    category: 'success',
    stakeholder: 'Farmer',
    duration: 180,
    thumbnail: '/images/farmer-success.jpg',
    content: {
      introduction: 'Maria Rodriguez, a third-generation farmer in rural Mexico, was struggling with traditional farming methods that yielded inconsistent results.',
      challenge: 'Facing unpredictable weather patterns, pest infestations, and market price volatility, Maria\'s farm was operating at a loss for three consecutive years.',
      solution: 'Through DamDoh\'s platform, Maria adopted precision farming techniques, connected with reliable suppliers, and accessed real-time market intelligence.',
      results: 'Within 18 months, Maria increased her crop yield by 40%, reduced input costs by 25%, and achieved profitability for the first time in years.',
      impact: 'Maria now employs 12 local workers, mentors other farmers in her community, and has become a regional leader in sustainable agriculture.',
      future: 'Maria plans to expand her operations and help 50 more farmers in her region adopt modern farming technologies.'
    },
    metrics: [
      { label: 'Yield Increase', value: '40%', change: '+40%', trend: 'up' },
      { label: 'Cost Reduction', value: '25%', change: '-25%', trend: 'down' },
      { label: 'Jobs Created', value: '12', change: '+12', trend: 'up' },
      { label: 'Community Impact', value: '50+', change: 'farmers helped', trend: 'up' }
    ],
    quotes: [
      {
        text: 'DamDoh didn\'t just save my farm—it transformed my entire community.',
        author: 'Maria Rodriguez',
        role: 'Farm Owner & Community Leader'
      }
    ],
    images: ['/images/maria-farm.jpg', '/images/community-event.jpg'],
    tags: ['precision-farming', 'community-impact', 'sustainability', 'women-in-agriculture']
  },
  {
    id: 'buyer-impact-1',
    title: 'Building Resilient Supply Chains',
    subtitle: 'Global Foods\' journey to sustainable sourcing',
    category: 'impact',
    stakeholder: 'Buyer',
    duration: 240,
    thumbnail: '/images/buyer-impact.jpg',
    content: {
      introduction: 'Global Foods, a major food processor, faced increasing pressure from consumers and regulators to ensure sustainable and ethical sourcing practices.',
      challenge: 'The company struggled with opaque supply chains, inconsistent quality, and difficulty verifying sustainability claims from suppliers.',
      solution: 'DamDoh provided transparent supplier verification, real-time quality monitoring, and blockchain-based traceability throughout the supply chain.',
      results: 'Global Foods reduced supply chain disruptions by 60%, improved product quality consistency by 35%, and achieved full traceability for 95% of ingredients.',
      impact: 'The company now sources from 200+ verified sustainable farms, supports fair wages for 15,000+ farmers, and has become a leader in ethical food production.',
      future: 'Global Foods aims to achieve 100% sustainable sourcing by 2025 and help 100,000 farmers transition to regenerative agriculture.'
    },
    metrics: [
      { label: 'Supply Disruptions', value: '60%', change: '-60%', trend: 'down' },
      { label: 'Quality Consistency', value: '35%', change: '+35%', trend: 'up' },
      { label: 'Traceability Coverage', value: '95%', change: '+95%', trend: 'up' },
      { label: 'Farmers Supported', value: '15K+', change: '+15,000', trend: 'up' }
    ],
    quotes: [
      {
        text: 'DamDoh gave us the transparency and trust we needed to build truly sustainable supply chains.',
        author: 'Sarah Chen',
        role: 'Chief Sustainability Officer, Global Foods'
      }
    ],
    images: ['/images/global-foods-facility.jpg', '/images/sustainable-farm.jpg'],
    tags: ['supply-chain', 'sustainability', 'traceability', 'ethical-sourcing']
  },
  {
    id: 'agritech-innovation-1',
    title: 'AI-Powered Crop Disease Detection',
    subtitle: 'AgroTech Solutions revolutionizes plant health monitoring',
    category: 'innovation',
    stakeholder: 'AgriTech Innovator',
    duration: 200,
    thumbnail: '/images/agritech-innovation.jpg',
    content: {
      introduction: 'AgroTech Solutions, a startup founded by former NASA engineers, developed an AI-powered platform for early crop disease detection.',
      challenge: 'Traditional disease detection relied on manual scouting, often identifying problems too late to prevent significant crop loss.',
      solution: 'Using computer vision and machine learning, the platform analyzes drone and satellite imagery to detect diseases 14 days earlier than traditional methods.',
      results: 'Farmers using the platform reduced crop losses by 45%, decreased pesticide use by 30%, and increased overall yields by 25%.',
      impact: 'Over 10,000 farmers across 15 countries now use the technology, preventing $500 million in annual crop losses and reducing chemical inputs by 100 tons.',
      future: 'The company plans to expand to 50 countries and integrate predictive analytics for climate-resilient farming.'
    },
    metrics: [
      { label: 'Crop Loss Reduction', value: '45%', change: '-45%', trend: 'down' },
      { label: 'Pesticide Reduction', value: '30%', change: '-30%', trend: 'down' },
      { label: 'Yield Increase', value: '25%', change: '+25%', trend: 'up' },
      { label: 'Economic Impact', value: '$500M', change: 'saved annually', trend: 'up' }
    ],
    quotes: [
      {
        text: 'Our AI doesn\'t just detect diseases—it prevents them, creating a healthier planet for everyone.',
        author: 'Dr. Raj Patel',
        role: 'CEO & Co-founder, AgroTech Solutions'
      }
    ],
    images: ['/images/drone-imaging.jpg', '/images/ai-analysis.jpg'],
    tags: ['ai-ml', 'disease-detection', 'precision-agriculture', 'sustainability']
  }
];

interface StorytellingWidgetProps {
  stakeholderType?: string;
  className?: string;
}

const StorytellingWidget: React.FC<StorytellingWidgetProps> = ({
  stakeholderType,
  className = ''
}) => {
  const { theme } = useTheme();
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [filteredStories, setFilteredStories] = useState<SuccessStory[]>(mockStories);

  // Filter stories based on stakeholder type
  useEffect(() => {
    if (stakeholderType) {
      const filtered = mockStories.filter(story =>
        story.stakeholder.toLowerCase() === stakeholderType.toLowerCase() ||
        story.tags.some(tag => tag.includes(stakeholderType.toLowerCase()))
      );
      setFilteredStories(filtered.length > 0 ? filtered : mockStories);
    } else {
      setFilteredStories(mockStories);
    }
  }, [stakeholderType]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success': return <Award className="h-4 w-4" />;
      case 'impact': return <TrendingUp className="h-4 w-4" />;
      case 'innovation': return <BookOpen className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      case 'sustainability': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
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

  if (selectedStory) {
    return (
      <div className={className}>
        <div className="mb-4">
          <button
            onClick={() => setSelectedStory(null)}
            className="text-sm underline"
            style={{ color: 'var(--color-primary)' }}
          >
            ← Back to Stories
          </button>
        </div>
        <StorytellingInterface
          stories={[selectedStory]}
          autoplay={false}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
          <BookOpen className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
          Success Stories & Impact
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textSecondary)' }}>
          Real stories of transformation in agriculture
        </p>
      </div>

      <div className="p-4">
        <div className="grid gap-4">
          {filteredStories.slice(0, 3).map((story) => (
            <div
              key={story.id}
              className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all"
              style={{ borderColor: 'var(--color-border)' }}
              onClick={() => setSelectedStory(story)}
            >
              {/* Story Preview */}
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <div className="relative z-10 text-center text-white">
                  <div className="flex justify-center mb-2">
                    {getCategoryIcon(story.category)}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wide">
                    {story.category}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                  {story.title}
                </h4>
                <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
                  {story.subtitle}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {story.metrics.slice(0, 2).map((metric, index) => (
                    <div key={index} className="text-center p-2 rounded" style={{ backgroundColor: 'var(--color-background)' }}>
                      <div className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                        {metric.value}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-textSecondary)' }}>
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {story.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: getCategoryColor(story.category),
                        color: 'white'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stakeholder */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded" style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-textSecondary)'
                  }}>
                    {story.stakeholder}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
                    Read Story →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-4 p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--color-background)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Your Success Story Starts Here
          </h4>
          <p className="text-sm mb-3" style={{ color: 'var(--color-textSecondary)' }}>
            Join thousands of stakeholders transforming agriculture with DamDoh
          </p>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            Share Your Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorytellingWidget;
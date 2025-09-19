/**
 * Celebration Modal - Animated celebration for achievements and milestones
 */

import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Award, CheckCircle } from 'lucide-react';
import { Achievement } from '@/services/dashboard/GamificationService';

interface CelebrationModalProps {
  isOpen: boolean;
  achievement: Achievement | null;
  message: string;
  animation: string;
  duration: number;
  onClose: () => void;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  achievement,
  message,
  animation,
  duration,
  onClose
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen || !achievement) return null;

  const getAnimationClass = () => {
    switch (animation) {
      case 'confetti':
        return 'animate-bounce';
      case 'sparkles':
        return 'animate-pulse';
      case 'fireworks':
        return 'animate-ping';
      case 'trophy':
        return 'animate-bounce';
      case 'champions':
        return 'animate-pulse';
      default:
        return 'animate-bounce';
    }
  };

  const getIcon = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return <Trophy className="h-16 w-16 text-yellow-500" />;
      case 'epic':
        return <Star className="h-16 w-16 text-purple-500" />;
      case 'rare':
        return <Zap className="h-16 w-16 text-blue-500" />;
      case 'uncommon':
        return <Award className="h-16 w-16 text-green-500" />;
      default:
        return <CheckCircle className="h-16 w-16 text-gray-500" />;
    }
  };

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'from-yellow-400 to-yellow-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'uncommon':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Confetti Background */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'][Math.floor(Math.random() * 5)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center transform transition-all duration-500 ${getAnimationClass()}`}>
        {/* Achievement Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full bg-gradient-to-r ${getRarityColor()}`}>
            {getIcon()}
          </div>
        </div>

        {/* Achievement Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {achievement.title}
        </h2>

        {/* Rarity Badge */}
        <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
             style={{
               backgroundColor: 'var(--color-primary)',
               color: 'white'
             }}>
          {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
        </div>

        {/* Achievement Description */}
        <p className="text-gray-600 mb-6">
          {achievement.description}
        </p>

        {/* Points Earned */}
        <div className="flex items-center justify-center mb-6">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-lg font-bold text-gray-900">
            +{achievement.points} Points
          </span>
        </div>

        {/* Rewards */}
        {achievement.rewards && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Rewards Unlocked:</h3>
            <div className="space-y-1">
              {achievement.rewards.badge && (
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2" />
                  {achievement.rewards.badge} Badge
                </div>
              )}
              {achievement.rewards.title && (
                <div className="flex items-center text-sm text-gray-600">
                  <Trophy className="h-4 w-4 mr-2" />
                  {achievement.rewards.title} Title
                </div>
              )}
              {achievement.rewards.feature && (
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="h-4 w-4 mr-2" />
                  {achievement.rewards.feature}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Celebration Message */}
        <div className="text-lg font-medium text-gray-800">
          {message}
        </div>
      </div>
    </div>
  );
};

export default CelebrationModal;
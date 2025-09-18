/**
 * Voice Control Component - Provides voice-activated interface controls
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Settings, HelpCircle } from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { Button } from '@/components/ui/button';

interface VoiceControlProps {
  className?: string;
  onCommand?: (command: any) => void;
  compact?: boolean;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  className = '',
  onCommand,
  compact = false
}) => {
  const {
    isListening,
    isSpeaking,
    isSupported,
    lastTranscript,
    lastCommand,
    error,
    startListening,
    stopListening,
    speak,
    settings,
    updateSettings
  } = useVoice();

  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Handle voice commands
  useEffect(() => {
    if (lastCommand && onCommand) {
      onCommand(lastCommand);
    }
  }, [lastCommand, onCommand]);

  // Auto-hide transcript after 3 seconds
  useEffect(() => {
    if (lastTranscript) {
      setShowTranscript(true);
      const timer = setTimeout(() => setShowTranscript(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastTranscript]);

  if (!isSupported) {
    return (
      <div className={`p-2 text-xs text-gray-500 ${className}`}>
        Voice control not supported in this browser
      </div>
    );
  }

  const handleToggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      try {
        await startListening();
      } catch (err) {
        console.error('Failed to start voice recognition:', err);
      }
    }
  };

  const handleShowHelp = () => {
    speak("Voice commands available: Go to dashboard, show farm map, check crop health, show weather, find suppliers, my achievements. Say 'stop listening' to turn off voice control.");
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant={isListening ? "default" : "outline"}
          size="sm"
          onClick={handleToggleListening}
          className={`transition-all duration-200 ${
            isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''
          }`}
          style={{
            backgroundColor: isListening ? 'var(--color-error)' : undefined,
            borderColor: 'var(--color-border)'
          }}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        {/* Status indicator */}
        {isSpeaking && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
        )}

        {/* Transcript popup */}
        {showTranscript && lastTranscript && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
            {lastTranscript}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border overflow-hidden ${className}`}
         style={{ borderColor: 'var(--color-border)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center" style={{ color: 'var(--color-text)' }}>
            <Mic className="h-5 w-5 mr-2" style={{ color: 'var(--color-primary)' }} />
            Voice Control
          </h3>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowHelp}
              style={{ color: 'var(--color-textSecondary)' }}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              style={{ color: 'var(--color-textSecondary)' }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span style={{ color: 'var(--color-textSecondary)' }}>
            {isListening ? 'Listening...' : 'Ready'}
          </span>

          {isSpeaking && (
            <>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span style={{ color: 'var(--color-textSecondary)' }}>Speaking...</span>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Main control */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleToggleListening}
            size="lg"
            className={`w-16 h-16 rounded-full transition-all duration-200 ${
              isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'hover:scale-105'
            }`}
            style={{
              backgroundColor: isListening ? 'var(--color-error)' : 'var(--color-primary)',
              borderColor: 'var(--color-primary)'
            }}
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Current transcript */}
        {lastTranscript && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Last heard:
            </div>
            <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
              "{lastTranscript}"
            </div>
            {lastCommand && (
              <div className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>
                → {lastCommand.action}
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-sm text-red-800">
              {error}
            </div>
          </div>
        )}

        {/* Quick commands */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => speak("Welcome to DamDoh voice control. Say 'show help' for available commands.")}
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <Volume2 className="h-4 w-4 mr-1" />
            Test Voice
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShowHelp}
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Show Help
          </Button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-4 p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
            <h4 className="font-medium mb-3" style={{ color: 'var(--color-text)' }}>Voice Settings</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value })}
                  className="w-full text-sm border rounded px-2 py-1"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Voice Speed
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.rate}
                  onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-center mt-1" style={{ color: 'var(--color-textSecondary)' }}>
                  {settings.rate}x
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceControl;
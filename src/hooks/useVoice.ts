/**
 * Voice Hook - Provides voice-activated interface functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceService, VoiceCommand, VoiceRecognitionResult, VoiceSettings } from '@/services/dashboard/VoiceService';

export interface UseVoiceReturn {
  // State
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  lastTranscript: string;
  lastCommand: VoiceCommand | null;
  error: string | null;

  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string, options?: Partial<VoiceSettings>) => Promise<void>;
  updateSettings: (settings: Partial<VoiceSettings>) => void;

  // Settings
  settings: VoiceSettings;
  availableLanguages: string[];
  availableVoices: SpeechSynthesisVoice[];
}

export const useVoice = (): UseVoiceReturn => {
  const voiceService = VoiceService.getInstance();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>(voiceService.getSettings());

  // Refs to avoid stale closures in event handlers
  const isListeningRef = useRef(isListening);
  const isSpeakingRef = useRef(isSpeaking);

  // Update refs when state changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Listen for voice recognition results
  useEffect(() => {
    const handleRecognitionResult = (result: VoiceRecognitionResult) => {
      setLastTranscript(result.transcript);

      if (result.commands.length > 0) {
        setLastCommand(result.commands[0]);
      }

      // Clear error on successful recognition
      if (error) {
        setError(null);
      }
    };

    const unsubscribe = voiceService.onRecognitionResult(handleRecognitionResult);
    return unsubscribe;
  }, [error]);

  // Listen for voice commands
  useEffect(() => {
    const handleCommand = (command: VoiceCommand) => {
      setLastCommand(command);

      // Handle specific commands
      switch (command.action) {
        case 'stop_listening':
          stopListening();
          break;
        case 'show_help':
          speak("You can say commands like: 'go to farm map', 'check crop health', 'show weather', 'find suppliers', or 'my achievements'. Say 'stop listening' to turn off voice control.");
          break;
        default:
          // Commands will be handled by parent components
          break;
      }
    };

    const unsubscribe = voiceService.onCommand(handleCommand);
    return unsubscribe;
  }, []);

  // Update status
  useEffect(() => {
    const updateStatus = () => {
      setIsListening(voiceService.isListening);
      setIsSpeaking(voiceService.isSpeaking);
    };

    // Check status periodically
    const interval = setInterval(updateStatus, 100);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const startListening = useCallback(async () => {
    try {
      setError(null);
      await voiceService.startListening();
      speak("Voice control activated. Try saying 'show help' for available commands.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start voice recognition';
      setError(errorMessage);
      console.error('Voice recognition error:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    speak("Voice control deactivated.");
  }, []);

  const speak = useCallback(async (text: string, options?: Partial<VoiceSettings>) => {
    try {
      await voiceService.speak(text, options);
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    voiceService.updateSettings(newSettings);
    setSettings(voiceService.getSettings());
  }, []);

  return {
    // State
    isListening,
    isSpeaking,
    isSupported: voiceService.isSupported,
    lastTranscript,
    lastCommand,
    error,

    // Actions
    startListening,
    stopListening,
    speak,
    updateSettings,

    // Settings
    settings,
    availableLanguages: voiceService.getAvailableLanguages(),
    availableVoices: voiceService.getAvailableVoices()
  };
};

// Hook for voice command handling
export const useVoiceCommands = (onCommand?: (command: VoiceCommand) => void) => {
  const { lastCommand } = useVoice();

  useEffect(() => {
    if (lastCommand && onCommand) {
      onCommand(lastCommand);
    }
  }, [lastCommand, onCommand]);

  return { lastCommand };
};

// Hook for voice navigation
export const useVoiceNavigation = (onNavigate?: (destination: string) => void) => {
  const handleCommand = useCallback((command: VoiceCommand) => {
    if (command.action === 'navigate' && command.parameters?.destination && onNavigate) {
      onNavigate(command.parameters.destination);
    }
  }, [onNavigate]);

  useVoiceCommands(handleCommand);

  return {};
};

// Hook for voice farm management
export const useVoiceFarmManagement = (onFarmAction?: (action: string, params?: any) => void) => {
  const handleCommand = useCallback((command: VoiceCommand) => {
    const farmActions = [
      'check_crop_health',
      'irrigate_field',
      'check_soil_moisture'
    ];

    if (farmActions.includes(command.action) && onFarmAction) {
      onFarmAction(command.action, command.parameters);
    }
  }, [onFarmAction]);

  useVoiceCommands(handleCommand);

  return {};
};

// Hook for voice procurement
export const useVoiceProcurement = (onProcurementAction?: (action: string, params?: any) => void) => {
  const handleCommand = useCallback((command: VoiceCommand) => {
    const procurementActions = [
      'search_suppliers',
      'show_procurement',
      'market_analysis'
    ];

    if (procurementActions.includes(command.action) && onProcurementAction) {
      onProcurementAction(command.action, command.parameters);
    }
  }, [onProcurementAction]);

  useVoiceCommands(handleCommand);

  return {};
};
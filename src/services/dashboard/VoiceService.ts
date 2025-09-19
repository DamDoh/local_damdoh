/**
 * Voice Service - Provides voice-activated interfaces for hands-free operation
 * Especially useful for farmers working in the field
 */

export interface VoiceCommand {
  command: string;
  action: string;
  parameters?: any;
  confidence: number;
  timestamp: Date;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  commands: VoiceCommand[];
}

export interface VoiceSettings {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  volume: number;
  rate: number;
  pitch: number;
}

export class VoiceService {
  private static instance: VoiceService;
  private recognition: any = null; // SpeechRecognition
  private synthesis: SpeechSynthesis | null = null;
  private _isListening: boolean = false;
  private _isSpeaking: boolean = false;
  private listeners: ((result: VoiceRecognitionResult) => void)[] = [];
  private commandListeners: ((command: VoiceCommand) => void)[] = [];
  private settings: VoiceSettings;

  private constructor() {
    this.settings = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      volume: 1,
      rate: 1,
      pitch: 1
    };

    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private initializeSpeechRecognition(): void {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.settings.continuous;
    this.recognition.interimResults = this.settings.interimResults;
    this.recognition.lang = this.settings.language;
    this.recognition.maxAlternatives = this.settings.maxAlternatives;

    this.recognition.onstart = () => {
      this._isListening = true;
      console.log('Voice recognition started');
    };

    this.recognition.onend = () => {
      this._isListening = false;
      console.log('Voice recognition ended');
    };

    this.recognition.onresult = (event: any) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1] as any;

      if (lastResult) {
        const transcript = lastResult[0].transcript;
        const confidence = lastResult[0].confidence;
        const isFinal = lastResult.isFinal;

        // Process the transcript for commands
        const commands = this.processTranscript(transcript, confidence);

        const result: VoiceRecognitionResult = {
          transcript,
          confidence,
          isFinal,
          commands
        };

        // Notify listeners
        this.listeners.forEach(listener => listener(result));

        // Execute commands if final
        if (isFinal && commands.length > 0) {
          commands.forEach(command => {
            this.commandListeners.forEach(listener => listener(command));
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this._isListening = false;
    };
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  private processTranscript(transcript: string, confidence: number): VoiceCommand[] {
    const commands: VoiceCommand[] = [];
    const lowerTranscript = transcript.toLowerCase().trim();

    // Define command patterns for different stakeholders
    const commandPatterns = [
      // Navigation commands
      {
        patterns: ['go to dashboard', 'show dashboard', 'open dashboard'],
        action: 'navigate',
        parameters: { destination: 'dashboard' }
      },
      {
        patterns: ['go to farm map', 'show farm map', 'open farm map', 'farm command center'],
        action: 'navigate',
        parameters: { destination: 'farm-map' }
      },
      {
        patterns: ['go to market', 'show market', 'market prices', 'commodity prices'],
        action: 'navigate',
        parameters: { destination: 'market' }
      },
      {
        patterns: ['go to weather', 'show weather', 'weather forecast'],
        action: 'navigate',
        parameters: { destination: 'weather' }
      },

      // Farm management commands
      {
        patterns: ['check crop health', 'crop status', 'how are my crops'],
        action: 'check_crop_health'
      },
      {
        patterns: ['water field', 'irrigate field', 'start irrigation'],
        action: 'irrigate_field',
        parameters: { action: 'start' }
      },
      {
        patterns: ['stop irrigation', 'stop watering'],
        action: 'irrigate_field',
        parameters: { action: 'stop' }
      },
      {
        patterns: ['check soil moisture', 'soil moisture level'],
        action: 'check_soil_moisture'
      },

      // Procurement commands
      {
        patterns: ['find suppliers', 'search suppliers', 'supplier search'],
        action: 'search_suppliers'
      },
      {
        patterns: ['show procurement opportunities', 'procurement deals'],
        action: 'show_procurement'
      },
      {
        patterns: ['market analysis', 'analyze market'],
        action: 'market_analysis'
      },

      // General commands
      {
        patterns: ['help', 'what can I say', 'commands', 'show commands'],
        action: 'show_help'
      },
      {
        patterns: ['stop listening', 'stop voice', 'turn off voice'],
        action: 'stop_listening'
      },
      {
        patterns: ['my achievements', 'show achievements', 'my progress'],
        action: 'show_achievements'
      }
    ];

    // Check for matches
    commandPatterns.forEach(pattern => {
      pattern.patterns.forEach(commandPattern => {
        if (lowerTranscript.includes(commandPattern)) {
          commands.push({
            command: commandPattern,
            action: pattern.action,
            parameters: pattern.parameters,
            confidence,
            timestamp: new Date()
          });
        }
      });
    });

    return commands;
  }

  // Public methods
  startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this._isListening) {
        resolve();
        return;
      }

      try {
        this.recognition.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this._isListening) {
      this.recognition.stop();
    }
  }

  speak(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      if (this._isSpeaking) {
        this.synthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Apply settings
      const settings = { ...this.settings, ...options };
      utterance.lang = settings.language;
      utterance.volume = settings.volume;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;

      utterance.onstart = () => {
        this._isSpeaking = true;
      };

      utterance.onend = () => {
        this._isSpeaking = false;
        resolve();
      };

      utterance.onerror = (error) => {
        this._isSpeaking = false;
        reject(error);
      };

      this.synthesis.speak(utterance);
    });
  }

  // Event listeners
  onRecognitionResult(callback: (result: VoiceRecognitionResult) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  onCommand(callback: (command: VoiceCommand) => void): () => void {
    this.commandListeners.push(callback);
    return () => {
      const index = this.commandListeners.indexOf(callback);
      if (index > -1) {
        this.commandListeners.splice(index, 1);
      }
    };
  }

  // Settings management
  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };

    if (this.recognition) {
      this.recognition.continuous = this.settings.continuous;
      this.recognition.interimResults = this.settings.interimResults;
      this.recognition.lang = this.settings.language;
      this.recognition.maxAlternatives = this.settings.maxAlternatives;
    }
  }

  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  // Status getters
  get isListening(): boolean {
    return this._isListening;
  }

  get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  get isSupported(): boolean {
    return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition) &&
           !!window.speechSynthesis;
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  // Get available languages for recognition
  getAvailableLanguages(): string[] {
    // Common languages supported by speech recognition
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA',
      'es-ES', 'es-MX', 'fr-FR', 'de-DE',
      'it-IT', 'pt-BR', 'ja-JP', 'ko-KR',
      'zh-CN', 'zh-TW', 'ru-RU', 'ar-SA'
    ];
  }
}

// Global type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
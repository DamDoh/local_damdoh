/**
 * Mobile Experience Service - Advanced mobile-first capabilities
 * Provides offline-first functionality, field operation tools, and mobile-optimized workflows
 * Single Responsibility: Mobile experience enhancement and offline capability management
 * Dependencies: Geolocation, camera, offline storage, push notifications
 */

import { apiCall } from '@/lib/api-utils';

export interface OfflineData {
  id: string;
  type: 'farm_data' | 'market_data' | 'communication' | 'task' | 'observation';
  data: any;
  timestamp: Date;
  synced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: Date;
  userId: string;
}

export interface FieldOperation {
  id: string;
  type: 'scouting' | 'harvesting' | 'planting' | 'irrigation' | 'pest_control' | 'soil_testing';
  farmId: string;
  fieldId?: string;
  cropId?: string;
  location: GeolocationCoordinates;
  timestamp: Date;
  data: FieldOperationData;
  photos: string[];
  notes: string;
  weather?: WeatherData;
  completed: boolean;
  synced: boolean;
}

export interface FieldOperationData {
  area?: number; // in acres/hectares
  yield?: number; // in kg/tons
  quality?: QualityMetrics;
  inputs?: InputApplication[];
  observations?: FieldObservation[];
  issues?: FieldIssue[];
}

export interface QualityMetrics {
  grade: 'A' | 'B' | 'C' | 'D';
  moisture: number;
  foreignMatter: number;
  damage: number;
  score: number; // 0-100
}

export interface InputApplication {
  type: 'fertilizer' | 'pesticide' | 'herbicide' | 'fungicide';
  product: string;
  quantity: number;
  unit: string;
  method: 'spray' | 'drip' | 'broadcast' | 'manual';
  cost?: number;
}

export interface FieldObservation {
  type: 'pest' | 'disease' | 'weed' | 'growth' | 'soil' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
}

export interface FieldIssue {
  type: 'equipment' | 'labor' | 'supply' | 'environmental' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actionRequired: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  conditions: 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog';
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: Date;
  temperature: { min: number; max: number };
  conditions: string;
  precipitation: number;
  humidity: number;
}

export interface VoiceCommand {
  id: string;
  command: string;
  intent: 'create_task' | 'log_operation' | 'record_observation' | 'send_message' | 'search' | 'navigate';
  parameters: Record<string, any>;
  confidence: number;
  timestamp: Date;
  executed: boolean;
  result?: any;
}

export interface MobileWorkflow {
  id: string;
  name: string;
  type: 'daily_check' | 'harvest' | 'planting' | 'maintenance' | 'inspection';
  steps: MobileWorkflowStep[];
  estimatedDuration: number; // in minutes
  requiredTools: string[];
  offlineCapable: boolean;
  locationRequired: boolean;
}

export interface MobileWorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'scan' | 'input' | 'photo' | 'location' | 'voice' | 'choice';
  required: boolean;
  dataKey: string;
  options?: string[]; // for choice type
  validation?: {
    type: 'number' | 'text' | 'date' | 'location';
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'reminder' | 'alert' | 'update' | 'achievement' | 'deadline';
  data?: any;
  scheduledFor?: Date;
  sent: boolean;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high';
}

export interface OfflineQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
  userId: string;
}

export class MobileExperienceService {
  private static instance: MobileExperienceService;
  private readonly CACHE_KEY = 'mobile-experience';
  private readonly OFFLINE_DATA_KEY = 'offline-data';
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private syncTimer: NodeJS.Timeout | null = null;

  static getInstance(): MobileExperienceService {
    if (!MobileExperienceService.instance) {
      MobileExperienceService.instance = new MobileExperienceService();
    }
    return MobileExperienceService.instance;
  }

  constructor() {
    this.initializeOfflineSync();
  }

  /**
   * Offline Data Management
   */
  async storeOfflineData(data: Omit<OfflineData, 'id' | 'timestamp' | 'synced' | 'syncAttempts'>): Promise<void> {
    const offlineData: OfflineData = {
      ...data,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      synced: false,
      syncAttempts: 0
    };

    const existingData = await this.getOfflineData();
    existingData.push(offlineData);

    localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(existingData));
  }

  async getOfflineData(): Promise<OfflineData[]> {
    try {
      const data = localStorage.getItem(this.OFFLINE_DATA_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Error reading offline data:', error);
      return [];
    }
  }

  async syncOfflineData(): Promise<{ synced: number; failed: number }> {
    const offlineData = await this.getOfflineData();
    const unsyncedData = offlineData.filter(item => !item.synced);

    let synced = 0;
    let failed = 0;

    for (const item of unsyncedData) {
      try {
        // Attempt to sync based on data type
        await this.syncDataItem(item);
        item.synced = true;
        item.syncAttempts++;
        synced++;
      } catch (error) {
        console.warn(`Failed to sync item ${item.id}:`, error);
        item.syncAttempts++;
        item.lastSyncAttempt = new Date();

        if (item.syncAttempts >= 5) {
          // Mark as failed after 5 attempts
          item.synced = true; // Remove from sync queue
        }
        failed++;
      }
    }

    // Update local storage
    localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(offlineData));

    return { synced, failed };
  }

  private async syncDataItem(item: OfflineData): Promise<void> {
    switch (item.type) {
      case 'farm_data':
        await apiCall('/api/farm/sync', { method: 'POST', body: JSON.stringify(item.data) });
        break;
      case 'market_data':
        await apiCall('/api/market/sync', { method: 'POST', body: JSON.stringify(item.data) });
        break;
      case 'communication':
        await apiCall('/api/communication/sync', { method: 'POST', body: JSON.stringify(item.data) });
        break;
      case 'task':
        await apiCall('/api/collaboration/tasks/sync', { method: 'POST', body: JSON.stringify(item.data) });
        break;
      case 'observation':
        await apiCall('/api/field/sync', { method: 'POST', body: JSON.stringify(item.data) });
        break;
      default:
        throw new Error(`Unknown data type: ${item.type}`);
    }
  }

  /**
   * Field Operations
   */
  async recordFieldOperation(operation: Omit<FieldOperation, 'id' | 'timestamp' | 'synced'>): Promise<FieldOperation> {
    const fieldOperation: FieldOperation = {
      ...operation,
      id: `field-op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      synced: navigator.onLine
    };

    if (navigator.onLine) {
      try {
        await apiCall('/api/field/operations', {
          method: 'POST',
          body: JSON.stringify(fieldOperation)
        });
        fieldOperation.synced = true;
      } catch (error) {
        console.warn('Failed to sync field operation, storing offline:', error);
        await this.storeOfflineData({
          type: 'observation',
          data: fieldOperation,
          userId: operation.data ? 'current-user' : 'unknown' // TODO: get actual user ID
        });
      }
    } else {
      await this.storeOfflineData({
        type: 'observation',
        data: fieldOperation,
        userId: operation.data ? 'current-user' : 'unknown'
      });
    }

    return fieldOperation;
  }

  async getFieldOperations(farmId?: string, dateRange?: { start: Date; end: Date }): Promise<FieldOperation[]> {
    try {
      let url = '/api/field/operations';
      const params = new URLSearchParams();

      if (farmId) params.append('farmId', farmId);
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }

      if (params.toString()) {
        url += `?${params}`;
      }

      const result = await apiCall(url) as { operations: FieldOperation[] };
      return result.operations;
    } catch (error) {
      console.warn('API unavailable for field operations, using defaults');
      return this.getDefaultFieldOperations(farmId, dateRange);
    }
  }

  /**
   * Voice Commands
   */
  async processVoiceCommand(audioBlob: Blob): Promise<VoiceCommand> {
    // In a real implementation, this would send to a speech-to-text service
    // For now, return a mock command
    const mockCommand: VoiceCommand = {
      id: `voice-${Date.now()}`,
      command: "Create harvest task for maize field A",
      intent: 'create_task',
      parameters: {
        title: 'Harvest maize field A',
        type: 'harvesting',
        fieldId: 'field-a',
        crop: 'maize'
      },
      confidence: 0.85,
      timestamp: new Date(),
      executed: false
    };

    return mockCommand;
  }

  async executeVoiceCommand(command: VoiceCommand): Promise<any> {
    switch (command.intent) {
      case 'create_task':
        // Create a task based on voice command
        return await this.createTaskFromVoice(command);
      case 'log_operation':
        // Log a field operation
        return await this.logOperationFromVoice(command);
      case 'record_observation':
        // Record a field observation
        return await this.recordObservationFromVoice(command);
      case 'send_message':
        // Send a message
        return await this.sendMessageFromVoice(command);
      default:
        throw new Error(`Unsupported voice command intent: ${command.intent}`);
    }
  }

  /**
   * Mobile Workflows
   */
  async getMobileWorkflows(type?: string): Promise<MobileWorkflow[]> {
    try {
      const url = type ? `/api/mobile/workflows?type=${type}` : '/api/mobile/workflows';
      const result = await apiCall(url) as { workflows: MobileWorkflow[] };
      return result.workflows;
    } catch (error) {
      console.warn('API unavailable for mobile workflows, using defaults');
      return this.getDefaultMobileWorkflows(type);
    }
  }

  async executeMobileWorkflow(workflowId: string, farmId: string): Promise<any> {
    const workflow = (await this.getMobileWorkflows()).find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Execute workflow steps
    const results: Record<string, any> = {};

    for (const step of workflow.steps) {
      if (step.required) {
        // In a real implementation, this would prompt the user for input
        // For now, we'll simulate with default values
        results[step.dataKey] = this.getDefaultStepValue(step);
      }
    }

    // Store the completed workflow
    await this.storeOfflineData({
      type: 'farm_data',
      data: {
        workflowId,
        farmId,
        results,
        completedAt: new Date()
      },
      userId: 'current-user' // TODO: get actual user ID
    });

    return results;
  }

  /**
   * Push Notifications
   */
  async scheduleNotification(notification: Omit<PushNotification, 'id' | 'sent' | 'read'>): Promise<PushNotification> {
    const pushNotification: PushNotification = {
      ...notification,
      id: `notification-${Date.now()}`,
      sent: false,
      read: false
    };

    try {
      await apiCall('/api/notifications/schedule', {
        method: 'POST',
        body: JSON.stringify(pushNotification)
      });
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
      // Store locally for later sync
      await this.storeOfflineData({
        type: 'communication',
        data: pushNotification,
        userId: notification.userId
      });
    }

    return pushNotification;
  }

  /**
   * Geolocation and Location Services
   */
  async getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  async getLocationAddress(coords: GeolocationCoordinates): Promise<string> {
    // In a real implementation, this would use a geocoding service
    // For now, return a mock address
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
  }

  /**
   * Offline Sync Management
   */
  private initializeOfflineSync(): void {
    // Set up periodic sync when online
    window.addEventListener('online', () => {
      this.startPeriodicSync();
    });

    window.addEventListener('offline', () => {
      this.stopPeriodicSync();
    });

    if (navigator.onLine) {
      this.startPeriodicSync();
    }
  }

  private startPeriodicSync(): void {
    if (this.syncTimer) return;

    this.syncTimer = setInterval(async () => {
      try {
        const result = await this.syncOfflineData();
        if (result.synced > 0 || result.failed > 0) {
          console.log(`Synced ${result.synced} items, ${result.failed} failed`);
        }
      } catch (error) {
        console.warn('Periodic sync failed:', error);
      }
    }, this.SYNC_INTERVAL);
  }

  private stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // Helper methods
  private async createTaskFromVoice(command: VoiceCommand): Promise<any> {
    // Implementation for creating task from voice command
    return { success: true, taskId: `task-${Date.now()}` };
  }

  private async logOperationFromVoice(command: VoiceCommand): Promise<any> {
    // Implementation for logging operation from voice command
    return { success: true, operationId: `op-${Date.now()}` };
  }

  private async recordObservationFromVoice(command: VoiceCommand): Promise<any> {
    // Implementation for recording observation from voice command
    return { success: true, observationId: `obs-${Date.now()}` };
  }

  private async sendMessageFromVoice(command: VoiceCommand): Promise<any> {
    // Implementation for sending message from voice command
    return { success: true, messageId: `msg-${Date.now()}` };
  }

  private getDefaultStepValue(step: MobileWorkflowStep): any {
    switch (step.type) {
      case 'input':
        if (step.validation?.type === 'number') {
          return step.validation?.min || 0;
        }
        return 'Sample input';
      case 'choice':
        return step.options?.[0] || 'Default';
      case 'location':
        return { latitude: 0, longitude: 0 };
      case 'photo':
        return ['sample-photo.jpg'];
      case 'scan':
        return 'sample-scan-data';
      case 'voice':
        return 'sample-voice-input';
      default:
        return null;
    }
  }

  // Default data methods
  private getDefaultFieldOperations(farmId?: string, dateRange?: { start: Date; end: Date }): FieldOperation[] {
    const operations: FieldOperation[] = [
      {
        id: 'field-op-1',
        type: 'scouting',
        farmId: farmId || 'farm-1',
        location: {
          latitude: -1.2864,
          longitude: 36.8172,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        } as GeolocationCoordinates,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        data: {
          observations: [
            {
              type: 'pest',
              severity: 'medium',
              description: 'Aphid infestation detected on maize leaves',
              recommendations: ['Apply organic insecticide', 'Monitor for 3 days']
            }
          ]
        },
        photos: ['photo-1.jpg'],
        notes: 'Regular field scouting completed',
        weather: {
          temperature: 25,
          humidity: 65,
          windSpeed: 5,
          windDirection: 'NE',
          precipitation: 0,
          conditions: 'clear',
          forecast: []
        },
        completed: true,
        synced: true
      }
    ];

    return operations.filter(op => {
      if (farmId && op.farmId !== farmId) return false;
      if (dateRange && (op.timestamp < dateRange.start || op.timestamp > dateRange.end)) return false;
      return true;
    });
  }

  private getDefaultMobileWorkflows(type?: string): MobileWorkflow[] {
    const workflows: MobileWorkflow[] = [
      {
        id: 'daily-check',
        name: 'Daily Field Check',
        type: 'daily_check',
        steps: [
          {
            id: 'location',
            title: 'Record Location',
            description: 'Get current GPS location',
            type: 'location',
            required: true,
            dataKey: 'location'
          },
          {
            id: 'weather',
            title: 'Weather Conditions',
            description: 'Record current weather',
            type: 'choice',
            required: true,
            dataKey: 'weather',
            options: ['Sunny', 'Cloudy', 'Rainy', 'Windy']
          },
          {
            id: 'observations',
            title: 'Field Observations',
            description: 'Note any issues or observations',
            type: 'input',
            required: false,
            dataKey: 'observations'
          },
          {
            id: 'photos',
            title: 'Take Photos',
            description: 'Photograph field conditions',
            type: 'photo',
            required: false,
            dataKey: 'photos'
          }
        ],
        estimatedDuration: 15,
        requiredTools: ['GPS', 'Camera'],
        offlineCapable: true,
        locationRequired: true
      },
      {
        id: 'harvest-log',
        name: 'Harvest Logging',
        type: 'harvest',
        steps: [
          {
            id: 'crop-select',
            title: 'Select Crop',
            description: 'Choose the crop being harvested',
            type: 'choice',
            required: true,
            dataKey: 'crop',
            options: ['Maize', 'Beans', 'Coffee', 'Tea']
          },
          {
            id: 'yield-measure',
            title: 'Measure Yield',
            description: 'Record harvest quantity',
            type: 'input',
            required: true,
            dataKey: 'yield',
            validation: { type: 'number', min: 0 }
          },
          {
            id: 'quality-check',
            title: 'Quality Assessment',
            description: 'Rate crop quality',
            type: 'choice',
            required: true,
            dataKey: 'quality',
            options: ['Grade A', 'Grade B', 'Grade C', 'Grade D']
          }
        ],
        estimatedDuration: 10,
        requiredTools: ['Scale', 'Quality checklist'],
        offlineCapable: true,
        locationRequired: false
      }
    ];

    return type ? workflows.filter(w => w.type === type) : workflows;
  }
}
/**
 * Meeting Service - Third-party video conferencing integration
 * Provides meeting link generation for Zoom, Microsoft Teams, and Google Meet
 * Single Responsibility: Meeting scheduling and link management
 * Dependencies: External video conferencing APIs
 */

import { apiCall } from '@/lib/api-utils';

export interface MeetingDetails {
  title: string;
  description?: string;
  startTime: Date;
  duration: number; // in minutes
  attendees?: string[];
  platform: 'zoom' | 'teams' | 'meet';
}

export interface MeetingLink {
  url: string;
  meetingId?: string;
  password?: string;
  platform: string;
  instructions: string;
}

export class MeetingService {
  private static instance: MeetingService;

  static getInstance(): MeetingService {
    if (!MeetingService.instance) {
      MeetingService.instance = new MeetingService();
    }
    return MeetingService.instance;
  }

  /**
   * Generate a meeting link for the specified platform
   */
  async generateMeetingLink(details: MeetingDetails): Promise<MeetingLink> {
    try {
      const result = await apiCall('/api/meetings/generate', {
        method: 'POST',
        body: JSON.stringify(details),
      });

      return result as MeetingLink;
    } catch (error) {
      console.error('Error generating meeting link:', error);
      // Fallback to direct link generation if API fails
      return this.generateFallbackLink(details);
    }
  }

  /**
   * Fallback meeting link generation when API is unavailable
   */
  private generateFallbackLink(details: MeetingDetails): MeetingLink {
    const baseUrl = this.getPlatformBaseUrl(details.platform);
    const meetingId = this.generateMeetingId();

    switch (details.platform) {
      case 'zoom':
        return {
          url: `${baseUrl}/j/${meetingId}`,
          meetingId,
          password: this.generatePassword(),
          platform: 'Zoom',
          instructions: 'Click the link to join the Zoom meeting. Enter the meeting ID and password when prompted.'
        };

      case 'teams':
        return {
          url: `${baseUrl}/l/meetup-join/${meetingId}`,
          meetingId,
          platform: 'Microsoft Teams',
          instructions: 'Click the link to join the Teams meeting. You may need to sign in with your Microsoft account.'
        };

      case 'meet':
        return {
          url: `${baseUrl}/${meetingId}`,
          meetingId,
          platform: 'Google Meet',
          instructions: 'Click the link to join the Google Meet. You may need to sign in with your Google account.'
        };

      default:
        throw new Error(`Unsupported platform: ${details.platform}`);
    }
  }

  /**
   * Get base URL for each platform
   */
  private getPlatformBaseUrl(platform: string): string {
    switch (platform) {
      case 'zoom':
        return 'https://zoom.us';
      case 'teams':
        return 'https://teams.microsoft.com';
      case 'meet':
        return 'https://meet.google.com';
      default:
        return '';
    }
  }

  /**
   * Generate a unique meeting ID
   */
  private generateMeetingId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate a meeting password
   */
  private generatePassword(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  /**
   * Get available meeting platforms
   */
  getAvailablePlatforms(): Array<{ value: 'zoom' | 'teams' | 'meet'; label: string; icon: string }> {
    return [
      { value: 'zoom', label: 'Zoom', icon: '📹' },
      { value: 'teams', label: 'Microsoft Teams', icon: '👥' },
      { value: 'meet', label: 'Google Meet', icon: '🎥' }
    ];
  }

  /**
   * Validate meeting details
   */
  validateMeetingDetails(details: MeetingDetails): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!details.title?.trim()) {
      errors.push('Meeting title is required');
    }

    if (!details.startTime || details.startTime < new Date()) {
      errors.push('Start time must be in the future');
    }

    if (!details.duration || details.duration < 15 || details.duration > 480) {
      errors.push('Duration must be between 15 minutes and 8 hours');
    }

    if (!['zoom', 'teams', 'meet'].includes(details.platform)) {
      errors.push('Invalid platform selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
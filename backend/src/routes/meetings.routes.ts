import { Router } from 'express';
import { authUser } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authUser);

/**
 * POST /meetings/generate
 * Generate a meeting link for video conferencing
 */
router.post('/generate', async (req, res) => {
  try {
    const { title, description, startTime, duration, attendees, platform } = req.body;

    // Validate required fields
    if (!title || !startTime || !duration || !platform) {
      return res.status(400).json({
        error: 'Missing required fields: title, startTime, duration, platform'
      });
    }

    // Validate platform
    const validPlatforms = ['zoom', 'teams', 'meet'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        error: 'Invalid platform. Must be one of: zoom, teams, meet'
      });
    }

    // For now, return a mock response with generated meeting details
    // In production, this would integrate with actual Zoom/Teams/Meet APIs
    const meetingId = generateMeetingId();
    const password = platform === 'zoom' ? generatePassword() : undefined;

    let meetingLink;
    let instructions;

    switch (platform) {
      case 'zoom':
        meetingLink = {
          url: `https://zoom.us/j/${meetingId}`,
          meetingId,
          password,
          platform: 'Zoom',
          instructions: 'Click the link to join the Zoom meeting. Enter the meeting ID and password when prompted.'
        };
        break;

      case 'teams':
        meetingLink = {
          url: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
          meetingId,
          platform: 'Microsoft Teams',
          instructions: 'Click the link to join the Teams meeting. You may need to sign in with your Microsoft account.'
        };
        break;

      case 'meet':
        meetingLink = {
          url: `https://meet.google.com/${meetingId}`,
          meetingId,
          platform: 'Google Meet',
          instructions: 'Click the link to join the Google Meet. You may need to sign in with your Google account.'
        };
        break;
    }

    res.status(201).json(meetingLink);

  } catch (error) {
    console.error('Error generating meeting:', error);
    res.status(500).json({ error: 'Failed to generate meeting link' });
  }
});

/**
 * GET /meetings/platforms
 * Get available meeting platforms
 */
router.get('/platforms', async (req, res) => {
  try {
    const platforms = [
      { value: 'zoom', label: 'Zoom', icon: '📹' },
      { value: 'teams', label: 'Microsoft Teams', icon: '👥' },
      { value: 'meet', label: 'Google Meet', icon: '🎥' }
    ];

    res.json({ platforms });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

/**
 * POST /meetings/:meetingId/join
 * Track meeting join events (for analytics)
 */
router.post('/:meetingId/join', async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { platform } = req.body;

    // In production, this could log analytics about meeting participation
    console.log(`User joined meeting ${meetingId} on ${platform}`);

    res.json({ success: true, message: 'Meeting join recorded' });
  } catch (error) {
    console.error('Error recording meeting join:', error);
    res.status(500).json({ error: 'Failed to record meeting join' });
  }
});

// Helper functions
function generateMeetingId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`.toUpperCase();
}

function generatePassword(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default router;
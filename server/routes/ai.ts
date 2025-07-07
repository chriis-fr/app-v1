import express from 'express';
import { aiService } from '../services/ai-service';
import { checkPermission } from '../middleware/check-permission';

const router = express.Router();

/**
 * GET /api/ai/settings
 * Get AI settings for the organization
 */
router.get('/settings', checkPermission('ai', 'read'), async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const settings = await aiService.getAISettings(organizationId);
    res.json(settings);
  } catch (error) {
    console.error('Error getting AI settings:', error);
    res.status(500).json({ error: 'Failed to get AI settings' });
  }
});

/**
 * PUT /api/ai/settings
 * Update AI settings for the organization
 */
router.put('/settings', checkPermission('ai', 'write'), async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const settings = req.body;
    await aiService.updateAISettings(organizationId, settings);
    
    res.json({ message: 'AI settings updated successfully' });
  } catch (error) {
    console.error('Error updating AI settings:', error);
    res.status(500).json({ error: 'Failed to update AI settings' });
  }
});

/**
 * POST /api/ai/chat
 * Process a chat message and get AI response
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;
    const userRole = req.user?.role;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'User ID and Organization ID required' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if AI is enabled
    const isEnabled = await aiService.isAIEnabled(organizationId);
    if (!isEnabled) {
      return res.status(403).json({ error: 'AI is disabled for this organization' });
    }

    // Process the message
    const response = await aiService.processChatMessage(
      userId,
      organizationId,
      message,
      userRole,
      {
        ...context,
        department: req.user?.department,
      }
    );

    // Save the conversation
    await aiService.saveChatMessage(userId, organizationId, {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    });

    await aiService.saveChatMessage(userId, organizationId, {
      id: (Date.now() + 1).toString(),
      text: response.text,
      sender: 'ai',
      timestamp: new Date(),
      metadata: response.metadata,
    });

    res.json(response);
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

/**
 * GET /api/ai/chat/history
 * Get chat history for the user
 */
router.get('/chat/history', async (req, res) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'User ID and Organization ID required' });
    }

    const history = await aiService.getChatHistory(userId, organizationId);
    res.json(history);
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

/**
 * DELETE /api/ai/chat/history
 * Clear chat history for the user
 */
router.delete('/chat/history', async (req, res) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'User ID and Organization ID required' });
    }

    await aiService.clearChatHistory(userId, organizationId);
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

/**
 * GET /api/ai/status
 * Check if AI is enabled for the organization
 */
router.get('/status', async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const isEnabled = await aiService.isAIEnabled(organizationId);
    res.json({ isEnabled });
  } catch (error) {
    console.error('Error checking AI status:', error);
    res.status(500).json({ error: 'Failed to check AI status' });
  }
});

export default router; 
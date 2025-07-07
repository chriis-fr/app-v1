import { Organization, User } from '../mongodb/models';
import type { Types } from 'mongoose';

interface AISettings {
  isEnabled: boolean;
  allowPersonalAI: boolean;
  allowOrganizationAI: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  metadata?: any;
}

interface ChatSession {
  id: string;
  userId: string;
  organizationId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface AIResponse {
  text: string;
  confidence: number;
  suggestions?: string[];
  metadata?: any;
}

export class AIService {
  private chatSessions: Map<string, ChatSession> = new Map();

  /**
   * Get AI settings for an organization
   */
  async getAISettings(organizationId: string): Promise<AISettings> {
    try {
      const organization = await Organization.findById(organizationId);
      
      // Default settings
      const defaultSettings: AISettings = {
        isEnabled: true,
        allowPersonalAI: true,
        allowOrganizationAI: true,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
      };

      // Get settings from organization if available
      if (organization?.settings?.ai) {
        return {
          ...defaultSettings,
          ...organization.settings.ai,
        };
      }

      return defaultSettings;
    } catch (error) {
      console.error('Error getting AI settings:', error);
      throw new Error('Failed to get AI settings');
    }
  }

  /**
   * Update AI settings for an organization
   */
  async updateAISettings(organizationId: string, settings: Partial<AISettings>): Promise<void> {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Update organization settings
      const currentSettings = organization.settings || {};
      const updatedSettings = {
        ...currentSettings,
        ai: {
          ...currentSettings.ai,
          ...settings,
        },
      };

      await Organization.findByIdAndUpdate(organizationId, {
        settings: updatedSettings,
      });
    } catch (error) {
      console.error('Error updating AI settings:', error);
      throw new Error('Failed to update AI settings');
    }
  }

  /**
   * Check if AI is enabled for an organization
   */
  async isAIEnabled(organizationId: string): Promise<boolean> {
    try {
      const settings = await this.getAISettings(organizationId);
      return settings.isEnabled;
    } catch (error) {
      console.error('Error checking AI status:', error);
      return false;
    }
  }

  /**
   * Process a chat message and generate AI response
   */
  async processChatMessage(
    userId: string,
    organizationId: string,
    message: string,
    userRole?: string,
    context?: any
  ): Promise<AIResponse> {
    try {
      // Check if AI is enabled
      const isEnabled = await this.isAIEnabled(organizationId);
      if (!isEnabled) {
        throw new Error('AI is disabled for this organization');
      }

      // Get user and organization context
      const [user, organization] = await Promise.all([
        User.findById(userId),
        Organization.findById(organizationId),
      ]);

      if (!user || !organization) {
        throw new Error('User or organization not found');
      }

      // TODO: Implement actual AI processing here
      // For now, return a placeholder response
      const response = await this.generatePlaceholderResponse(message, userRole, context);

      return response;
    } catch (error) {
      console.error('Error processing chat message:', error);
      throw new Error('Failed to process chat message');
    }
  }

  /**
   * Generate a placeholder response (replace with actual AI integration)
   */
  private async generatePlaceholderResponse(
    message: string,
    userRole?: string,
    context?: any
  ): Promise<AIResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const department = context?.department?.toLowerCase();
    let response: string;

    // Return contextual response based on role and department
    if (userRole === 'owner') {
      response = `As an organization owner, I can help you with strategic decisions, financial analysis, and business insights. Your message: "${message}" - I'm here to assist with high-level business management and organizational strategy.`;
    } else {
      // Department-specific responses
      switch (department) {
        case 'hr':
          response = `As your HR AI assistant, I can help you with employee management, payroll questions, hiring processes, performance reviews, and HR policies. Regarding "${message}" - I'm here to support your HR operations and ensure compliance.`;
          break;
        case 'finance':
        case 'accounting':
          response = `As your Finance AI assistant, I can help you with accounting tasks, financial reporting, budgeting, and financial analysis. Regarding "${message}" - I'm here to support your financial operations and ensure accuracy.`;
          break;
        case 'inventory':
        case 'warehouse':
          response = `As your Inventory AI assistant, I can help you with stock management, warehouse operations, supply chain optimization, and inventory tracking. Regarding "${message}" - I'm here to support your inventory operations.`;
          break;
        case 'sales':
        case 'crm':
          response = `As your Sales AI assistant, I can help you with customer management, sales strategies, lead generation, and sales analytics. Regarding "${message}" - I'm here to support your sales operations and customer relationships.`;
          break;
        default:
          response = `I understand your message: "${message}". I'm here to help with your daily tasks and questions. This is a placeholder response until we integrate with an actual AI model.`;
      }
    }

    return {
      text: response,
      confidence: 0.8,
      suggestions: [
        'Ask about organization data',
        'Get help with tasks',
        'Request insights',
      ],
      metadata: {
        model: 'placeholder',
        processingTime: 1000,
        userRole,
        department,
      },
    };
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: string, organizationId: string): Promise<ChatMessage[]> {
    try {
      const sessionId = `${userId}-${organizationId}`;
      const session = this.chatSessions.get(sessionId);
      
      if (!session) {
        return [];
      }

      return session.messages;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Save chat message to history
   */
  async saveChatMessage(
    userId: string,
    organizationId: string,
    message: ChatMessage
  ): Promise<void> {
    try {
      const sessionId = `${userId}-${organizationId}`;
      let session = this.chatSessions.get(sessionId);

      if (!session) {
        session = {
          id: sessionId,
          userId,
          organizationId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      session.messages.push(message);
      session.updatedAt = new Date();
      this.chatSessions.set(sessionId, session);

      // TODO: Save to database for persistence
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  /**
   * Clear chat history for a user
   */
  async clearChatHistory(userId: string, organizationId: string): Promise<void> {
    try {
      const sessionId = `${userId}-${organizationId}`;
      this.chatSessions.delete(sessionId);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }
}

export const aiService = new AIService(); 
import { API_ENDPOINTS } from '@/config/api';
import type { Conversation, ConversationDetail, CreateConversationResponse, SendMessageResponse } from '@/types/conversation';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const conversationService = {
  // Get all conversations for current user
  getAll: async (): Promise<Conversation[]> => {
    try {
      const response = await fetch(API_ENDPOINTS.ai.conversations, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  // Get single conversation with messages
  getById: async (id: string): Promise<ConversationDetail | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.ai.conversation(id), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  },

  // Create new conversation
  create: async (): Promise<CreateConversationResponse | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.ai.conversations, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  },

  // Update conversation title
  updateTitle: async (id: string, title: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.ai.conversation(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to update conversation');
      }

      return true;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return false;
    }
  },

  // Delete conversation
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.ai.conversation(id), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  },

  // Send message in conversation
  sendMessage: async (conversationId: string, message: string): Promise<SendMessageResponse | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.ai.conversationMessages(conversationId), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },
};

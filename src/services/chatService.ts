'use client';

import { API_ENDPOINTS } from '@/config/api';

interface ChatContext {
  type?: 'lesson' | 'minitest' | 'hackathon' | 'course' | 'general';
  title?: string;
  lessonId?: string;
  minitestId?: string;
  problemDescription?: string;
  hints?: string[];
  phaseName?: string;
  courseName?: string;
}

interface SendMessageOptions {
  message: string;
  context: ChatContext | null;
  conversationHistory?: Array<{ role: 'user' | 'model'; parts: string }>;
}

interface ChatResponse {
  reply: string;
  suggestions?: string[];
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function sendChatMessage({
  message,
  context,
  conversationHistory = [],
}: SendMessageOptions): Promise<ChatResponse> {
  try {
    // Build context for backend
    let chatContext: any = undefined;
    if (context) {
      chatContext = {
        lessonId: context.lessonId,
        lessonTitle: context.title,
        minitestId: context.minitestId,
        minitestTitle: context.type === 'minitest' ? context.title : undefined,
      };
    }

    // Prepare conversation history for context
    void conversationHistory.slice(-10).map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: msg.parts,
    }));

    const requestBody = {
      message,
      context: chatContext,
    };

    const response = await fetch(API_ENDPOINTS.ai.chat, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI Chat API error:', errorData);
      return {
        reply: 'Xin lỗi bạn, đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.',
        suggestions: ['Thử lại', 'Quay lại trang chủ'],
      };
    }

    const data = await response.json();

    if (data.success && data.data) {
      return {
        reply: data.data.response || 'Xin lỗi, mình chưa hiểu ý bạn.',
        suggestions: data.data.suggestions || [],
      };
    }

    return {
      reply: data.message || 'Xin lỗi, mình chưa hiểu ý bạn.',
      suggestions: [],
    };
  } catch (error) {
    console.error('Error sending message to AI:', error);
    return {
      reply: 'Xin lỗi bạn, đã có lỗi kết nối. Vui lòng kiểm tra internet và thử lại.',
      suggestions: ['Thử lại', 'Quay lại trang chủ'],
    };
  }
}

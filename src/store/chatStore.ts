'use client';

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface ChatContext {
  type: 'course' | 'lesson' | 'minitest' | 'hackathon' | null;
  id?: string;
  title?: string;
  courseName?: string;
  phaseName?: string;
  problemTitle?: string;
  problemDescription?: string;
  hints?: string[];
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  context: ChatContext | null;
  isTyping: boolean;
  unreadCount: number;

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setContext: (context: ChatContext | null) => void;
  setIsTyping: (typing: boolean) => void;
  clearMessages: () => void;
  incrementUnread: () => void;
  clearUnread: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  context: null,
  isTyping: false,
  unreadCount: 0,

  openChat: () => set({ isOpen: true }),

  closeChat: () => set({ isOpen: false }),

  toggleChat: () => {
    const { isOpen, unreadCount } = get();
    set({ 
      isOpen: !isOpen,
      unreadCount: !isOpen ? 0 : unreadCount
    });
  },

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
      unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
    }));
  },

  setMessages: (messages) => set({ messages }),

  setContext: (context) => set({ context }),

  setIsTyping: (isTyping) => set({ isTyping }),

  clearMessages: () => set({ messages: [] }),

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  clearUnread: () => set({ unreadCount: 0 }),
}));

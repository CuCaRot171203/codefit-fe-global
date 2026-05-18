'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Bot,
  User,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useConversationStore } from '@/store/conversation.store';
import { conversationService } from '@/services/conversationService';
import type { Conversation, ConversationMessage } from '@/types/conversation';

const QUICK_QUESTIONS = [
  { label: 'Đăng ký khóa học', prompt: 'Làm sao để đăng ký khóa học trên CodeFit?' },
  { label: 'Giải lao là gì?', prompt: 'Giải lao trên CodeFit là gì?' },
  { label: 'Tham gia Hackathon', prompt: 'Làm sao tham gia Hackathon?' },
  { label: 'Nhận chứng chỉ', prompt: 'Làm sao để nhận chứng chỉ hoàn thành khóa học?' },
  { label: 'Cách tăng điểm', prompt: 'Làm sao để tăng điểm nhanh trên CodeFit?' },
  { label: 'Minitest là gì?', prompt: 'Minitest hoạt động như thế nào?' },
];

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function formatMessageContent(content: string) {
  return content.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <div key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={j} className="font-semibold">
                {part.slice(2, -2)}
              </span>
            );
          }
          return part;
        })}
      </div>
    );
  });
}

export default function AiAssistantPage() {
  const {
    conversations,
    currentConversation,
    isLoading,
    isSending,
    setConversations,
    setCurrentConversation,
    setLoading,
    setSending,
    addMessage,
    removeConversation,
    clearCurrent,
    updateConversationTitle,
  } = useConversationStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const loadConversations = async () => {
    setLoading(true);
    const data = await conversationService.getAll();
    setConversations(data);
    setLoading(false);
  };

  const handleNewChat = async () => {
    setLoading(true);
    const newConv = await conversationService.create();
    if (newConv) {
      const convWithMessages: Conversation = {
        id: newConv.id,
        title: newConv.title,
        createdAt: newConv.createdAt,
        updatedAt: newConv.updatedAt,
        messageCount: 0,
        lastMessage: null,
      };
      setConversations([convWithMessages, ...conversations]);
      setCurrentConversation({
        ...convWithMessages,
        messages: [],
      });
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleSelectConversation = async (conv: Conversation) => {
    if (currentConversation?.id === conv.id) return;
    setLoading(true);
    const detail = await conversationService.getById(conv.id);
    if (detail) {
      setCurrentConversation(detail);
    }
    setLoading(false);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    const success = await conversationService.delete(convId);
    if (success) {
      removeConversation(convId);
      if (currentConversation?.id === convId) {
        clearCurrent();
      }
    }
  };

  const handleSend = async (text?: string) => {
    const textToSend = (text || input).trim();
    if (!textToSend) return;

    // Ensure we have a conversation
    let convId = currentConversation?.id;
    if (!convId) {
      setLoading(true);
      const newConv = await conversationService.create();
      if (newConv) {
        const convWithMessages: Conversation = {
          id: newConv.id,
          title: newConv.title,
          createdAt: newConv.createdAt,
          updatedAt: newConv.updatedAt,
          messageCount: 0,
          lastMessage: null,
        };
        setConversations([convWithMessages, ...conversations]);
        setCurrentConversation({
          ...convWithMessages,
          messages: [],
        });
        convId = newConv.id;
      }
      setLoading(false);
      if (!convId) return;
    }

    // Add user message locally
    const userMsg: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);

    if (!currentConversation?.messages.length) {
      updateConversationTitle(convId, textToSend.substring(0, 50) + (textToSend.length > 50 ? '...' : ''));
    }

    setInput('');
    setSending(true);

    // Send to API
    const response = await conversationService.sendMessage(convId, textToSend);
    if (response?.message) {
      addMessage(response.message);
      // Refresh conversations list to get updated title
      loadConversations();
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* Sidebar - Conversation History */}
      <div
        ref={sidebarRef}
        className="w-64 flex-shrink-0 border-r border-border bg-surface-container-low dark:bg-slate-900/50 flex flex-col"
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-border">
          <Button
            onClick={handleNewChat}
            disabled={isLoading}
            className="w-full justify-start gap-2 h-9 text-xs font-medium"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            Cuộc trò chuyện mới
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 px-3">
                <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Chưa có cuộc trò chuyện nào
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg transition-colors group relative',
                    currentConversation?.id === conv.id
                      ? 'bg-primary/10 text-primary dark:text-primary'
                      : 'hover:bg-surface-container-high dark:hover:bg-slate-800/50 text-secondary dark:text-slate-300'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(conv.updatedAt)}
                      </p>
                    </div>
                  </div>
                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    title="Xóa cuộc trò chuyện"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-border">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-primary dark:text-white">Trợ lý AI</h1>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-600 dark:text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {!currentConversation ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <Bot className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Chào bạn! Mình là <span className="font-semibold">Codey</span> - trợ lý AI của CodeFit.
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-xs mt-2">
                  Chọn một cuộc trò chuyện hoặc bắt đầu cuộc trò chuyện mới để được hỗ trợ.
                </p>
              </div>
            ) : currentConversation.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-xs text-muted-foreground text-center max-w-sm mb-4">
                  Mình có thể giúp bạn trả lời các câu hỏi về CodeFit!
                </p>
                {/* Quick Questions */}
                <div className="flex flex-wrap gap-1.5 justify-center max-w-md">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q.prompt)}
                      disabled={isSending}
                      className="px-2.5 py-1 rounded-full bg-surface-container-low dark:bg-slate-800 text-[10px] font-medium text-secondary dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary whitespace-nowrap transition-colors disabled:opacity-50"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {currentConversation.messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.role === 'user' && (
                      <div className="flex justify-end mb-1">
                        <span className="text-[10px] text-secondary dark:text-slate-500 uppercase tracking-wide">
                          Bạn
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      'flex gap-2',
                      msg.role === 'user' && 'flex-row-reverse'
                    )}>
                      {msg.role === 'assistant' && (
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-orange-400 text-white text-[10px]">
                            <Bot className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          'max-w-[75%] rounded-xl px-3 py-2 text-xs',
                          msg.role === 'assistant'
                            ? 'bg-surface-container-low dark:bg-slate-800 rounded-tl-sm'
                            : 'bg-primary text-white rounded-tr-sm'
                        )}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {formatMessageContent(msg.content)}
                        </div>
                        <div
                          className={cn(
                            'text-[10px] mt-1 opacity-60',
                            msg.role === 'user' ? 'text-white/70 text-right' : 'text-secondary dark:text-slate-500'
                          )}
                        >
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>

                      {msg.role === 'user' && (
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Suggestions */}
                    {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 ml-8">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(suggestion)}
                            disabled={isSending}
                            className="px-2 py-1 rounded-full bg-surface-container-low dark:bg-slate-800 text-[10px] text-secondary dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary transition-colors disabled:opacity-50"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isSending && (
                  <div className="flex gap-2">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-orange-400 text-white text-[10px]">
                        <Bot className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-surface-container-low dark:bg-slate-800 rounded-xl rounded-tl-sm px-3 py-2">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              disabled={isSending}
              className="flex-1 bg-surface-container-low dark:bg-slate-800 border-0 rounded-full px-4 py-2 text-xs focus-visible:ring-2 focus-visible:ring-primary h-9"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isSending}
              size="icon"
              className="rounded-full w-9 h-9 bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

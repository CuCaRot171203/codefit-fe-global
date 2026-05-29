'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { sendChatMessage } from '@/services/chatService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Send,
  Sparkles,
  ChevronDown,
  Bot,
  User,
  Loader2,
} from 'lucide-react';

const WELCOME_MESSAGE = `Xin chào! 👋 Mình là trợ lý AI của Codefit.

Mình có thể giúp bạn:
- Hướng dẫn ôn tập bài tập lập trình
- Trả lời thông tin về Codefit
- Gợi ý cách tiếp cận bài toán

Hãy đặt câu hỏi nhé!`;

const QUICK_QUESTIONS = [
  { label: 'Hướng dẫn sử dụng', query: 'Hướng dẫn tôi cách sử dụng nền tảng Codefit' },
  { label: 'Cách tham gia khóa học', query: 'Làm sao để tham gia một khóa học trên Codefit?' },
  { label: 'Minitest là gì?', query: 'Minitest trên Codefit là gì?' },
  { label: 'Hackathon là gì?', query: 'Hackathon trên Codefit là gì?' },
];

export function FloatingChatWidget() {
  const {
    isOpen,
    messages,
    context,
    isTyping,
    unreadCount,
    toggleChat,
    addMessage,
    setIsTyping,
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (message?: string) => {
    const textToSend = message || inputValue.trim();
    if (!textToSend || isTyping) return;

    setInputValue('');
    setShowQuickQuestions(false);

    // Add user message
    addMessage({
      role: 'user',
      content: textToSend,
    });

    // Add typing indicator
    setIsTyping(true);

    try {
      // Build conversation history for context
      const history = messages.map((m) => ({
        role: m.role as 'user' | 'model',
        parts: m.content,
      }));

      const response = await sendChatMessage({
        message: textToSend,
        context,
        conversationHistory: history,
      });

      // Add assistant response
      addMessage({
        role: 'assistant',
        content: response.reply,
        suggestions: response.suggestions,
      });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        suggestions: ['Thử lại', 'Quay lại trang chủ'],
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={cn(
          'fixed bottom-6 right-6 z-[9999] group',
          'transition-all duration-300 ease-out'
        )}
        aria-label="Mở trợ lý AI"
      >
        {/* Unread Badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Button */}
        {/* AI Chatbot Toggle Button */}
        <div
          className={cn(
            'relative flex items-center justify-center',
            'transition-all duration-300 ease-out',
            'hover:scale-110',
            'active:scale-95',
            isOpen && 'scale-0 opacity-0 rotate-180'
          )}
        >
          {/* Pulse animation rings */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-purple-400 scale-125" />

          {/* Wobble / float animation */}
          <div className="relative animate-wobble">
            {/* Outer glow */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-400 blur-sm opacity-60 animate-pulse" />
            {/* Main circle */}
            <div className="relative h-14 w-14 rounded-full shadow-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500">
              <svg
                viewBox="0 0 40 40"
                className="h-10 w-10 drop-shadow-lg"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Robot head */}
                <rect x="8" y="10" width="24" height="20" rx="4" fill="white" fillOpacity="0.95" />
                {/* Antenna */}
                <line x1="20" y1="10" x2="20" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="20" cy="5" r="2" fill="#FFD700" className="animate-pulse" />
                {/* Eyes */}
                <circle cx="14.5" cy="19" r="2.5" fill="#7C3AED" />
                <circle cx="25.5" cy="19" r="2.5" fill="#7C3AED" />
                {/* Eye highlights */}
                <circle cx="15.2" cy="18.2" r="0.8" fill="white" />
                <circle cx="26.2" cy="18.2" r="0.8" fill="white" />
                {/* Smile */}
                <path d="M15 24 Q20 28 25 24" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                {/* Ear buttons */}
                <circle cx="8" cy="20" r="1.5" fill="#DDD6FE" />
                <circle cx="32" cy="20" r="1.5" fill="#DDD6FE" />
                {/* Sparkle stars */}
                <path d="M4 12 L5 9 L6 12 L9 13 L6 14 L5 17 L4 14 L1 13 Z" fill="#FFD700" opacity="0.8" className="animate-spin" style={{ transformOrigin: '5px 13px', animationDuration: '3s' }} />
                <path d="M34 10 L35 8 L36 10 L38 11 L36 12 L35 14 L34 12 L32 11 Z" fill="#FFD700" opacity="0.8" className="animate-spin" style={{ transformOrigin: '35px 11px', animationDuration: '2.5s', animationDirection: 'reverse' }} />
              </svg>
            </div>
          </div>

          {/* Sparkles on hover */}
          <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <Sparkles className="absolute -top-1 -left-1 h-3 w-3 text-yellow-300 animate-float" />
            <Sparkles className="absolute -bottom-1 -right-1 h-2 w-2 text-cyan-300 animate-float" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-[9998] w-[380px] h-[560px]',
          'flex flex-col rounded-2xl shadow-2xl overflow-hidden',
          'bg-white dark:bg-slate-900',
          'border border-slate-200 dark:border-slate-700',
          'transition-all duration-300 ease-out',
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500">
          <div className="flex items-center gap-3">
            {/* AI Avatar */}
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Bot className="h-6 w-6 text-white" />
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
            </div>

            <div>
              <h3 className="font-semibold text-white text-sm">Codefit Assistant</h3>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Đang hoạt động
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear chat button */}
            <button
              onClick={() => {
                useChatStore.getState().clearMessages();
                setShowQuickQuestions(true);
              }}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              title="Xóa cuộc trò chuyện"
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Close button */}
            <button
              onClick={toggleChat}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              title="Đóng"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>

        {/* Context Badge */}
        {context && (
          <div className="flex-shrink-0 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              {context.type === 'lesson' && `Đang học: ${context.title}`}
              {context.type === 'minitest' && `Minitest: ${context.title}`}
              {context.type === 'hackathon' && `Hackathon: ${context.title}`}
              {context.type === 'course' && `Khóa học: ${context.title}`}
            </Badge>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="space-y-4">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                {/* AI Welcome */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">
                        {WELCOME_MESSAGE}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 ml-1 block">Vừa xong</span>
                  </div>
                </div>

                {/* Quick Questions */}
                {showQuickQuestions && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {QUICK_QUESTIONS.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(q.query)}
                        className="text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md transition-all text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                {message.role === 'assistant' ? (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'flex-1 max-w-[85%]',
                    message.role === 'user' && 'flex flex-col items-end'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 shadow-sm',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                    )}
                  >
                    <p
                      className={cn(
                        'text-sm whitespace-pre-line',
                        message.role === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                      )}
                    >
                      {message.content}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 mx-1 block">
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {/* Suggestions */}
                  {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-2.5 py-1 text-xs rounded-full bg-slate-100 hover:bg-violet-100 dark:bg-slate-700 dark:hover:bg-violet-900/50 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors border border-slate-200 dark:border-slate-600"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              disabled={isTyping}
              className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-visible:ring-violet-500"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            AI có thể đưa ra câu trả lời không chính xác. Hãy kiểm chứng thông tin.
          </p>
        </div>
      </div>
    </>
  );
}

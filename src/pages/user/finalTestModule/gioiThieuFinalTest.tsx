'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import { API_ENDPOINTS } from '@/config/api';
import { Timer, ClipboardList, Play, BookOpen, Loader2, Trophy } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  problems: Problem[];
}

const GioiThieuFinalTest = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { finalTestId } = useParams<{ finalTestId: string }>();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (finalTestId) {
      fetchFinalTest();
    } else {
      setLoading(false);
    }
  }, [finalTestId]);

  const fetchFinalTest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.hackathons.detail(finalTestId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setHackathon(data.data);
      }
    } catch (error) {
      console.error('Error fetching final test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    navigate(`/user/final-test/${finalTestId}/lam-bai`);
  };

  const questionCount = hackathon?.problems?.length || 0;
  const displayTitle = hackathon?.title || 'Final Test';
  const displayCourse = 'Khóa học CodeFit';
  const duration = hackathon?.durationMinutes || 60;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-[2rem] shadow-[0px_20px_40px_rgba(11,60,93,0.06)] border border-outline-variant/10">
        {/* Left Side: Illustration */}
        <div className={cn(
          'lg:col-span-5 relative flex items-center justify-center p-12 overflow-hidden',
          isDark ? 'bg-gradient-to-br from-amber-900 to-slate-900' : 'bg-gradient-to-br from-amber-500 to-orange-600'
        )}>
          <div className="absolute inset-0 opacity-20">
            <div className={cn(
              'absolute top-0 left-0 w-full h-full bg-gradient-to-br',
              isDark ? 'from-amber-800 via-slate-900 to-amber-900' : 'from-amber-400 via-orange-500 to-amber-600'
            )} />
          </div>

          <div className="relative z-10 text-center">
            {/* Certificate Illustration */}
            <div className={cn(
              'w-48 h-48 mx-auto rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl',
              isDark ? 'bg-slate-800' : 'bg-gradient-to-br from-amber-100 to-amber-200'
            )}>
              <div className="text-center">
                <div className={cn(
                  'text-6xl font-headline font-bold mb-2',
                  isDark ? 'text-amber-400' : 'text-amber-600'
                )}>
                  <Trophy className="w-20 h-20 mx-auto" />
                </div>
                <span className={cn(
                  'text-xs font-semibold',
                  isDark ? 'text-slate-400' : 'text-amber-700'
                )}>
                  FINAL TEST
                </span>
              </div>
            </div>

            <div className="mt-8">
              <span className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4',
                isDark ? 'bg-amber-400/20 text-amber-400' : 'bg-white/30 text-white'
              )}>
                Capstone Challenge
              </span>
              <h2 className={cn(
                'font-headline text-2xl font-bold leading-tight',
                isDark ? 'text-slate-100' : 'text-white'
              )}>
                Chứng nhận hoàn thành khóa học
              </h2>
            </div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className={cn(
          'lg:col-span-7 p-8 lg:p-14 flex flex-col justify-center',
          isDark ? 'bg-slate-900' : 'bg-surface-container-lowest'
        )}>
          {/* Timer Badge */}
          <div className={cn(
            'mb-2 flex items-center gap-2',
            isDark ? 'text-amber-400' : 'text-amber-600'
          )}>
            <Timer className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-wide">Thời gian: {duration} phút</span>
          </div>

          {/* Title */}
          <h1 className={cn(
            'font-headline text-3xl lg:text-4xl font-bold mb-6 leading-tight',
            isDark ? 'text-white' : 'text-primary'
          )}>
            {displayTitle}
          </h1>
          
          {/* Course info */}
          <p className={cn(
            'text-sm mb-4',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            {displayCourse}
          </p>

          {/* Instructions */}
          <div className={cn(
            'p-6 rounded-2xl mb-10',
            isDark ? 'bg-slate-800' : 'bg-surface-container-low'
          )}>
            <h3 className={cn(
              'font-semibold mb-4 flex items-center gap-2',
              isDark ? 'text-slate-200' : 'text-on-surface'
            )}>
              <ClipboardList className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
              Hướng dẫn làm bài
            </h3>
            <ul className="space-y-4">
              {[
                { num: 1, text: 'Đọc kỹ yêu cầu từng bài toán.' },
                { num: 2, text: 'Sau khi bắt đầu, bạn không thể tạm dừng.' },
                { num: 3, text: `Gồm ${questionCount} bài tập lập trình.` },
                { num: 4, text: 'Hoàn thành bài thi để nhận chứng chỉ.' },
              ].map((item) => (
                <li key={item.num} className="flex gap-3 items-start">
                  <span className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    isDark
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-amber-500 text-white'
                  )}>
                    {item.num}
                  </span>
                  <p className={cn(
                    'text-sm',
                    isDark ? 'text-slate-400' : 'text-on-surface-variant'
                  )}>
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleStart}
              className={cn(
                'flex-1 font-headline font-bold py-4 px-8 rounded-xl transition-all duration-300 active:scale-95 shadow-lg',
                isDark
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/50'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
              )}
            >
              <Play className="w-5 h-5 mr-2" />
              Bắt đầu ngay
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className={cn(
                'flex-1 font-headline font-bold py-4 px-8 rounded-xl transition-all duration-300 active:scale-95',
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-dim border-transparent'
              )}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Quay lại
            </Button>
          </div>

          {/* Footer Stats */}
          <div className={cn(
            'mt-8 flex items-center justify-between border-t pt-6',
            isDark ? 'border-slate-700' : 'border-outline-variant/15'
          )}>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-8 h-8 rounded-full ring-2 flex items-center justify-center text-[10px] font-bold',
                    isDark ? 'ring-slate-900 bg-slate-600' : 'ring-white bg-slate-400',
                    isDark ? 'text-slate-200' : 'text-white'
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className={cn(
                'w-8 h-8 rounded-full ring-2 flex items-center justify-center text-[10px] font-bold',
                isDark ? 'ring-slate-900 bg-slate-700 text-slate-300' : 'ring-white bg-secondary-container text-on-secondary-container'
              )}>
                +5k
              </div>
            </div>
            <p className={cn(
              'text-sm font-medium',
              isDark ? 'text-slate-400' : 'text-on-surface-variant'
            )}>
              5,000+ học viên đã hoàn thành
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GioiThieuFinalTest;

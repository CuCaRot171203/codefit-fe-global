'use client';

import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import {
  Clock,
  CheckCircle,
  Flame,
  BarChart3,
  Calendar,
  Award,
} from 'lucide-react';

// Mock data
const statsData = {
  totalHours: 124,
  lessonsCompleted: 48,
  totalLessons: 60,
  currentStreak: 12,
};

const courses = [
  {
    name: 'React Engineering',
    subtitle: 'Mastering Hooks & Architecture',
    progress: 85,
  },
  {
    name: 'Advanced Python',
    subtitle: 'Data Processing & Automation',
    progress: 42,
  },
  {
    name: 'Cấu trúc dữ liệu & Giải thuật',
    subtitle: 'Complexity & Optimization',
    progress: 60,
  },
];

const recentLessons = [
  {
    title: 'UseMemo & Performance Optimization',
    time: '14:30 - Hôm nay',
    highlight: true,
  },
  {
    title: 'Context API Deep Dive',
    time: '09:15 - Hôm qua',
    highlight: false,
  },
  {
    title: 'Asynchronous Programming in Python',
    time: '18:40 - 20/10/2023',
    highlight: false,
  },
  {
    title: 'Introduction to Linked Lists',
    time: '10:22 - 19/10/2023',
    highlight: false,
  },
];

// Generate heatmap data
const generateHeatmapData = () => {
  const densities = ['bg-surface-container-low', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary/80', 'bg-primary'];
  const data = [];
  for (let i = 0; i < 52; i++) {
    const row = [];
    for (let j = 0; j < 7; j++) {
      row.push(densities[Math.floor(Math.random() * densities.length)]);
    }
    data.push(row);
  }
  return data;
};

const heatmapData = generateHeatmapData();

const DashboardTienTrinhUser = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  return (
    <div>
      {/* Page Title Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className={cn(
            'font-headline text-4xl font-bold tracking-tight',
            isDark ? 'text-white' : 'text-primary'
          )}>
            Tiến độ học tập
          </h2>
          <p className={cn(
            'mt-1',
            isDark ? 'text-slate-400' : 'text-on-surface-variant'
          )}>
            Theo dõi hành trình chinh phục mã nguồn của bạn.
          </p>
        </div>
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl',
          isDark ? 'bg-slate-800' : 'bg-surface-container-low'
        )}>
          <Calendar className={cn(
            'w-5 h-5',
            isDark ? 'text-blue-400' : 'text-primary'
          )} />
          <span className={cn(
            'text-sm font-bold',
            isDark ? 'text-slate-300' : 'text-primary'
          )}>
            Tháng 10, 2023
          </span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Hours */}
        <div className={cn(
          'p-6 rounded-2xl flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <div className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center',
            isDark ? 'bg-blue-900/30' : 'bg-primary-container/10'
          )}>
            <Clock className={cn(
              'w-7 h-7',
              isDark ? 'text-blue-400' : 'text-primary-container'
            )} />
          </div>
          <div>
            <p className={cn(
              'text-xs font-semibold uppercase tracking-wider mb-1',
              isDark ? 'text-slate-400' : 'text-on-surface-variant'
            )}>
              Tổng giờ học
            </p>
            <h3 className={cn(
              'text-3xl font-headline font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {statsData.totalHours}
              <span className="text-sm font-body ml-1 opacity-60">giờ</span>
            </h3>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className={cn(
          'p-6 rounded-2xl flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <div className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center',
            isDark ? 'bg-amber-900/30' : 'bg-tertiary-fixed-dim/10'
          )}>
            <CheckCircle className={cn(
              'w-7 h-7',
              isDark ? 'text-amber-400' : 'text-on-tertiary-container'
            )} />
          </div>
          <div>
            <p className={cn(
              'text-xs font-semibold uppercase tracking-wider mb-1',
              isDark ? 'text-slate-400' : 'text-on-surface-variant'
            )}>
              Bài học đã xong
            </p>
            <h3 className={cn(
              'text-3xl font-headline font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {statsData.lessonsCompleted}
              <span className="text-sm font-body ml-1 opacity-60">/{statsData.totalLessons}</span>
            </h3>
          </div>
        </div>

        {/* Current Streak */}
        <div className={cn(
          'p-6 rounded-2xl flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300',
          isDark ? 'bg-blue-900/30' : 'bg-primary-container'
        )}>
          <div className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center',
            isDark ? 'bg-slate-800/50' : 'bg-white/10'
          )}>
            <Flame className={cn(
              'w-7 h-7',
              isDark ? 'text-amber-400' : 'text-tertiary-fixed-dim'
            )} />
          </div>
          <div>
            <p className={cn(
              'text-xs font-semibold uppercase tracking-wider mb-1',
              isDark ? 'text-blue-400' : 'text-primary-fixed'
            )}>
              Chuỗi hiện tại
            </p>
            <h3 className={cn(
              'text-3xl font-headline font-bold',
              isDark ? 'text-white' : 'text-white'
            )}>
              {statsData.currentStreak}
              <span className="text-sm font-body ml-1 opacity-60">ngày</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Progress & Heatmap */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Progress Bars */}
          <div className={cn(
            'rounded-3xl p-8',
            isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
          )}>
            <h4 className={cn(
              'font-headline text-xl font-bold mb-8 flex items-center gap-2',
              isDark ? 'text-white' : 'text-primary'
            )}>
              <BarChart3 className="w-6 h-6" />
              Tiến độ các khóa học
            </h4>
            <div className="space-y-8">
              {courses.map((course, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className={cn(
                        'font-bold block',
                        isDark ? 'text-slate-200' : 'text-primary'
                      )}>
                        {course.name}
                      </span>
                      <span className={cn(
                        'text-xs',
                        isDark ? 'text-slate-500' : 'text-on-surface-variant'
                      )}>
                        {course.subtitle}
                      </span>
                    </div>
                    <span className={cn(
                      'text-sm font-bold',
                      isDark ? 'text-blue-400' : 'text-primary'
                    )}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className={cn(
                    'h-3 rounded-full overflow-hidden',
                    isDark ? 'bg-slate-700' : 'bg-surface-container-low'
                  )}>
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isDark
                          ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                          : 'bg-gradient-to-r from-primary to-primary-container'
                      )}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className={cn(
            'rounded-3xl p-8',
            isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
          )}>
            <div className="flex justify-between items-center mb-8">
              <h4 className={cn(
                'font-headline text-xl font-bold',
                isDark ? 'text-white' : 'text-primary'
              )}>
                Hoạt động trong 3 tháng qua
              </h4>
              <div className="flex gap-1 items-center">
                <span className={cn(
                  'text-xs mr-1',
                  isDark ? 'text-slate-500' : 'text-on-surface-variant'
                )}>
                  Ít
                </span>
                <div className={cn(
                  'w-3 h-3 rounded-sm',
                  isDark ? 'bg-slate-700' : 'bg-surface-container-low'
                )} />
                <div className={cn(
                  'w-3 h-3 rounded-sm',
                  isDark ? 'bg-blue-900/50' : 'bg-primary/20'
                )} />
                <div className={cn(
                  'w-3 h-3 rounded-sm',
                  isDark ? 'bg-blue-800/60' : 'bg-primary/40'
                )} />
                <div className={cn(
                  'w-3 h-3 rounded-sm',
                  isDark ? 'bg-blue-700/80' : 'bg-primary/70'
                )} />
                <div className={cn(
                  'w-3 h-3 rounded-sm',
                  isDark ? 'bg-blue-600' : 'bg-primary'
                )} />
                <span className={cn(
                  'text-xs ml-1',
                  isDark ? 'text-slate-500' : 'text-on-surface-variant'
                )}>
                  Nhiều
                </span>
              </div>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="flex gap-1.5 min-w-max">
                {heatmapData.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex flex-col gap-1.5">
                    {row.map((color, cellIndex) => (
                      <div
                        key={cellIndex}
                        className={cn(
                          'w-3 h-3 rounded-sm',
                          color
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className={cn(
                'flex justify-between px-2 text-xs font-bold uppercase mt-3',
                isDark ? 'text-slate-500' : 'text-on-surface-variant'
              )}>
                <span>Tháng 8</span>
                <span>Tháng 9</span>
                <span>Tháng 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Progress Monolith & Recent Lessons */}
        <div className="space-y-8">
          {/* Progress Monolith Visualizer */}
          <div className={cn(
            'rounded-3xl p-8 relative overflow-hidden h-[320px] flex flex-col justify-end',
            isDark ? 'bg-blue-900/50' : 'bg-primary-container text-white'
          )}>
            <div className={cn(
              'absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-12 translate-x-12',
              isDark ? 'bg-amber-500/10' : 'bg-tertiary-fixed-dim/10'
            )} />
            <div className="absolute top-8 left-8">
              <Award className={cn(
                'w-16 h-16',
                isDark ? 'text-amber-400' : 'text-tertiary-fixed-dim'
              )} />
            </div>
            <div className="relative z-10">
              <h4 className={cn(
                'font-headline text-2xl font-bold mb-2',
                isDark ? 'text-white' : 'text-on-primary'
              )}>
                Sắp đạt cấp độ mới!
              </h4>
              <p className={cn(
                'text-sm mb-6 leading-relaxed',
                isDark ? 'text-slate-300' : 'text-primary-fixed'
              )}>
                Hoàn thành thêm 2 bài học "Advanced Hooks" để đạt danh hiệu Architect.
              </p>
              <div className={cn(
                'w-full h-1.5 rounded-full mb-2',
                isDark ? 'bg-slate-700' : 'bg-white/20'
              )}>
                <div
                  className={cn(
                    'h-full rounded-full',
                    isDark ? 'bg-amber-400' : 'bg-tertiary-fixed-dim'
                  )}
                  style={{ width: '90%' }}
                />
              </div>
              <p className={cn(
                'text-xs font-bold uppercase tracking-widest opacity-80',
                isDark ? 'text-slate-400' : 'text-primary-fixed'
              )}>
                90% hoàn thành mục tiêu tuần
              </p>
            </div>
          </div>

          {/* Recently Completed */}
          <div className={cn(
            'rounded-3xl p-6',
            isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
          )}>
            <h4 className={cn(
              'font-headline text-lg font-bold mb-6',
              isDark ? 'text-white' : 'text-primary'
            )}>
              Bài học vừa hoàn thành
            </h4>
            <div className="space-y-6">
              {recentLessons.map((lesson, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={cn(
                    'mt-1 w-2 h-2 rounded-full shrink-0',
                    lesson.highlight
                      ? isDark ? 'bg-amber-400' : 'bg-tertiary-fixed-dim'
                      : isDark ? 'bg-slate-600' : 'bg-primary/20'
                  )} />
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm font-bold leading-tight',
                      isDark ? 'text-slate-200' : 'text-primary'
                    )}>
                      {lesson.title}
                    </p>
                    <p className={cn(
                      'text-xs mt-1',
                      isDark ? 'text-slate-500' : 'text-on-surface-variant'
                    )}>
                      Hoàn thành: {lesson.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              className={cn(
                'w-full mt-8 py-3 text-sm font-bold rounded-xl transition-colors',
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'border-outline-variant/30 text-primary hover:bg-surface-container-low'
              )}
              variant="outline"
            >
              Xem tất cả lịch sử
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTienTrinhUser;

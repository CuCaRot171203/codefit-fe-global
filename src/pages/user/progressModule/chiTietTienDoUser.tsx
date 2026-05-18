'use client';

import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import {
  ChevronRight,
  RotateCcw,
  Target,
  Lightbulb,
  Filter,
} from 'lucide-react';

// Mock data
const problemData = {
  title: 'Đảo ngược danh sách liên kết',
  level: 'Trung bình',
  description: 'Phân tích sâu về hiệu suất và lịch sử giải quyết bài toán Reverse Linked List của bạn.',
  breadcrumb: ['Cấu trúc dữ liệu', 'Danh sách liên kết', 'Chi tiết Tiến độ'],
};

const stats = {
  totalAttempts: 12,
  weeklyAttempts: 2,
  highestScore: '100/100',
  fastestTime: '24ms',
  percentile: '92%',
  ranking: 'Top 5%',
};

const submissions = [
  {
    id: 1,
    date: '20/10/2023 14:30',
    status: 'Accepted',
    statusType: 'success',
    score: '100/100',
    runtime: '24ms',
    memory: '14.2 MB',
  },
  {
    id: 2,
    date: '20/10/2023 14:15',
    status: 'Accepted',
    statusType: 'success',
    score: '100/100',
    runtime: '32ms',
    memory: '14.5 MB',
  },
  {
    id: 3,
    date: '19/10/2023 09:10',
    status: 'Wrong Answer',
    statusType: 'error',
    score: '45/100',
    runtime: '--',
    memory: '--',
  },
  {
    id: 4,
    date: '18/10/2023 21:45',
    status: 'Time Limit Exceeded',
    statusType: 'warning',
    score: '20/100',
    runtime: '>1000ms',
    memory: '18.1 MB',
  },
];

const aiSuggestions = [
  'Sử dụng phương pháp hai con trỏ để tối ưu bộ nhớ.',
  'Cẩn thận với các trường hợp biên như danh sách có 1 phần tử.',
];

const ChiTietTienDoUser = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const getStatusStyles = (type: string) => {
    switch (type) {
      case 'success':
        return isDark
          ? 'bg-emerald-900/30 text-emerald-400'
          : 'bg-green-100 text-green-700';
      case 'error':
        return isDark
          ? 'bg-red-900/30 text-red-400'
          : 'bg-red-100 text-red-700';
      case 'warning':
        return isDark
          ? 'bg-amber-900/30 text-amber-400'
          : 'bg-amber-100 text-amber-700';
      default:
        return '';
    }
  };

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        {problemData.breadcrumb.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className={cn(
                'w-4 h-4',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )} />
            )}
            <span className={cn(
              index === problemData.breadcrumb.length - 1
                ? 'font-semibold'
                : '',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}>
              {item}
            </span>
          </div>
        ))}
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className={cn(
            'px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest mb-3 inline-block',
            isDark
              ? 'bg-blue-900/30 text-blue-400'
              : 'bg-primary-fixed text-on-primary-fixed'
          )}>
            Cấp độ: {problemData.level}
          </span>
          <h2 className={cn(
            'text-4xl font-bold mb-2',
            isDark ? 'text-white' : 'text-primary'
          )}>
            {problemData.title}
          </h2>
          <p className={cn(
            'max-w-xl',
            isDark ? 'text-slate-400' : 'text-on-surface-variant'
          )}>
            {problemData.description}
          </p>
        </div>
        <Button
          className={cn(
            'px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95',
            isDark
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-tertiary-fixed-dim text-on-tertiary-fixed hover:bg-amber-400'
          )}
        >
          <RotateCcw className="w-5 h-5" />
          Thử lại bài học
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Attempts */}
        <div className={cn(
          'p-6 rounded-2xl border-l-4 shadow-sm',
          isDark ? 'bg-slate-800 border-l-blue-500' : 'bg-surface-container-lowest border-l-primary'
        )}>
          <p className={cn(
            'text-sm font-medium mb-1',
            isDark ? 'text-slate-400' : 'text-on-surface-variant'
          )}>
            Tổng số lần thử
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn(
              'text-3xl font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {stats.totalAttempts}
            </h3>
            <span className="text-xs font-bold text-emerald-500">
              +{stats.weeklyAttempts} tuần này
            </span>
          </div>
        </div>

        {/* Highest Score */}
        <div className={cn(
          'p-6 rounded-2xl border-l-4 shadow-sm',
          isDark ? 'bg-slate-800 border-l-blue-500' : 'bg-surface-container-lowest border-l-primary'
        )}>
          <p className={cn(
            'text-sm font-medium mb-1',
            isDark ? 'text-slate-400' : 'text-on-surface-variant'
          )}>
            Điểm cao nhất
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn(
              'text-3xl font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {stats.highestScore}
            </h3>
          </div>
        </div>

        {/* Fastest Time */}
        <div className={cn(
          'p-6 rounded-2xl border-l-4 shadow-sm',
          isDark ? 'bg-slate-800 border-l-amber-500' : 'bg-surface-container-lowest border-l-tertiary-fixed-dim'
        )}>
          <p className={cn(
            'text-sm font-medium mb-1',
            isDark ? 'text-slate-400' : 'text-on-surface-variant'
          )}>
            Thời gian nhanh nhất
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn(
              'text-3xl font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {stats.fastestTime}
            </h3>
            <span className="text-xs font-bold text-emerald-500">
              Vượt {stats.percentile}
            </span>
          </div>
        </div>

        {/* Ranking */}
        <div className={cn(
          'p-6 rounded-2xl border-l-4 shadow-sm',
          isDark ? 'bg-slate-800 border-l-blue-500' : 'bg-surface-container-lowest border-l-primary'
        )}>
          <p className={cn(
            'text-sm font-medium mb-1',
            isDark ? 'text-slate-400' : 'text-on-surface-variant'
          )}>
            Xếp hạng
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn(
              'text-3xl font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {stats.ranking}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart Section */}
        <div className={cn(
          'lg:col-span-8 p-8 rounded-3xl shadow-sm',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className={cn(
                'text-xl font-bold mb-1',
                isDark ? 'text-white' : 'text-primary'
              )}>
                Xu hướng cải thiện
              </h3>
              <p className={cn(
                'text-sm',
                isDark ? 'text-slate-400' : 'text-on-surface-variant'
              )}>
                Điểm số và Runtime qua các lần nộp bài
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-3 h-3 rounded-full',
                  isDark ? 'bg-blue-500' : 'bg-primary-container'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  isDark ? 'text-slate-400' : ''
                )}>
                  Điểm số
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-3 h-3 rounded-full',
                  isDark ? 'bg-amber-400' : 'bg-tertiary-fixed-dim'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  isDark ? 'text-slate-400' : ''
                )}>
                  Runtime
                </span>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full h-64 relative mt-4">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
              {/* Grid Lines */}
              <line stroke={isDark ? '#374151' : '#eceef0'} strokeWidth="1" x1="0" x2="800" y1="0" y2="0" />
              <line stroke={isDark ? '#374151' : '#eceef0'} strokeWidth="1" x1="0" x2="800" y1="50" y2="50" />
              <line stroke={isDark ? '#374151' : '#eceef0'} strokeWidth="1" x1="0" x2="800" y1="100" y2="100" />
              <line stroke={isDark ? '#374151' : '#eceef0'} strokeWidth="1" x1="0" x2="800" y1="150" y2="150" />

              {/* Score Line */}
              <path
                d="M0,180 L100,160 L200,120 L300,90 L400,60 L500,40 L600,20 L700,10 L800,10"
                fill="none"
                stroke={isDark ? '#3b82f6' : '#0B3C5D'}
                strokeLinecap="round"
                strokeWidth="4"
              />

              {/* Runtime Line */}
              <path
                d="M0,140 L100,145 L200,130 L300,140 L400,100 L500,80 L600,90 L700,75 L800,60"
                fill="none"
                stroke={isDark ? '#fbbf24' : '#ffb95f'}
                strokeDasharray="8,4"
                strokeWidth="3"
              />

              {/* Area under score */}
              <path
                d="M0,180 L100,160 L200,120 L300,90 L400,60 L500,40 L600,20 L700,10 L800,10 V200 H0 Z"
                fill={isDark ? '#3b82f6' : '#0B3C5D'}
                opacity="0.1"
              />
            </svg>

            {/* Chart Labels */}
            <div className={cn(
              'flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest px-2',
              isDark ? 'text-slate-500' : 'text-slate-400'
            )}>
              <span>Lần 1</span>
              <span>Lần 3</span>
              <span>Lần 6</span>
              <span>Lần 9</span>
              <span>Lần 12</span>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Next Goal Card */}
          <div className={cn(
            'p-8 rounded-3xl relative overflow-hidden',
            isDark ? 'bg-blue-900/50 text-white' : 'bg-primary-container text-white'
          )}>
            <div className="relative z-10">
              <h4 className={cn(
                'text-xl font-bold mb-4',
                isDark ? '' : ''
              )}>
                Mục tiêu tiếp theo
              </h4>
              <p className={cn(
                'text-sm mb-6',
                isDark ? 'text-slate-300' : 'text-blue-200'
              )}>
                Giảm mức sử dụng bộ nhớ xuống dưới 14MB để đạt danh hiệu "Memory Master".
              </p>
              <div className={cn(
                'w-full h-2 rounded-full mb-2',
                isDark ? 'bg-slate-700' : 'bg-white/10'
              )}>
                <div
                  className={cn(
                    'h-full rounded-full',
                    isDark ? 'bg-amber-400' : 'bg-tertiary-fixed-dim'
                  )}
                  style={{ width: '75%' }}
                />
              </div>
              <p className={cn(
                'text-[10px] font-bold uppercase tracking-widest text-right',
                isDark ? 'text-slate-400' : 'text-blue-200'
              )}>
                75% Hoàn thành
              </p>
            </div>
            <Target className={cn(
              'absolute -right-10 -bottom-10 w-32 h-32 opacity-10',
              isDark ? '' : ''
            )} />
          </div>

          {/* AI Suggestions */}
          <div className={cn(
            'p-8 rounded-3xl',
            isDark ? 'bg-slate-800' : 'bg-surface-container-high'
          )}>
            <h4 className={cn(
              'text-lg font-bold mb-4',
              isDark ? 'text-white' : 'text-primary'
            )}>
              Gợi ý từ AI
            </h4>
            <ul className="flex flex-col gap-4">
              {aiSuggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-3">
                  <Lightbulb className={cn(
                    'w-5 h-5 shrink-0 mt-0.5',
                    isDark ? 'text-amber-400' : 'text-primary'
                  )} />
                  <p className={cn(
                    'text-sm leading-relaxed',
                    isDark ? 'text-slate-400' : 'text-on-surface-variant'
                  )}>
                    {suggestion}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed History Table */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className={cn(
            'text-2xl font-bold',
            isDark ? 'text-white' : 'text-primary'
          )}>
            Lịch sử chi tiết các lần thử
          </h3>
          <Button
            variant="ghost"
            className={cn(
              'gap-2 text-sm font-semibold',
              isDark ? 'text-slate-400 hover:text-white' : 'text-primary'
            )}
          >
            <Filter className="w-4 h-4" />
            Lọc kết quả
          </Button>
        </div>

        <div className={cn(
          'overflow-hidden rounded-3xl shadow-sm',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn(
                'border-b',
                isDark ? 'bg-slate-700/50 border-slate-700' : 'bg-surface-container-low border-surface-container'
              )}>
                <th className={cn(
                  'px-8 py-5 text-[10px] font-bold uppercase tracking-widest',
                  isDark ? 'text-slate-400' : 'text-on-surface-variant'
                )}>
                  Ngày nộp
                </th>
                <th className={cn(
                  'px-8 py-5 text-[10px] font-bold uppercase tracking-widest',
                  isDark ? 'text-slate-400' : 'text-on-surface-variant'
                )}>
                  Trạng thái
                </th>
                <th className={cn(
                  'px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-center',
                  isDark ? 'text-slate-400' : 'text-on-surface-variant'
                )}>
                  Điểm số
                </th>
                <th className={cn(
                  'px-8 py-5 text-[10px] font-bold uppercase tracking-widest',
                  isDark ? 'text-slate-400' : 'text-on-surface-variant'
                )}>
                  Runtime
                </th>
                <th className={cn(
                  'px-8 py-5 text-[10px] font-bold uppercase tracking-widest',
                  isDark ? 'text-slate-400' : 'text-on-surface-variant'
                )}>
                  Bộ nhớ
                </th>
                <th className={cn(
                  'px-8 py-5 text-[10px] font-bold uppercase tracking-widest',
                  isDark ? 'text-slate-400' : 'text-on-surface-variant'
                )}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container dark:divide-slate-700">
              {submissions.map((submission) => (
                <tr
                  key={submission.id}
                  className={cn(
                    'transition-colors',
                    isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/50'
                  )}
                >
                  <td className={cn(
                    'px-8 py-6 font-medium text-sm',
                    isDark ? 'text-slate-300' : ''
                  )}>
                    {submission.date}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      'px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider',
                      getStatusStyles(submission.statusType)
                    )}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={cn(
                      'font-bold',
                      submission.score === '100/100'
                        ? isDark ? 'text-white' : 'text-primary'
                        : isDark ? 'text-slate-500' : 'text-slate-400'
                    )}>
                      {submission.score}
                    </span>
                  </td>
                  <td className={cn(
                    'px-8 py-6 text-sm',
                    isDark ? 'text-slate-400' : ''
                  )}>
                    {submission.runtime}
                  </td>
                  <td className={cn(
                    'px-8 py-6 text-sm',
                    isDark ? 'text-slate-400' : ''
                  )}>
                    {submission.memory}
                  </td>
                  <td className="px-8 py-6">
                    <Button
                      variant="link"
                      className={cn(
                        'font-bold text-xs p-0 h-auto',
                        isDark
                          ? 'text-blue-400 hover:text-blue-300'
                          : 'text-primary-container hover:underline'
                      )}
                    >
                      {submission.statusType === 'error' ? 'Xem lỗi' : 'Xem mã nguồn'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChiTietTienDoUser;

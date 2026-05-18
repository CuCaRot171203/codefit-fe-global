'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import {
  Search,
  Eye,
  ArrowUpRight,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Mock submission data
const submissions = [
  {
    id: '40922',
    title: 'Làm mịn ảnh số',
    status: 'accepted',
    statusText: 'Chấp nhận',
    time: '24 ms',
    memory: '12.4 MB',
    language: 'C++ 17',
    relativeTime: 'Vừa xong',
    timestamp: '14:24 - 24/05',
  },
  {
    id: '22810',
    title: 'Tìm đường đi ngắn nhất',
    status: 'wrong_answer',
    statusText: 'Sai kết quả',
    time: '112 ms',
    memory: '48.2 MB',
    language: 'Python 3',
    relativeTime: '12 phút trước',
    timestamp: '14:12 - 24/05',
  },
  {
    id: '19923',
    title: 'Cây khung nhỏ nhất',
    status: 'compile_error',
    statusText: 'Lỗi biên dịch',
    time: '0 ms',
    memory: '0 MB',
    language: 'C++ 17',
    relativeTime: '45 phút trước',
    timestamp: '13:39 - 24/05',
  },
  {
    id: '05521',
    title: 'Sắp xếp chuỗi ký tự',
    status: 'accepted',
    statusText: 'Chấp nhận',
    time: '8 ms',
    memory: '4.1 MB',
    language: 'Java 11',
    relativeTime: '2 giờ trước',
    timestamp: '12:15 - 24/05',
  },
  {
    id: '99011',
    title: 'Dãy con tăng dài nhất',
    status: 'time_limit',
    statusText: 'Quá giới hạn thời gian',
    time: '2,001 ms',
    memory: '156.4 MB',
    language: 'Python 3',
    relativeTime: '4 giờ trước',
    timestamp: '10:45 - 24/05',
  },
];

const statusStyles = {
  accepted: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    ring: 'ring-emerald-100 dark:ring-emerald-900/50',
    dot: 'bg-emerald-500',
  },
  wrong_answer: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    ring: 'ring-red-100 dark:ring-red-900/50',
    dot: 'bg-red-500',
  },
  compile_error: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    ring: 'ring-slate-200 dark:ring-slate-700',
    dot: 'bg-slate-500',
  },
  time_limit: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    ring: 'ring-amber-100 dark:ring-amber-900/50',
    dot: 'bg-amber-500',
  },
};

const languageStyles: Record<string, string> = {
  'C++ 17': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'Python 3': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Java 11': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'JavaScript': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const HistoryStudyPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  const totalSubmissions = 1284;

  return (
    <div className="p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="font-headline text-3xl lg:text-4xl font-bold mb-2 text-primary dark:text-blue-400">
            Lịch sử nộp bài
          </h1>
          <p className={cn(
            'font-body',
            isDark ? 'text-slate-400' : 'text-secondary'
          )}>
            Theo dõi và tối ưu hóa hiệu suất các giải thuật của bạn.
          </p>
        </div>

        {/* Stats Cards */}
        <div className={cn(
          'flex items-center gap-3 p-1.5 rounded-2xl',
          isDark ? 'bg-slate-800' : 'bg-surface-container-low'
        )}>
          <div className={cn(
            'px-4 py-2 rounded-xl shadow-sm',
            isDark ? 'bg-slate-700' : 'bg-surface-container-lowest'
          )}>
            <span className={cn(
              'block text-[10px] uppercase tracking-wider font-bold',
              isDark ? 'text-slate-500' : 'text-outline'
            )}>
              Tổng số
            </span>
            <span className={cn(
              'text-xl font-headline font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {totalSubmissions.toLocaleString()}
            </span>
          </div>
          <div className="px-4 py-2">
            <span className={cn(
              'block text-[10px] uppercase tracking-wider font-bold',
              isDark ? 'text-slate-500' : 'text-outline'
            )}>
              Tỉ lệ đạt
            </span>
            <span className={cn(
              'text-xl font-headline font-bold',
              isDark ? 'text-amber-400' : 'text-on-tertiary-container'
            )}>
              84.2%
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 items-center">
        <div className="lg:col-span-5 relative">
          <Search className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5',
            isDark ? 'text-slate-500' : 'text-outline'
          )} />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-xl text-sm font-body outline-none transition-all border-0',
              isDark
                ? 'bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-700 text-white placeholder:text-slate-500'
                : 'bg-surface-container-highest focus:ring-2 focus:ring-primary/20'
            )}
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'w-full px-4 py-3 rounded-xl text-sm font-body outline-none cursor-pointer border-0',
              isDark
                ? 'bg-slate-800 text-slate-200'
                : 'bg-surface-container-highest'
            )}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="accepted">Chấp nhận</option>
            <option value="wrong_answer">Sai kết quả</option>
            <option value="compile_error">Lỗi biên dịch</option>
            <option value="time_limit">Quá giới hạn thời gian</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className={cn(
              'w-full px-4 py-3 rounded-xl text-sm font-body outline-none cursor-pointer border-0',
              isDark
                ? 'bg-slate-800 text-slate-200'
                : 'bg-surface-container-highest'
            )}
          >
            <option value="all">Tất cả ngôn ngữ</option>
            <option value="cpp">C++</option>
            <option value="python">Python 3</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        <div className="lg:col-span-1 flex justify-end">
          <button
            className={cn(
              'p-3 rounded-xl transition-colors border-0 cursor-pointer',
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                : 'bg-surface-container-high hover:bg-surface-dim text-primary'
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className={cn(
        'rounded-3xl overflow-hidden shadow-[0px_20px_40px_rgba(11,60,93,0.04)] border',
        isDark
          ? 'bg-slate-800/50 border-slate-700'
          : 'bg-surface-container-lowest shadow-[0px_20px_40px_rgba(11,60,93,0.04)] border-outline-variant/10'
      )}>
        {/* Table Header */}
        <div className={cn(
          'grid grid-cols-7 px-6 py-5 border-b font-headline font-semibold text-sm tracking-tight',
          isDark
            ? 'bg-slate-800 border-slate-700 text-slate-400'
            : 'bg-surface-container-low/50 border-outline-variant/15 text-primary'
        )}>
          <div>Thời gian</div>
          <div>Bài tập</div>
          <div>Trạng thái</div>
          <div>Thời gian chạy</div>
          <div>Bộ nhớ</div>
          <div>Ngôn ngữ</div>
          <div className="text-right">Hành động</div>
        </div>

        {/* Table Body */}
        <div className={cn(
          'divide-y',
          isDark ? 'divide-slate-700' : 'divide-outline-variant/10'
        )}>
          {submissions.map((submission) => {
            const status = statusStyles[submission.status as keyof typeof statusStyles];
            return (
              <div
                key={submission.id}
                className={cn(
                  'grid grid-cols-7 px-6 py-4 items-center group transition-colors hover',
                  isDark
                    ? 'hover:bg-slate-700/50'
                    : 'hover:bg-surface-container-low/30'
                )}
              >
                {/* Time */}
                <div>
                  <div className={cn(
                    'text-sm font-medium',
                    isDark ? 'text-slate-200' : 'text-primary'
                  )}>
                    {submission.relativeTime}
                  </div>
                  <div className={cn(
                    'text-[10px] font-bold uppercase',
                    isDark ? 'text-slate-500' : 'text-outline'
                  )}>
                    {submission.timestamp}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <div className={cn(
                    'text-sm font-semibold cursor-pointer hover:underline',
                    isDark ? 'text-slate-200 hover:text-blue-400' : 'text-primary hover:text-primary-container'
                  )}>
                    {submission.title}
                  </div>
                  <div className={cn(
                    'text-xs',
                    isDark ? 'text-slate-500' : 'text-outline'
                  )}>
                    ID: #{submission.id}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1',
                    status.bg,
                    status.text,
                    status.ring
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                    {submission.statusText}
                  </span>
                </div>

                {/* Time Runtime */}
                <div className={cn(
                  'text-sm',
                  isDark ? 'text-slate-400' : 'text-secondary'
                )}>
                  {submission.time}
                </div>

                {/* Memory */}
                <div className={cn(
                  'text-sm',
                  isDark ? 'text-slate-400' : 'text-secondary'
                )}>
                  {submission.memory}
                </div>

                {/* Language */}
                <div>
                  <span className={cn(
                    'text-xs font-headline font-semibold px-2 py-0.5 rounded',
                    languageStyles[submission.language] || (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
                  )}>
                    {submission.language}
                  </span>
                </div>

                {/* Actions */}
                <div className="text-right">
                  <button
                    className={cn(
                      'p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100',
                      isDark
                        ? 'text-slate-500 hover:text-white hover:bg-slate-600'
                        : 'text-outline hover:text-primary hover:bg-surface-container'
                    )}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className={cn(
          'px-6 py-6 flex items-center justify-between border-t',
          isDark
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-surface-container-low/20 border-outline-variant/10'
        )}>
          <div className={cn(
            'text-sm',
            isDark ? 'text-slate-500' : 'text-outline'
          )}>
            Hiển thị <span className={cn(
              'font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>1-10</span> trong số{' '}
            <span className={cn(
              'font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>{totalSubmissions.toLocaleString()}</span> kết quả
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            <button
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-not-allowed opacity-50',
                isDark ? 'text-slate-500 hover:bg-slate-700' : 'text-outline hover:bg-surface-container-high'
              )}
              disabled
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-headline transition-colors',
                  page === 1
                    ? (isDark ? 'bg-blue-600 text-white' : 'bg-primary text-white')
                    : (isDark
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-primary hover:bg-surface-container-high')
                )}
              >
                {page}
              </button>
            ))}
            
            <span className={cn(
              'px-2',
              isDark ? 'text-slate-500' : 'text-outline'
            )}>
              ...
            </span>
            
            <button
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center font-headline transition-colors',
                isDark
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-primary hover:bg-surface-container-high'
              )}
            >
              128
            </button>
            
            <button
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                isDark
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-primary hover:bg-surface-container-high'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {/* Tips Card */}
        <div className={cn(
          'col-span-1 md:col-span-2 p-8 rounded-[2rem] relative overflow-hidden group',
          isDark ? 'bg-blue-600' : 'bg-primary'
        )}>
          <div className="relative z-10">
            <h3 className="font-headline text-2xl font-bold mb-4 text-white">
              Mẹo cải thiện tốc độ
            </h3>
            <p className={cn(
              'leading-relaxed max-w-md',
              isDark ? 'text-blue-200' : 'text-on-primary-container'
            )}>
              Dựa trên lịch sử nộp bài gần đây của bạn ở bài tập{' '}
              <span className="text-white font-bold">"Dãy con tăng dài nhất"</span>,
              việc sử dụng{' '}
              <span className={cn(
                'font-bold',
                isDark ? 'text-amber-300' : 'text-tertiary-fixed'
              )}>
                Quy hoạch động tối ưu bằng Binary Search
              </span>
              có thể giảm thời gian chạy từ 2s xuống còn dưới 50ms.
            </p>
            <button
              className={cn(
                'mt-6 px-6 py-2 font-bold rounded-full text-sm hover:scale-105 active:scale-95 transition-all border-0 cursor-pointer',
                isDark
                  ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                  : 'bg-tertiary-fixed text-on-tertiary-fixed hover:opacity-90'
              )}
            >
              Xem hướng dẫn chi tiết
              <ArrowUpRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
          {/* Decorative element */}
          <div className={cn(
            'absolute -right-12 -bottom-12 w-64 h-64 rounded-full blur-3xl opacity-50 transition-transform duration-700 group-hover:scale-125',
            isDark ? 'bg-blue-500' : 'bg-primary-container'
          )} />
        </div>

        {/* Daily Challenge Card */}
        <div className={cn(
          'p-8 rounded-[2rem] flex flex-col justify-between border',
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-surface-container-high border-outline-variant/10'
        )}>
          <div>
            <Trophy
              className={cn(
                'w-10 h-10 mb-4',
                isDark ? 'text-amber-400' : 'text-on-tertiary-container'
              )}
            />
            <h4 className={cn(
              'font-headline text-lg font-bold mb-2',
              isDark ? 'text-white' : 'text-primary'
            )}>
              Thử thách hàng ngày
            </h4>
            <p className={cn(
              'text-sm mt-2',
              isDark ? 'text-slate-400' : 'text-secondary'
            )}>
              Hoàn thành bài tập hôm nay để nhận 50 EXP và duy trì chuỗi Streak của bạn.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[10, 11, 12].map((num, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold',
                    isDark ? 'border-slate-700 bg-slate-600' : 'border-surface-container-high bg-slate-400',
                    isDark ? 'text-slate-300' : 'text-white'
                  )}
                >
                  +{num}
                </div>
              ))}
            </div>
            <span className={cn(
              'text-xs font-bold',
              isDark ? 'text-blue-400' : 'text-primary'
            )}>
              Đã tham gia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryStudyPage;

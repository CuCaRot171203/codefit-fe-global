'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { RootState } from '@/store';
import { hackathonService } from '@/services/api';
import {
  Calendar,
  Users,
  Zap,
  Rocket,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

type TabFilter = 'all' | 'active' | 'upcoming' | 'ended' | 'registered';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  maxParticipants: number;
  _count?: {
    participants: number;
    submissions: number;
  };
  registeredAt?: string;
  isRegistered?: boolean;
}

const getStatusBadge = (status: string, isDark: boolean) => {
  switch (status) {
    case 'active':
      return (
        <Badge className={cn(
          'px-3 py-1 rounded-full text-xs font-bold tracking-wide',
          isDark ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700' : 'bg-green-100 text-green-700 border-green-200'
        )}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse inline-block" />
          Đang diễn ra
        </Badge>
      );
    case 'upcoming':
      return (
        <Badge className={cn(
          'px-3 py-1 rounded-full text-xs font-bold tracking-wide',
          isDark ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
        )}>
          <Clock className="w-3 h-3 mr-1 inline" />
          Sắp diễn ra
        </Badge>
      );
    case 'ended':
      return (
        <Badge className={cn(
          'px-3 py-1 rounded-full text-xs font-bold tracking-wide',
          isDark ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-100 text-slate-500 border-slate-200'
        )}>
          <XCircle className="w-3 h-3 mr-1 inline" />
          Đã kết thúc
        </Badge>
      );
    default:
      return null;
  }
};

const getStatusFromDates = (startTime: string, endTime: string): 'active' | 'upcoming' | 'ended' => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTimeUntil = (startTime: string) => {
  const now = new Date();
  const start = new Date(startTime);
  const diff = start.getTime() - now.getTime();
  if (diff <= 0) return '';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `Còn ${hours} giờ ${minutes} phút`;
};

const DanhSachHackathon = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [allHackathons, setAllHackathons] = useState<Hackathon[]>([]);
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [upcomingHackathons, setUpcomingHackathons] = useState<Hackathon[]>([]);
  const [endedHackathons, setEndedHackathons] = useState<Hackathon[]>([]);
  const [registeredHackathons, setRegisteredHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchRegistered = useCallback(async () => {
    if (!token) return;
    try {
      const res = await hackathonService.getRegistered();
      if (res.success) {
        const registered = (res.data || []) as Hackathon[];
        setRegisteredHackathons(registered);
        setRegisteredIds(new Set(registered.map((h: Hackathon) => h.id)));
      }
    } catch (e) {
      console.error('Failed to fetch registered hackathons:', e);
    }
  }, [token]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, upcomingRes, endedRes] = await Promise.all([
        hackathonService.getActive(),
        hackathonService.getUpcoming(),
        hackathonService.getEnded(),
      ]);

      if (activeRes.success) setActiveHackathons((activeRes.data || []) as Hackathon[]);
      if (upcomingRes.success) setUpcomingHackathons((upcomingRes.data || []) as Hackathon[]);
      if (endedRes.success) setEndedHackathons((endedRes.data || []) as Hackathon[]);

      // all = combine all
      const all = [
        ...((activeRes.data || []) as Hackathon[]),
        ...((upcomingRes.data || []) as Hackathon[]),
        ...((endedRes.data || []) as Hackathon[]),
      ];
      setAllHackathons(all);
    } catch (e) {
      console.error('Failed to fetch hackathons:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchRegistered();
  }, [fetchAll, fetchRegistered]);

  const loadTabData = async (tab: TabFilter) => {
    if (tab === 'registered' && !token) return;
    if (tab === 'registered') await fetchRegistered();
  };

  const handleTabChange = (tab: TabFilter) => {
    setActiveTab(tab);
    loadTabData(tab);
  };

  const getHackathonsForTab = (): Hackathon[] => {
    switch (activeTab) {
      case 'active': return activeHackathons;
      case 'upcoming': return upcomingHackathons;
      case 'ended': return endedHackathons;
      case 'registered': return registeredHackathons;
      default: return allHackathons;
    }
  };

  const getStatus = (h: Hackathon): 'active' | 'upcoming' | 'ended' => {
    return getStatusFromDates(h.startTime, h.endTime);
  };

  const hackathons = getHackathonsForTab();

  const tabButtons: { key: TabFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Tất cả', icon: <Trophy className="w-4 h-4" /> },
    { key: 'active', label: 'Đang diễn ra', icon: <Zap className="w-4 h-4" /> },
    { key: 'upcoming', label: 'Sắp diễn ra', icon: <Clock className="w-4 h-4" /> },
    { key: 'ended', label: 'Đã kết thúc', icon: <XCircle className="w-4 h-4" /> },
    { key: 'registered', label: 'Đã đăng ký', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <header className="mb-12 max-w-5xl">
        <h1 className={cn(
          'text-5xl font-bold tracking-tight mb-4',
          isDark ? 'text-white' : 'text-primary'
        )}>
          Các cuộc thi Hackathon
        </h1>
        <p className={cn(
          'text-xl max-w-2xl',
          isDark ? 'text-slate-400' : 'text-secondary'
        )}>
          Thử thách bản thân với những dự án thực tế, kết nối với cộng đồng lập trình viên và nhận giải thưởng hấp dẫn.
        </p>
      </header>

      {/* Bento Filter Section - Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={cn(
          'p-6 rounded-2xl flex items-center justify-between',
          isDark ? 'bg-slate-800' : 'bg-surface-container-low'
        )}>
          <div>
            <p className={cn(
              'text-sm font-bold mb-1',
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            )}>
              ĐANG DIỄN RA
            </p>
            <h3 className={cn(
              'text-2xl font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {activeHackathons.length} cuộc thi
            </h3>
          </div>
          <Zap className={cn('w-10 h-10 opacity-20', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
        </div>

        <div className={cn(
          'p-6 rounded-2xl flex items-center justify-between',
          isDark ? 'bg-slate-800' : 'bg-surface-container-low'
        )}>
          <div>
            <p className={cn(
              'text-sm font-bold mb-1',
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            )}>
              SẮP DIỄN RA
            </p>
            <h3 className={cn(
              'text-2xl font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {upcomingHackathons.length} cuộc thi
            </h3>
          </div>
          <Clock className={cn('w-10 h-10 opacity-20', isDark ? 'text-yellow-400' : 'text-yellow-600')} />
        </div>

        <div className={cn(
          'p-6 rounded-2xl flex items-center justify-between',
          isDark ? 'bg-slate-800' : 'bg-surface-container-low'
        )}>
          <div>
            <p className={cn(
              'text-sm font-bold mb-1',
              isDark ? 'text-purple-400' : 'text-purple-600'
            )}>
              ĐÃ ĐĂNG KÝ
            </p>
            <h3 className={cn(
              'text-2xl font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              {registeredHackathons.length} cuộc thi
            </h3>
          </div>
          <CheckCircle className={cn('w-10 h-10 opacity-20', isDark ? 'text-purple-400' : 'text-purple-600')} />
        </div>
      </div>

      {/* Tab Filters */}
      <div className={cn(
        'flex flex-wrap gap-2 p-2 rounded-2xl mb-8',
        isDark ? 'bg-slate-800' : 'bg-surface-container-low'
      )}>
        {tabButtons.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
              activeTab === key
                ? isDark
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-primary text-white shadow-md'
                : isDark
                  ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-primary'
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className={cn('w-10 h-10 animate-spin', isDark ? 'text-cyan-400' : 'text-primary')} />
        </div>
      ) : hackathons.length === 0 ? (
        <div className={cn(
          'flex flex-col items-center justify-center py-20 rounded-3xl text-center',
          isDark ? 'bg-slate-800 text-slate-400' : 'bg-surface-container-low text-slate-500'
        )}>
          <Trophy className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-semibold mb-1">Không có hackathon nào</p>
          <p className="text-sm">
            {activeTab === 'registered'
              ? 'Bạn chưa đăng ký cuộc thi nào.'
              : 'Hiện tại chưa có cuộc thi nào trong danh mục này.'}
          </p>
        </div>
      ) : (
        /* Hackathon Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {hackathons.map((hackathon) => {
            const status = getStatus(hackathon);
            const isRegistered = registeredIds.has(hackathon.id) || hackathon.isRegistered;
            const participantCount = hackathon._count?.participants || 0;

            return (
              <div
                key={hackathon.id}
                className={cn(
                  'rounded-2xl overflow-hidden flex flex-col group shadow-md transition-all duration-500',
                  isDark
                    ? 'bg-slate-800 hover:shadow-lg hover:shadow-blue-500/10'
                    : 'bg-surface-container-lowest hover:shadow-[0px_20px_40px_rgba(11,60,93,0.08)]'
                )}
              >
                {/* Image */}
                <div className="h-48 relative overflow-hidden">
                  <img
                    alt={hackathon.title}
                    src={hackathon.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {getStatusBadge(status, isDark)}
                    {isRegistered && (
                      <Badge className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold tracking-wide',
                        isDark ? 'bg-purple-900/50 text-purple-400 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-200'
                      )}>
                        <CheckCircle className="w-3 h-3 mr-1 inline" />
                        Đã đăng ký
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className={cn(
                    'text-xl font-bold mb-3 leading-tight',
                    isDark ? 'text-white' : 'text-primary'
                  )}>
                    {hackathon.title}
                  </h3>

                  <p className={cn(
                    'text-sm mb-4 line-clamp-2 flex-1',
                    isDark ? 'text-slate-400' : 'text-secondary'
                  )}>
                    {hackathon.description?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className={cn(
                      'flex items-center gap-3',
                      isDark ? 'text-slate-400' : 'text-secondary'
                    )}>
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-medium">
                        {status === 'upcoming' ? (
                          <span className="text-yellow-500">{getTimeUntil(hackathon.startTime)}</span>
                        ) : (
                          formatDate(hackathon.startTime)
                        )}
                      </span>
                    </div>
                    <div className={cn(
                      'flex items-center gap-3',
                      isDark ? 'text-slate-400' : 'text-secondary'
                    )}>
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-medium">
                        {participantCount.toLocaleString()} / {hackathon.maxParticipants || '∞'} người tham gia
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/user/hackathon/${hackathon.id}`)}
                    className={cn(
                      'mt-auto w-full py-3 rounded-xl font-bold transition-all duration-300 active:scale-95',
                      isRegistered
                        ? isDark
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                        : isDark
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                          : 'bg-tertiary-fixed-dim hover:bg-amber-500 text-on-tertiary-fixed'
                    )}
                  >
                    {isRegistered ? 'Xem chi tiết' : 'Tham gia ngay'}
                  </Button>
                </div>
              </div>
            );
          })}

          {/* CTA Card */}
          <div className={cn(
            'rounded-2xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden',
            isDark ? 'bg-blue-900/50 text-white' : 'bg-primary-container text-white'
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-50" />
            <div className="relative z-10">
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto',
                isDark ? 'bg-slate-800/50' : 'bg-white/10'
              )}>
                <Rocket className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-4 font-headline">
                Bạn có ý tưởng đột phá?
              </h3>
              <p className={cn(
                'mb-8 max-w-xs mx-auto',
                isDark ? 'text-slate-300' : 'text-on-primary-container'
              )}>
                Tổ chức cuộc thi riêng của bạn trên nền tảng CodeFit ngay hôm nay.
              </p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=codefitedu@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'px-8 py-3 rounded-xl font-bold transition-all duration-300 active:scale-95',
                  isDark
                    ? 'bg-white text-blue-900 hover:bg-slate-100'
                    : 'bg-white text-primary hover:bg-slate-100'
                )}
              >
                Liên hệ hợp tác
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanhSachHackathon;

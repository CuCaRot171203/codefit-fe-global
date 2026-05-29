'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import {
  Mail,
  Award,
  Edit,
  Star,
  BookOpen,
  Users,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { API_ENDPOINTS } from '@/config/api';

const LectureProfilePage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (userStr && userStr !== 'undefined') {
        const localUser = JSON.parse(userStr);
        setUserData(localUser);
      }
      
      if (token && token !== 'undefined' && token.length > 20) {
        try {
          const response = await fetch(API_ENDPOINTS.profile.get, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              const serverUser = data.data;
              localStorage.setItem('user', JSON.stringify(serverUser));
              setUserData(serverUser);
            }
          }
        } catch (e) {
          console.error('Failed to fetch from server:', e);
        }
      }
    } catch (e) {
      console.error('Failed to fetch user data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = userData?.fullName || userData?.username || 'Giảng viên';
  const initials = displayName.split(' ').map((n: string) => n[0] || '').join('').toUpperCase().slice(0, 2);
  
  const email = userData?.email;
  const bio = userData?.bio;
  const expertise = userData?.expertise;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <section
        className={cn(
          'rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center md:items-end justify-between gap-8',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}
      >
        <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-32 h-32 md:w-40 md:h-40">
              <AvatarImage src={userData?.avatar} alt={displayName} />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                {initials || 'GV'}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                'absolute -bottom-2 -right-2 p-2 rounded-xl border-4',
                isDark ? 'bg-cyan-500 border-slate-800' : 'bg-cyan-500 border-white'
              )}
            >
              <Star
                className={cn(
                  'w-5 h-5',
                  isDark ? 'text-slate-900' : 'text-white'
                )}
              />
            </div>
          </div>

          {/* Info */}
          <div className="text-center md:text-left">
            <h1
              className={cn(
                'text-4xl font-headline font-bold mb-2',
                isDark ? 'text-white' : 'text-primary'
              )}
            >
              {displayName}
            </h1>
            <p
              className={cn(
                'text-lg mb-4 italic',
                isDark ? 'text-slate-400' : 'text-secondary'
              )}
            >
              Giảng viên CodeFit
            </p>
            {email && (
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-secondary')}>
                <Mail className="w-4 h-4 inline mr-1" />
                {email}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={() => navigate('/lecture/profile/edit')}
          className={cn(
            'gap-2 self-center md:self-end',
            isDark
              ? 'bg-cyan-600 hover:bg-cyan-700'
              : 'bg-primary hover:bg-primary/90'
          )}
        >
          <Edit className="w-4 h-4" />
          Chỉnh sửa hồ sơ
        </Button>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Contact Info */}
          <div
            className={cn(
              'rounded-2xl p-6 space-y-6',
              isDark ? 'bg-slate-800' : 'bg-surface-container-low'
            )}
          >
            <h2
              className={cn(
                'text-xl font-headline font-semibold border-b pb-3',
                isDark ? 'text-white border-slate-700' : 'text-primary border-outline-variant/20'
              )}
            >
              Thông tin liên hệ
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    isDark ? 'bg-slate-700 text-cyan-400' : 'bg-surface-container-lowest text-primary'
                  )}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Email
                  </p>
                  <p className="text-sm font-semibold">{email || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {expertise && (
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isDark ? 'bg-slate-700 text-cyan-400' : 'bg-surface-container-lowest text-primary'
                    )}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      Chuyên môn
                    </p>
                    <p className="text-sm font-semibold">{expertise}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <div
              className={cn(
                'rounded-2xl p-6 shadow-sm',
                isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
              )}
            >
              <h2
                className={cn(
                  'text-xl font-headline font-semibold mb-4',
                  isDark ? 'text-white' : 'text-primary'
                )}
              >
                Giới thiệu
              </h2>
              <p className={cn(
                'text-sm leading-relaxed',
                isDark ? 'text-slate-300' : 'text-secondary'
              )}>
                {bio}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              className={cn(
                'p-5 rounded-2xl shadow-sm border-l-4',
                isDark ? 'bg-slate-800 border-l-cyan-500' : 'bg-surface-container-lowest border-l-primary'
              )}
            >
              <p className="text-slate-500 text-xs font-bold mb-1">KHÓA HỌC</p>
              <p
                className={cn(
                  'text-2xl font-headline font-bold',
                  isDark ? 'text-white' : 'text-primary'
                )}
              >
                {userData?.courseCount || 0}
              </p>
            </div>

            <div
              className={cn(
                'p-5 rounded-2xl shadow-sm border-l-4',
                isDark ? 'bg-slate-800 border-l-cyan-500' : 'bg-surface-container-lowest border-l-primary'
              )}
            >
              <p className="text-slate-500 text-xs font-bold mb-1">BÀI GIẢNG</p>
              <p
                className={cn(
                  'text-2xl font-headline font-bold',
                  isDark ? 'text-white' : 'text-primary'
                )}
              >
                {userData?.lessonCount || 0}
              </p>
            </div>

            <div
              className={cn(
                'p-5 rounded-2xl shadow-sm border-l-4',
                isDark ? 'bg-slate-800 border-l-amber-500' : 'bg-surface-container-lowest border-l-tertiary-fixed-dim'
              )}
            >
              <p className="text-slate-500 text-xs font-bold mb-1">HỌC VIÊN</p>
              <p
                className={cn(
                  'text-2xl font-headline font-bold',
                  isDark ? 'text-white' : 'text-primary'
                )}
              >
                {userData?.studentCount || 0}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className={cn(
              'rounded-2xl p-8 shadow-sm',
              isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
            )}
          >
            <h2
              className={cn(
                'text-xl font-headline font-semibold mb-6',
                isDark ? 'text-white' : 'text-primary'
              )}
            >
              Thao tác nhanh
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className={cn(
                  'h-auto py-4 justify-start gap-3',
                  isDark ? 'border-slate-600 hover:bg-slate-700' : ''
                )}
                onClick={() => navigate('/lecture/my-courses')}
              >
                <BookOpen className="w-5 h-5 text-cyan-500" />
                <span>Quản lý khóa học</span>
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'h-auto py-4 justify-start gap-3',
                  isDark ? 'border-slate-600 hover:bg-slate-700' : ''
                )}
                onClick={() => navigate('/lecture/lesson-requests')}
              >
                <FileText className="w-5 h-5 text-cyan-500" />
                <span>Bài được giao</span>
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'h-auto py-4 justify-start gap-3',
                  isDark ? 'border-slate-600 hover:bg-slate-700' : ''
                )}
                onClick={() => navigate('/lecture/submissions')}
              >
                <Users className="w-5 h-5 text-cyan-500" />
                <span>Bài nộp của học viên</span>
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'h-auto py-4 justify-start gap-3',
                  isDark ? 'border-slate-600 hover:bg-slate-700' : ''
                )}
                onClick={() => navigate('/lecture/notifications')}
              >
                <Mail className="w-5 h-5 text-cyan-500" />
                <span>Thông báo</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureProfilePage;

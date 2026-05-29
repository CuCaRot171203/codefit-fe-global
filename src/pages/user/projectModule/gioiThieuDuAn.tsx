'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from '@/components/ui/button';
import {
  Download,
  Send,
  FileArchive,
  BookOpen,
  ChevronRight,
  Loader2,
  Trophy,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  fileUrl?: string;
  course?: { id: string; title: string };
}

const GioiThieuDuAn = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.projects.detail(projectId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) setProject(data.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-amber-400' : 'text-amber-600')} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
        <div className="text-center max-w-sm px-6">
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6',
            isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
          )}>
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className={cn(
            'text-xl font-bold mb-2',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Chưa có dự án cuối khóa
          </h2>
          <p className={cn(
            'text-sm leading-relaxed mb-6',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>
            Final Project chưa được cập nhật cho khóa học này. Vui lòng quay lại sau hoặc liên hệ giảng viên.
          </p>
          <button
            onClick={() => navigate(-1)}
            className={cn(
              'px-6 py-2.5 rounded-xl font-semibold text-sm transition-all',
              isDark
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm'
            )}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
      {/* Top Nav Bar */}
      <div
        className={cn(
          'sticky top-0 z-10 border-b backdrop-blur-md',
          isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'
        )}
      >
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                isDark ? 'bg-amber-500/20' : 'bg-amber-50'
              )}
            >
              <Trophy className={cn('w-4 h-4', isDark ? 'text-amber-400' : 'text-amber-600')} />
            </div>
            <span className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {project?.course?.title || 'Khóa học'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium',
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700'
            )}>
              Dự án cuối khóa
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - 8/4 Split */}
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ===================== 8 PART - Main Content ===================== */}
          <div className="lg:col-span-8 space-y-8">

            {/* Hero Header */}
            <div className={cn(
              'rounded-2xl p-8',
              isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
            )}>
              <div className="flex items-start gap-5">
                {/* Thumbnail */}
                <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={isDark ? { backgroundColor: '#0f172a' } : { backgroundColor: '#f8fafc' }}>
                  {project?.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <Trophy className={cn('w-10 h-10', isDark ? 'text-amber-400' : 'text-amber-500')} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      'text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full',
                      isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700'
                    )}>
                      Final Project
                    </span>
                  </div>
                  <h1 className={cn(
                    'text-2xl lg:text-3xl font-bold leading-snug',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    {project?.title || 'Dự án cuối khóa'}
                  </h1>
                  {project?.course?.title && (
                    <p className={cn(
                      'text-sm mt-1.5',
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    )}>
                      {project.course.title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Nội dung dự án */}
            <div className={cn(
              'rounded-2xl overflow-hidden',
              isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
            )}>
              <div className={cn(
                'px-6 py-4 border-b flex items-center gap-3',
                isDark ? 'border-slate-800' : 'border-slate-100'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  isDark ? 'bg-cyan-500/20' : 'bg-cyan-50'
                )}>
                  <BookOpen className={cn('w-4 h-4', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
                </div>
                <h2 className={cn(
                  'text-base font-semibold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  Nội dung dự án
                </h2>
              </div>
              <div className="px-6 py-5">
                <div
                  className={cn(
                    'prose prose-sm max-w-none',
                    isDark ? 'prose-invert' : ''
                  )}
                  style={{ color: isDark ? '#cbd5e1' : '#334155' }}
                  dangerouslySetInnerHTML={{
                    __html: project?.description
                      || '<p class="text-slate-400 italic text-sm">Chưa có nội dung dự án.</p>'
                  }}
                />
              </div>
            </div>

            {/* Checklist yêu cầu */}
            <div className={cn(
              'rounded-2xl p-6',
              isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
            )}>
              <div className="flex items-center gap-3 mb-5">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'
                )}>
                  <CheckCircle2 className={cn('w-4 h-4', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
                </div>
                <h2 className={cn(
                  'text-base font-semibold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  Checklist hoàn thành
                </h2>
              </div>
              <div className="space-y-2">
                {[
                  'Hoàn thành mã nguồn theo đúng yêu cầu',
                  'Viết README và tài liệu kỹ thuật',
                  'Nén và đóng gói project (zip/rar)',
                  'Nộp qua hệ thống trước deadline',
                ].map((item, i) => (
                  <div key={i} className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm',
                    isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'
                  )}>
                    <div className={cn(
                      'w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center',
                      isDark ? 'border-slate-700' : 'border-slate-300'
                    )}>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ===================== 4 PART - Sidebar ===================== */}
          <div className="lg:col-span-4 space-y-5">

            {/* Nút nộp bài */}
            <div className={cn(
              'rounded-2xl overflow-hidden',
              isDark ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200'
            )}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={cn('w-4 h-4', isDark ? 'text-amber-400' : 'text-amber-600')} />
                  <span className={cn(
                    'text-xs font-semibold uppercase tracking-wider',
                    isDark ? 'text-amber-400' : 'text-amber-700'
                  )}>
                    Hành động
                  </span>
                </div>
                <h3 className={cn(
                  'text-xl font-bold mb-3',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  Sẵn sàng nộp bài?
                </h3>
                <p className={cn(
                  'text-sm leading-relaxed mb-5',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}>
                  Nén mã nguồn dự án thành file <code className={cn(
                    'px-1 py-0.5 rounded text-xs font-mono',
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'
                  )}>.zip</code> hoặc <code className={cn(
                    'px-1 py-0.5 rounded text-xs font-mono',
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'
                  )}>.rar</code> rồi nộp lên hệ thống.
                </p>
                <Button
                  onClick={() => navigate(`/user/project/${projectId}/submit`)}
                  className={cn(
                    'w-full gap-2 font-semibold shadow-lg',
                    isDark
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  )}
                >
                  <Send className="w-4 h-4" />
                  Nộp dự án
                </Button>
              </div>
            </div>

            {/* Tải tài liệu */}
            {project?.fileUrl && (
              <div className={cn(
                'rounded-2xl p-5',
                isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <FileArchive className={cn('w-4 h-4', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
                  <h3 className={cn(
                    'text-sm font-semibold',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    Tài liệu đính kèm
                  </h3>
                </div>
                <a
                  href={project.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl group transition-all',
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-cyan-300'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    isDark ? 'bg-cyan-500/20' : 'bg-cyan-50'
                  )}>
                    <FileArchive className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    )}>
                      File đính kèm
                    </p>
                    <p className={cn(
                      'text-xs',
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    )}>
                      Nhấn để tải về
                    </p>
                  </div>
                  <Download className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isDark ? 'text-slate-500 group-hover:text-cyan-400' : 'text-slate-400 group-hover:text-cyan-600'
                  )} />
                </a>
              </div>
            )}

            {/* Thông tin khóa học */}
            {project?.course && (
              <div className={cn(
                'rounded-2xl p-5',
                isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className={cn('w-4 h-4', isDark ? 'text-violet-400' : 'text-violet-600')} />
                  <h3 className={cn(
                    'text-sm font-semibold',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    Thông tin
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-500')}>
                      Khóa học
                    </span>
                    <span className={cn(
                      'text-xs font-medium',
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    )}>
                      {project.course.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-500')}>
                      Loại
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700'
                    )}>
                      Final Project
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-500')}>
                      Trạng thái
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                    )}>
                      Sẵn sàng
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mẹo */}
            <div className={cn(
              'rounded-2xl p-5 border',
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'
                )}>
                  💡
                </div>
                <h3 className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  Mẹo hoàn thành
                </h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Đọc kỹ đề bài trước khi code',
                  'Commit thường xuyên để dễ quản lý',
                  'Viết test case đơn giản để tự kiểm tra',
                  'Nộp sớm, không chờ deadline',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className={cn(
                      'w-3 h-3 mt-0.5 flex-shrink-0',
                      isDark ? 'text-amber-400' : 'text-amber-600'
                    )} />
                    <span className={cn(
                      'text-xs leading-relaxed',
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GioiThieuDuAn;

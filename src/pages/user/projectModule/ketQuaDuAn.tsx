'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import { API_ENDPOINTS } from '@/config/api';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Star,
  Loader2,
  Award,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Submission {
  id: string;
  projectId: string;
  fileUrl: string;
  status: string;
  submittedAt: string;
  reviewNote?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  courseId: string;
  course?: { id: string; title: string };
  submissions?: Submission[];
}

const KetQuaDuAn = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch project details
      const projectRes = await fetch(`${API_ENDPOINTS.projects.detail(projectId!)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectData = await projectRes.json();
      if (projectData.success) {
        setProject(projectData.data);

        // Find current user's submission
        const userId = JSON.parse(atob(token.split('.')[1]))?.userId;
        const submissions = projectData.data.submissions || [];
        const mySub = submissions.find((s: any) => s.user?.id === userId);
        if (mySub) {
          setMySubmission(mySub);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCertificate = () => {
    navigate('/user/certificates');
  };

  const handleBackToCourse = () => {
    if (project?.courseId) {
      navigate(`/user/courses/${project.courseId}/content`);
    } else {
      navigate('/user/courses');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-amber-400' : 'text-amber-600')} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <h1
          className={cn(
            'text-4xl font-headline font-bold tracking-tight mb-2',
            isDark ? 'text-white' : 'text-primary'
          )}
        >
          Kết quả nộp dự án
        </h1>
        <p
          className={cn(
            isDark ? 'text-slate-400' : 'text-on-surface-variant'
          )}
        >
          Dưới đây là thông tin về lần nộp dự án CodeFit gần nhất của bạn.
        </p>
      </div>

      {/* Success Banner */}
      {mySubmission ? (
        <div
          className={cn(
            'p-8 rounded-2xl mb-8 text-center',
            mySubmission.status === 'approved'
              ? isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'
              : mySubmission.status === 'rejected'
              ? isDark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'
              : isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          )}
        >
          {mySubmission.status === 'approved' ? (
            <CheckCircle className={cn('w-16 h-16 mx-auto mb-4', isDark ? 'text-green-400' : 'text-green-500')} />
          ) : mySubmission.status === 'rejected' ? (
            <XCircle className={cn('w-16 h-16 mx-auto mb-4', isDark ? 'text-red-400' : 'text-red-500')} />
          ) : (
            <Loader2 className={cn('w-16 h-16 mx-auto mb-4 animate-spin', isDark ? 'text-blue-400' : 'text-blue-500')} />
          )}
          <h2 className={cn('text-2xl font-bold mb-2',
            mySubmission.status === 'approved'
              ? isDark ? 'text-green-400' : 'text-green-700'
              : mySubmission.status === 'rejected'
              ? isDark ? 'text-red-400' : 'text-red-700'
              : isDark ? 'text-blue-400' : 'text-blue-700'
          )}>
            {mySubmission.status === 'approved' ? 'Dự án đạt yêu cầu!' : mySubmission.status === 'rejected' ? 'Dự án cần chỉnh sửa' : 'Đã nộp dự án thành công!'}
          </h2>
          <p className={cn('text-lg', isDark ? 'text-slate-300' : 'text-slate-600')}>
            {mySubmission.status === 'approved' ? 'Chúc mừng bạn đã hoàn thành khóa học!' : mySubmission.status === 'rejected' ? 'Vui lòng xem phản hồi và nộp lại.' : 'Dự án của bạn đang chờ mentor chấm điểm.'}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            'p-8 rounded-2xl mb-8 text-center',
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'
          )}
        >
          <FileText className={cn('w-16 h-16 mx-auto mb-4 opacity-50', isDark ? 'text-slate-400' : 'text-slate-400')} />
          <h2 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-700')}>
            Bạn chưa nộp dự án
          </h2>
          <p className={cn('text-lg', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Hãy hoàn thành và nộp dự án cuối khóa để nhận chứng chỉ.
          </p>
          <Button
            onClick={() => navigate(`/user/project/${projectId}/submit`)}
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
          >
            Nộp dự án ngay
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Certificate Card */}
        <div
          className={cn(
            'p-8 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02]',
            isDark ? 'bg-slate-800 border-slate-700 hover:border-amber-500' : 'bg-surface-container-low border-outline-variant hover:border-amber-500'
          )}
          onClick={handleGetCertificate}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center',
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
            )}>
              <Award className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className={cn('text-xl font-bold mb-1', isDark ? 'text-white' : 'text-primary')}>
                Nhận chứng chỉ
              </h3>
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Xem và tải chứng chỉ hoàn thành khóa học của bạn
              </p>
            </div>
            <ArrowRight className={cn('w-6 h-6', isDark ? 'text-slate-500' : 'text-slate-400')} />
          </div>
        </div>

        {/* Back to Course Card */}
        <div
          className={cn(
            'p-8 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02]',
            isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-surface-container-low border-outline-variant hover:border-blue-500'
          )}
          onClick={handleBackToCourse}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center',
              isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            )}>
              <ArrowRight className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className={cn('text-xl font-bold mb-1', isDark ? 'text-white' : 'text-primary')}>
                Quay lại khóa học
              </h3>
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Xem lại nội dung và tiến độ học tập
              </p>
            </div>
            <ArrowRight className={cn('w-6 h-6', isDark ? 'text-slate-500' : 'text-slate-400')} />
          </div>
        </div>
      </div>

      {/* Submission Info */}
      <div
        className={cn(
          'p-8 rounded-2xl',
          isDark ? 'bg-slate-800' : 'bg-surface-container-low'
        )}
      >
        <h3 className={cn('text-xl font-bold mb-6', isDark ? 'text-white' : 'text-primary')}>
          Thông tin nộp bài
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className={cn('text-sm mb-1', isDark ? 'text-slate-500' : 'text-slate-500')}>
              Dự án
            </p>
            <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              {project?.title || 'Final Project'}
            </p>
          </div>
          
          <div>
            <p className={cn('text-sm mb-1', isDark ? 'text-slate-500' : 'text-slate-500')}>
              Thời gian nộp
            </p>
            <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              {mySubmission?.submittedAt ? new Date(mySubmission.submittedAt).toLocaleString('vi-VN') : 'Chưa nộp'}
            </p>
          </div>
          
          <div>
            <p className={cn('text-sm mb-1', isDark ? 'text-slate-500' : 'text-slate-500')}>
              Trạng thái
            </p>
            {mySubmission ? (
              <span className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                mySubmission.status === 'approved'
                  ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                  : mySubmission.status === 'rejected'
                  ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                  : isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
              )}>
                {mySubmission.status === 'approved' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : mySubmission.status === 'rejected' ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {mySubmission.status === 'approved' ? 'Đạt' : mySubmission.status === 'rejected' ? 'Từ chối' : 'Đang chờ chấm điểm'}
              </span>
            ) : (
              <span className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
              )}>
                Chưa nộp
              </span>
            )}
          </div>

          <div>
            <p className={cn('text-sm mb-1', isDark ? 'text-slate-500' : 'text-slate-500')}>
              Phản hồi
            </p>
            <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {mySubmission?.reviewNote || 'Sẽ có trong vòng 48 giờ làm việc'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 flex justify-center opacity-30">
        <div className="flex items-center gap-2">
          <Star
            className={cn(
              'w-8 h-8',
              isDark ? 'text-amber-400' : ''
            )}
          />
          <span
            className={cn(
              'font-headline text-2xl font-bold tracking-tighter',
              isDark ? 'text-white' : ''
            )}
          >
            CodeFit
          </span>
        </div>
      </div>
    </div>
  );
};

export default KetQuaDuAn;

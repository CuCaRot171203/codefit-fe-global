'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from '@/components/ui/button';
import {
  UploadCloud,
  Trash2,
  Send,
  ShieldCheck,
  Clock,
  MessageSquare,
  Loader2,
  FileArchive,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { notification } from 'antd';

const NopDuAn = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [isChecked, setIsChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<{ title: string; description: string; fileUrl?: string } | null>(null);

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
      if (data.success) {
        setProject({
          title: data.data.title,
          description: data.data.description,
          fileUrl: data.data.fileUrl,
        });
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        notification.error({ message: 'Lỗi', description: 'File quá lớn. Vui lòng chọn file nhỏ hơn 50MB.' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 50 * 1024 * 1024) {
        notification.error({ message: 'Lỗi', description: 'File quá lớn. Vui lòng chọn file nhỏ hơn 50MB.' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !isChecked || !projectId) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'project');

      const uploadResponse = await fetch(`${API_ENDPOINTS.upload.single}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadData.success) throw new Error(uploadData.message || 'Upload failed');

      const fileUrl = uploadData.url || uploadData.data?.url;

      const submitResponse = await fetch(API_ENDPOINTS.projects.submit, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId, fileUrl, fileName: selectedFile.name }),
      });
      const submitData = await submitResponse.json();

      if (submitData.success) {
        const certificate = submitData.data?.certificate;

        if (certificate?.id) {
          notification.success({
            message: 'Thành công!',
            description: 'Đã nộp dự án. Chứng chỉ đã được phát hành!',
            duration: 4,
          });
          setTimeout(() => {
            navigate(`/user/certificate/${certificate.id}`);
          }, 1500);
        } else {
          notification.warning({
            message: 'Đã nộp dự án!',
            description: 'Chứng chỉ sẽ được phát hành sau khi hoàn thành tất cả các phần của khóa học.',
            duration: 5,
          });
          setTimeout(() => {
            navigate(`/user/certificates`);
          }, 2000);
        }
      } else {
        throw new Error(submitData.message || 'Submit failed');
      }
    } catch (error: any) {
      notification.error({ message: 'Lỗi', description: error.message || 'Không thể nộp dự án. Vui lòng thử lại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-amber-400' : 'text-amber-600')} />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-slate-950' : 'bg-slate-50')}>

      {/* Top Nav */}
      <div className={cn(
        'sticky top-0 z-10 border-b backdrop-blur-md',
        isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'
      )}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(`/user/project/${projectId}`)}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors',
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <span className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium',
            isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700'
          )}>
            Nộp Final Project
          </span>
        </div>
      </div>

      {/* Main Content - 8/4 Layout */}
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ===================== 8 PART - Upload Form ===================== */}
          <div className="lg:col-span-8 space-y-5">

            {/* Page Title Card */}
            <div className={cn(
              'rounded-2xl p-6',
              isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
            )}>
              <h1 className={cn(
                'text-xl font-bold',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                Nộp bài: {project?.title || 'Dự án cuối khóa'}
              </h1>
              <p className={cn(
                'text-sm mt-1.5 leading-relaxed',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}>
                Nén mã nguồn thành file <code className={cn(
                  'px-1 py-0.5 rounded text-xs font-mono',
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                )}>.zip</code> hoặc <code className={cn(
                  'px-1 py-0.5 rounded text-xs font-mono',
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                )}>.rar</code> rồi tải lên hệ thống.
              </p>
            </div>

            {/* Drop Zone */}
            <div className={cn(
              'rounded-2xl p-5',
              isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
            )}>
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200',
                  isDragOver
                    ? isDark ? 'border-amber-400 bg-amber-500/10' : 'border-amber-500 bg-amber-50'
                    : isDark
                    ? 'border-slate-700 bg-slate-800/50 hover:border-amber-500/40'
                    : 'border-slate-300 hover:border-amber-400 bg-slate-50'
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                  isDark ? 'bg-amber-500/20' : 'bg-amber-50'
                )}>
                  <UploadCloud className={cn('w-6 h-6', isDark ? 'text-amber-400' : 'text-amber-600')} />
                </div>
                <p className={cn(
                  'text-sm font-semibold mb-1',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  Kéo & thả file vào đây
                </p>
                <p className={cn(
                  'text-xs mb-4',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}>
                  Hỗ trợ .zip, .rar — tối đa 50MB
                </p>
                <button
                  className={cn(
                    'px-4 py-2 text-xs font-semibold rounded-lg transition-colors',
                    isDark
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  )}
                >
                  Chọn file
                </button>
                <input
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  type="file"
                  accept=".zip,.rar,.tar,.gz"
                  onChange={handleFileChange}
                />
              </div>

              {/* Selected File */}
              {selectedFile && (
                <div className={cn(
                  'mt-4 flex items-center justify-between p-4 rounded-xl border',
                  isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-emerald-50 border-emerald-200'
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                    )}>
                      <FileArchive className={cn('w-4 h-4', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}>
                        {selectedFile.name}
                      </p>
                      <p className={cn(
                        'text-xs',
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      )}>
                        {formatFileSize(selectedFile.size)} · Sẵn sàng nộp
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Terms + Submit */}
            <div className={cn(
              'rounded-2xl p-5',
              isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
            )}>
              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <div className="mt-0.5">
                  <input
                    className={cn(
                      'w-4 h-4 rounded border transition-all cursor-pointer',
                      isDark
                        ? 'border-slate-600 text-amber-500 focus:ring-amber-400'
                        : 'border-slate-300 text-amber-600 focus:ring-amber-500'
                    )}
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                  />
                </div>
                <span className={cn(
                  'text-xs leading-relaxed',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}>
                  Tôi xác nhận đây là sản phẩm cá nhân và không vi phạm quy định của khóa học.
                </span>
              </label>

              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || !isChecked || isSubmitting}
                className={cn(
                  'w-full gap-2 font-semibold shadow-lg',
                  selectedFile && isChecked && !isSubmitting
                    ? isDark
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang nộp...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Nộp dự án
                  </>
                )}
              </Button>
            </div>

          </div>

          {/* ===================== 4 PART - Sidebar Info ===================== */}
          <div className="lg:col-span-4 space-y-4">

            {/* Checklist */}
            <div className={cn(
              'rounded-2xl p-5',
              isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
            )}>
              <h3 className={cn(
                'text-sm font-semibold mb-3',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                Checklist trước khi nộp
              </h3>
              <div className="space-y-2">
                {[
                  'Mã nguồn đầy đủ, chạy được',
                  'File nén .zip hoặc .rar',
                  'Có README mô tả cách chạy',
                  'Kích thước dưới 50MB',
                ].map((item, i) => (
                  <div key={i} className={cn(
                    'flex items-center gap-2.5 text-xs',
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    <CheckCircle2 className={cn('w-3.5 h-3.5 flex-shrink-0', isDark ? 'text-emerald-400' : 'text-emerald-500')} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              {[
                {
                  icon: ShieldCheck,
                  label: 'Bảo mật',
                  desc: 'Mã nguồn được mã hóa trong quá trình chấm điểm.',
                  color: 'cyan',
                },
                {
                  icon: Clock,
                  label: 'Thời gian',
                  desc: 'Hệ thống ghi nhận thời điểm nộp cuối cùng.',
                  color: 'violet',
                },
                {
                  icon: MessageSquare,
                  label: 'Phản hồi',
                  desc: 'Kết quả đánh giá trong 48 giờ làm việc.',
                  color: 'amber',
                },
              ].map((item, i) => (
                <div key={i} className={cn(
                  'rounded-xl p-4 flex items-start gap-3',
                  isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
                )}>
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    item.color === 'cyan' ? (isDark ? 'bg-cyan-500/20' : 'bg-cyan-50') :
                    item.color === 'violet' ? (isDark ? 'bg-violet-500/20' : 'bg-violet-50') :
                    (isDark ? 'bg-amber-500/20' : 'bg-amber-50')
                  )}>
                    <item.icon className={cn(
                      'w-4 h-4',
                      item.color === 'cyan' ? (isDark ? 'text-cyan-400' : 'text-cyan-600') :
                      item.color === 'violet' ? (isDark ? 'text-violet-400' : 'text-violet-600') :
                      (isDark ? 'text-amber-400' : 'text-amber-600')
                    )} />
                  </div>
                  <div>
                    <p className={cn(
                      'text-xs font-semibold mb-0.5',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {item.label}
                    </p>
                    <p className={cn(
                      'text-xs leading-relaxed',
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    )}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tài liệu đính kèm */}
            {project?.fileUrl && (
              <a
                href={project.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'block rounded-xl p-4 border transition-all',
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
                    : 'bg-white border-slate-200 shadow-sm hover:border-amber-400'
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <FileArchive className={cn('w-3.5 h-3.5', isDark ? 'text-amber-400' : 'text-amber-600')} />
                  <span className={cn(
                    'text-xs font-semibold',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    Tài liệu đề bài
                  </span>
                </div>
                <p className={cn(
                  'text-xs',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}>
                  Tải về để xem yêu cầu chi tiết →
                </p>
              </a>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default NopDuAn;

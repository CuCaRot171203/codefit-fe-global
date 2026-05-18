import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/components/editor';
import {
  ArrowLeft,
  Save,
  Edit,
  Loader2,
  FolderOpen,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Code,
  Upload,
  X,
  Image as ImageIcon,
  FileArchive,
} from 'lucide-react';
import { message, Upload as AntUpload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';

interface ProjectSubmission {
  id: string;
  userId: string;
  user?: { fullName: string; email: string };
  fileUrl: string;
  status: string;
  submittedAt: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  fileUrl?: string;
  submissions: ProjectSubmission[];
}

export default function FinalProjectSettingsPage() {
  const { id: courseId, projectId } = useParams<{ id: string; projectId: string }>();
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [archiveFileList, setArchiveFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.project(projectId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        const p = data.data;
        setProject(p);
        setTitle(p.title);
        setDescription(p.description || '');
        setImageUrl(p.imageUrl || '');
        setFileUrl(p.fileUrl || '');
        if (p.imageUrl) {
          setImageFileList([{ uid: '-1', name: 'image', status: 'done', url: p.imageUrl, thumbUrl: p.imageUrl }]);
        }
        if (p.fileUrl) {
          setArchiveFileList([{ uid: '-2', name: p.fileUrl.split('/').pop() || 'file', status: 'done', url: p.fileUrl, thumbUrl: p.fileUrl }]);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      message.error('Không thể tải thông tin Final Project');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.project(projectId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          fileUrl,
        }),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã lưu Final Project');
        navigate(`/admin/courses/${courseId}/edit`);
      } else {
        message.error(data.message || 'Lưu thất bại');
      }
    } catch (error) {
      console.error('Error saving:', error);
      message.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload: UploadProps['onChange'] = async ({ fileList }) => {
    setImageFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj as Blob);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.upload.single, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          setImageUrl(data.data.url);
          message.success('Upload ảnh thành công');
        }
      } catch (error) {
        console.error('Upload error:', error);
        message.error('Upload thất bại');
      }
    } else {
      setImageUrl('');
    }
  };

  const handleArchiveUpload: UploadProps['onChange'] = async ({ fileList }) => {
    setArchiveFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj as Blob);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.upload.single, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          setFileUrl(data.data.url);
          message.success('Upload file thành công');
        }
      } catch (error) {
        console.error('Upload error:', error);
        message.error('Upload thất bại');
      }
    } else {
      setFileUrl('');
    }
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const token = localStorage.getItem('token');
        const response = await fetch(`${API_ENDPOINTS.admin.project(submissionId)}/approve`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã duyệt bài nộp');
        fetchProject();
      }
    } catch (error) {
      console.error('Error approving:', error);
      message.error('Duyệt thất bại');
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    const reason = prompt('Lý do từ chối (tùy chọn):');
    try {
      const token = localStorage.getItem('token');
        const response = await fetch(`${API_ENDPOINTS.admin.project(submissionId)}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã từ chối bài nộp');
        fetchProject();
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      message.error('Từ chối thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", isDark ? "bg-slate-950" : "bg-slate-50")}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-10 border-b",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/courses/${courseId}/edit`)}
                className={isDark ? "text-slate-300 hover:text-white" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay về
              </Button>
              <div>
                <h1 className={cn("text-xl font-bold flex items-center gap-2", isDark ? "text-white" : "")}>
                  <FolderOpen className="w-5 h-5 text-cyan-500" />
                  Chỉnh sửa Final Project
                </h1>
                <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
                  {title || 'Đang tải...'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info - 8/4 Layout */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <Edit className="w-4 h-4" />
              Thông tin Final Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-6">
              {/* Left - 8 columns */}
              <div className="col-span-12 lg:col-span-8">
                <div className={cn(
                  "rounded-lg border p-4 space-y-4",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                )}>
                  <div>
                    <Label className={isDark ? "text-slate-300" : ""}>Tiêu đề</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={cn("mt-1", isDark && "bg-slate-800 border-slate-700 text-white")}
                      placeholder="VD: Final Project - Website Portfolio"
                    />
                  </div>
                  <div>
                    <Label className={isDark ? "text-slate-300" : ""}>Mô tả / Yêu cầu</Label>
                    <Tabs defaultValue="edit" className="mt-1">
                      <TabsList className={cn(isDark ? "bg-slate-900" : "bg-white")}>
                        <TabsTrigger value="edit" className={cn(isDark ? "data-[state=active]:bg-slate-700" : "")}>
                          <Edit className="w-4 h-4 mr-1" />
                          Viết nội dung
                        </TabsTrigger>
                        <TabsTrigger value="preview" className={cn(isDark ? "data-[state=active]:bg-slate-700" : "")}>
                          <Eye className="w-4 h-4 mr-1" />
                          Xem trước
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit" className="mt-2">
                        <RichTextEditor
                          value={description}
                          onChange={setDescription}
                          placeholder={`Viết nội dung yêu cầu project ở đây...

Ví dụ:
1. Tạo website portfolio cá nhân với React
2. Website cần responsive trên mọi thiết bị
3. Có animation mượt mà khi scroll trang
4. Sử dụng API để lấy dữ liệu

Tiêu chí chấm điểm:
- Code sạch, có comment (20%)
- Giao diện đẹp, UX tốt (30%)
- Tính năng hoạt động đầy đủ (50%)`}
                          className={isDark ? "border-slate-700" : ""}
                        />
                      </TabsContent>
                      <TabsContent value="preview" className="mt-2">
                        <div
                          className={cn(
                            "min-h-[300px] p-6 rounded-lg border",
                            isDark ? "bg-slate-900 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"
                          )}
                        >
                          {description ? (
                            <div
                              className="prose prose-sm max-w-none"
                              style={{ whiteSpace: 'pre-wrap' }}
                              dangerouslySetInnerHTML={{ __html: description }}
                            />
                          ) : (
                            <p className={cn("italic", isDark ? "text-slate-500" : "text-slate-400")}>
                              Chưa có nội dung
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Right - 4 columns */}
              <div className="col-span-12 lg:col-span-4">
                <div className={cn(
                  "rounded-lg border p-4 space-y-4",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
                )}>
                  {/* Image Upload */}
                  <div>
                    <Label className={isDark ? "text-slate-300" : ""}>Ảnh minh họa</Label>
                    <div className={cn(
                      "mt-2 border border-dashed rounded-lg p-4 text-center",
                      isDark ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"
                    )}>
                      <AntUpload
                        listType="picture-card"
                        fileList={imageFileList}
                        onChange={handleImageUpload}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                        className={isDark ? "ant-upload-dark" : ""}
                        onPreview={(file) => {
                          if (imageUrl) {
                            window.open(imageUrl, '_blank');
                          }
                        }}
                      >
                        {imageFileList.length < 1 && (
                          <div className="flex flex-col items-center">
                            <ImageIcon className={cn("w-8 h-8 mb-2", isDark ? "text-slate-400" : "text-slate-500")} />
                            <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                              Upload Ảnh
                            </span>
                          </div>
                        )}
                      </AntUpload>
                      {imageUrl && (
                        <div className="mt-2">
                          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className={cn(
                            "text-sm underline",
                            isDark ? "text-cyan-400" : "text-cyan-600"
                          )}>
                            Xem ảnh hiện tại
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Archive Upload */}
                  <div>
                    <Label className={isDark ? "text-slate-300" : ""}>File đính kèm (zip/rar, tối đa 25MB)</Label>
                    <div className={cn(
                      "mt-2 border border-dashed rounded-lg p-4",
                      isDark ? "border-slate-600 bg-slate-900" : "border-slate-300 bg-white"
                    )}>
                      <AntUpload
                        fileList={archiveFileList}
                        onChange={handleArchiveUpload}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept=".zip,.rar,.7z"
                        showUploadList={{ showRemoveIcon: true, showDownloadIcon: true }}
                        className={isDark ? "ant-upload-dark" : ""}
                      >
                        <Button variant="outline" size="sm" className={cn(
                          "w-full",
                          isDark && "border-slate-600 text-slate-300 hover:bg-slate-700"
                        )}>
                          <FileArchive className="w-4 h-4 mr-2" />
                          Upload File
                        </Button>
                      </AntUpload>
                      {fileUrl && (
                        <div className="mt-2 text-center">
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={cn(
                            "text-sm underline",
                            isDark ? "text-cyan-400" : "text-cyan-600"
                          )}>
                            Tải file hiện tại
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <FileText className="w-4 h-4 text-cyan-500" />
              Bài nộp ({project?.submissions?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project?.submissions && project.submissions.length > 0 ? (
              <div className="space-y-4">
                {project.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                        )}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={cn("font-medium", isDark ? "text-white" : "")}>
                            {submission.user?.fullName || 'Người dùng'}
                          </h4>
                          <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                            {submission.user?.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className={cn("w-3 h-3", isDark ? "text-slate-500" : "text-slate-400")} />
                            <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                              {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs px-3 py-1 rounded-full",
                          submission.status === 'approved'
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : submission.status === 'rejected'
                            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                        )}>
                          {submission.status === 'approved' ? 'Đạt' : submission.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-1 px-3 py-1 rounded text-sm",
                            isDark ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
                          )}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                        {submission.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveSubmission(submission.id)}
                              className="text-green-600 border-green-300 hover:bg-green-50 dark:border-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectSubmission(submission.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                "text-center py-12 rounded-lg",
                isDark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"
              )}>
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có bài nộp nào</p>
                <p className="text-sm mt-1">Học viên sẽ nộp bài sau khi hoàn thành khóa học</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

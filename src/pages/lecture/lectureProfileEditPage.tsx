'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, ArrowLeft, Save, Upload } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { notification } from 'antd';

const LectureProfileEditPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
    expertise: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userStr && userStr !== 'undefined') {
        const localUser = JSON.parse(userStr);
        setFormData({
          fullName: localUser.fullName || '',
          email: localUser.email || '',
          bio: localUser.bio || '',
          expertise: localUser.expertise || '',
        });
        setAvatarPreview(localUser.avatar || null);
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
              setFormData({
                fullName: serverUser.fullName || '',
                email: serverUser.email || '',
                bio: serverUser.bio || '',
                expertise: serverUser.expertise || '',
              });
              setAvatarPreview(serverUser.avatar || null);
              localStorage.setItem('user', JSON.stringify(serverUser));
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        notification.error({
          message: 'Lỗi',
          description: 'Vui lòng chọn file hình ảnh!',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        notification.error({
          message: 'Lỗi',
          description: 'Kích thước file không được vượt quá 5MB!',
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập họ và tên!',
      });
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      const validToken = token && token !== 'undefined' && token.length > 20 ? token : null;
      
      if (!validToken) {
        notification.error({
          message: 'Lỗi',
          description: 'Vui lòng đăng nhập lại!',
        });
        setIsSaving(false);
        return;
      }

      let avatarUrl = avatarPreview;

      // Upload avatar if changed
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', avatarFile);

        try {
          const uploadResponse = await fetch(API_ENDPOINTS.upload.image, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${validToken}`,
            },
            body: formDataUpload,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            avatarUrl = uploadData.data?.url || uploadData.url;
          }
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
        }
      }

      const response = await fetch(API_ENDPOINTS.profile.update, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          bio: formData.bio.trim(),
          expertise: formData.expertise.trim(),
          avatar: avatarUrl,
        }),
      });

      if (response.ok) {
        // Update localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          localStorage.setItem('user', JSON.stringify({
            ...user,
            fullName: formData.fullName.trim(),
            bio: formData.bio.trim(),
            expertise: formData.expertise.trim(),
            avatar: avatarUrl,
          }));
        }

        notification.success({
          message: 'Thành công',
          description: 'Cập nhật hồ sơ thành công!',
        });

        setTimeout(() => {
          navigate('/lecture/profile');
        }, 1500);
      } else {
        const data = await response.json();
        notification.error({
          message: 'Lỗi',
          description: data.message || 'Cập nhật hồ sơ thất bại!',
        });
      }
    } catch {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể kết nối đến máy chủ!',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/lecture/profile')}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className={cn(
          'text-3xl font-headline font-bold',
          isDark ? 'text-white' : 'text-primary'
        )}>
          Chỉnh sửa hồ sơ
        </h1>
      </div>

      {/* Avatar Section */}
      <div className={cn(
        'rounded-2xl p-8',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="w-32 h-32 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'GV'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAvatarClick}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Tải lên ảnh mới
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG hoặc GIF. Kích thước tối đa 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className={cn(
        'rounded-2xl p-8 space-y-6',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}>
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider">
            Họ và tên <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Nguyễn Văn Giảng Viên"
            className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
          />
        </div>

        {/* Email (readonly) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider">
            Email
          </Label>
          <Input
            id="email"
            value={formData.email}
            disabled
            className={isDark ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-slate-100'}
          />
          <p className="text-xs text-muted-foreground">
            Email không thể thay đổi
          </p>
        </div>

        {/* Expertise */}
        <div className="space-y-2">
          <Label htmlFor="expertise" className="text-xs font-semibold uppercase tracking-wider">
            Chuyên môn
          </Label>
          <Input
            id="expertise"
            value={formData.expertise}
            onChange={(e) => handleInputChange('expertise', e.target.value)}
            placeholder="Ví dụ: Lập trình Python, Machine Learning"
            className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider">
            Giới thiệu bản thân
          </Label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Viết vài dòng giới thiệu về bản thân..."
            rows={4}
            className={cn(
              'flex w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' 
                : 'border-input bg-background'
            )}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LectureProfileEditPage;

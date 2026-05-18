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

const UNIVERSITY_SCHOOLS = [
  'Trường Đại học Bách Khoa TP.HCM (HCMUT)',
  'Trường Đại học FPT (FPTU)',
  'Trường Đại học Khoa học Tự nhiên TP.HCM',
  'Trường Đại học Công nghệ Thông tin TP.HCM (UIT)',
  'Trường Đại học Kinh tế Luật TP.HCM',
  'Trường Đại học Ngoại ngữ - Tin học TP.HCM',
  'Trường Đại học Sư phạm Kỹ thuật TP.HCM',
  'Trường Đại học Tôn Đức Thắng',
  'Trường Đại học Văn Lang',
  'Trường Đại học RMIT Việt Nam',
  'Trường Đại học KHTN',
  'Trường Đại học Văn Hiến',
  'Trường Đại học Công nghiệp TP.HCM',
  'Trường Đại học Mở TP.HCM',
  'Trường Đại học Tài chính - Marketing',
  'Trường Đại học Ngân hàng TP.HCM',
  'Trường Đại học Sài Gòn',
  'Trường Đại học Giao thông Vận tải TP.HCM',
  'Trường Đại học Y khoa Phạm Ngọc Thạch',
  'Trường Đại học Nông Lâm TP.HCM',
  'Khác (Đại học)',
];

const COLLEGE_SCHOOLS = [
  'Cao đẳng FPT Polytechnic',
  'Cao đẳng Kỹ thuật iMIC',
  'Cao đẳng Thực hành FPT',
  'Cao đẳng Viễn Đông',
  'Cao đẳng Nghề TP.HCM',
  'Cao đẳng Công thương TP.HCM',
  'Cao đẳng Bách Khoa Sài Gòn',
  'Cao đẳng Sài Gòn',
  'Khác (Cao đẳng)',
];

const HIGH_SCHOOL_NOTES = [
  'THPT Chuyên Lê Hồng Phong',
  'THPT Chuyên Trần Đại Nghĩa',
  'THPT Chuyên Nguyễn Tất Thành',
  'THPT Chuyên Hùng Vương',
  'THPT Chuyên Lương Thế Vinh',
  'THPT Năng Khiếu TP.HCM',
  'THPT Gia Định',
  'THPT Mạc Đĩnh Chi',
  'Khác (Cấp 3)',
];

type SchoolType = 'university' | 'college' | 'highschool' | '';

const LEARNING_LEVELS = [
  { value: 'beginner', label: 'Mới bắt đầu', description: 'Chưa có kinh nghiệm lập trình' },
  { value: 'intermediate', label: 'Trung bình', description: 'Đã biết cơ bản về lập trình' },
  { value: 'advanced', label: 'Nâng cao', description: 'Có kinh nghiệm và muốn phát triển thêm' },
];

const ProfileEditPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    schoolType: '' as SchoolType,
    school: '',
    customSchool: '',
    learningLevel: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        const localUser = JSON.parse(userStr);
        setUserData(localUser);
        
        // Determine school type from existing school name
        let schoolType: SchoolType = '';
        if (localUser.school) {
          if (UNIVERSITY_SCHOOLS.some(s => localUser.school.includes(s.split(' (')[0]))) {
            schoolType = 'university';
          } else if (COLLEGE_SCHOOLS.some(s => localUser.school.includes(s.split(' (')[0]))) {
            schoolType = 'college';
          } else if (localUser.school.toLowerCase().includes('thpt') || 
                     localUser.school.toLowerCase().includes('trường')) {
            schoolType = 'highschool';
          } else {
            schoolType = 'highschool'; // default for other schools
          }
        }
        
        setFormData({
          fullName: localUser.fullName || '',
          schoolType,
          school: schoolType === 'highschool' ? '' : (localUser.school || ''),
          customSchool: schoolType === 'highschool' ? (localUser.school || '') : '',
          learningLevel: localUser.learningLevel || '',
        });
        setAvatarPreview(localUser.avatar || null);
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
    if (field === 'schoolType') {
      setFormData((prev) => ({ 
        ...prev, 
        schoolType: value as SchoolType, 
        school: '', 
        customSchool: '' 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập họ và tên!',
      });
      return;
    }

    if (!formData.schoolType) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng chọn loại trường (Cao đẳng, Đại học hoặc Cấp 3)!',
      });
      return;
    }

    if (formData.schoolType === 'highschool' && !formData.customSchool.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập tên trường cấp 3!',
      });
      return;
    }

    if ((formData.schoolType === 'university' || formData.schoolType === 'college') && !formData.school) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng chọn trường học!',
      });
      return;
    }

    if ((formData.school === 'Khác (Đại học)' || formData.school === 'Khác (Cao đẳng)') && !formData.customSchool.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập tên trường học!',
      });
      return;
    }

    if (!formData.learningLevel) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng chọn trình độ học tập!',
      });
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      // Validate token - ensure it's not null, undefined, or the string "undefined"
      const validToken = token && token !== 'undefined' && token.length > 20 ? token : null;
      console.log('Token from localStorage:', validToken ? `${validToken.substring(0, 50)}...` : 'null/invalid');
      let avatarUrl = avatarPreview;

      // Upload avatar if changed
      if (avatarFile && validToken) {
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

      // Update profile
      if (!validToken) {
        notification.error({
          message: 'Lỗi',
          description: 'Vui lòng đăng nhập lại!',
        });
        setIsSaving(false);
        return;
      }

      const selectedSchool = formData.schoolType === 'highschool'
        ? formData.customSchool.trim()
        : (formData.school === 'Khác (Đại học)' || formData.school === 'Khác (Cao đẳng)')
          ? formData.customSchool.trim()
          : formData.school;

      const response = await fetch(API_ENDPOINTS.profile.update, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          school: selectedSchool,
          learningLevel: formData.learningLevel,
          avatar: avatarUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          localStorage.setItem('user', JSON.stringify({
            ...user,
            fullName: formData.fullName.trim(),
            school: selectedSchool,
            learningLevel: formData.learningLevel,
            avatar: avatarUrl,
            isOnboarded: true,
          }));
        }

        notification.success({
          message: 'Thành công',
          description: 'Cập nhật hồ sơ thành công!',
        });

        setTimeout(() => {
          navigate('/user/profile');
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
          onClick={() => navigate('/user/profile')}
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
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
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
            placeholder="Nguyễn Văn A"
            className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
          />
        </div>

        {/* School Type */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider">
            Loại trường <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('schoolType', 'university')}
              className={cn(
                'p-4 rounded-xl border-2 text-center transition-all',
                formData.schoolType === 'university'
                  ? 'border-primary bg-primary/5'
                  : isDark
                  ? 'border-slate-600 hover:border-slate-500'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className={cn(
                'font-semibold text-sm',
                isDark ? 'text-white' : 'text-foreground'
              )}>
                Đại học
              </div>
              <div className={cn(
                'text-xs mt-1',
                isDark ? 'text-slate-400' : 'text-muted-foreground'
              )}>
                University
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('schoolType', 'college')}
              className={cn(
                'p-4 rounded-xl border-2 text-center transition-all',
                formData.schoolType === 'college'
                  ? 'border-primary bg-primary/5'
                  : isDark
                  ? 'border-slate-600 hover:border-slate-500'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className={cn(
                'font-semibold text-sm',
                isDark ? 'text-white' : 'text-foreground'
              )}>
                Cao đẳng
              </div>
              <div className={cn(
                'text-xs mt-1',
                isDark ? 'text-slate-400' : 'text-muted-foreground'
              )}>
                College
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('schoolType', 'highschool')}
              className={cn(
                'p-4 rounded-xl border-2 text-center transition-all',
                formData.schoolType === 'highschool'
                  ? 'border-primary bg-primary/5'
                  : isDark
                  ? 'border-slate-600 hover:border-slate-500'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className={cn(
                'font-semibold text-sm',
                isDark ? 'text-white' : 'text-foreground'
              )}>
                Cấp 3
              </div>
              <div className={cn(
                'text-xs mt-1',
                isDark ? 'text-slate-400' : 'text-muted-foreground'
              )}>
                High School
              </div>
            </button>
          </div>
        </div>

        {/* School Selection */}
        {formData.schoolType === 'highschool' ? (
          <div className="space-y-2">
            <Label htmlFor="customSchool" className="text-xs font-semibold uppercase tracking-wider">
              Tên trường cấp 3 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customSchool"
              placeholder="Ví dụ: THPT Chuyên Lê Hồng Phong"
              value={formData.customSchool}
              onChange={(e) => handleInputChange('customSchool', e.target.value)}
              className={cn(isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}
            />
            <select
              value={HIGH_SCHOOL_NOTES.includes(formData.customSchool) ? formData.customSchool : ''}
              onChange={(e) => handleInputChange('customSchool', e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-2',
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'border-input bg-background',
              )}
            >
              <option value="">-- Hoặc chọn từ danh sách --</option>
              {HIGH_SCHOOL_NOTES.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
        ) : formData.schoolType ? (
          <div className="space-y-2">
            <Label htmlFor="school" className="text-xs font-semibold uppercase tracking-wider">
              Trường học <span className="text-red-500">*</span>
            </Label>
            <select
              id="school"
              value={formData.school}
              onChange={(e) => {
                handleInputChange('school', e.target.value);
                if (e.target.value !== 'Khác (Đại học)' && e.target.value !== 'Khác (Cao đẳng)') {
                  setFormData((prev) => ({ ...prev, customSchool: '' }));
                }
              }}
              className={cn(
                'flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'border-input bg-background',
              )}
            >
              <option value="">-- Chọn trường học --</option>
              {formData.schoolType === 'university' && UNIVERSITY_SCHOOLS.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
              {formData.schoolType === 'college' && COLLEGE_SCHOOLS.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
            {(formData.school === 'Khác (Đại học)' || formData.school === 'Khác (Cao đẳng)') && (
              <Input
                placeholder="Nhập tên trường học của bạn"
                value={formData.customSchool}
                onChange={(e) => handleInputChange('customSchool', e.target.value)}
                className={cn('mt-2', isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}
              />
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            Vui lòng chọn loại trường ở trên
          </div>
        )}

        {/* Learning Level */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wider">
            Trình độ học tập <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LEARNING_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleInputChange('learningLevel', level.value)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  formData.learningLevel === level.value
                    ? 'border-primary bg-primary/5'
                    : isDark
                    ? 'border-slate-600 hover:border-slate-500'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className={cn(
                  'font-semibold text-sm',
                  isDark ? 'text-white' : 'text-foreground'
                )}>
                  {level.label}
                </div>
                <div className={cn(
                  'text-xs mt-1',
                  isDark ? 'text-slate-400' : 'text-muted-foreground'
                )}>
                  {level.description}
                </div>
              </button>
            ))}
          </div>
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

export default ProfileEditPage;

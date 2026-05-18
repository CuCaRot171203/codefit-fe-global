import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { API_ENDPOINTS } from '@/config/api';
import { notification } from 'antd';
import { Upload, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

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

const LEARNING_LEVELS = [
  { value: 'beginner', label: 'Mới bắt đầu', description: 'Chưa có kinh nghiệm lập trình' },
  { value: 'intermediate', label: 'Trung bình', description: 'Đã biết cơ bản về lập trình' },
  { value: 'advanced', label: 'Nâng cao', description: 'Có kinh nghiệm và muốn phát triển thêm' },
];

type SchoolType = 'university' | 'college' | 'highschool' | '';

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const [fullName, setFullName] = useState('');
  const [schoolType, setSchoolType] = useState<SchoolType>('');
  const [school, setSchool] = useState('');
  const [customSchool, setCustomSchool] = useState('');
  const [learningLevel, setLearningLevel] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(open);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsOpen(open);
    if (open) {
      loadExistingData();
    }
  }, [open]);

  const loadExistingData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      try {
        const user = JSON.parse(userStr);
        setFullName(user.fullName || '');
        setLearningLevel(user.learningLevel || '');
        setAvatarPreview(user.avatar || null);

        if (user.school) {
          if (UNIVERSITY_SCHOOLS.some(s => user.school.includes(s.split(' (')[0]))) {
            setSchoolType('university');
            setSchool(user.school);
          } else if (COLLEGE_SCHOOLS.some(s => user.school.includes(s.split(' (')[0]))) {
            setSchoolType('college');
            setSchool(user.school);
          } else {
            setSchoolType('highschool');
            setCustomSchool(user.school);
          }
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      }
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

  const handleSchoolTypeChange = (type: SchoolType) => {
    setSchoolType(type);
    setSchool('');
    setCustomSchool('');
  };

  const getSchoolList = () => {
    switch (schoolType) {
      case 'university':
        return UNIVERSITY_SCHOOLS;
      case 'college':
        return COLLEGE_SCHOOLS;
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập họ và tên!',
      });
      return;
    }

    if (!schoolType) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng chọn loại trường!',
      });
      return;
    }

    if (schoolType === 'highschool' && !customSchool.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập tên trường cấp 3!',
      });
      return;
    }

    if ((schoolType === 'university' || schoolType === 'college') && !school) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng chọn trường học!',
      });
      return;
    }

    if ((school === 'Khác (Đại học)' || school === 'Khác (Cao đẳng)') && !customSchool.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập tên trường học!',
      });
      return;
    }

    if (!learningLevel) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng chọn trình độ học tập!',
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token.length < 20) {
        notification.error({
          message: 'Lỗi',
          description: 'Vui lòng đăng nhập lại!',
        });
        setIsLoading(false);
        return;
      }

      let avatarUrl = avatarPreview;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);

        try {
          const uploadResponse = await fetch(API_ENDPOINTS.upload.image, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            avatarUrl = uploadData.data?.url || uploadData.url;
          }
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
        }
      }

      const selectedSchool = schoolType === 'highschool'
        ? customSchool.trim()
        : (school === 'Khác (Đại học)' || school === 'Khác (Cao đẳng)')
          ? customSchool.trim()
          : school;

      const response = await fetch(API_ENDPOINTS.profile.update, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          school: selectedSchool,
          learningLevel,
          referralCode: referralCode.trim() || undefined,
          avatar: avatarUrl || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật thông tin thành công!',
        });

        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          localStorage.setItem('user', JSON.stringify({
            ...user,
            ...data.data,
            fullName: fullName.trim(),
            school: selectedSchool,
            learningLevel,
            avatar: avatarUrl,
            isOnboarded: true,
          }));
        }

        setIsOpen(false);
        onComplete();
      } else {
        notification.error({
          message: 'Lỗi',
          description: data.message || 'Cập nhật thông tin thất bại!',
        });
      }
    } catch {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể kết nối đến máy chủ!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">
            Hoàn thiện hồ sơ của bạn
          </DialogTitle>
          <DialogDescription>
            Cung cấp thêm thông tin để chúng tôi có thể cá nhân hóa trải nghiệm học tập cho bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={handleAvatarClick}>
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleAvatarClick}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Tải lên ảnh
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG. Tối đa 5MB
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* School Type */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              Loại trường <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSchoolTypeChange('university')}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  schoolType === 'university'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="font-semibold text-sm">Đại học</div>
                <div className="text-xs text-muted-foreground mt-1">University</div>
              </button>
              <button
                type="button"
                onClick={() => handleSchoolTypeChange('college')}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  schoolType === 'college'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="font-semibold text-sm">Cao đẳng</div>
                <div className="text-xs text-muted-foreground mt-1">College</div>
              </button>
              <button
                type="button"
                onClick={() => handleSchoolTypeChange('highschool')}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  schoolType === 'highschool'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="font-semibold text-sm">Cấp 3</div>
                <div className="text-xs text-muted-foreground mt-1">High School</div>
              </button>
            </div>
          </div>

          {/* School Selection/Input */}
          {schoolType === 'highschool' ? (
            <div className="space-y-2">
              <Label htmlFor="customSchool" className="text-xs font-semibold uppercase tracking-wider">
                Tên trường cấp 3 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customSchool"
                placeholder="Ví dụ: THPT Chuyên Lê Hồng Phong"
                value={customSchool}
                onChange={(e) => setCustomSchool(e.target.value)}
              />
            </div>
          ) : schoolType ? (
            <div className="space-y-2">
              <Label htmlFor="school" className="text-xs font-semibold uppercase tracking-wider">
                Trường học <span className="text-red-500">*</span>
              </Label>
              <select
                id="school"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  if (e.target.value !== 'Khác (Đại học)' && e.target.value !== 'Khác (Cao đẳng)') {
                    setCustomSchool('');
                  }
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">-- Chọn trường học --</option>
                {getSchoolList().map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {(school === 'Khác (Đại học)' || school === 'Khác (Cao đẳng)') && (
                <Input
                  placeholder="Nhập tên trường học của bạn"
                  value={customSchool}
                  onChange={(e) => setCustomSchool(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-2">
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
                  onClick={() => setLearningLevel(level.value)}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    learningLevel === level.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="font-semibold text-sm">{level.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-xs font-semibold uppercase tracking-wider">
              Mã giới thiệu <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
            </Label>
            <Input
              id="referralCode"
              placeholder="Nhập mã người giới thiệu"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
            Bỏ qua
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;

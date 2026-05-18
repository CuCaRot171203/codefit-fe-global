import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Logo from '@/assets/images/LOGO_CODEFIT.png';
import { API_ENDPOINTS } from '@/config/api';
import { notification } from 'antd';

/**
 * Khởi tạo interface
 */
interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

/**
 * Phương thức kiểm tra độ mạnh của mật khẩu
 * @param password - Mật khẩu cần kiểm tra
 * @returns Độ mạnh của mật khẩu
 */
const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;

  // Các case mật khẩu cần check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // Check độ mạnh của mật khẩu
  if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Trung bình', color: 'bg-yellow-500' };
  if (score <= 3) return { score: 3, label: 'Khá', color: 'bg-blue-500' };
  return { score: 4, label: 'Mạnh', color: 'bg-green-500' };
};

/**
 * Trang đăng ký
 * @returns Trang đăng ký
 */
const RegisterPage = () => {
  // Khởi tạo useNavigate
  const navigate = useNavigate();

  // Khởi tạo các state
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');

  // Khởi tạo state độ mạnh của mật khẩu
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
  });

  /**
   * Phương thức xử lý thay đổi mật khẩu
   * @param e - Sự kiện thay đổi mật khẩu
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(getPasswordStrength(value));
  };

  /**
   * Phương thức xử lý submit form
   * @param e - Sự kiện submit form
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Lấy dữ liệu từ form
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const passwordValue = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const terms = formData.get('terms') as string;

    // Check tên người dùng
    if (!username?.trim()) {
      notification.error({
      message: 'Lỗi',
      description: 'Vui lòng nhập tên người dùng!',
    });
      setIsLoading(false);
      return;
    }

    // Check địa chỉ email
    if (!email?.trim()) {
      notification.error({
      message: 'Lỗi',
      description: 'Vui lòng nhập địa chỉ email!',
    });
      setIsLoading(false);
      return;
    }

    // Check địa chỉ email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notification.error({
      message: 'Lỗi',
      description: 'Địa chỉ email không hợp lệ!',
    });
      setIsLoading(false);
      return;
    }

    // Check mật khẩu
    if (!passwordValue) {
      notification.error({
      message: 'Lỗi',
      description: 'Vui lòng nhập mật khẩu!',
    });
      setIsLoading(false);
      return;
    }

    // Check độ dài mật khẩu
    if (passwordValue.length < 8) {
      notification.error({
      message: 'Lỗi',
      description: 'Mật khẩu phải có ít nhất 8 ký tự!',
    });
      setIsLoading(false);
      return;
    }

    // Check xác nhận mật khẩu
    if (!confirmPassword) {
      notification.error({
      message: 'Lỗi',
      description: 'Vui lòng xác nhận mật khẩu!',
    });
      setIsLoading(false);
      return;
    }

    // Kiểm tra khớp mật khẩu
    if (passwordValue !== confirmPassword) {
      notification.error({
      message: 'Lỗi',
      description: 'Mật khẩu xác nhận không khớp!',
    });
      setIsLoading(false);
      return;
    }

    // Check đồng ý với điều khoản và chính sách bảo mật
    if (!terms) {
      notification.error({
      message: 'Lỗi',
      description: 'Bạn cần đồng ý với Điều khoản và Chính sách Bảo mật!',
    });
      setIsLoading(false);
      return;
    }

    // Gọi API, gửi request đăng ký
    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password: passwordValue }),
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
      message: 'Thành công',
      description: 'Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...',
    });
        setTimeout(() => {
          navigate('/dang-nhap');
        }, 1500);
      } else {
        const errorMsg = data.message || data.error || '';
        if (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('exist')) {
          notification.error({
          message: 'Lỗi',
          description: 'Email đã được sử dụng. Vui lòng sử dụng email khác!',
        });
        } else if (errorMsg.toLowerCase().includes('username') && errorMsg.toLowerCase().includes('exist')) {
          notification.error({
          message: 'Lỗi',
          description: 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác!',
        });
        } else {
          notification.error({
          message: 'Lỗi',
          description: 'Đăng ký thất bại: ' + (errorMsg || 'Vui lòng thử lại sau!'),
        });
        }
      }
    } catch {
      notification.error({
      message: 'Lỗi',
      description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!',
    });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="inline-block">
          <div className="font-headline text-2xl font-bold text-primary dark:text-cyan-400 mb-2">
            <img src={Logo} alt="CodeFit Logo" className="h-9 w-auto" />
          </div>
        </Link>
        <h2 className="font-headline text-2xl font-semibold text-foreground dark:text-white tracking-tight">
          Tạo tài khoản mới
        </h2>
        <p className="text-muted-foreground dark:text-slate-400 font-body mt-1 text-sm">
          Bắt đầu hành trình chinh phục kỹ năng lập trình của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
            Tên người dùng
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
            Địa chỉ Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Password Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
              Mật khẩu
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
              Xác nhận mật khẩu
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${
              passwordStrength.score <= 1 ? 'text-red-500' :
              passwordStrength.score === 2 ? 'text-yellow-500' :
              passwordStrength.score === 3 ? 'text-blue-500' : 'text-green-500'
            }`}>
              Độ mạnh: {passwordStrength.label}
            </p>
          </div>
        )}

        {/* Password Requirements */}
        <div className="text-xs text-muted-foreground dark:text-slate-500 space-y-0.5">
          <p className="font-medium">Yêu cầu mật khẩu:</p>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            <li className={password.length >= 8 ? 'text-green-500' : ''}>
              Ít nhất 8 ký tự {password.length >= 8 && '✓'}
            </li>
            <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-500' : ''}>
              Chữ hoa và chữ thường {/[A-Z]/.test(password) && /[a-z]/.test(password) && '✓'}
            </li>
            <li className={/\d/.test(password) ? 'text-green-500' : ''}>
              Ít nhất 1 chữ số {/\d/.test(password) && '✓'}
            </li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : ''}>
              Ít nhất 1 ký tự đặc biệt {/[!@#$%^&*(),.?":{}|<>]/.test(password) && '✓'}
            </li>
          </ul>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-2.5 pt-1">
          <Checkbox id="terms" name="terms" className="mt-0.5" />
          <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground dark:text-slate-400 leading-tight cursor-pointer">
            Tôi đồng ý với{' '}
            <a href="#" className="text-primary dark:text-cyan-400 font-semibold hover:underline">
              Điều khoản
            </a>{' '}
            và{' '}
            <a href="#" className="text-primary dark:text-cyan-400 font-semibold hover:underline">
              Chính sách Bảo mật
            </a>
            .
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </Button>

          <div className="relative flex items-center justify-center py-1.5">
            <div className="w-full border-t border-border dark:border-slate-600"></div>
            <span className="absolute bg-background dark:bg-slate-800 px-3 text-xs font-medium text-muted-foreground dark:text-slate-500 uppercase tracking-[0.15em]">
              hoặc
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 text-sm font-semibold border-input bg-background hover:bg-accent hover:text-accent-foreground dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </div>

        <div className="pt-4 text-center">
          <p className="font-body text-sm text-muted-foreground dark:text-slate-400">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="text-primary dark:text-cyan-400 font-semibold ml-1 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;

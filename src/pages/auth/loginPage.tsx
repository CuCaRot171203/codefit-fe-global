import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/assets/images/LOGO_CODEFIT.png';
import { notification } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeRole, type AppRole } from '@/utils/roleUtils';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập địa chỉ email!',
      });
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notification.error({
        message: 'Lỗi',
        description: 'Địa chỉ email không hợp lệ!',
      });
      setIsLoading(false);
      return;
    }

    if (!password) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập mật khẩu!',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await authLogin(email.trim(), password);

      if (result.success) {
        notification.success({
          message: 'Thành công',
          description: 'Đăng nhập thành công! Đang chuyển hướng...',
        });

        // Get role from stored user to determine redirect
        const storedUser = localStorage.getItem('user');
        const userRole: AppRole = storedUser
          ? normalizeRole((JSON.parse(storedUser) as { role?: string }).role || 'user')
          : 'user';

        setTimeout(() => {
          if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else if (userRole === 'lecture') {
            navigate('/lecture');
          } else {
            navigate('/user/dashboard');
          }
        }, 1500);
      } else {
        const errorMsg = result.message || '';
        setEmail('');
        setPassword('');

        if (errorMsg.toLowerCase().includes('invalid') && errorMsg.toLowerCase().includes('credential')) {
          notification.error({
            message: 'Lỗi đăng nhập',
            description: 'Email hoặc mật khẩu không chính xác!',
          });
        } else {
          notification.error({
            message: 'Lỗi',
            description: errorMsg || 'Đăng nhập thất bại. Vui lòng thử lại!',
          });
        }
        setIsLoading(false);
      }
    } catch {
      setEmail('');
      setPassword('');
      setIsLoading(false);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!',
      });
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
        <h2 className="font-headline text-2xl font-bold text-foreground dark:text-white tracking-tight">
          Chào mừng quay trở lại
        </h2>
        <p className="text-muted-foreground dark:text-slate-400 font-body mt-1 text-sm">
          Tiếp tục hành trình lập trình của bạn.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
            Địa chỉ Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
              Mật khẩu
            </Label>
            <Link to="/quen-mat-khau" className="text-xs font-semibold text-primary dark:text-cyan-400 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-border dark:border-slate-600"></div>
        <span className="absolute bg-background dark:bg-slate-800 px-3 text-xs font-medium text-muted-foreground dark:text-slate-500 italic">
          hoặc tiếp tục với
        </span>
      </div>

      {/* Google Login */}
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
        Đăng nhập với Google
      </Button>

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="font-body text-sm text-muted-foreground dark:text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="text-primary dark:text-cyan-400 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

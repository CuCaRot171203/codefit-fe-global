import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Logo from '@/assets/images/LOGO_CODEFIT.png';
import { ArrowRight } from 'lucide-react';

const ForgotPasswordPage = () => {
  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="inline-block">
          <div className="font-headline text-2xl font-bold text-primary dark:text-cyan-400">
            <img src={Logo} alt="CodeFit Logo" className="h-9 w-auto" />
          </div>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="font-headline text-2xl font-semibold text-foreground dark:text-white tracking-tight mb-2">
          Quên mật khẩu?
        </h2>
        <p className="text-muted-foreground dark:text-slate-400 font-body text-sm">
          Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
        </p>
      </div>

      <form className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
            Địa chỉ Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-2 flex items-center justify-center gap-2"
        >
          Gửi liên kết
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Back to Login */}
      <div className="mt-8 text-center">
        <Link
          to="/dang-nhap"
          className="font-body text-sm text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-cyan-400 transition-colors"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

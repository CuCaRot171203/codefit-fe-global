import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';

const GoogleSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processGoogleLogin = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('Google auth error:', error);
        navigate('/dang-nhap?error=google_auth_failed');
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          const userRole = user.role || 'user';
          setTimeout(() => {
            if (userRole === 'admin') {
              navigate('/admin/dashboard');
            } else if (userRole === 'lecture') {
              navigate('/lecture');
            } else {
              navigate('/user/dashboard');
            }
          }, 100);
        } catch (e) {
          console.error('Failed to parse user data:', e);
          navigate('/dang-nhap?error=invalid_data');
        }
      } else {
        navigate('/dang-nhap?error=missing_data');
      }
    };

    processGoogleLogin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spin size="large" />
        <p className="text-slate-500">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default GoogleSuccessPage;

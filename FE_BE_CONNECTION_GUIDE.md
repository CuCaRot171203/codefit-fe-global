# HƯỚNG DẪN KẾT NỐI FE - BE

## 1. Cấu hình môi trường

### Backend (.env)
```
DATABASE_URL=mysql://user:password@localhost:3306/codefit
JWT_SECRET=your-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint
PORT=5000
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

## 2. Khởi động servers

### Terminal 1 - Backend
```bash
cd d:\FPTU_SUPPORT\CODEFIT\codefit-be\backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd d:\FPTU_SUPPORT\CODEFIT\codefit-fe
npm run dev
```

## 3. Sử dụng API Services

### Import services
```typescript
import { authService, courseService, submissionService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
```

### Auth - Đăng nhập
```typescript
const { login, logout, user, isAuthenticated } = useAuth();

// Trong function
const handleLogin = async () => {
  const result = await login('user@example.com', 'password123');
  if (result.success) {
    // Redirect to dashboard
  }
};
```

### Auth - Đăng ký
```typescript
const { register } = useAuth();

const handleRegister = async () => {
  const result = await register('newuser@example.com', 'username', 'Password123!');
  if (result.success) {
    // Redirect to dashboard
  }
};
```

### Courses - Lấy danh sách
```typescript
const [courses, setCourses] = useState([]);

useEffect(() => {
  const fetchCourses = async () => {
    const res = await courseService.getAll();
    if (res.success) {
      setCourses(res.data);
    }
  };
  fetchCourses();
}, []);
```

### Courses - Chi tiết & Enroll
```typescript
const [course, setCourse] = useState(null);

useEffect(() => {
  const fetchCourse = async () => {
    const res = await courseService.getById(courseId);
    if (res.success) {
      setCourse(res.data);
    }
  };
  fetchCourse();
}, [courseId]);

const handleEnroll = async () => {
  const res = await courseService.enroll(courseId);
  if (res.success) {
    // Show success, redirect to learning
  }
};
```

### Submission - Nộp bài
```typescript
const handleSubmit = async () => {
  const res = await submissionService.submit(problemId, code, 'javascript');
  if (res.success) {
    console.log('Result:', res.data);
  }
};
```

### Upload Image
```typescript
const handleUpload = async (file: File) => {
  const res = await uploadService.uploadImage(file, '/profile');
  if (res.success) {
    return res.data.url;
  }
};
```

## 4. Route Protection

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return <>{children}</>;
}

// Usage in router
<Route path="/user/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## 5. Xử lý lỗi

```typescript
try {
  const res = await authService.login(email, password);
  if (!res.success) {
    toast.error(res.message);
  }
} catch (error) {
  toast.error('Lỗi kết nối server');
}
```

## 6. Headers Authentication

Token được tự động gửi trong mọi request:
```typescript
Authorization: Bearer <token>
```

Token được lưu trong localStorage và tự động attach vào headers.

## 7. Test kết nối

Chạy browser và truy cập:
- Frontend: http://localhost:8000
- Backend API: http://localhost:5000/api/courses

Kiểm tra network tab trong DevTools để xem requests.

## 8. CORS Configuration

Backend đã configured cho:
- http://localhost:8000 (Frontend dev)
- http://localhost:3000 (Alternative)

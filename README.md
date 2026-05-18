# CodeFit Frontend

> Ngày cập nhật: **18/05/2026**

## Giới thiệu

**CodeFit** là nền tảng học lập trình trực tuyến, giúp người dùng học và thực hành kỹ năng lập trình thông qua các khóa học, dự án thực tế, và hackathon.

---

## Công nghệ sử dụng

### Framework & Build

| Công nghệ | Mô tả |
|-----------|-------|
| React 19 | UI Framework |
| TypeScript | Ngôn ngữ lập trình |
| Vite | Build tool |
| Tailwind CSS | Styling |

### UI & Components

| Công nghệ | Mô tả |
|-----------|-------|
| Radix UI | Headless UI primitives |
| Shadcn/ui patterns | Component patterns |
| Framer Motion | Animation library |
| Lucide React | Icon library |
| Ant Design | UI component library |

### State Management & Routing

| Công nghệ | Mô tả |
|-----------|-------|
| Redux Toolkit | State management |
| Zustand | Lightweight state |
| React Router v7 | Routing |

### Editor & Charts

| Công nghệ | Mô tả |
|-----------|-------|
| Monaco Editor | Code editor |
| Recharts | Charts & visualizations |
| Tiptap | Rich text editor |

### Drag & Drop

| Công nghệ | Mô tả |
|-----------|-------|
| dnd-kit | Drag and drop primitives |

### Utilities

| Công nghệ | Mô tả |
|-----------|-------|
| qrcode | QR code generation |
| html2canvas | Screenshot capture |
| jsPDF | PDF generation |

---

## Cấu trúc thư mục

```
src/
├── components/              # Components dùng chung
│   ├── auth/
│   ├── public/
│   └── user/
├── configs/                 # Cấu hình ứng dụng
├── contexts/                # React Contexts (Auth, Error Handler)
├── hooks/                   # Custom React hooks
├── layouts/                 # Layout wrappers
├── lib/                     # Utilities
├── pages/                   # Pages
│   ├── admin/              # Trang quản trị
│   ├── auth/               # Trang xác thực
│   ├── lecture/            # Trang giảng viên
│   ├── public/             # Trang công khai & lỗi
│   └── user/               # Trang người dùng
├── router/                  # Cấu hình routing
├── services/                # API services
├── store/                   # Redux store
├── types/                   # TypeScript types
├── App.tsx
└── main.tsx
```

---

## Scripts

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Kiểm tra lint
npm run lint

# Preview production build
npm run preview
```

---

## Routes

### Public Routes `PublicLayout`

| Route | Page | File |
|-------|------|------|
| `/` | Trang chủ | `landingPage.tsx` |
| `/lo-trinh` | Lộ trình học | `loTrinhPage.tsx` |
| `/cong-dong` | Cộng đồng | `congDongPage.tsx` |
| `/bang-gia` | Bảng giá | `bangGiaPage.tsx` |
| `/verify/:certificateId` | Xác minh chứng chỉ | `verifyCertificatePage.tsx` |

### Auth Routes `AuthLayout`

| Route | Page | File |
|-------|------|------|
| `/dang-ky` | Đăng ký | `registerPage.tsx` |
| `/dang-nhap` | Đăng nhập | `loginPage.tsx` |
| `/quen-mat-khau` | Quên mật khẩu | `forgotPassword.tsx` |
| `/dat-lai-mat-khau` | Đặt lại mật khẩu | `resetPasswordForm.tsx` |
| `/dat-lai-mat-khau/thanh-cong` | Thành công | `resetPasswordSuccess.tsx` |

### User Routes `UserLayout`

| Route | Page | File |
|-------|------|------|
| `/user/dashboard` | Dashboard | `dashboardUser.tsx` |
| `/user/thong-ke` | Thống kê | `thongKeDashboard.tsx` |
| `/user/lo-trinh` | Lộ trình học | `loTrinhUserPage.tsx` |
| `/user/tai-lieu` | Tài liệu | `taiLieuPage.tsx` |
| `/user/danh-sach-khoa-hoc` | Danh sách khóa học | `danhSachKhoaHocUser.tsx` |
| `/user/courses/:id` | Chi tiết khóa học | `chiTietKhoaHoc.tsx` |
| `/user/courses/:id/content` | Nội dung khóa học | `CourseContentPage.tsx` |
| `/user/lot-trinh/:routeLoTrinh` | Lộ trình học chi tiết | `loTrinhHocUser.tsx` |
| `/user/chuong-trinh/:chuongTrinhId` | Chương trình học | `chuongTrinhHocUser.tsx` |
| `/user/study/:problemId` | Trang học code | `studyPage.tsx` |
| `/user/lich-su-nop-bai` | Lịch sử nộp bài | `historyStudyPage.tsx` |
| `/user/minitest/:minitestId` | Giới thiệu Minitest | `gioiThieuMinitest.tsx` |
| `/user/minitest/gioi-thieu` | Giới thiệu Minitest | `gioiThieuMinitest.tsx` |
| `/user/ket-qua-minitest` | Kết quả Minitest | `ketQuaMinitest.tsx` |
| `/user/tien-do-hoc-tap` | Tiến độ học tập | `dashboardTienTrinhUser.tsx` |
| `/user/chi-tiet-tien-do/:problemId` | Chi tiết tiến độ | `chiTietTienDoUser.tsx` |
| `/user/hackathon` | Danh sách Hackathon | `danhSachHackathon.tsx` |
| `/user/hackathon/:hackathonId` | Chi tiết Hackathon | `chiTietHackathon.tsx` |
| `/user/hackathon/:hackathonId/leaderboard` | Bảng xếp hạng | `leadingBoardHackathon.tsx` |
| `/user/profile` | Hồ sơ người dùng | `profilePageUser.tsx` |
| `/user/profile/edit` | Chỉnh sửa hồ sơ | `profileEditPage.tsx` |
| `/user/notifications` | Thông báo | `userNotificationsPage.tsx` |
| `/user/certificates` | Chứng chỉ | `certificatePage.tsx` |
| `/user/certificate/:certificateId` | Chi tiết chứng chỉ | `certificateDetail.tsx` |
| `/user/project/:projectId` | Giới thiệu dự án | `gioiThieuDuAn.tsx` |
| `/user/project/:projectId/result` | Kết quả dự án | `ketQuaDuAn.tsx` |
| `/user/project/:projectId/submit` | Nộp dự án | `nopDuAn.tsx` |
| `/user/final-test/:finalTestId` | Giới thiệu Final Test | `gioiThieuFinalTest.tsx` |
| `/user/final-test/:finalTestId/lam-bai` | Làm bài Final Test | `lamBaiFinalTest.tsx` |
| `/user/final-test/:finalTestId/ket-qua` | Kết quả Final Test | `ketQuaFinalTest.tsx` |
| `/user/lesson/:lessonId` | Trang bài học | `userLessonPage.tsx` |
| `/user/lecture/:lectureId` | Hồ sơ giảng viên | `InstructorProfilePage.tsx` |
| `/user/nhap-ma-kich-hoat` | Nhập mã kích hoạt | `DashboardUnlockCode.tsx` |

### User Routes - Payment `UserLayout`

| Route | Page | File |
|-------|------|------|
| `/user/payment/activate/:courseId?` | Kích hoạt mã | `ActivateCodeScreen.tsx` |
| `/user/payment/qr/:courseId?` | Thanh toán QR | `QRPaymentScreen.tsx` |
| `/user/payment/success` | Thanh toán thành công | `PaymentSuccessPage.tsx` |
| `/user/payment/cancel` | Hủy thanh toán | `PaymentCancelPage.tsx` |

### User Routes - Exam `ExamLayout`

| Route | Page | File |
|-------|------|------|
| `/user/minitest/lam-bai` | Làm bài Minitest | `lamBaiMiniest.tsx` |

### User Routes - Hackathon `HackathonLayout`

| Route | Page | File |
|-------|------|------|
| `/user/hackathon/:hackathonId/problem/:problemId` | Giao diện lập trình | `giaoDienLapTrinhHackathon.tsx` |

### User Routes - AI Assistant `UserLayoutNoFooter`

| Route | Page | File |
|-------|------|------|
| `/user/ai-assistant` | AI Assistant | `aiAssistantPage.tsx` |

### Admin Routes `AdminLayout`

| Route | Page | File |
|-------|------|------|
| `/admin` | Dashboard | `dashboardPage.tsx` |
| `/admin/dashboard` | Dashboard | `dashboardPage.tsx` |
| `/admin/courses` | Quản lý khóa học | `coursesPage.tsx` |
| `/admin/courses/new` | Tạo khóa học | `courseEditPage.tsx` |
| `/admin/courses/:id/edit` | Chỉnh sửa khóa học | `courseEditPage.tsx` |
| `/admin/courses/:id/content` | Nội dung khóa học | `contentEditorPage.tsx` |
| `/admin/courses/:id/editor` | Editor nội dung | `contentEditorPage.tsx` |
| `/admin/courses/:id/minitests` | Cài đặt Minitest | `minitestSettingsPage.tsx` |
| `/admin/courses/:id/final-test/:hackathonId` | Cài đặt Final Test | `FinalTestSettingsPage.tsx` |
| `/admin/courses/:id/final-project/:projectId` | Cài đặt Final Project | `FinalProjectSettingsPage.tsx` |
| `/admin/instructors` | Quản lý giảng viên | `instructorsPage.tsx` |
| `/admin/instructors/:lectureId` | Chi tiết giảng viên | `instructorDetailPage.tsx` |
| `/admin/users` | Quản lý người dùng | `usersPage.tsx` |
| `/admin/users/:userId` | Xem người dùng | `userPreviewPage.tsx` |
| `/admin/users/:userId/edit` | Chỉnh sửa người dùng | `userEditPage.tsx` |
| `/admin/minitests` | Quản lý Minitest | `minitestsPage.tsx` |
| `/admin/hackathons` | Quản lý Hackathon | `hackathonsPage.tsx` |
| `/admin/hackathons/create` | Tạo Hackathon | `hackathonCreatePage.tsx` |
| `/admin/hackathons/:id` | Chi tiết Hackathon | `hackathonDetailPage.tsx` |
| `/admin/hackathons/:id/edit` | Chỉnh sửa Hackathon | `hackathonEditPage.tsx` |
| `/admin/notifications` | Thông báo | `adminNotificationsPage.tsx` |
| `/admin/notifications/manage` | Quản lý thông báo | `adminNotificationManagementPage.tsx` |
| `/admin/lesson-requests` | Yêu cầu bài học | `lessonRequestsPage.tsx` |
| `/admin/lesson-requests/create` | Tạo yêu cầu | `lessonRequestCreatePage.tsx` |
| `/admin/lesson-requests/:id` | Chi tiết yêu cầu | `lessonRequestDetailPage.tsx` |
| `/admin/lesson-reviews` | Phê duyệt bài học | `lessonReviewPage.tsx` |

### Lecture Routes `LectureLayout`

| Route | Page | File |
|-------|------|------|
| `/lecture` | Dashboard | `lectureDashboardPage.tsx` |
| `/lecture/my-courses` | Khóa học của tôi | `lectureMyCoursesPage.tsx` |
| `/lecture/my-courses/:courseId` | Chi tiết khóa học | `lectureCourseDetailPage.tsx` |
| `/lecture/minitests` | Minitests | `lectureMinitestsPage.tsx` |
| `/lecture/hackathons` | Hackathons | `lectureHackathonsPage.tsx` |
| `/lecture/hackathons/:hackathonId` | Chi tiết Hackathon | `lectureHackathonDetailPage.tsx` |
| `/lecture/lesson-requests` | Yêu cầu bài học | `lectureLessonRequestsPage.tsx` |
| `/lecture/lessons/:lessonId/edit` | Chỉnh sửa bài học | `lectureLessonEditorPage.tsx` |
| `/lecture/submissions` | Bài nộp | `lectureSubmissionsPage.tsx` |
| `/lecture/notifications` | Thông báo | `lectureNotificationsPage.tsx` |
| `/lecture/profile` | Hồ sơ | `lectureProfilePage.tsx` |
| `/lecture/profile/edit` | Chỉnh sửa hồ sơ | `lectureProfileEditPage.tsx` |

### Error Routes `ErrorLayout`

| Route | Page | File |
|-------|------|------|
| `/error/401` | 401 Unauthorized | `Error401.tsx` |
| `/error/403` | 403 Forbidden | `Error403.tsx` |
| `/error/404` | 404 Not Found | `Error404.tsx` |
| `/error/500` | 500 Server Error | `Error500.tsx` |

---

## Cài đặt

```bash
# Clone repository
git clone <repo-url>

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

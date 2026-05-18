const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    me: `${API_BASE_URL}/api/auth/me`,
    refreshToken: `${API_BASE_URL}/api/auth/refresh-token`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
  },

  // Courses
  courses: {
    list: `${API_BASE_URL}/api/courses`,
    detail: (id: string) => `${API_BASE_URL}/api/courses/${id}`,
    enroll: `${API_BASE_URL}/api/courses/enroll`,
  },

  // Enrollments
  enrollments: {
    my: `${API_BASE_URL}/api/enrollments/my`,
    detail: (id: string) => `${API_BASE_URL}/api/enrollments/${id}`,
  },

  // Payments
  payments: {
    create: `${API_BASE_URL}/api/payment/create`,
    activate: `${API_BASE_URL}/api/payment/activate`,
    my: `${API_BASE_URL}/api/payment/my`,
    detail: (id: string) => `${API_BASE_URL}/api/payment/${id}`,
    status: (id: string) => `${API_BASE_URL}/api/payment/${id}/status`,
    cancel: (id: string) => `${API_BASE_URL}/api/payment/${id}/cancel`,
    payosCallback: `${API_BASE_URL}/api/payment/payos/callback`,
    payosCreate: `${API_BASE_URL}/api/payment/payos/create`,
    payosConfirm: `${API_BASE_URL}/api/payment/payos/confirm`,
    payosCancel: `${API_BASE_URL}/api/payment/payos/cancel-payment`,
  },

  // Users
  users: {
    detail: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    profile: `${API_BASE_URL}/api/users/profile`,
  },

  // Admin
  admin: {
    dashboard: `${API_BASE_URL}/api/admin/dashboard/stats`,
    users: `${API_BASE_URL}/api/admin/users`,
    user: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
    courses: `${API_BASE_URL}/api/admin/courses`,
    // Lecture Course Assignment
    lectureCourses: (lectureId: string) => `${API_BASE_URL}/api/admin/lectures/${lectureId}/courses`,
    assignCourse: (lectureId: string, courseId: string) => `${API_BASE_URL}/api/admin/lectures/${lectureId}/courses/${courseId}`,
    // Instructor Detail
    instructorDetail: (lectureId: string) => `${API_BASE_URL}/api/admin/lectures/${lectureId}/detail`,
    // Get all lectures
    lectures: `${API_BASE_URL}/api/admin/users?role=lecture`,
    // Get lectures by course
    courseLectures: (courseId: string) => `${API_BASE_URL}/api/admin/courses/${courseId}/lectures`,
    payments: `${API_BASE_URL}/api/admin/payments`,
    paymentStats: `${API_BASE_URL}/api/admin/payments/stats`,
    activateCodes: `${API_BASE_URL}/api/admin/activate-codes`,
    createCode: `${API_BASE_URL}/api/admin/activate-codes`,
    enrollments: `${API_BASE_URL}/api/admin/enrollments`,
    // Phases & Lessons
    phases: `${API_BASE_URL}/api/admin/phases`,
    phase: (id: string) => `${API_BASE_URL}/api/admin/phases/${id}`,
    lessons: `${API_BASE_URL}/api/admin/lessons`,
    lesson: (id: string) => `${API_BASE_URL}/api/admin/lessons/${id}`,
    lessonTestcases: (id: string) => `${API_BASE_URL}/api/admin/lessons/${id}/testcases`,
    // Minitests
    minitests: `${API_BASE_URL}/api/admin/minitests`,
    minitestsStats: `${API_BASE_URL}/api/admin/minitests/stats`,
    minitestSubmissions: (id: string) => `${API_BASE_URL}/api/admin/minitests/${id}/submissions`,
    minitest: (id: string) => `${API_BASE_URL}/api/admin/minitests/${id}`,
    // Problems
    problems: `${API_BASE_URL}/api/admin/problems`,
    problem: (id: string) => `${API_BASE_URL}/api/admin/problems/${id}`,
    courseProblems: (courseId: string) => `${API_BASE_URL}/api/admin/courses/${courseId}/problems`,
    addProblemToHackathon: (hackathonId: string) => `${API_BASE_URL}/api/admin/hackathons/${hackathonId}/problems`,
    removeProblemFromHackathon: (hackathonId: string, problemId: string) => `${API_BASE_URL}/api/admin/hackathons/${hackathonId}/problems/${problemId}`,
    // Hackathons
    hackathons: `${API_BASE_URL}/api/admin/hackathons`,
    hackathon: (id: string) => `${API_BASE_URL}/api/admin/hackathons/${id}`,
    // Projects
    projects: `${API_BASE_URL}/api/admin/projects`,
    project: (id: string) => `${API_BASE_URL}/api/admin/projects/${id}`,
    // Lesson Requests
    lessonRequests: `${API_BASE_URL}/api/admin/lesson-requests`,
    approveLessonRequest: (id: string) => `${API_BASE_URL}/api/admin/lesson-requests/${id}/approve`,
    rejectLessonRequest: (id: string) => `${API_BASE_URL}/api/admin/lesson-requests/${id}/reject`,
  },

  // Lesson Progress
  lessonProgress: {
    complete: `${API_BASE_URL}/api/lesson-progress/complete`,
    courseProgress: (courseId: string) => `${API_BASE_URL}/api/lesson-progress/course/${courseId}`,
  },

  // Submissions
  submissions: {
    submit: `${API_BASE_URL}/api/submissions/submit`,
    run: `${API_BASE_URL}/api/submissions/run`,
    history: `${API_BASE_URL}/api/submissions/history`,
    detail: (id: string) => `${API_BASE_URL}/api/submissions/${id}`,
  },

  // Problems
  problems: {
    list: `${API_BASE_URL}/api/problems`,
    detail: (id: string) => `${API_BASE_URL}/api/problems/${id}`,
    testcases: (id: string) => `${API_BASE_URL}/api/problems/${id}/testcases`,
  },

  // Hackathons
  hackathons: {
    list: `${API_BASE_URL}/api/hackathons`,
    active: `${API_BASE_URL}/api/hackathons/active`,
    upcoming: `${API_BASE_URL}/api/hackathons/upcoming`,
    ended: `${API_BASE_URL}/api/hackathons/ended`,
    registered: `${API_BASE_URL}/api/hackathons/registered`,
    detail: (id: string) => `${API_BASE_URL}/api/hackathons/${id}`,
    join: (id: string) => `${API_BASE_URL}/api/hackathons/${id}/join`,
    leaderboard: (id: string) => `${API_BASE_URL}/api/hackathons/${id}/leaderboard`,
    submit: (id: string) => `${API_BASE_URL}/api/hackathons/${id}/submit`,
    participants: (id: string) => `${API_BASE_URL}/api/hackathons/${id}/participants`,
    problems: (id: string) => `${API_BASE_URL}/api/hackathons/${id}/problems`,
    submissions: (id: string) => `${API_BASE_URL}/api/hackathons/${id}/submissions`,
    runProblem: (id: string) => `${API_BASE_URL}/api/hackathons/${id}/run-problem`,
    submitProblem: (id: string) => `${API_BASE_URL}/api/hackathons/${id}/submit-problem`,
  },

  // Projects
  projects: {
    list: `${API_BASE_URL}/api/projects`,
    detail: (id: string) => `${API_BASE_URL}/api/projects/${id}`,
    submit: `${API_BASE_URL}/api/projects/submit`,
  },

  // Minitests
  minitests: {
    list: `${API_BASE_URL}/api/minitests`,
    detail: (id: string) => `${API_BASE_URL}/api/minitests/${id}`,
    submit: (id: string) => `${API_BASE_URL}/api/minitests/${id}/submit`,
    result: (id: string) => `${API_BASE_URL}/api/minitests/${id}/result`,
  },

  // Certificates
  certificates: {
    my: `${API_BASE_URL}/api/certificates/my`,
    verify: (code: string) => `${API_BASE_URL}/api/certificates/verify/${code}`,
  },

  // Upload
  upload: {
    single: `${API_BASE_URL}/api/upload`,
    image: `${API_BASE_URL}/api/upload/image`,
    images: `${API_BASE_URL}/api/upload/images`,
  },

  // User Profile
  profile: {
    get: `${API_BASE_URL}/api/users/profile`,
    update: `${API_BASE_URL}/api/users/profile`,
    changePassword: `${API_BASE_URL}/api/users/change-password`,
  },

  // Notifications
  notifications: {
    list: `${API_BASE_URL}/api/notifications`,
    read: (id: string) => `${API_BASE_URL}/api/notifications/${id}/read`,
    readAll: `${API_BASE_URL}/api/notifications/read-all`,
    // Admin: Create notification for lecture
    create: `${API_BASE_URL}/api/notifications`,
    // Admin: Get all notifications (sent and received)
    all: `${API_BASE_URL}/api/notifications/all`,
    // Admin: Get notifications sent by current admin
    sent: `${API_BASE_URL}/api/notifications/sent`,
    // Admin: Delete notification
    delete: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
  },

  // Feedback
  feedback: {
    create: `${API_BASE_URL}/api/feedback`,
    list: `${API_BASE_URL}/api/feedback`,
  },

  // Lecture API endpoints
  lecture: {
    dashboard: `${API_BASE_URL}/api/lecture/dashboard`,
    courses: `${API_BASE_URL}/api/lecture/courses`,
    course: (id: string) => `${API_BASE_URL}/api/lecture/courses/${id}`,
    minitests: `${API_BASE_URL}/api/lecture/minitests`,
    hackathons: `${API_BASE_URL}/api/lecture/hackathons`,
    hackathonDetail: (id: string) => `${API_BASE_URL}/api/hackathons/${id}`,
    // Phase & Lesson management
    phases: `${API_BASE_URL}/api/lecture/phases`,
    lessons: `${API_BASE_URL}/api/lecture/lessons`,
    lessonContent: (lessonId: string) => `${API_BASE_URL}/api/lecture/lesson-content/${lessonId}`,
    lessonContentUpdate: (lessonId: string) => `${API_BASE_URL}/api/lecture/lesson-content/${lessonId}/content`,
    lessonScoring: (lessonId: string) => `${API_BASE_URL}/api/lecture/lesson-content/${lessonId}/scoring`,
    submitLesson: (lessonId: string) => `${API_BASE_URL}/api/lecture/lessons/${lessonId}/submit`,
  },

  // Course Access (Unlock Codes - CFE- format)
  courseAccess: {
    // Create single code
    create: (courseId: string) => `${API_BASE_URL}/api/course-access/${courseId}/codes`,
    // Create bulk codes
    bulkCreate: (courseId: string) => `${API_BASE_URL}/api/course-access/${courseId}/codes/bulk`,
    // Grant access by email
    grant: (courseId: string) => `${API_BASE_URL}/api/course-access/${courseId}/grant`,
    // Assign to multiple users
    assignUsers: (courseId: string) => `${API_BASE_URL}/api/course-access/${courseId}/assign-users`,
    // Get users not enrolled
    usersNotEnrolled: (courseId: string) => `${API_BASE_URL}/api/course-access/${courseId}/users/not-enrolled`,
    // User activates by code
    activate: `${API_BASE_URL}/api/course-access/activate`,
    // Validate code link (for email)
    validateLink: (code: string) => `${API_BASE_URL}/api/course-access/activate/${code}`,
    // List codes for course
    list: (courseId: string) => `${API_BASE_URL}/api/course-access/${courseId}/codes`,
    // Delete code
    delete: (codeId: string) => `${API_BASE_URL}/api/course-access/codes/${codeId}`,
    // Get enrollments (enrolled users with progress)
    enrollments: (courseId: string) => `${API_BASE_URL}/api/course-access/${courseId}/enrollments`,
    // Update user unlocks
    updateUnlocks: (courseId: string, userId: string) => `${API_BASE_URL}/api/course-access/${courseId}/enrollments/${userId}/unlock`,
    // Unlock all lessons for user
    unlockAll: (courseId: string, userId: string) => `${API_BASE_URL}/api/course-access/${courseId}/enrollments/${userId}/unlock-all`,
  },

  // Lesson Request (Admin & Lecture)
  lessonRequests: {
    // Admin endpoints
    list: `${API_BASE_URL}/api/admin/lesson-requests`,
    detail: (id: string) => `${API_BASE_URL}/api/admin/lesson-requests/${id}`,
    approve: (id: string) => `${API_BASE_URL}/api/admin/lesson-requests/${id}/approve`,
    reject: (id: string) => `${API_BASE_URL}/api/admin/lesson-requests/${id}/reject`,
    // Lecture endpoints
    create: `${API_BASE_URL}/api/lesson-requests`,
    update: (id: string) => `${API_BASE_URL}/api/lesson-requests/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/lesson-requests/${id}`,
    myRequests: `${API_BASE_URL}/api/lesson-requests/lecture/my-requests`,
    pending: `${API_BASE_URL}/api/lesson-requests/lecture/pending`,
    start: (id: string) => `${API_BASE_URL}/api/lesson-requests/${id}/start`,
    submit: (id: string) => `${API_BASE_URL}/api/lesson-requests/${id}/submit`,
    cancel: (id: string) => `${API_BASE_URL}/api/lesson-requests/${id}/cancel`,
  },

  // Lesson Content (user lesson page)
  lessonContent: {
    get: (lessonId: string) => `${API_BASE_URL}/api/lesson-content/${lessonId}`,
    update: (lessonId: string) => `${API_BASE_URL}/api/lesson-content/${lessonId}/content`,
    scoring: (lessonId: string) => `${API_BASE_URL}/api/lesson-content/${lessonId}/scoring`,
    updateScoring: (lessonId: string) => `${API_BASE_URL}/api/lesson-content/${lessonId}/scoring`,
  },

  // Lesson Review (Admin)
  lessonReviews: {
    pending: `${API_BASE_URL}/api/lesson-reviews/pending`,
    list: `${API_BASE_URL}/api/lesson-reviews`,
    detail: (lessonId: string) => `${API_BASE_URL}/api/lesson-reviews/${lessonId}`,
    approve: (lessonId: string) => `${API_BASE_URL}/api/lesson-reviews/${lessonId}/approve`,
    reject: (lessonId: string) => `${API_BASE_URL}/api/lesson-reviews/${lessonId}/reject`,
    publish: (lessonId: string) => `${API_BASE_URL}/api/lesson-reviews/${lessonId}/publish`,
    batchApprove: `${API_BASE_URL}/api/lesson-reviews/batch/approve`,
    batchPublish: `${API_BASE_URL}/api/lesson-reviews/batch/publish`,
  },

  // AI
  ai: {
    generateHints: `${API_BASE_URL}/api/ai/generate-hints`,
    chat: `${API_BASE_URL}/api/ai/chat`,
    conversations: `${API_BASE_URL}/api/ai/conversations`,
    conversation: (id: string) => `${API_BASE_URL}/api/ai/conversations/${id}`,
    conversationMessages: (id: string) => `${API_BASE_URL}/api/ai/conversations/${id}/messages`,
  },

  // Scoring
  scoring: {
    run: `${API_BASE_URL}/api/scoring/run`,
    submit: `${API_BASE_URL}/api/scoring/submit`,
    submissions: (lessonId: string) => `${API_BASE_URL}/api/scoring/submissions/${lessonId}`,
    detail: (submissionId: string) => `${API_BASE_URL}/api/scoring/submission/${submissionId}`,
  },

  // User Dashboard Stats
  stats: {
    scoreBreakdown: `${API_BASE_URL}/api/stats/score-breakdown`,
    loginDays: `${API_BASE_URL}/api/stats/login-days`,
    weeklyActivity: `${API_BASE_URL}/api/stats/weekly-activity`,
    globalRank: `${API_BASE_URL}/api/stats/global-rank`,
    evaluation: `${API_BASE_URL}/api/stats/evaluation`,
    enrolledCourses: `${API_BASE_URL}/api/stats/enrolled-courses`,
    globalLeaderboard: `${API_BASE_URL}/api/stats/global-leaderboard`,
    systemStats: `${API_BASE_URL}/api/stats/system`,
  },
};

export default API_ENDPOINTS;

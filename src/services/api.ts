import { API_ENDPOINTS } from '@/config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const isValidToken = token && token !== 'undefined' && token !== 'null' && token.length > 20;
    return {
      'Content-Type': 'application/json',
      ...(isValidToken && { Authorization: `Bearer ${token}` }),
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data?.message || `HTTP ${response.status}: Request failed`,
          data: undefined,
          statusCode: response.status,
        };
      }
      return { ...data, statusCode: response.status };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Network error',
        data: undefined,
        statusCode: 0,
      };
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data?.message || `HTTP ${response.status}: Request failed`,
          data: undefined,
          statusCode: response.status,
        };
      }
      return { ...data, statusCode: response.status };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Network error',
        data: undefined,
        statusCode: 0,
      };
    }
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data?.message || `HTTP ${response.status}: Request failed`,
          data: undefined,
          statusCode: response.status,
        };
      }
      return { ...data, statusCode: response.status };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Network error',
        data: undefined,
        statusCode: 0,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data?.message || `HTTP ${response.status}: Request failed`,
          data: undefined,
          statusCode: response.status,
        };
      }
      return { ...data, statusCode: response.status };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Network error',
        data: undefined,
        statusCode: 0,
      };
    }
  }

  async uploadImage(endpoint: string, file: File, folder?: string): Promise<ApiResponse<{ url: string; fileId: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);

    const token = localStorage.getItem('token');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ============ AUTH SERVICE ============
export const authService = {
  login: (email: string, password: string) =>
    apiClient.post(API_ENDPOINTS.auth.login, { email, password }),

  register: (email: string, username: string, password: string) =>
    apiClient.post(API_ENDPOINTS.auth.register, { email, username, password }),

  getMe: () => apiClient.get(API_ENDPOINTS.auth.me),

  refreshToken: (refreshToken: string) =>
    apiClient.post(API_ENDPOINTS.auth.refreshToken, { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post(API_ENDPOINTS.auth.resetPassword, { token, newPassword }),
};

// ============ COURSE SERVICE ============
export const courseService = {
  getAll: () => apiClient.get(API_ENDPOINTS.courses.list),

  getById: (id: string) => apiClient.get(API_ENDPOINTS.courses.detail(id)),

  enroll: (courseId: string) =>
    apiClient.post(API_ENDPOINTS.courses.enroll, { courseId }),
};

// ============ ENROLLMENT SERVICE ============
export const enrollmentService = {
  getMyEnrollments: () => apiClient.get(API_ENDPOINTS.enrollments.my),

  getById: (id: string) => apiClient.get(API_ENDPOINTS.enrollments.detail(id)),
};

// ============ LESSON PROGRESS SERVICE ============
export const lessonProgressService = {
  complete: (lessonId: string, courseId: string) =>
    apiClient.post(API_ENDPOINTS.lessonProgress.complete, { lessonId, courseId }),

  getCourseProgress: (courseId: string) =>
    apiClient.get(API_ENDPOINTS.lessonProgress.courseProgress(courseId)),
};

// ============ SUBMISSION SERVICE ============
export const submissionService = {
  submit: (problemId: string, code: string, language: string) =>
    apiClient.post(API_ENDPOINTS.submissions.submit, { problemId, code, language }),

  run: (problemId: string, code: string, language: string) =>
    apiClient.post(API_ENDPOINTS.submissions.run, { problemId, code, language }),

  getHistory: () => apiClient.get(API_ENDPOINTS.submissions.history),

  getById: (id: string) => apiClient.get(API_ENDPOINTS.submissions.detail(id)),
};

// ============ PROBLEM SERVICE ============
export const problemService = {
  getAll: () => apiClient.get(API_ENDPOINTS.problems.list),

  getById: (id: string) => apiClient.get(API_ENDPOINTS.problems.detail(id)),

  getTestcases: (id: string) => apiClient.get(API_ENDPOINTS.problems.testcases(id)),
};

// ============ HACKATHON SERVICE ============
export const hackathonService = {
  getAll: () => apiClient.get(API_ENDPOINTS.hackathons.list),

  getActive: () => apiClient.get(API_ENDPOINTS.hackathons.active),

  getUpcoming: () => apiClient.get(API_ENDPOINTS.hackathons.upcoming),

  getEnded: () => apiClient.get(API_ENDPOINTS.hackathons.ended),

  getRegistered: () => apiClient.get(API_ENDPOINTS.hackathons.registered),

  getById: (id: string) => apiClient.get(API_ENDPOINTS.hackathons.detail(id)),

  join: (id: string, teamName?: string) =>
    apiClient.post(API_ENDPOINTS.hackathons.join(id), { teamName }),

  getLeaderboard: (id: string) =>
    apiClient.get(API_ENDPOINTS.hackathons.leaderboard(id)),

  getParticipants: (id: string) =>
    apiClient.get(API_ENDPOINTS.hackathons.participants(id)),

  submit: (id: string, code: string, language: string) =>
    apiClient.post(API_ENDPOINTS.hackathons.submit(id), { code, language }),

  getProblems: (id: string) =>
    apiClient.get(API_ENDPOINTS.hackathons.problems(id)),

  runProblem: (id: string, problemId: string, code: string, language: string) =>
    apiClient.post(API_ENDPOINTS.hackathons.runProblem(id), { problemId, code, language }),

  submitProblem: (id: string, problemId: string, code: string, language: string) =>
    apiClient.post(API_ENDPOINTS.hackathons.submitProblem(id), { problemId, code, language }),
};

// ============ PROJECT SERVICE ============
export const projectService = {
  getAll: () => apiClient.get(API_ENDPOINTS.projects.list),

  getById: (id: string) => apiClient.get(API_ENDPOINTS.projects.detail(id)),

  submit: (projectId: string, submissionUrl: string, description: string) =>
    apiClient.post(API_ENDPOINTS.projects.submit, { projectId, submissionUrl, description }),
};

// ============ MINITEST SERVICE ============
export const minitestService = {
  getAll: () => apiClient.get(API_ENDPOINTS.minitests.list),

  getById: (id: string) => apiClient.get(API_ENDPOINTS.minitests.detail(id)),

  submit: (minitestId: string, answers: Record<string, string>) =>
    apiClient.post(API_ENDPOINTS.minitests.submit, { minitestId, answers }),

  getResult: (id: string) => apiClient.get(API_ENDPOINTS.minitests.result(id)),
};

// ============ CERTIFICATE SERVICE ============
export const certificateService = {
  getMyCertificates: () => apiClient.get(API_ENDPOINTS.certificates.my),

  verify: (code: string) => apiClient.get(API_ENDPOINTS.certificates.verify(code)),
};

// ============ UPLOAD SERVICE ============
export const uploadService = {
  uploadImage: (file: File, folder?: string) =>
    apiClient.uploadImage(API_ENDPOINTS.upload.image, file, folder),

  uploadImages: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    if (folder) formData.append('folder', folder);

    const token = localStorage.getItem('token');
    return fetch(API_ENDPOINTS.upload.images, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then((res) => res.json());
  },
};

// ============ PROFILE SERVICE ============
export const profileService = {
  update: (data: { username?: string; bio?: string; avatar?: string }) =>
    apiClient.put(API_ENDPOINTS.profile.update, data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post(API_ENDPOINTS.profile.changePassword, { currentPassword, newPassword }),
};

// ============ NOTIFICATION SERVICE ============
export const notificationService = {
  getAll: () => apiClient.get(API_ENDPOINTS.notifications.list),

  markAsRead: (id: string) =>
    apiClient.post(API_ENDPOINTS.notifications.read(id), {}),

  markAllAsRead: () => apiClient.post(API_ENDPOINTS.notifications.readAll, {}),
};

// ============ FEEDBACK SERVICE ============
export const feedbackService = {
  create: (data: { type: string; content: string; targetId?: string }) =>
    apiClient.post(API_ENDPOINTS.feedback.create, data),

  getAll: () => apiClient.get(API_ENDPOINTS.feedback.list),
};

export default apiClient;

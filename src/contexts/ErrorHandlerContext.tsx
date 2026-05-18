import { createContext, useContext, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type HttpStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500 | 502 | 503;

export interface ErrorInfo {
  code: HttpStatus;
  message?: string;
  detail?: string;
}

interface ErrorHandlerContextType {
  handleError: (error: ErrorInfo) => void;
  handle401: (message?: string) => void;
  handle403: (message?: string) => void;
  handle404: (message?: string) => void;
  handle500: (message?: string) => void;
  handleUnknown: (message?: string) => void;
}

const ErrorHandlerContext = createContext<ErrorHandlerContextType | undefined>(undefined);

export function getErrorRoute(code: HttpStatus): string {
  return `/error/${code}`;
}

export function ErrorHandlerProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);
  const lastErrorRef = useRef<string | null>(null);

  const handleError = useCallback(
    (error: ErrorInfo) => {
      const route = `/error/${error.code}`;
      const stateKey = `${error.code}-${error.message || ''}`;

      if (
        isNavigatingRef.current ||
        (location.pathname.startsWith('/error/') && lastErrorRef.current === stateKey)
      ) {
        return;
      }

      isNavigatingRef.current = true;
      lastErrorRef.current = stateKey;

      navigate(route, {
        state: {
          fromError: true,
          errorMessage: error.message,
          errorDetail: error.detail,
          originalPath: location.pathname,
        },
      });

      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1500);
    },
    [navigate, location.pathname]
  );

  const handle401 = useCallback(
    (message?: string) => handleError({ code: 401, message }),
    [handleError]
  );

  const handle403 = useCallback(
    (message?: string) => handleError({ code: 403, message }),
    [handleError]
  );

  const handle404 = useCallback(
    (message?: string) => handleError({ code: 404, message }),
    [handleError]
  );

  const handle500 = useCallback(
    (message?: string) => handleError({ code: 500, message }),
    [handleError]
  );

  const handleUnknown = useCallback(
    (message?: string) => handleError({ code: 500, message: message || 'Đã xảy ra lỗi không xác định' }),
    [handleError]
  );

  return (
    <ErrorHandlerContext.Provider
      value={{ handleError, handle401, handle403, handle404, handle500, handleUnknown }}
    >
      {children}
    </ErrorHandlerContext.Provider>
  );
}

export function useErrorHandler(): ErrorHandlerContextType {
  const context = useContext(ErrorHandlerContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorHandlerProvider');
  }
  return context;
}

/**
 * Hook for pages to handle API errors and navigate to error pages.
 * Automatically detects HTTP status code from API response.
 *
 * Usage:
 *   const { handleApiError } = useApiErrorHandler();
 *   const res = await authService.getMe();
 *   if (!res.success) handleApiError(res);
 */
export function useApiErrorHandler() {
  const { handleError } = useErrorHandler();

  const handleApiError = useCallback(
    (response: { success: boolean; statusCode?: number; message?: string }) => {
      if (response.success) return;

      const statusCode = response.statusCode ?? 500;
      const code = statusCode as HttpStatus;

      if ([400, 401, 403, 404, 409, 422, 500, 502, 503].includes(code)) {
        handleError({ code, message: response.message });
      } else {
        handleError({ code: 500, message: response.message });
      }
    },
    [handleError]
  );

  return { handleApiError };
}

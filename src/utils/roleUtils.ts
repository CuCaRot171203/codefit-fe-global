/**
 * Auth Role Utilities
 * Normalize and validate user roles across the application.
 */

export type AppRole = 'admin' | 'lecture' | 'user';

/**
 * Normalize raw role from backend to canonical AppRole.
 * Backend may return 'roleName' field with values like 'admin', 'lecture', 'user'.
 */
export function normalizeRole(rawRole: string | undefined | null): AppRole {
  if (!rawRole) return 'user';
  const lower = rawRole.toLowerCase().trim();
  if (lower === 'admin' || lower === 'lecture') return lower as AppRole;
  return 'user';
}

/**
 * Get the default redirect path for a given role.
 */
export function getRoleDefaultPath(role: AppRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'lecture':
      return '/lecture';
    case 'user':
    default:
      return '/user/dashboard';
  }
}

/**
 * Check if a role is allowed to access a route prefix.
 */
export function canAccessRoute(role: AppRole, routePrefix: string): boolean {
  if (routePrefix.startsWith('/admin')) return role === 'admin';
  if (routePrefix.startsWith('/lecture')) return role === 'lecture';
  if (routePrefix.startsWith('/user')) return role === 'user';
  return true;
}

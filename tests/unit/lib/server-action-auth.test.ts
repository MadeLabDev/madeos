import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest';

import { checkPermission,requirePermission } from '@/lib/permissions';

/**
 * Unit tests for Server Action Authorization
 * 
 * Tests the requirePermission function which validates permissions
 * before allowing Server Actions to execute
 */

// Mock next-auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/lib/auth';

describe('Server Action Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('should return allowed=true when user has permission', async () => {
      // Mock session with permissions
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@test.com',
          name: 'Test User',
          permissions: {
            users: ['read', 'update'],
            customers: ['read'],
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await checkPermission('users', 'read');

      expect(result.allowed).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('user@test.com');
    });

    it('should return allowed=false when user lacks permission', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@test.com',
          permissions: {
            users: ['read', 'update'], // NO create/delete
            customers: ['read'],
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(mockSession as any);

      // User tries to create (not in permissions list)
      const result = await checkPermission('users', 'create');

      expect(result.allowed).toBe(false);
      expect(result.user).toBeUndefined();
    });

    it('should return allowed=false when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await checkPermission('users', 'read');

      expect(result.allowed).toBe(false);
      expect(result.user).toBeUndefined();
    });

    it('should return allowed=false when module does not exist in permissions', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@test.com',
          permissions: {
            orders: ['read', 'create'], // NO users module
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await checkPermission('users', 'read');

      expect(result.allowed).toBe(false);
    });

    it('should return allowed=false when permissions object is empty', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@test.com',
          permissions: {}, // Empty permissions
        },
      };

      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await checkPermission('users', 'read');

      expect(result.allowed).toBe(false);
    });

    it('should return allowed=false when permissions is undefined', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@test.com',
          // permissions undefined
        },
      };

      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const result = await checkPermission('users', 'read');

      expect(result.allowed).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('should return user when permission is allowed', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@test.com',
          name: 'Admin',
          permissions: {
            users: ['read', 'create', 'update', 'delete'],
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(mockSession as any);

      const user = await requirePermission('users', 'create');

      expect(user).toBeDefined();
      expect(user.id).toBe('user-1');
      expect(user.email).toBe('admin@test.com');
    });

    it('should throw error when permission is denied', async () => {
      const mockSession = {
        user: {
          id: 'user-2',
          email: 'sales@test.com',
          permissions: {
            users: ['read', 'update'], // NO delete
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(mockSession as any);

      // Should throw error when trying to delete
      await expect(requirePermission('users', 'delete')).rejects.toThrow(
        /Insufficient permissions/i
      );
    });

    it('should throw error when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      await expect(requirePermission('users', 'read')).rejects.toThrow(
        /Insufficient permissions/i
      );
    });

    it('should throw error with specific module and action in message', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@test.com',
          permissions: {
            orders: ['read'], // No users permissions
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(mockSession as any);

      await expect(requirePermission('users', 'delete')).rejects.toThrow(
        /delete.*users/i
      );
    });
  });

  describe('Permission Scenarios', () => {
    it('User can read and update but not create/delete', async () => {
      const userSession = {
        user: {
          id: 'user-1',
          email: 'user@test.com',
          permissions: {
            users: ['read', 'update'],
            customers: ['read', 'update'],
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(userSession as any);

      // Should succeed
      expect(
        (await checkPermission('users', 'read')).allowed
      ).toBe(true);
      expect(
        (await checkPermission('users', 'update')).allowed
      ).toBe(true);

      // Should fail
      expect(
        (await checkPermission('users', 'create')).allowed
      ).toBe(false);
      expect(
        (await checkPermission('users', 'delete')).allowed
      ).toBe(false);
    });

    it('Manager user can do everything on their modules', async () => {
      const managerSession = {
        user: {
          id: 'manager-1',
          email: 'manager@test.com',
          permissions: {
            users: ['read', 'create', 'update', 'delete'],
            orders: ['read', 'create', 'update', 'delete'],
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(managerSession as any);

      // All should succeed
      const actions = ['read', 'create', 'update', 'delete'];
      for (const action of actions) {
        const result = await checkPermission('users', action);
        expect(result.allowed).toBe(true);
      }
    });

    it('Viewer user can only read', async () => {
      const viewerSession = {
        user: {
          id: 'viewer-1',
          email: 'viewer@test.com',
          permissions: {
            users: ['read'],
            orders: ['read'],
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(viewerSession as any);

      // Only read should succeed
      expect(
        (await checkPermission('users', 'read')).allowed
      ).toBe(true);
      expect(
        (await checkPermission('users', 'create')).allowed
      ).toBe(false);
      expect(
        (await checkPermission('users', 'update')).allowed
      ).toBe(false);
      expect(
        (await checkPermission('users', 'delete')).allowed
      ).toBe(false);
    });
  });

  describe('Multi-module Permission Scenarios', () => {
    it('User with different permissions on different modules', async () => {
      const mixedSession = {
        user: {
          id: 'mixed-1',
          email: 'mixed@test.com',
          permissions: {
            users: ['read', 'update'], // Limited
            orders: ['read', 'create', 'update', 'delete'], // Full
            reports: ['read'], // Read-only
          },
        },
      };

      vi.mocked(auth).mockResolvedValue(mixedSession as any);

      // Users: read/update only
      expect(
        (await checkPermission('users', 'read')).allowed
      ).toBe(true);
      expect(
        (await checkPermission('users', 'delete')).allowed
      ).toBe(false);

      // Orders: full access
      expect(
        (await checkPermission('orders', 'create')).allowed
      ).toBe(true);
      expect(
        (await checkPermission('orders', 'delete')).allowed
      ).toBe(true);

      // Reports: read only
      expect(
        (await checkPermission('reports', 'read')).allowed
      ).toBe(true);
      expect(
        (await checkPermission('reports', 'create')).allowed
      ).toBe(false);
    });
  });
});

import { describe, expect,it } from 'vitest';

import {
  getAccessibleModules,
  getModulePermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
  isAdmin,
  isManager,
} from '@/lib/permissions';

describe('Permission System - Unit Tests', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    roles: [
      { id: '1', name: 'sales', displayName: 'Sales Staff' },
      { id: '2', name: 'designer', displayName: 'Designer' },
    ],
    permissions: {
      orders: ['read', 'create', 'update'],
      customers: ['read', 'create'],
      inventory: ['read'],
    },
  };

  describe('hasPermission', () => {
    it('should return true when user has exact permission', () => {
      const user = {
        permissions: {
          orders: ['read', 'create'],
        },
      };

      expect(hasPermission(user, 'orders', 'read')).toBe(true);
      expect(hasPermission(user, 'orders', 'create')).toBe(true);
    });

    it('should return false when user lacks permission', () => {
      const user = {
        permissions: {
          orders: ['read'],
        },
      };

      expect(hasPermission(user, 'orders', 'delete')).toBe(false);
      expect(hasPermission(user, 'orders', 'update')).toBe(false);
    });

    it('should return false for non-existent module', () => {
      const user = {
        permissions: {
          orders: ['read'],
        },
      };

      expect(hasPermission(user, 'settings', 'read')).toBe(false);
      expect(hasPermission(user, 'customers', 'create')).toBe(false);
    });

    it('should handle empty permissions object', () => {
      const user = {
        permissions: {},
      };

      expect(hasPermission(user, 'orders', 'read')).toBe(false);
    });

    it('should handle user without permissions property', () => {
      const user = {} as any;

      expect(hasPermission(user, 'orders', 'read')).toBe(false);
    });

    it('should handle multiple permissions on same module', () => {
      const user = {
        permissions: {
          orders: ['read', 'create', 'update', 'delete'],
        },
      };

      expect(hasPermission(user, 'orders', 'read')).toBe(true);
      expect(hasPermission(user, 'orders', 'create')).toBe(true);
      expect(hasPermission(user, 'orders', 'update')).toBe(true);
      expect(hasPermission(user, 'orders', 'delete')).toBe(true);
      expect(hasPermission(user, 'orders', 'approve')).toBe(false);
    });

    it('should return false when user is null or undefined', () => {
      expect(hasPermission(null, 'orders', 'read')).toBe(false);
      expect(hasPermission(undefined, 'orders', 'read')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one permission', () => {
      expect(hasAnyPermission(mockUser, 'orders', ['read', 'delete'])).toBe(true);
      expect(hasAnyPermission(mockUser, 'customers', ['delete', 'create'])).toBe(true);
    });

    it('should return false when user has none of the permissions', () => {
      expect(hasAnyPermission(mockUser, 'orders', ['delete', 'approve'])).toBe(false);
      expect(hasAnyPermission(mockUser, 'settings', ['read', 'update'])).toBe(false);
    });

    it('should return false when permissions array is empty', () => {
      expect(hasAnyPermission(mockUser, 'orders', [])).toBe(false);
    });

    it('should return false when user is null or undefined', () => {
      expect(hasAnyPermission(null, 'orders', ['read'])).toBe(false);
      expect(hasAnyPermission(undefined, 'orders', ['read'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      expect(hasAllPermissions(mockUser, 'orders', ['read', 'create'])).toBe(true);
    });

    it('should return false when user lacks any permission', () => {
      expect(hasAllPermissions(mockUser, 'orders', ['read', 'delete'])).toBe(false);
      expect(hasAllPermissions(mockUser, 'customers', ['read', 'create', 'update'])).toBe(false);
    });

    it('should return true when checking empty permissions array', () => {
      expect(hasAllPermissions(mockUser, 'orders', [])).toBe(true);
    });

    it('should return false when user is null or undefined', () => {
      expect(hasAllPermissions(null, 'orders', ['read'])).toBe(false);
      expect(hasAllPermissions(undefined, 'orders', ['read'])).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      expect(hasRole(mockUser, 'sales')).toBe(true);
      expect(hasRole(mockUser, 'designer')).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      expect(hasRole(mockUser, 'admin')).toBe(false);
      expect(hasRole(mockUser, 'manager')).toBe(false);
    });

    it('should return false when user is null or undefined', () => {
      expect(hasRole(null, 'admin')).toBe(false);
      expect(hasRole(undefined, 'admin')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(hasRole(mockUser, 'Sales')).toBe(false);
      expect(hasRole(mockUser, 'SALES')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has at least one role', () => {
      expect(hasAnyRole(mockUser, ['admin', 'sales'])).toBe(true);
      expect(hasAnyRole(mockUser, ['manager', 'designer'])).toBe(true);
    });

    it('should return false when user has none of the roles', () => {
      expect(hasAnyRole(mockUser, ['admin', 'manager'])).toBe(false);
      expect(hasAnyRole(mockUser, ['finance', 'packer'])).toBe(false);
    });

    it('should return false when roles array is empty', () => {
      expect(hasAnyRole(mockUser, [])).toBe(false);
    });

    it('should return false when user is null or undefined', () => {
      expect(hasAnyRole(null, ['admin'])).toBe(false);
      expect(hasAnyRole(undefined, ['admin'])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true when user has admin role', () => {
      const adminUser = { ...mockUser, roles: [{ id: '3', name: 'admin', displayName: 'Admin' }] };
      expect(isAdmin(adminUser)).toBe(true);
    });

    it('should return false when user does not have admin role', () => {
      expect(isAdmin(mockUser)).toBe(false);
    });

    it('should return false when user is null or undefined', () => {
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('isManager', () => {
    it('should return true when user has manager role', () => {
      const managerUser = { ...mockUser, roles: [{ id: '3', name: 'manager', displayName: 'Manager' }] };
      expect(isManager(managerUser)).toBe(true);
    });

    it('should return false when user does not have manager role', () => {
      expect(isManager(mockUser)).toBe(false);
    });

    it('should return false when user is null or undefined', () => {
      expect(isManager(null)).toBe(false);
      expect(isManager(undefined)).toBe(false);
    });
  });

  describe('getModulePermissions', () => {
    it('should return permissions for a module', () => {
      expect(getModulePermissions(mockUser, 'orders')).toEqual(['read', 'create', 'update']);
      expect(getModulePermissions(mockUser, 'customers')).toEqual(['read', 'create']);
    });

    it('should return empty array for non-existent module', () => {
      expect(getModulePermissions(mockUser, 'settings')).toEqual([]);
    });

    it('should return empty array when user is null or undefined', () => {
      expect(getModulePermissions(null, 'orders')).toEqual([]);
      expect(getModulePermissions(undefined, 'orders')).toEqual([]);
    });

    it('should return empty array when user has no permissions', () => {
      const userNoPerms = { ...mockUser, permissions: {} };
      expect(getModulePermissions(userNoPerms, 'orders')).toEqual([]);
    });
  });

  describe('getAccessibleModules', () => {
    it('should return all modules user has access to', () => {
      const modules = getAccessibleModules(mockUser);
      expect(modules).toContain('orders');
      expect(modules).toContain('customers');
      expect(modules).toContain('inventory');
      expect(modules.length).toBe(3);
    });

    it('should return empty array when user is null or undefined', () => {
      expect(getAccessibleModules(null)).toEqual([]);
      expect(getAccessibleModules(undefined)).toEqual([]);
    });

    it('should return empty array when user has no permissions', () => {
      const userNoPerms = { ...mockUser, permissions: {} };
      expect(getAccessibleModules(userNoPerms)).toEqual([]);
    });
  });
});

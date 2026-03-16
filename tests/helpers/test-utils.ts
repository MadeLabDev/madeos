import * as bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

import { PrismaClient } from "@/generated/prisma/client";

let prisma: PrismaClient;

export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * Test data generators
 */
export const testDataGenerators = {
  user: (overrides = {}) => ({
    email: `test-${uuid().slice(0, 8)}@example.com`,
    name: "Test User",
    image: null,
    isActive: true,
    emailVerified: new Date(),
    ...overrides,
  }),

  role: (overrides = {}) => ({
    name: `role-${uuid().slice(0, 8)}`,
    displayName: "Test Role",
    description: "Test role for testing",
    ...overrides,
  }),

  pantone: (overrides = {}) => ({
    pantoneCode: `PMS-${Math.floor(Math.random() * 10000)}`,
    name: `Color-${uuid().slice(0, 8)}`,
    hex: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
    supplier: "Test Supplier",
    supplierCode: `SUP-${uuid().slice(0, 6)}`,
    ...overrides,
  }),

  module: (overrides = {}) => ({
    name: `module-${uuid().slice(0, 8)}`,
    displayName: "Test Module",
    description: "Test module for testing",
    ...overrides,
  }),

  permission: (overrides = {}) => ({
    action: `action-${uuid().slice(0, 8)}`,
    displayName: "Test Action",
    ...overrides,
  }),
};

/**
 * Database test utilities
 */
export const dbUtils = {
  /**
   * Create a test user with role assignment
   */
  async createTestUser(roleNames: string[] = ["admin"], userOverrides = {}) {
    const prisma = getPrismaClient();
    const userData = testDataGenerators.user(userOverrides);

    const hashedPassword = await bcrypt.hash("password123", 10);

    // First create the user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    // Then assign roles
    for (const roleName of roleNames) {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }

    // Return user with roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    module: true,
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return userWithRoles;
  },

  /**
   * Create a test role with permissions
   */
  async createTestRole(
    permissionData: { moduleName: string; actionName: string }[] = []
  ) {
    const prisma = getPrismaClient();
    const roleData = testDataGenerators.role();

    const role = await prisma.role.create({
      data: roleData,
    });

    // Add permissions
    for (const perm of permissionData) {
      let moduleRecord = await prisma.module.findUnique({
        where: { name: perm.moduleName },
      });

      if (!moduleRecord) {
        moduleRecord = await prisma.module.create({
          data: testDataGenerators.module({
            name: perm.moduleName,
          }),
        });
      }

      let permission = await prisma.permission.findUnique({
        where: { action: perm.actionName },
      });

      if (!permission) {
        permission = await prisma.permission.create({
          data: testDataGenerators.permission({
            action: perm.actionName,
          }),
        });
      }

      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          moduleId: module.id,
          permissionId: permission.id,
        },
      });
    }

    // Return role with permissions
    const roleWithPerms = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        rolePermissions: {
          include: {
            module: true,
            permission: true,
          },
        },
      },
    });

    return roleWithPerms;
  },

  /**
   * Create a test pantone
   */
  async createTestPantone(overrides = {}) {
    const prisma = getPrismaClient();
    const pantoneData = testDataGenerators.pantone(overrides);

    const pantone = await prisma.pantone.create({
      data: pantoneData,
    });

    return pantone;
  },

  /**
   * Create necessary modules and permissions for testing
   */
  async seedModulesAndPermissions() {
    const prisma = getPrismaClient();

    const modules = [
      { name: "users", displayName: "Users" },
      { name: "roles", displayName: "Roles" },
      { name: "pantones", displayName: "Pantones" },
      { name: "orders", displayName: "Orders" },
    ];

    const permissions = [
      { action: "read", displayName: "Read" },
      { action: "create", displayName: "Create" },
      { action: "update", displayName: "Update" },
      { action: "delete", displayName: "Delete" },
    ];

    for (const mod of modules) {
      await prisma.module.upsert({
        where: { name: mod.name },
        update: {},
        create: mod,
      });
    }

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { action: perm.action },
        update: {},
        create: perm,
      });
    }
  },

  /**
   * Clean up all test data
   */
  async cleanup() {
    const prisma = getPrismaClient();

    // Delete in order of dependencies
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.module.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.pantone.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.activityLog.deleteMany();
  },

  /**
   * Get user with full permission data
   */
  async getUserWithPermissions(userId: string) {
    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    module: true,
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    // Build permission matrix
    const permissions: Record<string, string[]> = {};

    user.userRoles.forEach((userRole) => {
      userRole.role.rolePermissions.forEach((rp) => {
        const moduleName = rp.module.name;
        const actionName = rp.permission.action;

        if (!permissions[moduleName]) {
          permissions[moduleName] = [];
        }

        if (!permissions[moduleName].includes(actionName)) {
          permissions[moduleName].push(actionName);
        }
      });
    });

    return {
      ...user,
      permissions,
    };
  },
};

/**
 * Authentication test utilities
 */
export const authUtils = {
  /**
   * Create mock session
   */
  createMockSession(user: any) {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        roles: user.userRoles || [],
        permissions: user.permissions || {},
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  /**
   * Create mock user
   */
  createMockUser(overrides = {}) {
    return {
      id: uuid(),
      email: `test-${uuid().slice(0, 8)}@example.com`,
      name: "Test User",
      image: null,
      userRoles: [],
      permissions: {},
      ...overrides,
    };
  },
};

/**
 * Assertion helpers
 */
export const assertUtils = {
  /**
   * Assert user has permission
   */
  assertHasPermission(user: any, moduleName: string, actionName: string) {
    if (!user.permissions[moduleName]?.includes(actionName)) {
      throw new Error(
        `User missing permission: ${moduleName}:${actionName}. Has: ${JSON.stringify(user.permissions)}`
      );
    }
  },

  /**
   * Assert user lacks permission
   */
  assertLacksPermission(user: any, moduleName: string, actionName: string) {
    if (user.permissions[moduleName]?.includes(actionName)) {
      throw new Error(
        `User should not have permission: ${moduleName}:${actionName}`
      );
    }
  },

  /**
   * Assert user has role
   */
  assertHasRole(user: any, roleName: string) {
    const hasRole = user.userRoles?.some(
      (ur: any) => ur.role?.name === roleName
    );

    if (!hasRole) {
      const roles = user.userRoles
        ?.map((ur: any) => ur.role?.name)
        .join(", ");
      throw new Error(
        `User should have role: ${roleName}. Has: ${roles || "none"}`
      );
    }
  },

  /**
   * Assert data integrity
   */
  async assertDataIntegrity() {
    const prisma = getPrismaClient();

    // Check for orphaned UserRoles (should not happen with CASCADE)
    const orphanedUserRoles = await prisma.userRole.findMany();
    for (const ur of orphanedUserRoles) {
      const user = await prisma.user.findUnique({
        where: { id: ur.userId },
      });
      const role = await prisma.role.findUnique({
        where: { id: ur.roleId },
      });

      if (!user || !role) {
        throw new Error(
          `Found orphaned UserRole: userId=${ur.userId}, roleId=${ur.roleId}`
        );
      }
    }

    // Check for orphaned RolePermissions
    const orphanedRolePerms = await prisma.rolePermission.findMany();
    for (const rp of orphanedRolePerms) {
      const role = await prisma.role.findUnique({
        where: { id: rp.roleId },
      });
      const moduleRecord = await prisma.module.findUnique({
        where: { id: rp.moduleId },
      });
      const permission = await prisma.permission.findUnique({
        where: { id: rp.permissionId },
      });

      if (!role || !module || !permission) {
        throw new Error(
          `Found orphaned RolePermission: roleId=${rp.roleId}, moduleId=${rp.moduleId}, permissionId=${rp.permissionId}`
        );
      }
    }
  },
};

/**
 * Response assertion helpers
 */
export const responseUtils = {
  /**
   * Assert successful response
   */
  assertSuccess(result: any, expectedData?: any) {
    if (!result || !result.success) {
      throw new Error(
        `Expected successful response but got: ${JSON.stringify(result)}`
      );
    }

    if (expectedData && result.data) {
      Object.entries(expectedData).forEach(([key, value]) => {
        if ((result.data as any)[key] !== value) {
          throw new Error(
            `Expected ${key}=${value} but got ${(result.data as any)[key]}`
          );
        }
      });
    }

    return result.data;
  },

  /**
   * Assert failed response
   */
  assertFailure(result: any, expectedMessage?: string) {
    if (!result || result.success) {
      throw new Error(
        `Expected failed response but got: ${JSON.stringify(result)}`
      );
    }

    if (expectedMessage && !result.message?.includes(expectedMessage)) {
      throw new Error(
        `Expected message "${expectedMessage}" but got "${result.message}"`
      );
    }

    return result;
  },
};

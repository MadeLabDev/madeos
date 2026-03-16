import { prisma } from "@/lib/prisma";

import { Module, Permission, RolePermission } from "../types/permission.types";

/**
 * MODULE OPERATIONS
 */

export async function findModuleById(id: string): Promise<Module | null> {
	return prisma.module.findUnique({ where: { id } });
}

export async function findModuleByName(name: string): Promise<Module | null> {
	return prisma.module.findUnique({ where: { name } });
}

export async function findAllModules(): Promise<Module[]> {
	return prisma.module.findMany({
		orderBy: { name: "asc" },
	});
}

export async function createModule(data: { name: string; displayName: string; description?: string }): Promise<Module> {
	const existing = await findModuleByName(data.name);
	if (existing) {
		throw new Error(`Module "${data.name}" already exists`);
	}

	return prisma.module.create({
		data: {
			name: data.name.toLowerCase(),
			displayName: data.displayName,
			description: data.description || null,
		},
	});
}

export async function updateModule(id: string, data: { displayName?: string; description?: string }): Promise<Module> {
	const moduleRecord = await findModuleById(id);
	if (!moduleRecord) throw new Error("Module not found");

	return prisma.module.update({
		where: { id },
		data,
	});
}

export async function deleteModule(id: string): Promise<void> {
	const moduleRecord = await findModuleById(id);
	if (!moduleRecord) throw new Error("Module not found");

	// Check if module has permissions assigned
	const count = await prisma.rolePermission.count({
		where: { moduleId: id },
	});

	if (count > 0) {
		throw new Error("Cannot delete module with assigned permissions");
	}

	await prisma.module.delete({ where: { id } });
}

/**
 * PERMISSION OPERATIONS
 */

export async function findPermissionById(id: string): Promise<Permission | null> {
	return prisma.permission.findUnique({ where: { id } });
}

export async function findPermissionByAction(action: string): Promise<Permission | null> {
	return prisma.permission.findUnique({ where: { action } });
}

export async function findAllPermissions(): Promise<Permission[]> {
	return prisma.permission.findMany({
		orderBy: { action: "asc" },
	});
}

export async function createPermission(data: { action: string; displayName: string; description?: string }): Promise<Permission> {
	const existing = await findPermissionByAction(data.action);
	if (existing) {
		throw new Error(`Permission "${data.action}" already exists`);
	}

	return prisma.permission.create({
		data: {
			action: data.action.toLowerCase(),
			displayName: data.displayName,
			description: data.description || null,
		},
	});
}

export async function deletePermission(id: string): Promise<void> {
	const permission = await findPermissionById(id);
	if (!permission) throw new Error("Permission not found");

	// Check if permission is assigned to roles
	const count = await prisma.rolePermission.count({
		where: { permissionId: id },
	});

	if (count > 0) {
		throw new Error("Cannot delete permission with role assignments");
	}

	await prisma.permission.delete({ where: { id } });
}

/**
 * ROLE PERMISSION OPERATIONS
 */

export async function findRolePermissions(roleId: string): Promise<RolePermission[]> {
	return prisma.rolePermission.findMany({
		where: { roleId },
		include: {
			module: true,
			permission: true,
		},
	});
}

export async function findModulePermissions(moduleId: string): Promise<RolePermission[]> {
	return prisma.rolePermission.findMany({
		where: { moduleId },
		include: {
			role: true,
			permission: true,
		},
	});
}

export async function findRoleModulePermissions(roleId: string, moduleId: string): Promise<Permission[]> {
	const permissions = await prisma.rolePermission.findMany({
		where: { roleId, moduleId },
		include: { permission: true },
	});

	return permissions.map((rp) => rp.permission);
}

export async function hasRolePermission(roleId: string, moduleId: string, permissionId: string): Promise<boolean> {
	const rp = await prisma.rolePermission.findUnique({
		where: {
			roleId_moduleId_permissionId: {
				roleId,
				moduleId,
				permissionId,
			},
		},
	});

	return !!rp;
}

export async function createRolePermission(data: { roleId: string; moduleId: string; permissionId: string }): Promise<RolePermission> {
	return prisma.rolePermission.create({
		data,
		include: {
			role: true,
			module: true,
			permission: true,
		},
	});
}

export async function deleteRolePermission(roleId: string, moduleId: string, permissionId: string): Promise<void> {
	await prisma.rolePermission.delete({
		where: {
			roleId_moduleId_permissionId: {
				roleId,
				moduleId,
				permissionId,
			},
		},
	});
}

/**
 * Get permissions for multiple roles (merged)
 */
export async function getMultiRolePermissions(roleIds: string[]): Promise<Record<string, Record<string, string[]>>> {
	const rolePermissions = await prisma.rolePermission.findMany({
		where: { roleId: { in: roleIds } },
		include: {
			module: true,
			permission: true,
		},
	});

	const result: Record<string, Record<string, string[]>> = {};

	rolePermissions.forEach((rp) => {
		if (!result[rp.module.name]) {
			result[rp.module.name] = {};
		}
		const modulePerms = result[rp.module.name];
		if (modulePerms && !modulePerms[rp.permission.action]) {
			modulePerms[rp.permission.action] = [];
		}
	});

	return result;
}

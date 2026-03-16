import { prisma } from "@/lib/prisma";

import { CreateRoleInput, Role, RoleWithPermissions, UpdateRoleInput } from "../types/role.types";

// Get case-insensitive mode setting from environment
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * Find role by ID
 */
export async function findRoleById(id: string): Promise<RoleWithPermissions | null> {
	const role = await prisma.role.findUnique({
		where: { id },
		include: {
			rolePermissions: {
				include: {
					module: true,
					permission: true,
				},
			},
		},
	});

	if (!role) return null;

	return {
		...role,
		permissions: role.rolePermissions.map((rp) => ({
			id: rp.id,
			module: {
				id: rp.module.id,
				name: rp.module.name,
				displayName: rp.module.displayName,
			},
			action: rp.permission.action,
			displayName: rp.permission.displayName,
		})),
	};
}

/**
 * Find role by name
 */
export async function findRoleByName(name: string): Promise<Role | null> {
	return prisma.role.findUnique({
		where: { name },
	});
}

/**
 * Get all roles with pagination and search
 */
export async function findAllRoles(
	params: {
		skip?: number;
		take?: number;
		search?: string;
	} = {},
): Promise<{ roles: Role[]; total: number }> {
	const { skip = 0, take = 50, search } = params;

	const where = search
		? {
				OR: [
					{
						name: {
							contains: search,
							...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
						},
					},
					{
						displayName: {
							contains: search,
							...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
						},
					},
					{
						description: {
							contains: search,
							...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
						},
					},
				],
			}
		: {};

	const [roles, total] = await Promise.all([
		prisma.role.findMany({
			where,
			skip,
			take,
			orderBy: { createdAt: "desc" },
		}),
		prisma.role.count({ where }),
	]);

	return { roles, total };
}

/**
 * Create new role
 */
export async function createRole(input: CreateRoleInput): Promise<Role> {
	// Check if role name already exists
	const existing = await findRoleByName(input.name);
	if (existing) {
		throw new Error(`Role "${input.name}" already exists`);
	}

	return prisma.role.create({
		data: {
			name: input.name,
			displayName: input.displayName,
			description: input.description || null,
		},
	});
}

/**
 * Update role
 */
export async function updateRole(id: string, input: UpdateRoleInput): Promise<Role> {
	const role = await prisma.role.findUnique({ where: { id } });
	if (!role) {
		throw new Error("Role not found");
	}

	// Prevent updating system roles (optional)
	const systemRoles = ["admin"];
	if (systemRoles.includes(role.name)) {
		throw new Error(`Cannot update system role "${role.name}"`);
	}

	return prisma.role.update({
		where: { id },
		data: {
			displayName: input.displayName,
			description: input.description,
		},
	});
}

/**
 * Delete role
 */
export async function deleteRole(id: string): Promise<void> {
	const role = await prisma.role.findUnique({
		where: { id },
		include: { userRoles: true },
	});

	if (!role) {
		throw new Error("Role not found");
	}

	// Prevent deleting system roles
	const systemRoles = ["admin"];
	if (systemRoles.includes(role.name)) {
		throw new Error(`Cannot delete system role "${role.name}"`);
	}

	// Check if role is assigned to users
	if (role.userRoles.length > 0) {
		throw new Error(`Cannot delete role "${role.name}" - it is assigned to users`);
	}

	await prisma.role.delete({ where: { id } });
}

/**
 * Get role with all permissions
 */
export async function getRolePermissions(roleId: string): Promise<RoleWithPermissions | null> {
	return findRoleById(roleId);
}

/**
 * Add permission to role
 */
export async function addPermissionToRole(roleId: string, moduleId: string, permissionId: string): Promise<void> {
	const role = await prisma.role.findUnique({ where: { id: roleId } });
	if (!role) throw new Error("Role not found");

	const moduleRecord = await prisma.module.findUnique({ where: { id: moduleId } });
	if (!moduleRecord) throw new Error("Module not found");

	const permission = await prisma.permission.findUnique({
		where: { id: permissionId },
	});
	if (!permission) throw new Error("Permission not found");

	// Check if permission already exists
	const existing = await prisma.rolePermission.findUnique({
		where: {
			roleId_moduleId_permissionId: { roleId, moduleId, permissionId },
		},
	});

	if (existing) {
		throw new Error("Permission already assigned to this role");
	}

	await prisma.rolePermission.create({
		data: { roleId, moduleId, permissionId },
	});
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(roleId: string, moduleId: string, permissionId: string): Promise<void> {
	const result = await prisma.rolePermission.delete({
		where: {
			roleId_moduleId_permissionId: { roleId, moduleId, permissionId },
		},
	});

	if (!result) {
		throw new Error("Permission not found for this role");
	}
}

/**
 * Get all permissions for a role by module
 */
export async function getRolePermissionsByModule(roleId: string, moduleName: string): Promise<string[]> {
	const permissions = await prisma.rolePermission.findMany({
		where: {
			roleId,
			module: { name: moduleName },
		},
		include: {
			permission: true,
		},
	});

	return permissions.map((rp) => rp.permission.action);
}

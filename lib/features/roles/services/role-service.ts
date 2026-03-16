import { SITE_CONFIG } from "@/lib";

import * as roleRepository from "../repositories/role-repository";
import { CreateRoleInput, Role, RoleWithPermissions, UpdateRoleInput } from "../types/role.types";

/**
 * Role service - Business logic for role management
 */

export async function getRoleById(id: string): Promise<RoleWithPermissions> {
	const role = await roleRepository.findRoleById(id);
	if (!role) {
		throw new Error("Role not found");
	}
	return role;
}

export async function getRoleByName(name: string): Promise<Role> {
	const role = await roleRepository.findRoleByName(name);
	if (!role) {
		throw new Error(`Role "${name}" not found`);
	}
	return role;
}

export async function getAllRoles(params?: { page?: number; pageSize?: number; search?: string }) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), search } = params || {};
	const skip = (page - 1) * pageSize;

	const result = await roleRepository.findAllRoles({
		skip,
		take: pageSize,
		search,
	});

	return {
		roles: result.roles,
		total: result.total,
		page,
		pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
}

export async function createRole(input: CreateRoleInput): Promise<Role> {
	// Validate input
	if (!input.name || !input.displayName) {
		throw new Error("Role name and display name are required");
	}

	// Role name should be lowercase without spaces
	const normalizedName = input.name.toLowerCase().replace(/\s+/g, "_");

	const role = await roleRepository.createRole({
		...input,
		name: normalizedName,
	});

	return role;
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<Role> {
	const role = await roleRepository.updateRole(id, input);
	return role;
}

export async function deleteRole(id: string): Promise<void> {
	await roleRepository.deleteRole(id);
}

export async function addPermissionToRole(roleId: string, moduleId: string, permissionId: string): Promise<void> {
	await roleRepository.addPermissionToRole(roleId, moduleId, permissionId);
}

export async function removePermissionFromRole(roleId: string, moduleId: string, permissionId: string): Promise<void> {
	await roleRepository.removePermissionFromRole(roleId, moduleId, permissionId);
}

export async function getRolePermissions(roleId: string): Promise<RoleWithPermissions> {
	return getRoleById(roleId);
}

/**
 * Get all permissions for a role by module (merged from all roles)
 */
export async function getRolePermissionsByModule(roleId: string, moduleName: string): Promise<string[]> {
	return roleRepository.getRolePermissionsByModule(roleId, moduleName);
}

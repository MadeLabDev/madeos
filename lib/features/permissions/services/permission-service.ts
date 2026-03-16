import * as permissionRepository from "../repositories/permission-repository";
import { CreateModuleInput, CreatePermissionInput, Module, Permission, RolePermission } from "../types/permission.types";

/**
 * MODULE SERVICE
 */

export async function getModuleById(id: string): Promise<Module> {
	const moduleRecord = await permissionRepository.findModuleById(id);
	if (!moduleRecord) {
		throw new Error("Module not found");
	}
	return moduleRecord;
}

export async function getModuleByName(name: string): Promise<Module> {
	const moduleRecord = await permissionRepository.findModuleByName(name);
	if (!moduleRecord) {
		throw new Error(`Module "${name}" not found`);
	}
	return moduleRecord;
}

export async function getAllModules(): Promise<Module[]> {
	return permissionRepository.findAllModules();
}

export async function createModule(input: CreateModuleInput): Promise<Module> {
	if (!input.name || !input.displayName) {
		throw new Error("Module name and display name are required");
	}

	return permissionRepository.createModule({
		name: input.name.toLowerCase().replace(/\s+/g, "_"),
		displayName: input.displayName,
		description: input.description,
	});
}

export async function updateModule(id: string, data: { displayName?: string; description?: string }): Promise<Module> {
	return permissionRepository.updateModule(id, data);
}

export async function deleteModule(id: string): Promise<void> {
	await permissionRepository.deleteModule(id);
}

/**
 * PERMISSION SERVICE
 */

export async function getPermissionById(id: string): Promise<Permission> {
	const permission = await permissionRepository.findPermissionById(id);
	if (!permission) {
		throw new Error("Permission not found");
	}
	return permission;
}

export async function getPermissionByAction(action: string): Promise<Permission> {
	const permission = await permissionRepository.findPermissionByAction(action);
	if (!permission) {
		throw new Error(`Permission "${action}" not found`);
	}
	return permission;
}

export async function getAllPermissions(): Promise<Permission[]> {
	return permissionRepository.findAllPermissions();
}

export async function createPermission(input: CreatePermissionInput): Promise<Permission> {
	if (!input.action || !input.displayName) {
		throw new Error("Permission action and display name are required");
	}

	return permissionRepository.createPermission({
		action: input.action.toLowerCase(),
		displayName: input.displayName,
		description: input.description,
	});
}

export async function deletePermission(id: string): Promise<void> {
	await permissionRepository.deletePermission(id);
}

/**
 * ROLE PERMISSION SERVICE
 */

export async function getRolePermissions(roleId: string): Promise<RolePermission[]> {
	return permissionRepository.findRolePermissions(roleId);
}

export async function getModulePermissions(moduleId: string): Promise<RolePermission[]> {
	return permissionRepository.findModulePermissions(moduleId);
}

export async function getRoleModulePermissions(roleId: string, moduleId: string): Promise<Permission[]> {
	return permissionRepository.findRoleModulePermissions(roleId, moduleId);
}

export async function checkRolePermission(roleId: string, moduleId: string, permissionId: string): Promise<boolean> {
	return permissionRepository.hasRolePermission(roleId, moduleId, permissionId);
}

export async function assignPermissionToRole(roleId: string, moduleId: string, permissionId: string): Promise<RolePermission> {
	// Validate inputs
	await getModuleById(moduleId);
	await getPermissionById(permissionId);

	// Check if already assigned
	const exists = await permissionRepository.hasRolePermission(roleId, moduleId, permissionId);
	if (exists) {
		throw new Error("Permission already assigned to this role");
	}

	return permissionRepository.createRolePermission({
		roleId,
		moduleId,
		permissionId,
	});
}

export async function removePermissionFromRole(roleId: string, moduleId: string, permissionId: string): Promise<void> {
	await permissionRepository.deleteRolePermission(roleId, moduleId, permissionId);
}

/**
 * Get merged permissions for a user with multiple roles
 */
export async function getMultiRolePermissions(roleIds: string[]): Promise<Record<string, string[]>> {
	if (roleIds.length === 0) {
		return {};
	}

	const rolePermissions = await permissionRepository.getMultiRolePermissions(roleIds);

	// Convert nested structure to simplified format for session
	const result: Record<string, string[]> = {};

	Object.entries(rolePermissions).forEach(([module, actions]) => {
		result[module] = Object.keys(actions);
	});

	return result;
}

"use server";

import { SITE_CONFIG } from "@/lib/config/site";
import { logActivity } from "@/lib/features/activity-log/services/activity-log.service";
import * as permissionService from "@/lib/features/permissions/services/permission-service";
import * as roleService from "@/lib/features/roles/services/role-service";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

/**
 * Get all roles
 */
export async function getRoles(params?: { page?: number; pageSize?: number; search?: string }) {
	try {
		await requirePermission("roles", "read");

		const result = await roleService.getAllRoles({
			page: params?.page || 1,
			pageSize: params?.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize"),
			search: params?.search,
		});

		return {
			success: true,
			data: result,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch roles";
		return { success: false, message };
	}
}

/**
 * Get role by ID with permissions
 */
export async function getRoleByIdAction(roleId: string) {
	try {
		await requirePermission("roles", "read");

		const role = await roleService.getRoleById(roleId);

		return {
			success: true,
			data: role,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch role";
		return { success: false, message };
	}
}

/**
 * Create role
 */
export async function createRole(input: { name: string; displayName: string; description?: string }) {
	try {
		const user = await requirePermission("roles", "create");

		const role = await roleService.createRole(input);

		// Log activity
		await logActivity({
			userId: user.id,
			action: "role.created",
			entity: "Role",
			entityId: role.id,
			details: { roleName: role.name },
		});

		// Broadcast to all clients
		await broadcastToAll("role_update", {
			action: "role_created",
			role,
		});

		return {
			success: true,
			message: "Role created successfully",
			data: role,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create role";
		return { success: false, message };
	}
}

/**
 * Update role
 */
export async function updateRole(roleId: string, input: { displayName?: string; description?: string }) {
	try {
		const user = await requirePermission("roles", "update");

		const role = await roleService.updateRole(roleId, input);

		// Log activity
		await logActivity({
			userId: user.id,
			action: "role.updated",
			entity: "Role",
			entityId: roleId,
			details: { changes: input },
		});

		// Broadcast to all clients
		await broadcastToAll("role_update", {
			action: "role_updated",
			role,
		});

		return {
			success: true,
			message: "Role updated successfully",
			data: role,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update role";
		return { success: false, message };
	}
}

/**
 * Delete role
 */
export async function deleteRole(roleId: string) {
	try {
		const user = await requirePermission("roles", "delete");

		await roleService.deleteRole(roleId);

		// Log activity
		await logActivity({
			userId: user.id,
			action: "role.deleted",
			entity: "Role",
			entityId: roleId,
		});

		// Broadcast to all clients
		await broadcastToAll("role_update", {
			action: "role_deleted",
			role: { id: roleId },
		});

		return {
			success: true,
			message: "Role deleted successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete role";
		return { success: false, message };
	}
}

/**
 * Get all modules
 */
export async function getModules() {
	try {
		await requirePermission("roles", "read");

		const modules = await permissionService.getAllModules();

		return {
			success: true,
			data: modules,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch modules";
		return { success: false, message };
	}
}

/**
 * Get all permissions
 */
export async function getPermissions() {
	try {
		await requirePermission("roles", "read");

		const permissions = await permissionService.getAllPermissions();

		return {
			success: true,
			data: permissions,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch permissions";
		return { success: false, message };
	}
}

/**
 * Assign permission to role
 */
export async function assignPermissionToRole(roleId: string, moduleId: string, permissionId: string) {
	try {
		const user = await requirePermission("roles", "update");

		await permissionService.assignPermissionToRole(roleId, moduleId, permissionId);

		// Log activity
		await logActivity({
			userId: user.id,
			action: "permission.granted",
			entity: "RolePermission",
			entityId: `${roleId}_${moduleId}_${permissionId}`,
			details: { roleId, moduleId, permissionId },
		});

		// Broadcast to all clients (reload role permissions)
		await broadcastToAll("role_update", {
			action: "role_permission_changed",
			roleId,
			moduleId,
			permissionId,
		});

		return {
			success: true,
			message: "Permission assigned successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to assign permission";
		return { success: false, message };
	}
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(roleId: string, moduleId: string, permissionId: string) {
	try {
		const user = await requirePermission("roles", "update");

		await permissionService.removePermissionFromRole(roleId, moduleId, permissionId);

		// Log activity
		await logActivity({
			userId: user.id,
			action: "permission.revoked",
			entity: "RolePermission",
			entityId: `${roleId}_${moduleId}_${permissionId}`,
			details: { roleId, moduleId, permissionId },
		});

		// Broadcast to all clients (reload role permissions)
		await broadcastToAll("role_update", {
			action: "role_permission_changed",
			roleId,
			moduleId,
			permissionId,
		});

		return {
			success: true,
			message: "Permission removed successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to remove permission";
		return { success: false, message };
	}
}

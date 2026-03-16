/**
 * Role types and interfaces
 */

export interface Role {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface RoleWithPermissions extends Role {
	permissions: RolePermissionDetail[];
}

export interface RolePermissionDetail {
	id: string;
	module: {
		id: string;
		name: string;
		displayName: string;
	};
	action: string;
	displayName: string;
}

export interface CreateRoleInput {
	name: string;
	displayName: string;
	description?: string;
	permissionIds?: string[]; // Array of RolePermission IDs to assign
}

export interface UpdateRoleInput {
	displayName?: string;
	description?: string;
	permissionIds?: string[]; // Update role permissions
}

export interface AssignPermissionInput {
	roleId: string;
	moduleId: string;
	permissionId: string;
}

export interface RemovePermissionInput {
	roleId: string;
	moduleId: string;
	permissionId: string;
}

/**
 * Default predefined roles
 */
export enum PredefinedRoles {
	ADMIN = "admin",
	MANAGER = "manager",
}

/**
 * Module names (entities in system)
 */
export enum ModuleNames {
	CUSTOMERS = "customers",
	REPORTS = "reports",
	SETTINGS = "settings",
	ROLES = "roles",
	USERS = "users",
	ACTIVITY_LOG = "activity_log",
}

/**
 * Permission actions
 */
export enum PermissionActions {
	READ = "read",
	CREATE = "create",
	UPDATE = "update",
	DELETE = "delete",
	APPROVE = "approve",
	EXPORT = "export",
}

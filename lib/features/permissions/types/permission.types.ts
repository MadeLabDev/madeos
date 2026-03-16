/**
 * Module types and interfaces
 */

export interface Module {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Permission {
	id: string;
	action: string;
	displayName: string;
	description: string | null;
	createdAt: Date;
}

export interface RolePermission {
	id: string;
	roleId: string;
	moduleId: string;
	permissionId: string;
	role?: {
		id: string;
		name: string;
		displayName: string;
	};
	module?: Module;
	permission?: Permission;
	createdAt: Date;
}

export interface CreateModuleInput {
	name: string;
	displayName: string;
	description?: string;
}

export interface CreatePermissionInput {
	action: string;
	displayName: string;
	description?: string;
}

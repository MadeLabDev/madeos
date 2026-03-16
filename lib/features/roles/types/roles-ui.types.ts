/**
 * Role UI Component Types
 * Types for components in app/(dashboard)/roles/*
 */

import type { Role } from "./role.types";

export interface Permission {
	id: string;
	action: string;
	displayName?: string;
	description?: string | null;
}

export interface Module {
	id: string;
	name: string;
	displayName?: string;
	description?: string | null;
}

export interface RolePermission {
	id: string;
	module: {
		id: string;
		name: string;
		displayName?: string;
	};
	action: string;
	displayName?: string;
}

export interface RoleFormData {
	name: string;
	displayName: string;
	description?: string;
}

export interface RoleFormProps {
	role?: Partial<Role>;
	title?: string;
	submitButtonText?: string;
	onSubmit: (data: RoleFormData) => Promise<{ success: boolean; message: string; data?: Role }>;
	onCancel?: () => void;
	redirectPath?: string;
	hideButtons?: boolean;
}

export interface EditRoleFormProps {
	roleId: string;
	role: Partial<Role>;
}

export interface RoleListProps {
	page: number;
	search: string;
	pageSize: number;
}

export interface RoleDetailWrapperProps {
	roleId: string;
	initialRole: Partial<Role>;
}

export interface RoleDetailPageProps {
	params: Promise<{ id: string }>;
}

export interface EditRolePageProps {
	params: Promise<{ id: string }>;
}

export interface RolePermissionsManagerProps {
	roleId: string;
	roleName: string;
	currentPermissions: RolePermission[];
	modules: Module[];
	permissions: Permission[];
	isSystemRole: boolean;
}

export interface RoleFormmProps {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
}

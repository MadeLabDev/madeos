/**
 * User UI Component Types
 * Types for components in app/(dashboard)/users/*
 */

export interface Role {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
}

export interface UserRole {
	role: Role;
}

export interface User {
	id: string;
	email: string;
	username?: string | null;
	name: string | null;
	isActive: boolean;
	activationTokenExpiry?: string | null;
	userRoles: UserRole[];
	createdAt: string;
}

export interface UserDetail extends User {
	userRoles: {
		role: Role & {
			rolePermissions?: {
				module: { name: string };
				permission: { action: string };
			}[];
		};
	}[];
}

export interface UserFormData {
	email: string;
	username?: string;
	name?: string;
	password?: string;
	roleIds: string[];
	groupId?: string;
}

export interface UserFormProps {
	user?: {
		id: string;
		email: string;
		username?: string | null;
		name: string | null;
		userRoles: UserRole[];
	};
	roles: Role[];
	userGroups?: any[];
	onSubmit: (data: UserFormData) => Promise<{ success: boolean; message: string }>;
	onCancel?: () => void;
	hideButtons?: boolean;
}

export interface EditUserFormProps {
	userId: string;
	user: any;
	roles: Role[];
}

export interface NewUserFormProps {
	roles: Role[];
	userGroups?: any[];
}

export interface UserListProps {
	page: number;
	search?: string;
	roleId?: string;
	pageSize: number;
}

export interface UserDetailWrapperProps {
	userId: string;
	initialUser: UserDetail;
}

// ============================================================================
// BUTTON COMPONENT TYPES
// ============================================================================

export interface ActivateUserButtonProps {
	userId: string;
	userEmail: string;
	isActive: boolean;
	variant?: "default" | "outline";
	className?: string;
}

export interface ResendActivationButtonProps {
	userId: string;
	userEmail: string;
}

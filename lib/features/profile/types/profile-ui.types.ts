/**
 * Profile UI Component Types
 * Types for components in app/(dashboard)/profile/*
 */

// ============================================================================
// USER/ROLE TYPES (imported from users)
// ============================================================================

export interface UserRole {
	id: string;
	displayName: string;
	permissions: RolePermission[];
}

export interface RolePermission {
	moduleName: string;
	moduleDisplayName: string;
	permissionAction: string;
}

export interface UserProfileData {
	id: string;
	email: string;
	name: string | null;
	username?: string | null;
	image?: string | null;
	emailVerified?: boolean;
}

// ============================================================================
// FORM COMPONENT TYPES
// ============================================================================

export interface ProfileFormProps {
	initialData: UserProfileData;
}

export interface ProfileRolesAndPermissionsProps {
	roles: UserRole[];
}

export interface ProfileTabsProps {
	initialData: UserProfileData;
	roles: UserRole[];
}

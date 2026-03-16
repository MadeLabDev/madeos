/**
 * Profile UI Component Types
 * Types for components in app/(dashboard)/profile/*
 */

export interface ProfileFormProps {
	initialData: {
		name: string | null;
		username: string | null;
		email: string;
		image: string | null;
	};
}

export interface ProfileTabsProps {
	initialData: {
		name: string | null;
		username: string | null;
		email: string;
		image: string | null;
	};
	roles: Array<{
		id: string;
		name: string;
		displayName: string;
		permissions: Array<{
			moduleId: string;
			moduleName: string;
			moduleDisplayName: string;
			permissionId: string;
			permissionAction: string;
			permissionDisplayName: string;
		}>;
	}>;
}

export interface ProfileRole {
	id: string;
	name: string;
	displayName: string;
	permissions: Array<{
		moduleId: string;
		moduleName: string;
		moduleDisplayName: string;
		permissionId: string;
		permissionAction: string;
		permissionDisplayName: string;
	}>;
}

export interface ProfileRolesAndPermissionsProps {
	roles: ProfileRole[];
}

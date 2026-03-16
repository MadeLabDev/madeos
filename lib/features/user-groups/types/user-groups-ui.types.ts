/**
 * User Groups UI Component Types
 * Types for components in app/(dashboard)/user-groups/*
 */

import type { UserGroupWithMembers } from "./user-groups.types";

export interface UserGroupDetailProps {
	userGroup: UserGroupWithMembers;
}

export interface AssignUsersToGroupModalProps {
	isOpen: boolean;
	onClose: () => void;
	userGroup: UserGroupWithMembers;
}

export interface EditUserGroupPageClientProps {
	userGroup: UserGroupWithMembers;
}

// List props
export interface UserGroupListProps {
	page: number;
	search: string;
	pageSize: number;
}

// Form types
export interface UserGroupFormProps {
	userGroup?: UserGroupWithMembers;
	onSubmit?: (data: { name: string; description?: string }) => Promise<{ success: boolean; message: string }>;
	onCancel?: () => void;
	isEditing?: boolean;
	hideButtons?: boolean;
}

// Page props
export interface EditUserGroupPageProps {
	params: Promise<{ id: string }>;
}

export interface UserGroupPageProps {
	params: Promise<{ id: string }>;
}

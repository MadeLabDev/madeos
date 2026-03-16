/**
 * Profile Builder UI Component Types
 * Types for components in app/(dashboard)/profile/builder/*
 */

import type { UserProfileModule, UserProfileWithModules } from "./user-profile.types";

// ============================================================================
// MAIN BUILDER COMPONENT TYPES
// ============================================================================

/**
 * ProfileBuilderProps - Root builder component
 */
export interface ProfileBuilderProps {
	profile: UserProfileWithModules | null;
}

/**
 * ProfileBuilderTabsProps - Main tabs container in profile builder
 */
export interface ProfileBuilderTabsProps {
	profile: UserProfileWithModules;
	onProfileUpdate: (profile: UserProfileWithModules) => void;
}

/**
 * ProfileBuilderFormProps - Profile form for basic info editing in builder
 */
export interface ProfileBuilderFormProps {
	profile: UserProfileWithModules;
	onProfileUpdate: (profile: UserProfileWithModules) => void;
}

// ============================================================================
// MODULE DIALOG TYPES
// ============================================================================

/**
 * AddModuleDialogProps - Dialog for adding new modules to profile
 */
export interface AddModuleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	profileId: string;
	onModuleAdded?: (module: UserProfileModule) => void;
}

/**
 * EditModuleDialogProps - Dialog for editing existing modules
 */
export interface EditModuleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	module: UserProfileModule;
	profileId: string;
	onModuleUpdated?: (moduleId: string, data: Partial<UserProfileModule>) => void;
}

// ============================================================================
// MODULE LAYOUT & SORTING TYPES
// ============================================================================

/**
 * ModuleLayoutProps - Layout container for draggable modules
 */
export interface ModuleLayoutProps {
	profile: UserProfileWithModules;
	onProfileUpdate?: (profile: UserProfileWithModules) => void;
	onOpenAddDialog?: () => void;
}

/**
 * SortableModuleItemProps - Individual draggable module item
 */
export interface SortableModuleItemProps {
	module: UserProfileModule;
	profileId: string;
	onModuleDeleted?: (moduleId: string) => void;
	onModuleUpdated?: (moduleId: string, data: Partial<UserProfileModule>) => void;
	isDragging?: boolean;
}

/**
 * ColumnDropZoneProps - Drop zone for module columns
 */
export interface ColumnDropZoneProps {
	columnNumber: 1 | 2;
	isEmpty: boolean;
	children: React.ReactNode;
}

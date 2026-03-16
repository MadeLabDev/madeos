/**
 * Meta Module Instance UI Component Types
 * Types for components in app/(dashboard)/meta/module-instances/*
 */

import type { ModuleTypeDetail } from "./meta.types";

// ============================================================================
// MODULE INSTANCE FORM TYPES
// ============================================================================

/**
 * ModuleInstanceFormProps - Form component for creating/editing module instances
 */
export interface ModuleInstanceFormProps {
	moduleType: ModuleTypeDetail;
	moduleTypes: ModuleTypeDetail[];
	selectedModuleTypeId: string;
	defaultValues?: any;
	onSubmit: (fieldValues: Record<string, any>, entityId: string, entityName: string) => Promise<any>;
	onCancel: () => void;
	onModuleTypeChange: (id: string) => void;
	hideButtons?: boolean;
	isLoading?: boolean;
}

/**
 * EditModuleInstanceFormProps - Wrapper component for edit module instance form
 */
export interface EditModuleInstanceFormProps {
	instance?: any;
	moduleTypes?: ModuleTypeDetail[];
}

// ============================================================================
// MODULE INSTANCE PAGE TYPES
// ============================================================================

/**
 * ModuleInstanceDetailPageProps - Detail page for viewing single module instance
 */
export interface ModuleInstanceDetailPageProps {
	params: Promise<{ id: string }>;
}

/**
 * EditModuleInstancePageProps - Edit page for module instance
 */
export interface EditModuleInstancePageProps {
	params: Promise<{ id: string }>;
}

/**
 * ModuleInstancesListProps - List view component for module instances
 */
export interface ModuleInstancesListProps {
	page: number;
	search: string;
	pageSize: number;
}

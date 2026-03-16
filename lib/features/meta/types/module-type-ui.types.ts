/**
 * Meta Module Type UI Component Types
 * Types for components in app/(dashboard)/meta/module-types/*
 */

import type { FieldSchemaItem } from "./meta.types";

// ============================================================================
// MODULE TYPE FORM TYPES
// ============================================================================

/**
 * ModuleTypeFormProps - Form component for creating/editing module types
 */
export interface ModuleTypeFormProps {
	defaultValues?: any;
	onSubmit: (data: any) => Promise<any>;
	isLoading?: boolean;
	onCancel?: () => void;
	hideButtons?: boolean;
}

/**
 * EditModuleTypeFormProps - Wrapper component for edit module type form
 */
export interface EditModuleTypeFormProps {
	id?: string;
	moduleType?: any;
}

/**
 * ModuleTypesListProps - List view component for module types
 */
export interface ModuleTypesListProps {
	page: number;
	search: string;
	pageSize: number;
}

// ============================================================================
// FIELD SCHEMA BUILDER TYPES
// ============================================================================

/**
 * FieldSchemaBuilderProps - Component for building field schema visually
 */
export interface FieldSchemaBuilderProps {
	fields: FieldSchemaItem[];
	onChange: (fields: FieldSchemaItem[]) => void;
	lockedFieldIds?: string[];
}

/**
 * FieldItemProps - Individual field item in schema builder
 */
export interface FieldItemProps {
	field: FieldSchemaItem;
	index: number;
	isFirst: boolean;
	isLast: boolean;
	onEdit: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onDelete: () => void;
	isLocked?: boolean;
}

/**
 * FieldEditDialogProps - Dialog for editing individual fields
 */
export interface FieldEditDialogProps {
	field?: FieldSchemaItem;
	isLocked?: boolean;
	onClose: () => void;
	onSave: (field: FieldSchemaItem) => void;
}

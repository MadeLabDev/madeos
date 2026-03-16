/**
 * Meta/Module Types - Type definitions for dynamic field schemas
 */

// ============================================================================
// FIELD SCHEMA TYPES
// ============================================================================

export type FieldType = "text" | "textarea" | "richtext" | "number" | "boolean" | "select" | "multiselect" | "radio" | "tags" | "date" | "daterange" | "email" | "url" | "file" | "image";

export interface FieldOption {
	value: string;
	label: string;
}

export interface FieldValidation {
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: string;
	message?: string;
}

export interface FieldSchemaItem {
	id: string; // Unique field ID
	name: string; // Database field name (alphanumeric + underscore)
	label: string; // Display label
	type: FieldType; // Field type
	required: boolean; // Is required
	placeholder?: string; // Placeholder text
	description?: string; // Help text for users
	order: number; // Display order
	options?: FieldOption[]; // For select/multiselect/tags types
	validation?: FieldValidation;
	defaultValue?: any; // Default value
}

export interface FieldSchema {
	fields: FieldSchemaItem[];
}

// ============================================================================
// MODULE TYPE TYPES
// ============================================================================

export interface CreateModuleTypeInput {
	key: string;
	name: string;
	description?: string;
	system?: string;
	fieldSchema: FieldSchema;
	isEnabled?: boolean;
	order?: number;
}

export interface UpdateModuleTypeInput {
	key?: string;
	name?: string;
	description?: string;
	system?: string;
	fieldSchema?: FieldSchema;
	isEnabled?: boolean;
	order?: number;
}

export interface ModuleTypeDetail {
	id: string;
	key: string;
	name: string;
	description: string | null;
	system: string;
	fieldSchema: FieldSchema;
	isEnabled: boolean;
	order: number;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string | null;
	updatedBy: string | null;
}

export interface ModuleTypeListResult {
	moduleTypes: ModuleTypeDetail[];
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
}

// ============================================================================
// MODULE INSTANCE TYPES
// ============================================================================

export interface CreateModuleInstanceInput {
	moduleTypeId: string;
	entityId: string;
	entityName: string;
	fieldValues: Record<string, any>;
	isActive?: boolean;
}

export interface UpdateModuleInstanceInput {
	fieldValues?: Record<string, any>;
	isActive?: boolean;
}

export interface ModuleInstanceDetail {
	id: string;
	moduleTypeId: string;
	moduleType?: ModuleTypeDetail;
	entityId: string;
	entityName: string;
	fieldValues: Record<string, any>;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string | null;
	updatedBy: string | null;
}

export interface ModuleInstanceListResult {
	instances: ModuleInstanceDetail[];
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
}

// ============================================================================
// FORM TYPES (UI)
// ============================================================================

export interface ModuleTypeFormData {
	key: string;
	name: string;
	description?: string;
	system: string;
	fieldSchema: FieldSchema;
	isEnabled: boolean;
	order: number;
}

export interface ModuleInstanceFormData {
	moduleTypeId: string;
	entityId: string;
	entityName: string;
	fieldValues: Record<string, any>;
	isActive?: boolean;
}

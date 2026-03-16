/**
 * ModuleType Service for Profile Feature
 * Business logic for module type management
 */

import { SITE_CONFIG } from "@/lib";

import * as moduleTypeRepository from "../repositories/module-type.repository";
import type { FieldSchema } from "../types/user-profile.types";

/**
 * Validate field schema structure
 */
function validateFieldSchema(schema: any): void {
	if (!schema || typeof schema !== "object") {
		throw new Error("fieldSchema must be an object");
	}

	if (!Array.isArray(schema.fields)) {
		throw new Error("fieldSchema.fields must be an array");
	}

	const validFieldTypes = ["text", "email", "url", "number", "date", "daterange", "textarea", "richtext", "select", "multiselect", "checkbox", "radio", "boolean", "tags", "file", "image"];

	for (const field of schema.fields) {
		if (!field.id || !field.name || !field.label || !field.type) {
			throw new Error("Each field must have id, name, label, and type");
		}

		if (!validFieldTypes.includes(field.type)) {
			throw new Error(`Invalid field type: ${field.type}`);
		}

		if (field.type === "select" && (!Array.isArray(field.options) || field.options.length === 0)) {
			throw new Error(`Select field "${field.label}" must have options array`);
		}
	}
}

/**
 * Get all module types with pagination
 */
export async function getModuleTypes(params?: { page?: number; pageSize?: number; search?: string; system?: string }) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), search, system } = params || {};
	const skip = (page - 1) * pageSize;

	const result = await moduleTypeRepository.findAllModuleTypes({
		skip,
		take: pageSize,
		search,
		isEnabled: true,
		system,
	});

	return {
		moduleTypes: result.moduleTypes,
		total: result.total,
		page,
		pageSize,
		pageCount: Math.ceil(result.total / pageSize),
	};
}

/**
 * Get module type by ID
 */
export async function getModuleTypeById(id: string) {
	const moduleType = await moduleTypeRepository.findModuleTypeById(id);
	if (!moduleType) {
		throw new Error("Module type not found");
	}
	return moduleType;
}

/**
 * Get module type by key (unique identifier)
 */
export async function getModuleTypeByKey(key: string) {
	const moduleType = await moduleTypeRepository.findModuleTypeByKey(key);
	if (!moduleType) {
		throw new Error(`Module type with key "${key}" not found`);
	}
	return moduleType;
}

/**
 * Get module type by system (system identifier)
 */
export async function getModuleTypeBySystem(system: string) {
	const moduleType = await moduleTypeRepository.findModuleTypeBySystem(system);
	if (!moduleType) {
		throw new Error(`Module type with system "${system}" not found`);
	}
	return moduleType;
}

/**
 * Get all enabled module types available for profiles
 */
export async function getEnabledModuleTypes() {
	return moduleTypeRepository.findEnabledModuleTypes();
}

/**
 * Get module types for profile feature (currently returns all enabled types for "profile" system)
 */
export async function getModuleTypesForProfile() {
	return moduleTypeRepository.findModuleTypesForProfile();
}

/**
 * Get module types for specific system (blog, knowledge, etc)
 */
export async function getModuleTypesBySystem(system: string) {
	return moduleTypeRepository.findModuleTypesBySystem(system);
}

/**
 * Create module type (admin only)
 */
export async function createModuleType(
	input: {
		key: string;
		name: string;
		description?: string;
		fieldSchema: FieldSchema;
		isEnabled?: boolean;
		order?: number;
	},
	userId?: string,
) {
	// Validate key format
	if (!/^[a-z0-9_]+$/.test(input.key)) {
		throw new Error("Module type key must be lowercase alphanumeric with underscores only");
	}

	// Check if key already exists
	const existing = await moduleTypeRepository.findModuleTypeByKey(input.key);
	if (existing) {
		throw new Error(`Module type with key "${input.key}" already exists`);
	}

	// Validate field schema
	validateFieldSchema(input.fieldSchema);

	return moduleTypeRepository.createModuleType({
		key: input.key,
		name: input.name,
		description: input.description,
		fieldSchema: input.fieldSchema,
		isEnabled: input.isEnabled ?? true,
		order: input.order ?? 0,
		createdBy: userId,
	});
}

/**
 * Update module type (admin only)
 */
export async function updateModuleType(
	id: string,
	input: Partial<{
		key: string;
		name: string;
		description: string;
		fieldSchema: FieldSchema;
		isEnabled: boolean;
		order: number;
	}>,
	userId?: string,
) {
	// Verify exists
	await getModuleTypeById(id);

	// Validate key if being updated
	if (input.key) {
		if (!/^[a-z0-9_]+$/.test(input.key)) {
			throw new Error("Module type key must be lowercase alphanumeric with underscores only");
		}

		const existing = await moduleTypeRepository.findModuleTypeByKey(input.key);
		if (existing && existing.id !== id) {
			throw new Error(`Module type with key "${input.key}" already exists`);
		}
	}

	// Validate field schema if being updated
	if (input.fieldSchema) {
		validateFieldSchema(input.fieldSchema);
	}

	return moduleTypeRepository.updateModuleType(id, {
		...(input.key && { key: input.key }),
		...(input.name && { name: input.name }),
		...(input.description !== undefined && { description: input.description }),
		...(input.fieldSchema && { fieldSchema: input.fieldSchema }),
		...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
		...(input.order !== undefined && { order: input.order }),
		...(userId && { updatedBy: userId }),
	});
}

/**
 * Delete module type (admin only, must have no instances)
 */
export async function deleteModuleType(id: string) {
	await getModuleTypeById(id);
	return moduleTypeRepository.deleteModuleType(id);
}

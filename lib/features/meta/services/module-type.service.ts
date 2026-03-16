/**
 * ModuleType Service - Business logic for module type management
 */

import { SITE_CONFIG } from "@/lib";

import { getProtectedTypeErrorMessage, isProtectedModuleTypeById } from "../config/protected-types";
import * as moduleTypeRepository from "../repositories/module-type.repository";
import type { CreateModuleTypeInput, FieldSchema, UpdateModuleTypeInput } from "../types";

/**
 * Get module types with pagination and filters
 */
export async function getModuleTypes(params?: { page?: number; pageSize?: number; search?: string; isEnabled?: boolean }) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), search, isEnabled } = params || {};
	const skip = (page - 1) * pageSize;

	const result = await moduleTypeRepository.findAllModuleTypes({
		skip,
		take: pageSize,
		search,
		isEnabled,
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
 * Get module type by key
 */
export async function getModuleTypeByKey(key: string) {
	const moduleType = await moduleTypeRepository.findModuleTypeByKey(key);
	if (!moduleType) {
		throw new Error(`Module type with key "${key}" not found`);
	}
	return moduleType;
}

/**
 * Get all enabled module types
 */
export async function getEnabledModuleTypes() {
	return moduleTypeRepository.findEnabledModuleTypes();
}

/**
 * Get module types by system
 */
export async function getModuleTypesBySystem(system: string) {
	return moduleTypeRepository.findModuleTypesBySystem(system);
}

/**
 * Create module type
 */
export async function createModuleType(input: CreateModuleTypeInput, userId?: string) {
	// Check if trying to create protected system type
	if (isProtectedModuleTypeById(input.key)) {
		throw new Error(getProtectedTypeErrorMessage("create"));
	}

	// Validate key format (alphanumeric, underscore, dash only)
	if (!/^[a-zA-Z0-9_-]+$/.test(input.key)) {
		throw new Error("Module type key must contain only alphanumeric characters, underscores, and dashes");
	}

	// Check if key already exists
	const existing = await moduleTypeRepository.findModuleTypeByKey(input.key);
	if (existing) {
		throw new Error(`Module type with key "${input.key}" already exists`);
	}

	// Validate fieldSchema
	validateFieldSchema(input.fieldSchema);

	return moduleTypeRepository.createModuleType({
		key: input.key,
		name: input.name,
		description: input.description,
		system: input.system || "meta",
		fieldSchema: input.fieldSchema,
		isEnabled: input.isEnabled,
		order: input.order,
		createdBy: userId,
	});
}

/**
 * Update module type
 */
export async function updateModuleType(id: string, input: UpdateModuleTypeInput, userId?: string) {
	// Vẫn cho phép Update cho dù đây là các type system
	// Verify exists
	// const moduleType = await getModuleTypeById(id);

	// Check if trying to update protected system type
	// if (isProtectedModuleTypeById(moduleType.key)) {
	//   throw new Error(getProtectedTypeErrorMessage('update'));
	// }

	// Validate key if being updated
	if (input.key) {
		if (!/^[a-zA-Z0-9_-]+$/.test(input.key)) {
			throw new Error("Module type key must contain only alphanumeric characters, underscores, and dashes");
		}

		const existing = await moduleTypeRepository.findModuleTypeByKey(input.key);
		if (existing && existing.id !== id) {
			throw new Error(`Module type with key "${input.key}" already exists`);
		}
	}

	// Validate fieldSchema if being updated
	if (input.fieldSchema) {
		validateFieldSchema(input.fieldSchema);
	}

	return moduleTypeRepository.updateModuleType(id, {
		...(input.key && { key: input.key }),
		...(input.name && { name: input.name }),
		...(input.description !== undefined && { description: input.description }),
		...(input.system && { system: input.system }),
		...(input.fieldSchema && { fieldSchema: input.fieldSchema }),
		...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
		...(input.order !== undefined && { order: input.order }),
		...(userId && { updatedBy: userId }),
	});
}

/**
 * Delete module type
 */
export async function deleteModuleType(id: string) {
	// Verify exists
	const moduleType = await getModuleTypeById(id);

	// Check if trying to delete protected system type
	if (isProtectedModuleTypeById(moduleType.key)) {
		throw new Error(getProtectedTypeErrorMessage("delete"));
	}

	return moduleTypeRepository.deleteModuleType(id);
}

/**
 * Batch delete module types
 */
export async function deleteModuleTypes(ids: string[]) {
	if (ids.length === 0) {
		throw new Error("No IDs provided for deletion");
	}

	// Check if any of the IDs are protected types
	const protectedIds = await Promise.all(
		ids.map(async (id) => {
			const moduleType = await moduleTypeRepository.findModuleTypeById(id);
			return moduleType && isProtectedModuleTypeById(moduleType.key) ? id : null;
		}),
	);

	const protectedIdsFiltered = protectedIds.filter((id) => id !== null);
	if (protectedIdsFiltered.length > 0) {
		throw new Error(getProtectedTypeErrorMessage("delete"));
	}

	return moduleTypeRepository.deleteModuleTypes(ids);
}

/**
 * Validate field schema structure
 */
function validateFieldSchema(schema: FieldSchema): void {
	if (!schema || !Array.isArray(schema.fields)) {
		throw new Error('Field schema must be an object with "fields" array');
	}

	if (schema.fields.length === 0) {
		throw new Error("Field schema must contain at least one field");
	}

	const seenIds = new Set<string>();
	const seenNames = new Set<string>();

	for (const field of schema.fields) {
		// Validate required properties
		if (!field.id || typeof field.id !== "string") {
			throw new Error("Each field must have a unique id (string)");
		}

		if (!field.name || typeof field.name !== "string") {
			throw new Error("Each field must have a name (string)");
		}

		if (!field.label || typeof field.label !== "string") {
			throw new Error("Each field must have a label (string)");
		}

		if (!field.type || typeof field.type !== "string") {
			throw new Error("Each field must have a type (string)");
		}

		// Check for duplicates
		if (seenIds.has(field.id)) {
			throw new Error(`Duplicate field id: "${field.id}"`);
		}
		if (seenNames.has(field.name)) {
			throw new Error(`Duplicate field name: "${field.name}"`);
		}

		seenIds.add(field.id);
		seenNames.add(field.name);

		// Validate field type
		const validTypes = ["text", "textarea", "richtext", "number", "boolean", "select", "multiselect", "radio", "tags", "date", "daterange", "email", "url", "file", "image"];
		if (!validTypes.includes(field.type)) {
			throw new Error(`Invalid field type: "${field.type}". Must be one of: ${validTypes.join(", ")}`);
		}

		// Validate select options if type is select
		if (field.type === "select") {
			if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
				throw new Error(`Field "${field.name}" with type "select" must have options array`);
			}
		}
	}
}

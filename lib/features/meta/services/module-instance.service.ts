/**
 * ModuleInstance Service - Business logic for module instance management
 */

import { SITE_CONFIG } from "@/lib";

import * as moduleInstanceRepository from "../repositories/module-instance.repository";
import type { CreateModuleInstanceInput, UpdateModuleInstanceInput } from "../types";

import * as moduleTypeService from "./module-type.service";

/**
 * Get module instances with pagination
 */
export async function getModuleInstances(params?: { page?: number; pageSize?: number; moduleTypeId?: string; entityName?: string; entityId?: string; isActive?: boolean }) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), ...filterParams } = params || {};
	const skip = (page - 1) * pageSize;

	const result = await moduleInstanceRepository.findAllModuleInstances({
		skip,
		take: pageSize,
		...filterParams,
	});

	return {
		instances: result.instances,
		total: result.total,
		page,
		pageSize,
		pageCount: Math.ceil(result.total / pageSize),
	};
}

/**
 * Get module instance by ID
 */
export async function getModuleInstanceById(id: string) {
	const instance = await moduleInstanceRepository.findModuleInstanceById(id);
	if (!instance) {
		throw new Error("Module instance not found");
	}
	return instance;
}

/**
 * Get module instance by moduleTypeId and entityId
 */
export async function getModuleInstanceByModuleAndEntity(moduleTypeId: string, entityId: string) {
	const instance = await moduleInstanceRepository.findModuleInstanceByModuleAndEntity(moduleTypeId, entityId);
	if (!instance) {
		throw new Error("Module instance not found");
	}
	return instance;
}

/**
 * Get all instances for an entity
 */
export async function getInstancesByEntity(entityId: string, entityName?: string) {
	return moduleInstanceRepository.findInstancesByEntity(entityId, entityName);
}

/**
 * Create module instance
 */
export async function createModuleInstance(input: CreateModuleInstanceInput, userId?: string) {
	// Verify module type exists
	await moduleTypeService.getModuleTypeById(input.moduleTypeId);

	// Validate field values against schema
	const moduleType = await moduleTypeService.getModuleTypeById(input.moduleTypeId);
	validateFieldValues(input.fieldValues, moduleType.fieldSchema);

	// Check if instance already exists
	const existing = await moduleInstanceRepository.findModuleInstanceByModuleAndEntity(input.moduleTypeId, input.entityId);

	if (existing) {
		throw new Error("Module instance already exists for this entity");
	}

	return moduleInstanceRepository.createModuleInstance({
		moduleTypeId: input.moduleTypeId,
		entityId: input.entityId,
		entityName: input.entityName,
		fieldValues: input.fieldValues,
		isActive: input.isActive,
		createdBy: userId,
	});
}

/**
 * Update module instance
 */
export async function updateModuleInstance(id: string, input: UpdateModuleInstanceInput, userId?: string) {
	// Get current instance to validate
	const instance = await getModuleInstanceById(id);

	// If fieldValues provided, validate against module type schema
	if (input.fieldValues) {
		const moduleType = await moduleTypeService.getModuleTypeById(instance.moduleTypeId);
		validateFieldValues(input.fieldValues, moduleType.fieldSchema);
	}

	return moduleInstanceRepository.updateModuleInstance(id, {
		...(input.fieldValues && { fieldValues: input.fieldValues }),
		...(input.isActive !== undefined && { isActive: input.isActive }),
		...(userId && { updatedBy: userId }),
	});
}

/**
 * Delete module instance
 */
export async function deleteModuleInstance(id: string) {
	// Verify exists
	await getModuleInstanceById(id);

	return moduleInstanceRepository.deleteModuleInstance(id);
}

/**
 * Delete instances by moduleTypeId
 */
export async function deleteInstancesByModuleType(moduleTypeId: string) {
	// Verify module type exists
	await moduleTypeService.getModuleTypeById(moduleTypeId);

	return moduleInstanceRepository.deleteInstancesByModuleType(moduleTypeId);
}

/**
 * Delete instances by entity
 */
export async function deleteInstancesByEntity(entityId: string, entityName?: string) {
	return moduleInstanceRepository.deleteInstancesByEntity(entityId, entityName);
}

/**
 * Upsert module instance
 */
export async function upsertModuleInstance(moduleTypeId: string, entityId: string, entityName: string, fieldValues: Record<string, any>, userId?: string) {
	// Verify module type exists
	const moduleType = await moduleTypeService.getModuleTypeById(moduleTypeId);

	// Validate field values
	validateFieldValues(fieldValues, moduleType.fieldSchema);

	return moduleInstanceRepository.upsertModuleInstance(moduleTypeId, entityId, entityName, fieldValues, userId);
}

/**
 * Validate field values against module type schema
 */
function validateFieldValues(values: Record<string, any>, schema: any): void {
	if (!schema || !schema.fields) {
		throw new Error("Invalid module type schema");
	}

	for (const field of schema.fields) {
		const value = values[field.name];

		// Check required fields
		if (field.required && (value === undefined || value === null || value === "")) {
			throw new Error(`Field "${field.label}" is required`);
		}

		// Type validation
		if (value !== undefined && value !== null && value !== "") {
			switch (field.type) {
				case "number":
					if (typeof value !== "number" && isNaN(Number(value))) {
						throw new Error(`Field "${field.label}" must be a number`);
					}
					if (field.validation?.min !== undefined && Number(value) < field.validation.min) {
						throw new Error(`Field "${field.label}" must be at least ${field.validation.min}`);
					}
					if (field.validation?.max !== undefined && Number(value) > field.validation.max) {
						throw new Error(`Field "${field.label}" must be at most ${field.validation.max}`);
					}
					break;

				case "email":
					if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
						throw new Error(`Field "${field.label}" must be a valid email`);
					}
					break;

				case "url":
					try {
						new URL(String(value));
					} catch {
						throw new Error(`Field "${field.label}" must be a valid URL`);
					}
					break;

				case "date":
					if (isNaN(Date.parse(String(value)))) {
						throw new Error(`Field "${field.label}" must be a valid date`);
					}
					break;

				case "select":
					if (!field.options?.some((opt: any) => opt.value === String(value))) {
						throw new Error(`Field "${field.label}" has invalid value`);
					}
					break;

				case "boolean":
					if (typeof value !== "boolean" && value !== "true" && value !== "false" && value !== "1" && value !== "0") {
						throw new Error(`Field "${field.label}" must be a boolean`);
					}
					break;
			}

			// Custom pattern validation
			if (field.validation?.pattern) {
				const regex = new RegExp(field.validation.pattern);
				if (!regex.test(String(value))) {
					throw new Error(field.validation.message || `Field "${field.label}" format is invalid`);
				}
			}
		}
	}
}

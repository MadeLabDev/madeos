"use server";

import { auth } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/config/site";
import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import * as moduleTypeService from "../services/module-type.service";
import type { CreateModuleTypeInput, UpdateModuleTypeInput } from "../types";

/**
 * Server Actions for module type management
 */

// ActionResult is now imported from @/lib/types

/**
 * Get current user session
 */
async function getCurrentUser() {
	const session = await auth();
	if (!session?.user?.email) {
		throw new Error("Not authenticated");
	}
	return session.user;
}

/**
 * Get all module types with pagination and filters
 */
export async function getModuleTypesAction(params?: { page?: number; pageSize?: number; search?: string; isEnabled?: boolean }): Promise<ActionResult> {
	try {
		const result = await moduleTypeService.getModuleTypes({
			page: params?.page || 1,
			pageSize: params?.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize"),
			search: params?.search,
			isEnabled: params?.isEnabled,
		});

		return {
			success: true,
			message: "Module types retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve module types",
		};
	}
}

/**
 * Get module type by ID
 */
export async function getModuleTypeByIdAction(id: string): Promise<ActionResult> {
	try {
		const moduleType = await moduleTypeService.getModuleTypeById(id);

		return {
			success: true,
			message: "Module type retrieved successfully",
			data: moduleType,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve module type",
		};
	}
}

/**
 * Get all enabled module types
 */
export async function getEnabledModuleTypesAction(): Promise<ActionResult> {
	try {
		const moduleTypes = await moduleTypeService.getEnabledModuleTypes();

		return {
			success: true,
			message: "Enabled module types retrieved successfully",
			data: moduleTypes,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve enabled module types",
		};
	}
}

/**
 * Create new module type (ADMIN only)
 */
export async function createModuleTypeAction(data: CreateModuleTypeInput): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "create");

		const currentUser = await getCurrentUser();

		const moduleType = await moduleTypeService.createModuleType(data, currentUser.id);

		return {
			success: true,
			message: "Module type created successfully",
			data: moduleType,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create module type",
		};
	}
}

/**
 * Update module type (ADMIN only)
 */
export async function updateModuleTypeAction(id: string, data: UpdateModuleTypeInput): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "update");

		const currentUser = await getCurrentUser();

		const moduleType = await moduleTypeService.updateModuleType(id, data, currentUser.id);

		return {
			success: true,
			message: "Module type updated successfully",
			data: moduleType,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update module type",
		};
	}
}

/**
 * Delete module type (ADMIN only)
 */
export async function deleteModuleTypeAction(id: string): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "delete");

		const moduleType = await moduleTypeService.deleteModuleType(id);

		return {
			success: true,
			message: "Module type deleted successfully",
			data: moduleType,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete module type",
		};
	}
}

/**
 * Batch delete module types (ADMIN only)
 */
export async function bulkDeleteModuleTypesAction(ids: string[]): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "delete");

		if (ids.length === 0) {
			return {
				success: false,
				message: "No module types selected for deletion",
			};
		}

		const result = await moduleTypeService.deleteModuleTypes(ids);

		return {
			success: true,
			message: `${result.count} module type(s) deleted successfully`,
			data: { count: result.count },
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete module types",
		};
	}
}

/**
 * Export module type data
 */
export async function exportModuleTypeAction(id: string): Promise<ActionResult> {
	try {
		const moduleType = await moduleTypeService.getModuleTypeById(id);

		return {
			success: true,
			message: "Module type exported successfully",
			data: moduleType,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to export module type",
		};
	}
}

/**
 * Import module type from exported data
 */
export async function importModuleTypeAction(data: any, overwrite: boolean = false): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "create");

		const currentUser = await getCurrentUser();

		// Check if key already exists
		let existing = null;
		try {
			existing = await moduleTypeService.getModuleTypeByKey(data.key);
		} catch (error) {
			// Key does not exist, which is fine
		}
		if (existing) {
			if (!overwrite) {
				return {
					success: false,
					message: "Module type with this key already exists",
				};
			} else {
				// Update existing
				const { id, createdAt, updatedAt, createdBy, updatedBy, ...importData } = data;
				const moduleType = await moduleTypeService.updateModuleType(existing.id, importData, currentUser.id);
				return {
					success: true,
					message: "Module type updated successfully",
					data: moduleType,
				};
			}
		}

		// Remove fields that should not be imported
		const { id, createdAt, updatedAt, createdBy, updatedBy, ...importData } = data;

		const moduleType = await moduleTypeService.createModuleType(importData, currentUser.id);

		return {
			success: true,
			message: "Module type imported successfully",
			data: moduleType,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to import module type",
		};
	}
}

"use server";

import { auth } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/config/site";
import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import * as moduleInstanceService from "../services/module-instance.service";
import type { CreateModuleInstanceInput, UpdateModuleInstanceInput } from "../types";

/**
 * Server Actions for module instance management
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
 * Get module instances with pagination
 */
export async function getModuleInstancesAction(params?: { page?: number; pageSize?: number; moduleTypeId?: string; entityName?: string; entityId?: string; isActive?: boolean }): Promise<ActionResult> {
	try {
		const result = await moduleInstanceService.getModuleInstances({
			page: params?.page || 1,
			pageSize: params?.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize"),
			moduleTypeId: params?.moduleTypeId,
			entityName: params?.entityName,
			entityId: params?.entityId,
			isActive: params?.isActive,
		});

		return {
			success: true,
			message: "Module instances retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve module instances",
		};
	}
}

/**
 * Get module instance by ID
 */
export async function getModuleInstanceByIdAction(id: string): Promise<ActionResult> {
	try {
		const instance = await moduleInstanceService.getModuleInstanceById(id);

		return {
			success: true,
			message: "Module instance retrieved successfully",
			data: instance,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve module instance",
		};
	}
}

/**
 * Get module instances for an entity
 */
export async function getInstancesByEntityAction(entityId: string, entityName?: string): Promise<ActionResult> {
	try {
		const instances = await moduleInstanceService.getInstancesByEntity(entityId, entityName);

		return {
			success: true,
			message: "Module instances retrieved successfully",
			data: instances,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve module instances",
		};
	}
}

/**
 * Create module instance (ADMIN only)
 */
export async function createModuleInstanceAction(data: CreateModuleInstanceInput): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "create");

		const currentUser = await getCurrentUser();

		const instance = await moduleInstanceService.createModuleInstance(data, currentUser.id);

		return {
			success: true,
			message: "Module instance created successfully",
			data: instance,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create module instance",
		};
	}
}

/**
 * Update module instance (ADMIN only)
 */
export async function updateModuleInstanceAction(id: string, data: UpdateModuleInstanceInput): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "update");

		const currentUser = await getCurrentUser();

		const instance = await moduleInstanceService.updateModuleInstance(id, data, currentUser.id);

		return {
			success: true,
			message: "Module instance updated successfully",
			data: instance,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update module instance",
		};
	}
}

/**
 * Delete module instance (ADMIN only)
 */
export async function deleteModuleInstanceAction(id: string): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "delete");

		const instance = await moduleInstanceService.deleteModuleInstance(id);

		return {
			success: true,
			message: "Module instance deleted successfully",
			data: instance,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete module instance",
		};
	}
}

/**
 * Upsert module instance (ADMIN only)
 */
export async function upsertModuleInstanceAction(moduleTypeId: string, entityId: string, entityName: string, fieldValues: Record<string, any>): Promise<ActionResult> {
	try {
		// Check permission - admin only
		await requirePermission("meta", "update");

		const currentUser = await getCurrentUser();

		const instance = await moduleInstanceService.upsertModuleInstance(moduleTypeId, entityId, entityName, fieldValues, currentUser.id);

		return {
			success: true,
			message: "Module instance saved successfully",
			data: instance,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to save module instance",
		};
	}
}

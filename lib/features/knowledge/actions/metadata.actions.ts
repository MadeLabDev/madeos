/**
 * Knowledge Category & Tag Server Actions
 * Server-side actions for category and tag management
 */

"use server";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import { KnowledgeCategoryService, KnowledgeModuleTypeService, KnowledgeTagService } from "../services";
import { CreateCategoryInput, CreateKnowledgeModuleTypeInput, CreateTagInput, UpdateCategoryInput, UpdateKnowledgeModuleTypeInput, UpdateTagInput } from "../types";

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

/**
 * Create new category
 */
export async function createCategoryAction(input: CreateCategoryInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "create");

		return await KnowledgeCategoryService.createCategory(input);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create category",
		};
	}
}

/**
 * Update category
 */
export async function updateCategoryAction(categoryId: string, input: UpdateCategoryInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "update");

		return await KnowledgeCategoryService.updateCategory(categoryId, input);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update category",
		};
	}
}

/**
 * Delete category
 */
export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "delete");

		return await KnowledgeCategoryService.deleteCategory(categoryId);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete category",
		};
	}
}

// ============================================================================
// TAG ACTIONS
// ============================================================================

/**
 * Create new tag
 */
export async function createTagAction(input: CreateTagInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "create");

		return await KnowledgeTagService.createTag(input);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create tag",
		};
	}
}

/**
 * Update tag
 */
export async function updateTagAction(tagId: string, input: UpdateTagInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "update");

		return await KnowledgeTagService.updateTag(tagId, input);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update tag",
		};
	}
}

/**
 * Delete tag
 */
export async function deleteTagAction(tagId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "delete");

		return await KnowledgeTagService.deleteTag(tagId);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete tag",
		};
	}
}

// ============================================================================
// MODULE TYPE ACTIONS
// ============================================================================

/**
 * Get all module types
 */
export async function getModuleTypesAction(): Promise<ActionResult> {
	try {
		await requirePermission("knowledge", "read");

		const moduleTypes = await KnowledgeModuleTypeService.getModuleTypes();
		return {
			success: true,
			message: "Module types retrieved successfully",
			data: moduleTypes,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch module types",
		};
	}
}

/**
 * Get enabled module types
 */
export async function getEnabledModuleTypesAction(): Promise<ActionResult> {
	try {
		await requirePermission("knowledge", "read");

		const moduleTypes = await KnowledgeModuleTypeService.getEnabledModuleTypes();
		return {
			success: true,
			message: "Module types retrieved successfully",
			data: moduleTypes,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch module types",
		};
	}
}

/**
 * Create module type
 */
export async function createModuleTypeAction(input: CreateKnowledgeModuleTypeInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "create");

		return await KnowledgeModuleTypeService.createModuleType(input);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create module type",
		};
	}
}

/**
 * Update module type
 */
export async function updateModuleTypeAction(moduleTypeId: string, input: UpdateKnowledgeModuleTypeInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "update");

		return await KnowledgeModuleTypeService.updateModuleType(moduleTypeId, input);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update module type",
		};
	}
}

/**
 * Delete module type
 */
export async function deleteModuleTypeAction(moduleTypeId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		await requirePermission("knowledge", "delete");

		return await KnowledgeModuleTypeService.deleteModuleType(moduleTypeId);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete module type",
		};
	}
}

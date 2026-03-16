"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { getPostTypePermissionModule, PostType } from "../../post/types";
import { categoryService } from "../services";
import { CreateCategoryInput, GetCategoriesOptions, UpdateCategoryInput } from "../types";

/**
 * Get paginated list of categories
 */
export async function listCategoriesAction(options?: GetCategoriesOptions): Promise<ActionResult> {
	try {
		const result = await categoryService.getCategories(options);
		return {
			success: true,
			data: result,
			message: "Categories retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve categories";
		console.error("[listCategoriesAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get all categories (no pagination)
 */
export async function getAllCategoriesAction(type?: PostType): Promise<ActionResult> {
	try {
		const categories = await categoryService.getAllCategories(type);
		return {
			success: true,
			data: categories,
			message: "Categories retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve categories";
		console.error("[getAllCategoriesAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get single category by ID
 */
export async function getCategoryAction(id: string): Promise<ActionResult> {
	try {
		const category = await categoryService.getCategoryById(id);
		return {
			success: true,
			data: category,
			message: "Category retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Category not found";
		console.error("[getCategoryAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Create new category
 */
export async function createCategoryAction(data: CreateCategoryInput): Promise<ActionResult> {
	try {
		// Check permission based on type
		await requirePermission(getPostTypePermissionModule(data.type), "create");

		const category = await categoryService.createCategory(data);
		revalidatePath(`/${getPostTypePermissionModule(data.type)}/categories`);

		await broadcastToAll("post_category_update", {
			action: "category_created",
			entity: category,
			timestamp: new Date().toISOString(),
		});

		return {
			success: true,
			data: category,
			message: "Category created successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create category";
		console.error("[createCategoryAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Update category
 */
export async function updateCategoryAction(id: string, data: UpdateCategoryInput): Promise<ActionResult> {
	try {
		// Get the category first to determine its type
		const category = await categoryService.getCategoryById(id);
		if (!category) {
			return {
				success: false,
				message: "Category not found",
			};
		}

		// Check permission based on type
		await requirePermission(getPostTypePermissionModule(category.type), "update");

		const updatedCategory = await categoryService.updateCategory(id, data);
		revalidatePath(`/${getPostTypePermissionModule(category.type)}/categories`);
		revalidatePath(`/${getPostTypePermissionModule(category.type)}/categories/${id}`);

		await broadcastToAll("post_category_update", {
			action: "category_updated",
			entity: updatedCategory,
			timestamp: new Date().toISOString(),
		});

		return {
			success: true,
			data: updatedCategory,
			message: "Category updated successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update category";
		console.error("[updateCategoryAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Delete category
 */
export async function deleteCategoryAction(id: string): Promise<ActionResult> {
	try {
		// Get the category first to determine its type
		const category = await categoryService.getCategoryById(id);
		if (!category) {
			return {
				success: false,
				message: "Category not found",
			};
		}

		// Check permission based on type
		await requirePermission(getPostTypePermissionModule(category.type), "delete");

		const deletedCategory = await categoryService.deleteCategory(id);
		revalidatePath(`/${getPostTypePermissionModule(category.type)}/categories`);

		await broadcastToAll("post_category_update", {
			action: "category_deleted",
			entity: category,
			timestamp: new Date().toISOString(),
		});

		return {
			success: true,
			data: deletedCategory,
			message: "Category deleted successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete category";
		console.error("[deleteCategoryAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Bulk delete categories
 */
export async function bulkDeleteCategoriesAction(ids: string[]): Promise<ActionResult> {
	try {
		if (ids.length === 0 || !ids[0]) {
			return {
				success: false,
				message: "No categories selected for deletion",
			};
		}

		// Get the first category to determine the type (assuming all categories are of the same type)
		const firstCategory = await categoryService.getCategoryById(ids[0]);
		if (!firstCategory) {
			return {
				success: false,
				message: "Categories not found",
			};
		}

		// Check permission based on type
		await requirePermission(getPostTypePermissionModule(firstCategory.type), "delete");

		const results = await Promise.allSettled(ids.map((id) => categoryService.deleteCategory(id)));

		const successful = results.filter((result) => result.status === "fulfilled").length;
		const failed = results.filter((result) => result.status === "rejected").length;

		revalidatePath(`/${getPostTypePermissionModule(firstCategory.type)}/categories`);

		return {
			success: true,
			data: { successful, failed },
			message: `${successful} categories deleted successfully${failed > 0 ? `, ${failed} failed` : ""}`,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete categories";
		console.error("[bulkDeleteCategoriesAction]", message);
		return {
			success: false,
			message,
		};
	}
}

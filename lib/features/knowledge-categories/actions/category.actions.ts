"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import { categoryService } from "../services";
import type { CreateCategoryInput, GetCategoriesOptions, UpdateCategoryInput } from "../types";

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
export async function getAllCategoriesAction(): Promise<ActionResult> {
	try {
		const categories = await categoryService.getAllCategories();
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
		await requirePermission("knowledge", "create");

		const category = await categoryService.createCategory(data);
		revalidatePath("/dashboard/knowledge/categories");

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
		await requirePermission("knowledge", "update");

		const category = await categoryService.updateCategory(id, data);
		revalidatePath("/dashboard/knowledge/categories");
		revalidatePath(`/dashboard/knowledge/categories/${id}`);

		return {
			success: true,
			data: category,
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
		await requirePermission("knowledge", "delete");

		const category = await categoryService.deleteCategory(id);
		revalidatePath("/dashboard/knowledge/categories");

		return {
			success: true,
			data: category,
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
 * Reorder categories
 */
export async function reorderCategoriesAction(categoryOrders: Array<{ id: string; order: number }>): Promise<ActionResult> {
	try {
		await requirePermission("knowledge", "update");

		const categories = await categoryService.reorderCategories(categoryOrders);
		revalidatePath("/dashboard/knowledge/categories");

		return {
			success: true,
			data: categories,
			message: "Categories reordered successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to reorder categories";
		console.error("[reorderCategoriesAction]", message);
		return {
			success: false,
			message,
		};
	}
}

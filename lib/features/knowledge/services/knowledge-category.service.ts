/**
 * Knowledge Category Service
 * Business logic for knowledge categories
 */

import type { ActionResult } from "@/lib/types";

import { KnowledgeCategoryRepository } from "../repositories";
import type { CreateCategoryInput, KnowledgeCategory, UpdateCategoryInput } from "../types";

export class KnowledgeCategoryService {
	/**
	 * Get all categories
	 */
	static async getCategories(): Promise<KnowledgeCategory[]> {
		try {
			return await KnowledgeCategoryRepository.findMany();
		} catch (error) {
			throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get category by ID
	 */
	static async getCategoryById(id: string): Promise<KnowledgeCategory | null> {
		try {
			return await KnowledgeCategoryRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch category: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new category (or return existing if already exists)
	 */
	static async createCategory(input: CreateCategoryInput): Promise<ActionResult> {
		try {
			// Check if category already exists by name
			const existingByName = await KnowledgeCategoryRepository.findByName(input.name);
			if (existingByName) {
				return {
					success: true,
					message: "Category already exists",
					data: existingByName,
				};
			}

			// Check if slug already exists
			if (await KnowledgeCategoryRepository.slugExists(input.slug)) {
				// Slug exists but name is different - try with modified slug
				let modifiedSlug = input.slug;
				let counter = 1;
				while (await KnowledgeCategoryRepository.slugExists(modifiedSlug)) {
					modifiedSlug = `${input.slug}-${counter}`;
					counter++;
				}
				input.slug = modifiedSlug;
			}

			const category = await KnowledgeCategoryRepository.create(input);

			return {
				success: true,
				message: "Category created successfully",
				data: category,
			};
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
	static async updateCategory(id: string, input: UpdateCategoryInput): Promise<ActionResult> {
		try {
			// Check category exists
			const category = await KnowledgeCategoryRepository.findById(id);
			if (!category) {
				return {
					success: false,
					message: "Category not found",
				};
			}

			// Validate slug if changed
			if (input.slug && input.slug !== category.slug) {
				if (await KnowledgeCategoryRepository.slugExists(input.slug, id)) {
					return {
						success: false,
						message: "Category with this slug already exists",
					};
				}
			}

			const updated = await KnowledgeCategoryRepository.update(id, input);

			return {
				success: true,
				message: "Category updated successfully",
				data: updated,
			};
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
	static async deleteCategory(id: string): Promise<ActionResult> {
		try {
			// Check category exists
			const category = await KnowledgeCategoryRepository.findById(id);
			if (!category) {
				return {
					success: false,
					message: "Category not found",
				};
			}

			const deleted = await KnowledgeCategoryRepository.delete(id);
			if (!deleted) {
				return {
					success: false,
					message: "Failed to delete category",
				};
			}

			return {
				success: true,
				message: "Category deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete category",
			};
		}
	}
}

/**
 * Blog Categories Service
 * Business logic for blog categories
 */

import { PostType } from "../../post/types";
import { categoryRepository } from "../repositories";
import { CreateCategoryInput, GetCategoriesOptions, PostCategory, UpdateCategoryInput } from "../types";

export class CategoryService {
	/**
	 * Get all categories with pagination
	 */
	async getCategories(options?: GetCategoriesOptions) {
		return categoryRepository.findMany(options);
	}

	/**
	 * Get category by ID
	 */
	async getCategoryById(id: string): Promise<PostCategory> {
		const category = await categoryRepository.findById(id);
		if (!category) {
			throw new Error(`Category with ID "${id}" not found`);
		}
		return category;
	}

	/**
	 * Get category by slug
	 */
	async getCategoryBySlug(slug: string, type?: PostType): Promise<PostCategory> {
		const category = await categoryRepository.findBySlug(slug, type);
		if (!category) {
			throw new Error(`Category with slug "${slug}" not found`);
		}
		return category;
	}

	/**
	 * Get all categories (no pagination)
	 */
	async getAllCategories(type?: PostType): Promise<PostCategory[]> {
		return categoryRepository.findAll(type);
	}

	/**
	 * Create new category
	 */
	async createCategory(data: CreateCategoryInput): Promise<PostCategory> {
		// Validate required fields
		if (!data.name?.trim()) {
			throw new Error("Category name is required");
		}
		if (!data.slug?.trim()) {
			throw new Error("Category slug is required");
		}
		if (!data.type) {
			throw new Error("Category type is required");
		}

		// Check if slug is unique within the same type
		const isUnique = await categoryRepository.isSlugUnique(data.slug, data.type);
		if (!isUnique) {
			throw new Error(`Category slug "${data.slug}" is already in use for ${data.type} posts`);
		}

		// Create category
		const category = await categoryRepository.create(data);

		// Emit event for realtime updates
		console.log("[CategoryService] Category created:", category.id);

		return category;
	}

	/**
	 * Update category
	 */
	async updateCategory(id: string, data: UpdateCategoryInput): Promise<PostCategory> {
		// Verify category exists
		const existing = await this.getCategoryById(id);

		// Validate slug if provided
		if (data.slug && data.slug !== existing.slug) {
			const isUnique = await categoryRepository.isSlugUnique(data.slug, existing.type, id);
			if (!isUnique) {
				throw new Error(`Category slug "${data.slug}" is already in use for ${existing.type} posts`);
			}
		}

		// Update category
		const category = await categoryRepository.update(id, data);

		// Emit event for realtime updates
		console.log("[CategoryService] Category updated:", id);

		return category;
	}

	/**
	 * Delete category
	 */
	async deleteCategory(id: string): Promise<PostCategory> {
		// Verify category exists
		await this.getCategoryById(id);

		// Check if category has posts
		// This should be done via Prisma or database constraint
		// For now, we'll just delete it and let the database handle constraints

		// Delete category
		const deleted = await categoryRepository.delete(id);

		// Emit event for realtime updates
		console.log("[CategoryService] Category deleted:", id);

		return deleted;
	}
}

export const categoryService = new CategoryService();

/**
 * Knowledge Categories Service
 * Business logic for knowledge categories
 */

import { categoryRepository } from "../repositories";
import { CreateCategoryInput, GetCategoriesOptions, KnowledgeCategory, UpdateCategoryInput } from "../types";

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
	async getCategoryById(id: string): Promise<KnowledgeCategory> {
		const category = await categoryRepository.findById(id);
		if (!category) {
			throw new Error(`Category with ID "${id}" not found`);
		}
		return category;
	}

	/**
	 * Get category by slug
	 */
	async getCategoryBySlug(slug: string): Promise<KnowledgeCategory> {
		const category = await categoryRepository.findBySlug(slug);
		if (!category) {
			throw new Error(`Category with slug "${slug}" not found`);
		}
		return category;
	}

	/**
	 * Get all categories (no pagination)
	 */
	async getAllCategories(): Promise<KnowledgeCategory[]> {
		return categoryRepository.findAll();
	}

	/**
	 * Create new category
	 */
	async createCategory(data: CreateCategoryInput): Promise<KnowledgeCategory> {
		// Validate required fields
		if (!data.name?.trim()) {
			throw new Error("Category name is required");
		}
		if (!data.slug?.trim()) {
			throw new Error("Category slug is required");
		}

		// Check if slug is unique
		const isUnique = await categoryRepository.isSlugUnique(data.slug);
		if (!isUnique) {
			throw new Error(`Category slug "${data.slug}" is already in use`);
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
	async updateCategory(id: string, data: UpdateCategoryInput): Promise<KnowledgeCategory> {
		// Verify category exists
		const existing = await this.getCategoryById(id);

		// Validate slug if provided
		if (data.slug && data.slug !== existing.slug) {
			const isUnique = await categoryRepository.isSlugUnique(data.slug, id);
			if (!isUnique) {
				throw new Error(`Category slug "${data.slug}" is already in use`);
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
	async deleteCategory(id: string): Promise<KnowledgeCategory> {
		// Verify category exists
		await this.getCategoryById(id);

		// Check if category has articles
		// This should be done via Prisma or database constraint
		// For now, we'll just delete it and let the database handle constraints

		// Delete category
		const deleted = await categoryRepository.delete(id);

		// Emit event for realtime updates
		console.log("[CategoryService] Category deleted:", id);

		return deleted;
	}

	/**
	 * Reorder categories
	 */
	async reorderCategories(categoryOrders: Array<{ id: string; order: number }>): Promise<KnowledgeCategory[]> {
		// Update all categories with new order
		const updated = await Promise.all(categoryOrders.map(({ id, order }) => categoryRepository.update(id, { order })));

		console.log("[CategoryService] Categories reordered");
		return updated;
	}
}

export const categoryService = new CategoryService();

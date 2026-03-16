/**
 * Knowledge Service
 * Business logic for knowledge articles
 */

import type { ActionResult } from "@/lib/types";

import { KnowledgeCategoryRepository, KnowledgeRepository, KnowledgeTagRepository } from "../repositories";
import type { CreateKnowledgeInput, KnowledgeWithRelations, PaginatedResult, UpdateKnowledgeInput } from "../types";

export class KnowledgeService {
	/**
	 * Get all articles with pagination and filtering
	 */
	static async getArticles(options: Parameters<typeof KnowledgeRepository.findMany>[0]): Promise<PaginatedResult<KnowledgeWithRelations>> {
		try {
			const result = await KnowledgeRepository.findMany(options);
			return result;
		} catch (error) {
			throw new Error(`Failed to fetch articles: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single article by ID
	 */
	static async getArticleById(id: string): Promise<KnowledgeWithRelations | null> {
		try {
			return await KnowledgeRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch article: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get article by slug (public view with view count increment)
	 */
	static async getPublicArticle(slug: string, type?: string): Promise<KnowledgeWithRelations | null> {
		try {
			const article = await KnowledgeRepository.findBySlug(slug);
			if (article && type && article.type !== type) {
				return null;
			}
			return article;
		} catch (error) {
			throw new Error(`Failed to fetch article: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new article
	 */
	static async createArticle(input: CreateKnowledgeInput): Promise<ActionResult> {
		try {
			// Validate slug is unique
			if (await KnowledgeRepository.slugExists(input.slug)) {
				return {
					success: false,
					message: "Article with this slug already exists",
				};
			}

			// Validate categories exist (require at least one)
			const categoryIds = input.categoryIds || [];
			if (!categoryIds || categoryIds.length === 0) {
				return {
					success: false,
					message: "At least one category is required",
				};
			}

			// Verify all categories exist
			for (const catId of categoryIds) {
				const category = await KnowledgeCategoryRepository.findById(catId);
				if (!category) {
					return {
						success: false,
						message: `Category with ID ${catId} not found`,
					};
				}
			}

			// Validate tags exist if provided
			if (input.tagIds && input.tagIds.length > 0) {
				const tags = await KnowledgeTagRepository.findByIds(input.tagIds);
				if (tags.length !== input.tagIds.length) {
					return {
						success: false,
						message: "One or more tags not found",
					};
				}
			}

			const article = await KnowledgeRepository.create({
				...input,
				categoryIds: categoryIds,
			});

			return {
				success: true,
				message: "Article created successfully",
				data: article,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create article",
			};
		}
	}

	/**
	 * Update article
	 */
	static async updateArticle(id: string, input: UpdateKnowledgeInput): Promise<ActionResult> {
		try {
			// Check article exists
			const article = await KnowledgeRepository.findById(id);
			if (!article) {
				return {
					success: false,
					message: "Article not found",
				};
			}

			// Validate slug if changed
			if (input.slug && input.slug !== article.slug) {
				if (await KnowledgeRepository.slugExists(input.slug, id)) {
					return {
						success: false,
						message: "Article with this slug already exists",
					};
				}
			}

			// Validate categories if changed (require at least one)
			if (input.categoryIds && input.categoryIds.length > 0) {
				// Verify all categories exist
				for (const catId of input.categoryIds) {
					const category = await KnowledgeCategoryRepository.findById(catId);
					if (!category) {
						return {
							success: false,
							message: `Category with ID ${catId} not found`,
						};
					}
				}
			}

			// Validate tags if provided
			if (input.tagIds) {
				if (input.tagIds.length > 0) {
					const tags = await KnowledgeTagRepository.findByIds(input.tagIds);
					if (tags.length !== input.tagIds.length) {
						return {
							success: false,
							message: "One or more tags not found",
						};
					}
				}
			}

			const updated = await KnowledgeRepository.update(id, input);

			// Refetch to ensure assignedUsers are loaded correctly after update
			const refetched = await KnowledgeRepository.findById(id);

			return {
				success: true,
				message: "Article updated successfully",
				data: refetched || updated,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update article",
			};
		}
	}

	/**
	 * Delete article
	 */
	static async deleteArticle(id: string): Promise<ActionResult> {
		try {
			// Check article exists
			const article = await KnowledgeRepository.findById(id);
			if (!article) {
				return {
					success: false,
					message: "Article not found",
				};
			}

			const deleted = await KnowledgeRepository.delete(id);
			if (!deleted) {
				return {
					success: false,
					message: "Failed to delete article",
				};
			}

			return {
				success: true,
				message: "Article deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete article",
			};
		}
	}

	/**
	 * Bulk delete articles
	 */
	static async bulkDeleteArticles(ids: string[]): Promise<ActionResult> {
		try {
			if (!ids.length) {
				return {
					success: false,
					message: "No articles to delete",
				};
			}

			// Check all articles exist
			for (const id of ids) {
				const article = await KnowledgeRepository.findById(id);
				if (!article) {
					return {
						success: false,
						message: `Article with ID ${id} not found`,
					};
				}
			}

			// Delete all articles
			const deleted = await KnowledgeRepository.deleteMany(ids);

			return {
				success: true,
				message: `${deleted} article(s) deleted successfully`,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete articles",
			};
		}
	}

	/**
	 * Get article by ID with view count increment (for course viewing)
	 */
	static async getArticleByIdWithViewIncrement(id: string): Promise<KnowledgeWithRelations | null> {
		try {
			const article = await KnowledgeRepository.findById(id);
			if (article) {
				// Increment view count
				await KnowledgeRepository.incrementViewCount(id);
			}
			return article;
		} catch (error) {
			throw new Error(`Failed to fetch article: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Count total knowledge articles
	 */
	static async countArticles(options: Parameters<typeof KnowledgeRepository.count>[0] = {}): Promise<number> {
		try {
			return await KnowledgeRepository.count(options);
		} catch (error) {
			throw new Error(`Failed to count articles: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}

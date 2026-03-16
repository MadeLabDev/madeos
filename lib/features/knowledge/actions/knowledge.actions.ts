/**
 * Knowledge Article Server Actions
 * Server-side actions for knowledge article management
 */

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import { moduleTypeService } from "../../profile/services";
import { KnowledgeCategoryService, KnowledgeService, KnowledgeTagService } from "../services";
import { CreateKnowledgeInput, KnowledgeWithRelations, PaginatedResult, UpdateKnowledgeInput } from "../types";

/**
 * Get all articles with pagination
 */
export async function getArticlesAction(options: Parameters<typeof KnowledgeService.getArticles>[0]): Promise<ActionResult<PaginatedResult<KnowledgeWithRelations>>> {
	try {
		const result = await KnowledgeService.getArticles(options);
		return {
			success: true,
			message: "Articles retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch articles",
		};
	}
}

/**
 * Get single article by ID
 */
export async function getArticleAction(articleId: string): Promise<ActionResult> {
	try {
		const article = await KnowledgeService.getArticleById(articleId);
		if (!article) {
			return {
				success: false,
				message: "Article not found",
			};
		}

		return {
			success: true,
			message: "Article retrieved successfully",
			data: article,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch article",
		};
	}
}

/**
 * Get course by ID with view count increment
 */
export async function getCourseAction(courseId: string): Promise<ActionResult> {
	try {
		const course = await KnowledgeService.getArticleByIdWithViewIncrement(courseId);
		if (!course) {
			return {
				success: false,
				message: "Course not found",
			};
		}

		return {
			success: true,
			message: "Course retrieved successfully",
			data: course,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch course",
		};
	}
}

/**
 * Get article by slug (public)
 */
export async function getPublicArticleAction(slug: string, type?: string): Promise<ActionResult> {
	try {
		const article = await KnowledgeService.getPublicArticle(slug, type);
		if (!article) {
			return {
				success: false,
				message: "Article not found",
			};
		}

		return {
			success: true,
			message: "Public article retrieved successfully",
			data: article,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch article",
		};
	}
}

/**
 * Create new article
 */
export async function createArticleAction(input: CreateKnowledgeInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Check permission
		await requirePermission("knowledge", "create");

		const result = await KnowledgeService.createArticle(input);

		// Index in vector search (non-blocking)
		if (result.success && result.data) {
			try {
				const { indexKnowledgeArticle } = await import("@/lib/features/vector-search/actions");
				const article = result.data as any;
				await indexKnowledgeArticle(article.id, article.title, article.content);
			} catch (indexError) {
				// Log but don't fail the main action
				console.warn("Failed to index knowledge article:", indexError);
			}
		}

		// Revalidate cache
		revalidatePath("/knowledge");

		return result;
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
export async function updateArticleAction(articleId: string, input: UpdateKnowledgeInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Check permission
		await requirePermission("knowledge", "update");

		const result = await KnowledgeService.updateArticle(articleId, input);

		// Re-index in vector search (non-blocking)
		if (result.success && result.data) {
			try {
				const { deleteEntityVectors, indexKnowledgeArticle } = await import("@/lib/features/vector-search/actions");
				// Delete old vectors
				await deleteEntityVectors("knowledge", articleId);
				// Index updated content
				const article = result.data as any;
				await indexKnowledgeArticle(article.id, article.title, article.content);
			} catch (indexError) {
				// Log but don't fail the main action
				console.warn("Failed to update knowledge index:", indexError);
			}
		}

		// Revalidate cache
		revalidatePath("/knowledge");
		revalidatePath(`/knowledge/${articleId}`);

		return result;
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
export async function deleteArticleAction(articleId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Check permission
		await requirePermission("knowledge", "delete");

		const result = await KnowledgeService.deleteArticle(articleId);

		// Clean up vectors (non-blocking)
		if (result.success) {
			try {
				const { deleteEntityVectors } = await import("@/lib/features/vector-search/actions");
				await deleteEntityVectors("knowledge", articleId);
			} catch (indexError) {
				// Log but don't fail the main action
				console.warn("Failed to delete knowledge vectors:", indexError);
			}
		}

		// Revalidate cache
		revalidatePath("/knowledge");

		return result;
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
export async function bulkDeleteArticlesAction(articleIds: string[]): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		if (!articleIds.length) {
			return {
				success: false,
				message: "No articles selected",
			};
		}

		// Check permission
		await requirePermission("knowledge", "delete");

		return await KnowledgeService.bulkDeleteArticles(articleIds);
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete articles",
		};
	}
}

/**
 * Get all categories for select/dropdown
 */
export async function getCategoriesAction(): Promise<ActionResult> {
	try {
		await requirePermission("knowledge", "read");

		const categories = await KnowledgeCategoryService.getCategories();
		return {
			success: true,
			message: "Categories retrieved successfully",
			data: categories,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch categories",
		};
	}
}

/**
 * Get all tags for select/dropdown
 */
export async function getTagsAction(): Promise<ActionResult> {
	try {
		await requirePermission("knowledge", "read");

		const tags = await KnowledgeTagService.getTags();
		return {
			success: true,
			message: "Tags retrieved successfully",
			data: tags,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch tags",
		};
	}
}

/**
 * Get module types for knowledge system
 */
export async function getKnowledgeSystemModuleTypesAction(system: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const knowledgeModuleTypes = await moduleTypeService.getModuleTypesBySystem(system);

		return {
			success: true,
			message: "Knowledge system module types retrieved",
			data: knowledgeModuleTypes,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get knowledge system module types",
		};
	}
}

/**
 * Search users for knowledge article assignment
 */
export async function searchKnowledgeUsersAction(query: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Check permission
		await requirePermission("knowledge", "update");

		const { getUsersAction } = await import("@/lib/features/users/actions/user-actions");

		const result = await getUsersAction({
			search: query,
			pageSize: 20, // Limit results for performance
		});

		if (result.success) {
			return {
				success: true,
				message: "Users retrieved successfully",
				data: (result.data as any)?.users || [],
			};
		} else {
			return {
				success: false,
				message: result.message,
			};
		}
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to search users",
		};
	}
}

/**
 * Count total knowledge articles
 */
export async function countArticlesAction(options: Parameters<typeof KnowledgeService.countArticles>[0] = {}): Promise<ActionResult<number>> {
	try {
		const count = await KnowledgeService.countArticles(options);
		return {
			success: true,
			message: "Articles counted successfully",
			data: count,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to count articles",
		};
	}
}

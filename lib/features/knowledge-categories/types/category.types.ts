/**
 * Knowledge Categories Types
 * Types for Knowledge Base category management
 */

// ============================================================================
// CATEGORY TYPES
// ============================================================================

/**
 * KnowledgeCategory - Category for organizing knowledge articles
 */
export interface KnowledgeCategory {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	color: string | null;
	icon: string | null;
	order: number;
	createdAt: Date;
	updatedAt: Date;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * CreateCategoryInput - Input for creating new category
 */
export interface CreateCategoryInput {
	name: string;
	slug: string;
	description?: string;
	color?: string;
	icon?: string;
	order?: number;
}

/**
 * UpdateCategoryInput - Input for updating category
 */
export interface UpdateCategoryInput {
	name?: string;
	slug?: string;
	description?: string;
	color?: string;
	icon?: string;
	order?: number;
}

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * GetCategoriesOptions - Options for querying categories
 */
export interface GetCategoriesOptions {
	page?: number;
	pageSize?: number;
	search?: string;
	orderBy?: "name" | "createdAt" | "order";
	orderDir?: "asc" | "desc";
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

// ActionResult is now imported from @/lib/types

/**
 * PaginatedResult - Paginated result wrapper
 */
export interface PaginatedResult<T> {
	items: T[];
	total: number;
	pageCount: number;
	currentPage: number;
}

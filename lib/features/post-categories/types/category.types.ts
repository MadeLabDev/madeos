/**
 * Post Categories Types
 * Types for Post category management
 */

import type { PostType } from "../../post/types";

// Re-export shared types

// ============================================================================
// CATEGORY TYPES
// ============================================================================

/**
 * PostCategory - Category for organizing posts
 */
export interface PostCategory {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	type: PostType;
	color: string | null;
	createdAt: Date;
	updatedAt: Date;
	_count?: {
		posts: number;
	};
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
	type: PostType;
	color?: string;
}

/**
 * UpdateCategoryInput - Input for updating category
 */
export interface UpdateCategoryInput {
	name?: string;
	slug?: string;
	description?: string;
	type?: PostType;
	color?: string;
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
	type?: PostType;
	orderBy?: "name" | "createdAt";
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

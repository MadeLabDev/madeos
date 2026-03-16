/**
 * Post Tags Types
 * Types for Post tag management
 */

import type { PostType } from "@/lib/features/post/types";

// ============================================================================
// TAG TYPES
// ============================================================================

/**
 * PostTag - Tag for organizing posts
 */
export interface PostTag {
	id: string;
	name: string;
	slug: string;
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
 * CreateTagInput - Input for creating new tag
 */
export interface CreateTagInput {
	name: string;
	slug: string;
	type: PostType;
	color?: string;
}

/**
 * UpdateTagInput - Input for updating tag
 */
export interface UpdateTagInput {
	name?: string;
	slug?: string;
	type?: PostType;
	color?: string;
}

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * GetTagsOptions - Options for querying tags
 */
export interface GetTagsOptions {
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

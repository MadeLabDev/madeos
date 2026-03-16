/**
 * Post Feature Types
 * Types for Post / Blog system
 */

type JsonValue = any; // Prisma JSON type

// ============================================================================
// POST TYPES
// ============================================================================

/**
 * PostType - Supported post types (string to allow any type)
 */
export type PostType = string;

/**
 * Map post type to permission module name
 * @param type - The post type
 * @returns The corresponding permission module name
 */
export function getPostTypePermissionModule(type: PostType): string {
	// For other types, use the type as the module name
	return type;
}

/**
 * Post - Main post article model
 * Represents a blog post with full metadata
 */
export interface Post {
	id: string;
	title: string;
	slug: string;
	content: string; // Tiptap JSON (serialized as string)
	excerpt: string | null;
	thumbnail: string | null;

	// Categorization (many-to-many via junction table)
	categories?: PostCategory[];

	// Tags (many-to-many)
	tags?: PostTag[];

	// Type & Visibility
	type: PostType; // e.g., "blog", "sponsor"
	visibility: string;

	// Metadata
	viewCount: number;
	isPublished: boolean;
	publishedAt: Date | null;

	// Meta data for dynamic fields
	metaData: JsonValue;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;
}

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

/**
 * PostTag - Tag for flexible categorization
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

/**
 * PostWithRelations - Post article with all relations loaded
 */
export interface PostWithRelations extends Post {
	categories: PostCategory[];
	tags: PostTag[];
}

// ============================================================================
// INPUT/OUTPUT TYPES
// ============================================================================

/**
 * CreatePostInput - Input for creating new post
 */
export interface CreatePostInput {
	title: string;
	slug: string;
	content: string;
	excerpt?: string;
	thumbnail?: string;
	categoryIds?: string[]; // Support multiple categories
	tagIds?: string[];
	tagNames?: string[]; // For form input (will be converted to tagIds)
	type: PostType;
	visibility?: string;
	isPublished?: boolean;
	publishedAt?: Date;
	metaData?: JsonValue;
}

/**
 * UpdatePostInput - Input for updating post
 */
export interface UpdatePostInput {
	title?: string;
	slug?: string;
	content?: string;
	excerpt?: string;
	thumbnail?: string;
	categoryIds?: string[]; // Support multiple categories
	tagIds?: string[];
	tagNames?: string[]; // For form input (will be converted to tagIds)
	type?: PostType;
	visibility?: string;
	isPublished?: boolean;
	publishedAt?: Date;
	metaData?: JsonValue;
}

/**
 * CreatePostCategoryInput - Input for creating category
 */
export interface CreatePostCategoryInput {
	name: string;
	slug: string;
	description?: string;
	color?: string;
	icon?: string;
	order?: number;
}

/**
 * UpdatePostCategoryInput - Input for updating category
 */
export interface UpdatePostCategoryInput {
	name?: string;
	slug?: string;
	description?: string;
	color?: string;
	icon?: string;
	order?: number;
}

/**
 * CreatePostTagInput - Input for creating tag
 */
export interface CreatePostTagInput {
	name: string;
	slug: string;
	color?: string;
}

/**
 * UpdatePostTagInput - Input for updating tag
 */
export interface UpdatePostTagInput {
	name?: string;
	slug?: string;
	color?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

// ActionResult is now imported from @/lib/types

/**
 * PaginatedResult - Paginated result
 */
export interface PaginatedResult<T> {
	items: T[];
	total: number;
	pageCount: number;
	currentPage: number;
}

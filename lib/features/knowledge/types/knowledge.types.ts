/**
 * Knowledge Feature Types
 * Types for Knowledge Base / Blog / Wiki system
 */

import type { ActionResult, PaginatedResult } from "@/lib/types";

// Re-export shared types for convenience
export type { ActionResult, PaginatedResult };

// ============================================================================
// KNOWLEDGE ARTICLE TYPES
// ============================================================================

/**
 * KnowledgeArticle - Main knowledge article model
 * Represents a blog/wiki article with full metadata
 */
export interface KnowledgeArticle {
	id: string;
	title: string;
	slug: string;
	content: string; // Tiptap JSON (serialized as string)
	excerpt: string | null;
	thumbnail: string | null;

	// Event relations (many-to-many)
	events?: Array<{
		id: string;
		title: string;
		slug: string;
		startDate: Date;
		endDate: Date;
	}>;

	// Categorization (many-to-many via junction table)
	categories?: KnowledgeCategory[];

	// Tags (many-to-many)
	tags?: KnowledgeTag[];

	// Type & Visibility ✨ NEW
	type: "knowledge" | "course";
	visibility: "public" | "private";
	assignedUsers?: KnowledgeAssignedUser[]; // Keep for backward compatibility
	assignedGroups?: KnowledgeAssignedGroup[]; // ✨ NEW: Groups assigned to private article

	// Metadata
	viewCount: number;
	isPublished: boolean;
	publishedAt: Date | null;
	metaData?: Record<string, any>;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;
}

/**
 * KnowledgeCategory - Category for organizing articles
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

/**
 * KnowledgeTag - Tag for flexible categorization
 */
export interface KnowledgeTag {
	id: string;
	name: string;
	slug: string;
	color: string | null;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * KnowledgeAssignedUser - User assigned to private article
 */
export interface KnowledgeAssignedUser {
	id: string;
	knowledgeId: string;
	userId: string;
	user?: {
		id: string;
		name: string | null;
		email: string;
		image: string | null;
	};
	assignedAt: Date;
	assignedBy: string | null;
}

/**
 * KnowledgeAssignedGroup - User group assigned to private article
 */
export interface KnowledgeAssignedGroup {
	id: string;
	knowledgeId: string;
	groupId: string;
	group?: {
		id: string;
		name: string;
		description: string | null;
		members?: Array<{
			id: string;
			userId: string;
			user: {
				id: string;
				name: string | null;
				email: string;
			};
		}>;
	};
	assignedAt: Date;
	assignedBy: string | null;
}

/**
 * KnowledgeWithRelations - Knowledge article with all relations loaded
 */
export interface KnowledgeWithRelations extends KnowledgeArticle {
	categories: KnowledgeCategory[];
	tags: KnowledgeTag[];
	events: Array<{
		id: string;
		title: string;
		slug: string;
		startDate: Date;
		endDate: Date;
	}>;
}

// ============================================================================
// MODULE TYPE FOR PROFILE BUILDER
// ============================================================================

/**
 * KnowledgeModuleType - Module type definition for Profile Builder
 * Used in UserProfileModule when rendering Knowledge content
 */
export interface KnowledgeModuleType {
	id: string;
	key: string; // e.g., "knowledge_article_preview", "knowledge_featured"
	name: string;
	system: string; // Always "knowledge"
	description: string | null;
	icon: string | null;
	fieldSchema: Record<string, any> | null; // JSON schema
	isEnabled: boolean;
	order: number;
	createdAt: Date;
	updatedAt: Date;
}

// ============================================================================
// INPUT/OUTPUT TYPES
// ============================================================================

/**
 * CreateKnowledgeInput - Input for creating new article
 */
export interface CreateKnowledgeInput {
	title: string;
	slug: string;
	content: string;
	excerpt?: string;
	thumbnail?: string;
	eventIds?: string[]; // Support multiple events
	categoryId?: string;
	categoryIds?: string[]; // Support multiple categories
	tagIds?: string[];
	tagNames?: string[]; // For form input (will be converted to tagIds)
	type?: "blog" | "knowledge" | "course";
	visibility?: "public" | "private";
	assignedUserIds?: string[]; // Users who can access private articles (deprecated - use assignedGroupIds)
	assignedGroupIds?: string[]; // ✨ NEW: Groups who can access private articles
	isPublished?: boolean;
	publishedAt?: Date;
	metaData?: Record<string, any>;
}

/**
 * UpdateKnowledgeInput - Input for updating article
 */
export interface UpdateKnowledgeInput {
	title?: string;
	slug?: string;
	content?: string;
	excerpt?: string;
	thumbnail?: string;
	eventIds?: string[]; // Support multiple events
	categoryId?: string;
	categoryIds?: string[]; // Support multiple categories
	tagIds?: string[];
	tagNames?: string[]; // For form input (will be converted to tagIds)
	type?: "blog" | "knowledge" | "course";
	visibility?: "public" | "private";
	assignedUserIds?: string[]; // Users who can access private articles (deprecated - use assignedGroupIds)
	assignedGroupIds?: string[]; // ✨ NEW: Groups who can access private articles
	isPublished?: boolean;
	publishedAt?: Date;
	metaData?: Record<string, any>;
}

/**
 * CreateCategoryInput - Input for creating category
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

/**
 * CreateTagInput - Input for creating tag
 */
export interface CreateTagInput {
	name: string;
	slug: string;
	color?: string;
}

/**
 * UpdateTagInput - Input for updating tag
 */
export interface UpdateTagInput {
	name?: string;
	slug?: string;
	color?: string;
}

/**
 * CreateKnowledgeModuleTypeInput - Input for creating module type
 */
export interface CreateKnowledgeModuleTypeInput {
	key: string;
	name: string;
	description?: string;
	icon?: string;
	fieldSchema?: Record<string, any>;
	isEnabled?: boolean;
	order?: number;
}

/**
 * UpdateKnowledgeModuleTypeInput - Input for updating module type
 */
export interface UpdateKnowledgeModuleTypeInput {
	key?: string;
	name?: string;
	description?: string;
	icon?: string;
	fieldSchema?: Record<string, any>;
	isEnabled?: boolean;
	order?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

// ActionResult and PaginatedResult are now imported from @/lib/types

/**
 * KnowledgePaginatedResult - Knowledge-specific paginated result
 */
export interface KnowledgePaginatedResult<T> {
	items: T[];
	total: number;
	pageCount: number;
	currentPage: number;
}

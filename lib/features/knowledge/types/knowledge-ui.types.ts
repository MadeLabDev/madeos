/**
 * Knowledge UI Component Types
 * Types for components in app/(dashboard)/knowledge/*
 */

import type { KnowledgeArticle, KnowledgeCategory, KnowledgeTag, KnowledgeWithRelations } from "./knowledge.types";

// ============================================================================
// MAIN KNOWLEDGE PAGE COMPONENT TYPES
// ============================================================================

/**
 * KnowledgeListProps - Knowledge list component props
 */
export interface KnowledgeListProps {
	page: number;
	search: string;
	categoryId: string;
	pageSize: number;
}

/**
 * KnowledgeDetailProps - Knowledge detail page
 */
export interface KnowledgeDetailProps {
	article: KnowledgeWithRelations;
}

// ============================================================================
// KNOWLEDGE LIST COMPONENT TYPES
// ============================================================================

/**
 * KnowledgeTableProps - Table component for displaying articles
 */
export interface KnowledgeTableProps {
	articles: KnowledgeWithRelations[];
	categories: KnowledgeCategory[];
	tags: KnowledgeTag[];
	onArticleDeleted?: (articleId: string) => void;
	onArticleUpdated?: (article: KnowledgeWithRelations) => void;
	page?: number;
	pageSize?: number;
	total?: number;
	onPageChange?: (page: number) => void;
}

/**
 * KnowledgeTableRowProps - Single row in knowledge table
 */
export interface KnowledgeTableRowProps {
	article: KnowledgeWithRelations;
	onDelete?: (articleId: string) => void;
	onUpdate?: (article: KnowledgeWithRelations) => void;
}

// ============================================================================
// FORM COMPONENT TYPES
// ============================================================================

/**
 * KnowledgeFormProps - Form for creating/editing knowledge article
 */
export interface KnowledgeFormProps {
	article?: KnowledgeArticle | null;
	categories: KnowledgeCategory[];
	tags: KnowledgeTag[];
	isLoading?: boolean;
	hideButtons?: boolean;
	moduleTypes?: any[];
}

/**
 * CategorySelectProps - Select component for category
 */
export interface CategorySelectProps {
	categories: KnowledgeCategory[];
	value?: string;
	onChange?: (categoryId: string) => void;
	isLoading?: boolean;
}

/**
 * TagSelectProps - Multi-select component for tags
 */
export interface TagSelectProps {
	tags: KnowledgeTag[];
	selectedTags?: string[];
	onChange?: (tagIds: string[]) => void;
	isLoading?: boolean;
}

// ============================================================================
// DIALOG COMPONENT TYPES
// ============================================================================

/**
 * AddKnowledgeDialogProps - Dialog for adding new article
 */
export interface AddKnowledgeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categories: KnowledgeCategory[];
	tags: KnowledgeTag[];
	onArticleAdded?: (article: KnowledgeWithRelations) => void;
}

/**
 * EditKnowledgeDialogProps - Dialog for editing article
 */
export interface EditKnowledgeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	article: KnowledgeArticle;
	categories: KnowledgeCategory[];
	tags: KnowledgeTag[];
	onArticleUpdated?: (article: KnowledgeWithRelations) => void;
}

/**
 * DeleteKnowledgeConfirmProps - Confirmation dialog for deletion
 */
export interface DeleteKnowledgeConfirmProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	articleTitle: string;
	isLoading?: boolean;
	onConfirm: () => Promise<void>;
}

// ============================================================================
// CATEGORY & TAG MANAGEMENT TYPES
// ============================================================================

/**
 * CategoryListProps - List of categories
 */
export interface CategoryListProps {
	categories: KnowledgeCategory[];
	onCategoryDeleted?: (categoryId: string) => void;
	onCategoryUpdated?: (category: KnowledgeCategory) => void;
}

/**
 * TagListProps - List of tags
 */
export interface TagListProps {
	tags: KnowledgeTag[];
	onTagDeleted?: (tagId: string) => void;
	onTagUpdated?: (tag: KnowledgeTag) => void;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

/**
 * KnowledgeSearchParams - Search and filter parameters
 */
export interface KnowledgeSearchParams {
	page?: number;
	search?: string;
	categoryId?: string;
	tagIds?: string[];
	isPublished?: boolean;
	sortBy?: "createdAt" | "publishedAt" | "viewCount" | "title";
	sortOrder?: "asc" | "desc";
}

/**
 * KnowledgeSearchFormProps - Search/filter form component
 */
export interface KnowledgeSearchFormProps {
	categories: KnowledgeCategory[];
	tags: KnowledgeTag[];
	onSearch: (params: KnowledgeSearchParams) => void;
	isLoading?: boolean;
}

// ============================================================================
// FORM COMPONENT TYPES
// ============================================================================

export interface NewKnowledgeFormProps {
	categories: KnowledgeCategory[];
	tags: KnowledgeTag[];
	moduleTypes?: any[];
}

export interface EditKnowledgeFormProps {
	article: KnowledgeArticle;
	categories: KnowledgeCategory[];
	tags: KnowledgeTag[];
	moduleTypes?: any[];
}

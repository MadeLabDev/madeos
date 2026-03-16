/**
 * Knowledge Categories UI Component Types
 * Types for components in app/(dashboard)/knowledge/categories/*
 */

import type { KnowledgeCategory } from "./category.types";

export interface CategoryFormProps {
	category?: KnowledgeCategory;
	isEditing?: boolean;
	hideButtons?: boolean;
}

export interface CategoryListProps {
	categories: KnowledgeCategory[];
	total: number;
	page: number;
	pageSize: number;
	search?: string;
}

export interface CategoryDetailWrapperProps {
	categoryId: string;
	initialCategory: KnowledgeCategory;
}

export interface EditCategoryFormProps {
	category: KnowledgeCategory;
}

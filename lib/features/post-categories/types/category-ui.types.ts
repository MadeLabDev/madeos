/**
 * Blog Categories UI Component Types
 * Types for components in app/(dashboard)/blog/categories/*
 */

import type { PostCategory } from "./category.types";

export interface CategoryFormProps {
	category?: PostCategory;
	isEditing?: boolean;
	hideButtons?: boolean;
}

export interface CategoryListProps {
	categories: PostCategory[];
	total: number;
	page: number;
	pageSize: number;
	search?: string;
}

export interface CategoryDetailWrapperProps {
	categoryId: string;
	initialCategory: PostCategory;
}

export interface EditCategoryFormProps {
	category: PostCategory;
}

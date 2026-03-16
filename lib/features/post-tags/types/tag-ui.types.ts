/**
 * Blog Tags UI Component Types
 * Types for components in app/(dashboard)/blog/tags/*
 */

import type { PostTag } from "./tag.types";

export interface TagFormProps {
	tag?: PostTag;
	isEditing?: boolean;
	hideButtons?: boolean;
}

export interface TagListProps {
	tags: PostTag[];
	total: number;
	page: number;
	pageSize: number;
	search?: string;
}

export interface TagDetailWrapperProps {
	tagId: string;
	initialTag: PostTag;
}

export interface EditTagFormProps {
	tag: PostTag;
}

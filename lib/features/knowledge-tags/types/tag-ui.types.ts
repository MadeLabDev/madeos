/**
 * Knowledge Tags UI Component Types
 * Types for components in app/(dashboard)/knowledge/tags/*
 */

import type { KnowledgeTag } from "./tag.types";

export interface TagFormProps {
	tag?: KnowledgeTag;
	isEditing?: boolean;
	hideButtons?: boolean;
}

export interface TagListProps {
	tags: KnowledgeTag[];
	total: number;
	page: number;
	pageSize: number;
	search?: string;
}

export interface TagDetailWrapperProps {
	tagId: string;
	initialTag: KnowledgeTag;
}

export interface EditTagFormProps {
	tag: KnowledgeTag;
}

export interface EditTagFormProps {
	tag: KnowledgeTag;
}

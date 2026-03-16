/**
 * Knowledge Tags Types
 */

export interface KnowledgeTag {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	color?: string | null;
	icon?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateTagInput {
	name: string;
	slug: string;
	description?: string | null;
	color?: string | null;
	icon?: string | null;
}

export interface UpdateTagInput {
	name?: string;
	slug?: string;
	description?: string | null;
	color?: string | null;
	icon?: string | null;
}

export interface GetTagsOptions {
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: "name" | "createdAt" | "updatedAt";
	orderDir?: "asc" | "desc";
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	pageCount: number;
	pageSize: number;
}

// ActionResult is now imported from @/lib/types

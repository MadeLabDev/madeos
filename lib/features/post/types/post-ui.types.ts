/**
 * Blog Post UI Component Types
 * Types for components in app/(dashboard)/blog/*
 */

import type { ModuleTypeDetail } from "../../meta/types";

import type { Post, PostCategory, PostTag } from "./post.types";

export interface PostFormProps {
	post?: Post;
	categories: PostCategory[];
	tags: PostTag[];
	moduleTypes?: ModuleTypeDetail[];
	isLoading?: boolean;
	hideButtons?: boolean;
	type?: string;
}

export interface PostListProps {
	page: number;
	search: string;
	categoryId: string;
	pageSize: number;
}

export interface PostDetailWrapperProps {
	postId: string;
	initialPost: Post;
}

export interface EditPostFormProps {
	post: Post;
	categories: PostCategory[];
	tags: PostTag[];
	type?: string;
	moduleTypes?: any[]; // ModuleType array
}

export interface NewPostFormProps {
	categories: PostCategory[];
	tags: PostTag[];
	type?: string;
	moduleTypes?: any[]; // ModuleType array
}

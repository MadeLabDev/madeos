/**
 * Post Service
 * Business logic for post articles
 */

import type { ActionResult } from "@/lib/types";

import { PostCategoryRepository, PostRepository, PostTagRepository } from "../repositories";
import { CreatePostInput, PaginatedResult, PostCategory, PostTag, PostWithRelations, UpdatePostInput } from "../types";

export class PostService {
	/**
	 * Get all posts with pagination and filtering
	 */
	static async getPosts(options: Parameters<typeof PostRepository.findMany>[0]): Promise<PaginatedResult<PostWithRelations>> {
		try {
			const result = await PostRepository.findMany(options);
			return result;
		} catch (error) {
			throw new Error(`Failed to fetch posts: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single post by ID
	 */
	static async getPostById(id: string): Promise<PostWithRelations | null> {
		try {
			return await PostRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch post: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get post by slug (public view with view count increment)
	 */
	static async getPublicPost(slug: string): Promise<PostWithRelations | null> {
		try {
			const post = await PostRepository.findBySlug(slug);
			if (post) {
				// Increment view count asynchronously
				PostRepository.incrementViewCount(post.id).catch(console.error);
			}
			return post;
		} catch (error) {
			throw new Error(`Failed to fetch post: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new post
	 */
	static async createPost(input: CreatePostInput): Promise<ActionResult> {
		try {
			// Validate slug is unique
			const existing = await PostRepository.findBySlug(input.slug);
			if (existing) {
				return {
					success: false,
					message: "Post with this slug already exists",
				};
			}

			// Validate categories exist if provided
			const categoryIds = input.categoryIds || [];
			if (categoryIds.length > 0) {
				for (const catId of categoryIds) {
					const category = await PostCategoryRepository.findById(catId);
					if (!category) {
						return {
							success: false,
							message: `Category with ID ${catId} not found`,
						};
					}
				}
			}

			// Validate tags exist if provided
			if (input.tagIds && input.tagIds.length > 0) {
				for (const tagId of input.tagIds) {
					const tag = await PostTagRepository.findById(tagId);
					if (!tag) {
						return {
							success: false,
							message: `Tag with ID ${tagId} not found`,
						};
					}
				}
			}

			const post = await PostRepository.create(input);

			return {
				success: true,
				message: "Post created successfully",
				data: post,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create post",
			};
		}
	}

	/**
	 * Update post
	 */
	static async updatePost(id: string, input: UpdatePostInput): Promise<ActionResult> {
		try {
			// Check if post exists
			const existing = await PostRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Post not found",
				};
			}

			// Validate slug uniqueness if changed
			if (input.slug && input.slug !== existing.slug) {
				const slugExists = await PostRepository.findBySlug(input.slug);
				if (slugExists) {
					return {
						success: false,
						message: "Post with this slug already exists",
					};
				}
			}

			// Validate categories exist if provided
			const categoryIds = input.categoryIds;
			if (categoryIds !== undefined && categoryIds.length > 0) {
				for (const catId of categoryIds) {
					const category = await PostCategoryRepository.findById(catId);
					if (!category) {
						return {
							success: false,
							message: `Category with ID ${catId} not found`,
						};
					}
				}
			}

			// Validate tags exist if provided
			if (input.tagIds && input.tagIds.length > 0) {
				for (const tagId of input.tagIds) {
					const tag = await PostTagRepository.findById(tagId);
					if (!tag) {
						return {
							success: false,
							message: `Tag with ID ${tagId} not found`,
						};
					}
				}
			}

			const post = await PostRepository.update(id, input);

			return {
				success: true,
				message: "Post updated successfully",
				data: post,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update post",
			};
		}
	}

	/**
	 * Delete post
	 */
	static async deletePost(id: string): Promise<ActionResult> {
		try {
			// Check if post exists
			const existing = await PostRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Post not found",
				};
			}

			await PostRepository.delete(id);

			return {
				success: true,
				message: "Post deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete post",
			};
		}
	}

	/**
	 * Get all categories
	 */
	static async getCategories(): Promise<PostCategory[]> {
		try {
			return await PostCategoryRepository.findMany();
		} catch (error) {
			throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get all tags
	 */
	static async getTags(): Promise<PostTag[]> {
		try {
			return await PostTagRepository.findMany();
		} catch (error) {
			throw new Error(`Failed to fetch tags: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}

/**
 * Post Article Server Actions
 * Server-side actions for post article management
 */

"use server";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { moduleTypeService } from "../../profile/services";
import { PostService } from "../services";
import { CreatePostInput, getPostTypePermissionModule, PaginatedResult, PostWithRelations, UpdatePostInput } from "../types";

/**
 * Get all posts with pagination
 */
export async function getPostsAction(options: Parameters<typeof PostService.getPosts>[0]): Promise<ActionResult<PaginatedResult<PostWithRelations>>> {
	try {
		const result = await PostService.getPosts(options);
		return {
			success: true,
			message: "Posts retrieved",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch posts",
		};
	}
}

/**
 * Get single post by ID
 */
export async function getPostAction(postId: string): Promise<ActionResult> {
	try {
		const post = await PostService.getPostById(postId);
		if (!post) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		return {
			success: true,
			message: "Post fetched successfully",
			data: post,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch post",
		};
	}
}

/**
 * Get post by slug (public)
 */
export async function getPublicPostAction(slug: string): Promise<ActionResult> {
	try {
		const post = await PostService.getPublicPost(slug);
		if (!post) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		return {
			success: true,
			message: "Post fetched successfully",
			data: post,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch post",
		};
	}
}

/**
 * Create new post
 */
export async function createPostAction(input: CreatePostInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		// Check permission
		await requirePermission(getPostTypePermissionModule(input.type), "create");

		const result = await PostService.createPost(input);

		if (result.success && result.data) {
			await broadcastToAll("post_update", {
				action: "post_created",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create post",
		};
	}
}

export async function updatePostAction(postId: string, input: UpdatePostInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		// Get the existing post to check permissions
		const existingPost = await PostService.getPostById(postId);
		if (!existingPost) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		// Check permission
		await requirePermission(getPostTypePermissionModule(existingPost.type), "update");

		const result = await PostService.updatePost(postId, input);

		if (result.success && result.data) {
			await broadcastToAll("post_update", {
				action: "post_updated",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update post",
		};
	}
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		// Get the existing post to check permissions
		const existingPost = await PostService.getPostById(postId);
		if (!existingPost) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		// Check permission
		await requirePermission(getPostTypePermissionModule(existingPost.type), "delete");

		const result = await PostService.deletePost(postId);

		if (result.success) {
			await broadcastToAll("post_update", {
				action: "post_deleted",
				entity: existingPost,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
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
export async function getCategoriesAction(): Promise<ActionResult> {
	try {
		const categories = await PostService.getCategories();
		return {
			success: true,
			message: "Categories retrieved",
			data: categories,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch categories",
		};
	}
}

/**
 * Get all tags
 */
export async function getTagsAction(): Promise<ActionResult> {
	try {
		const tags = await PostService.getTags();
		return {
			success: true,
			message: "Tags retrieved",
			data: tags,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch tags",
		};
	}
}

/**
 * Bulk delete posts
 */
export async function bulkDeletePostsAction(ids: string[]): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		if (ids.length === 0) {
			return {
				success: false,
				message: "No posts selected",
			};
		}

		// Get the first post to determine the type for permission checking
		const firstPost = await PostService.getPostById(ids[0]!);
		if (!firstPost) {
			return {
				success: false,
				message: "Post not found",
			};
		}

		// Check permission
		await requirePermission(getPostTypePermissionModule(firstPost.type), "delete");

		const results = await Promise.allSettled(ids.map((id) => PostService.deletePost(id)));

		const successful = results.filter((result) => result.status === "fulfilled").length;
		const failed = results.filter((result) => result.status === "rejected").length;

		return {
			success: true,
			data: { successful, failed },
			message: `${successful} posts deleted successfully${failed > 0 ? `, ${failed} failed` : ""}`,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete posts",
		};
	}
}

/**
 * Get module types for post system
 */
export async function getPostSystemModuleTypesAction(system: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const postModuleTypes = await moduleTypeService.getModuleTypesBySystem(system);

		return {
			success: true,
			message: "Post system module types retrieved",
			data: postModuleTypes,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get post system module types",
		};
	}
}

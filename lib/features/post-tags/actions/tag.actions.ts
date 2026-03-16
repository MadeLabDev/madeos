"use server";

import { revalidatePath } from "next/cache";

import { getPostTypePermissionModule, PostType } from "@/lib/features/post/types";
import { tagService } from "@/lib/features/post-tags/services";
import { CreateTagInput, GetTagsOptions, UpdateTagInput } from "@/lib/features/post-tags/types";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

/**
 * Get paginated list of tags
 */
export async function listTagsAction(options?: GetTagsOptions): Promise<ActionResult> {
	try {
		const result = await tagService.getTags(options);
		return {
			success: true,
			data: result,
			message: "Tags retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve tags";
		console.error("[listTagsAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get all tags (no pagination)
 */
export async function getAllTagsAction(type?: PostType): Promise<ActionResult> {
	try {
		const tags = await tagService.getAllTags(type);
		return {
			success: true,
			data: tags,
			message: "Tags retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to retrieve tags";
		console.error("[getAllTagsAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Get single tag by ID
 */
export async function getTagAction(id: string): Promise<ActionResult> {
	try {
		const tag = await tagService.getTagById(id);
		return {
			success: true,
			data: tag,
			message: "Tag retrieved successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Tag not found";
		console.error("[getTagAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Create new tag
 */
export async function createTagAction(data: CreateTagInput): Promise<ActionResult> {
	try {
		// Check permission based on type
		await requirePermission(getPostTypePermissionModule(data.type), "create");

		const tag = await tagService.createTag(data);
		revalidatePath(`/${getPostTypePermissionModule(data.type)}/tags`);

		await broadcastToAll("post_tag_update", {
			action: "tag_created",
			entity: tag,
			timestamp: new Date().toISOString(),
		});

		return {
			success: true,
			data: tag,
			message: "Tag created successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create tag";
		console.error("[createTagAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Update tag
 */
export async function updateTagAction(id: string, data: UpdateTagInput): Promise<ActionResult> {
	try {
		// Get the tag first to determine its type
		const tag = await tagService.getTagById(id);
		if (!tag) {
			return {
				success: false,
				message: "Tag not found",
			};
		}

		// Check permission based on type
		await requirePermission(getPostTypePermissionModule(tag.type), "update");

		const updatedTag = await tagService.updateTag(id, data);
		revalidatePath(`/${getPostTypePermissionModule(tag.type)}/tags`);
		revalidatePath(`/${getPostTypePermissionModule(tag.type)}/tags/${id}`);

		await broadcastToAll("post_tag_update", {
			action: "tag_updated",
			entity: updatedTag,
			timestamp: new Date().toISOString(),
		});

		return {
			success: true,
			data: updatedTag,
			message: "Tag updated successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update tag";
		console.error("[updateTagAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Delete tag
 */
export async function deleteTagAction(id: string): Promise<ActionResult> {
	try {
		// Get the tag first to determine its type
		const tag = await tagService.getTagById(id);
		if (!tag) {
			return {
				success: false,
				message: "Tag not found",
			};
		}

		// Check permission based on type
		await requirePermission(getPostTypePermissionModule(tag.type), "delete");

		const deletedTag = await tagService.deleteTag(id);
		revalidatePath(`/${getPostTypePermissionModule(tag.type)}/tags`);

		await broadcastToAll("post_tag_update", {
			action: "tag_deleted",
			entity: tag,
			timestamp: new Date().toISOString(),
		});

		return {
			success: true,
			data: deletedTag,
			message: "Tag deleted successfully",
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete tag";
		console.error("[deleteTagAction]", message);
		return {
			success: false,
			message,
		};
	}
}

/**
 * Bulk delete tags
 */
export async function bulkDeleteTagsAction(ids: string[]): Promise<ActionResult> {
	try {
		if (ids.length === 0 || !ids[0]) {
			return {
				success: false,
				message: "No tags selected for deletion",
			};
		}

		// Get the first tag to determine the type (assuming all tags are of the same type)
		const firstTag = await tagService.getTagById(ids[0]);
		if (!firstTag) {
			return {
				success: false,
				message: "Tags not found",
			};
		}

		// Check permission based on type
		await requirePermission(getPostTypePermissionModule(firstTag.type), "delete");

		const results = await Promise.allSettled(ids.map((id) => tagService.deleteTag(id)));

		const successful = results.filter((result) => result.status === "fulfilled").length;
		const failed = results.filter((result) => result.status === "rejected").length;

		revalidatePath(`/${getPostTypePermissionModule(firstTag.type)}/tags`);

		return {
			success: true,
			data: { successful, failed },
			message: `${successful} tags deleted successfully${failed > 0 ? `, ${failed} failed` : ""}`,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete tags";
		console.error("[bulkDeleteTagsAction]", message);
		return {
			success: false,
			message,
		};
	}
}

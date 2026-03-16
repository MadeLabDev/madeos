"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import { tagService } from "../services";
import type { CreateTagInput, GetTagsOptions, UpdateTagInput } from "../types";

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
export async function getAllTagsAction(): Promise<ActionResult> {
	try {
		const tags = await tagService.getAllTags();
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
		// Check permission
		await requirePermission("knowledge", "create");

		const tag = await tagService.createTag(data);
		revalidatePath("/dashboard/knowledge/tags");

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
		// Check permission
		await requirePermission("knowledge", "update");

		const tag = await tagService.updateTag(id, data);
		revalidatePath("/dashboard/knowledge/tags");
		revalidatePath(`/dashboard/knowledge/tags/${id}`);

		return {
			success: true,
			data: tag,
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
		// Check permission
		await requirePermission("knowledge", "delete");

		const tag = await tagService.deleteTag(id);
		revalidatePath("/dashboard/knowledge/tags");

		return {
			success: true,
			data: tag,
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

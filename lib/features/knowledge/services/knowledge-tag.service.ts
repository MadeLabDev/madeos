/**
 * Knowledge Tag Service
 * Business logic for knowledge tags
 */

import type { ActionResult } from "@/lib/types";

import { KnowledgeTagRepository } from "../repositories";
import type { CreateTagInput, KnowledgeTag, UpdateTagInput } from "../types";

export class KnowledgeTagService {
	/**
	 * Get all tags
	 */
	static async getTags(): Promise<KnowledgeTag[]> {
		try {
			return await KnowledgeTagRepository.findMany();
		} catch (error) {
			throw new Error(`Failed to fetch tags: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get tag by ID
	 */
	static async getTagById(id: string): Promise<KnowledgeTag | null> {
		try {
			return await KnowledgeTagRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch tag: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new tag (or return existing if already exists)
	 */
	static async createTag(input: CreateTagInput): Promise<ActionResult> {
		try {
			// Check if tag already exists by name
			const existingByName = await KnowledgeTagRepository.findByName(input.name);
			if (existingByName) {
				return {
					success: true,
					message: "Tag already exists",
					data: existingByName,
				};
			}

			// Check if slug already exists
			if (await KnowledgeTagRepository.slugExists(input.slug)) {
				// Slug exists but name is different - try with modified slug
				let modifiedSlug = input.slug;
				let counter = 1;
				while (await KnowledgeTagRepository.slugExists(modifiedSlug)) {
					modifiedSlug = `${input.slug}-${counter}`;
					counter++;
				}
				input.slug = modifiedSlug;
			}

			const tag = await KnowledgeTagRepository.create(input);

			return {
				success: true,
				message: "Tag created successfully",
				data: tag,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create tag",
			};
		}
	}

	/**
	 * Update tag
	 */
	static async updateTag(id: string, input: UpdateTagInput): Promise<ActionResult> {
		try {
			// Check tag exists
			const tag = await KnowledgeTagRepository.findById(id);
			if (!tag) {
				return {
					success: false,
					message: "Tag not found",
				};
			}

			// Validate slug if changed
			if (input.slug && input.slug !== tag.slug) {
				if (await KnowledgeTagRepository.slugExists(input.slug, id)) {
					return {
						success: false,
						message: "Tag with this slug already exists",
					};
				}
			}

			const updated = await KnowledgeTagRepository.update(id, input);

			return {
				success: true,
				message: "Tag updated successfully",
				data: updated,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update tag",
			};
		}
	}

	/**
	 * Delete tag
	 */
	static async deleteTag(id: string): Promise<ActionResult> {
		try {
			// Check tag exists
			const tag = await KnowledgeTagRepository.findById(id);
			if (!tag) {
				return {
					success: false,
					message: "Tag not found",
				};
			}

			const deleted = await KnowledgeTagRepository.delete(id);
			if (!deleted) {
				return {
					success: false,
					message: "Failed to delete tag",
				};
			}

			return {
				success: true,
				message: "Tag deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete tag",
			};
		}
	}
}

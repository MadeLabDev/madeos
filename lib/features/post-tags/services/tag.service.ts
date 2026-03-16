/**
 * Blog Tags Service
 * Business logic for blog tags
 */

import { PostType } from "@/lib/features/post/types";
import { tagRepository } from "@/lib/features/post-tags/repositories";
import { CreateTagInput, GetTagsOptions, PostTag, UpdateTagInput } from "@/lib/features/post-tags/types";

export class TagService {
	/**
	 * Get all tags with pagination
	 */
	async getTags(options?: GetTagsOptions) {
		return tagRepository.findMany(options);
	}

	/**
	 * Get tag by ID
	 */
	async getTagById(id: string): Promise<PostTag> {
		const tag = await tagRepository.findById(id);
		if (!tag) {
			throw new Error(`Tag with ID "${id}" not found`);
		}
		return tag;
	}

	/**
	 * Get tag by slug
	 */
	async getTagBySlug(slug: string, type?: PostType): Promise<PostTag> {
		const tag = await tagRepository.findBySlug(slug, type);
		if (!tag) {
			throw new Error(`Tag with slug "${slug}" not found`);
		}
		return tag;
	}

	/**
	 * Get all tags (no pagination)
	 */
	async getAllTags(type?: PostType): Promise<PostTag[]> {
		return tagRepository.findAll(type);
	}

	/**
	 * Create new tag
	 */
	async createTag(data: CreateTagInput): Promise<PostTag> {
		// Validate required fields
		if (!data.name?.trim()) {
			throw new Error("Tag name is required");
		}
		if (!data.slug?.trim()) {
			throw new Error("Tag slug is required");
		}
		if (!data.type) {
			throw new Error("Tag type is required");
		}

		// Check if slug is unique within the same type
		const isUnique = await tagRepository.isSlugUnique(data.slug, data.type);
		if (!isUnique) {
			throw new Error(`Tag slug "${data.slug}" is already in use for ${data.type} posts`);
		}

		// Create tag
		const tag = await tagRepository.create(data);

		// Emit event for realtime updates
		console.log("[TagService] Tag created:", tag.id);

		return tag;
	}

	/**
	 * Update tag
	 */
	async updateTag(id: string, data: UpdateTagInput): Promise<PostTag> {
		// Verify tag exists
		const existing = await this.getTagById(id);

		// Validate slug if provided
		if (data.slug && data.slug !== existing.slug) {
			const isUnique = await tagRepository.isSlugUnique(data.slug, existing.type, id);
			if (!isUnique) {
				throw new Error(`Tag slug "${data.slug}" is already in use for ${existing.type} posts`);
			}
		}

		// Update tag
		const tag = await tagRepository.update(id, data);

		// Emit event for realtime updates
		console.log("[TagService] Tag updated:", id);

		return tag;
	}

	/**
	 * Delete tag
	 */
	async deleteTag(id: string): Promise<PostTag> {
		// Verify tag exists
		await this.getTagById(id);

		// Delete tag
		const deleted = await tagRepository.delete(id);

		// Emit event for realtime updates
		console.log("[TagService] Tag deleted:", id);

		return deleted;
	}
}

export const tagService = new TagService();

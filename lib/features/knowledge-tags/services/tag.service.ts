/**
 * Knowledge Tags Service
 * Business logic for knowledge tags
 */

import { tagRepository } from "../repositories";
import { CreateTagInput, GetTagsOptions, KnowledgeTag, UpdateTagInput } from "../types";

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
	async getTagById(id: string): Promise<KnowledgeTag> {
		const tag = await tagRepository.findById(id);
		if (!tag) {
			throw new Error(`Tag with ID "${id}" not found`);
		}
		return tag;
	}

	/**
	 * Get tag by slug
	 */
	async getTagBySlug(slug: string): Promise<KnowledgeTag> {
		const tag = await tagRepository.findBySlug(slug);
		if (!tag) {
			throw new Error(`Tag with slug "${slug}" not found`);
		}
		return tag;
	}

	/**
	 * Get all tags (no pagination)
	 */
	async getAllTags(): Promise<KnowledgeTag[]> {
		return tagRepository.findAll();
	}

	/**
	 * Create new tag
	 */
	async createTag(data: CreateTagInput): Promise<KnowledgeTag> {
		// Validate required fields
		if (!data.name?.trim()) {
			throw new Error("Tag name is required");
		}
		if (!data.slug?.trim()) {
			throw new Error("Tag slug is required");
		}

		// Check if slug is unique
		const isUnique = await tagRepository.isSlugUnique(data.slug);
		if (!isUnique) {
			throw new Error(`Tag slug "${data.slug}" is already in use`);
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
	async updateTag(id: string, data: UpdateTagInput): Promise<KnowledgeTag> {
		// Verify tag exists
		const existing = await this.getTagById(id);

		// Validate slug if provided
		if (data.slug && data.slug !== existing.slug) {
			const isUnique = await tagRepository.isSlugUnique(data.slug, id);
			if (!isUnique) {
				throw new Error(`Tag slug "${data.slug}" is already in use`);
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
	async deleteTag(id: string): Promise<KnowledgeTag> {
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

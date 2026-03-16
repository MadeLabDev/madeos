/**
 * Knowledge Tags Repository
 * Database access layer for tags
 */

import { prisma } from "@/lib/prisma";

import { CreateTagInput, GetTagsOptions, KnowledgeTag, PaginatedResult, UpdateTagInput } from "../types";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class TagRepository {
	/**
	 * Find tags with pagination and search
	 */
	async findMany(options?: GetTagsOptions): Promise<PaginatedResult<KnowledgeTag>> {
		const page = options?.page || 1;
		const limit = options?.limit || 10;
		const search = options?.search?.trim();
		const orderBy = options?.orderBy || "name";
		const orderDir = options?.orderDir || "asc";

		// Build WHERE clause
		const where = search
			? {
					OR: [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { slug: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }],
				}
			: {};

		// Get total count
		const total = await prisma.knowledgeTag.count({ where });

		// Calculate pagination
		const skip = (page - 1) * limit;
		const pageCount = Math.ceil(total / limit);

		// Fetch tags
		const data = await prisma.knowledgeTag.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [orderBy]: orderDir },
		});

		return {
			data,
			total,
			page,
			pageCount,
			pageSize: limit,
		};
	}

	/**
	 * Find tag by ID
	 */
	async findById(id: string): Promise<KnowledgeTag | null> {
		return prisma.knowledgeTag.findUnique({ where: { id } });
	}

	/**
	 * Find tag by slug
	 */
	async findBySlug(slug: string): Promise<KnowledgeTag | null> {
		return prisma.knowledgeTag.findUnique({ where: { slug } });
	}

	/**
	 * Find all tags (no pagination)
	 */
	async findAll(): Promise<KnowledgeTag[]> {
		return prisma.knowledgeTag.findMany({ orderBy: { name: "asc" } });
	}

	/**
	 * Create new tag
	 */
	async create(data: CreateTagInput): Promise<KnowledgeTag> {
		return prisma.knowledgeTag.create({ data });
	}

	/**
	 * Update tag
	 */
	async update(id: string, data: UpdateTagInput): Promise<KnowledgeTag> {
		return prisma.knowledgeTag.update({
			where: { id },
			data: {
				...data,
				updatedAt: new Date(),
			},
		});
	}

	/**
	 * Delete tag
	 */
	async delete(id: string): Promise<KnowledgeTag> {
		return prisma.knowledgeTag.delete({ where: { id } });
	}

	/**
	 * Check if slug is unique
	 */
	async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
		const where = excludeId ? { slug, NOT: { id: excludeId } } : { slug };
		const count = await prisma.knowledgeTag.count({ where });
		return count === 0;
	}

	/**
	 * Count total tags
	 */
	async count(): Promise<number> {
		return prisma.knowledgeTag.count();
	}

	/**
	 * Get tags by article ID (future implementation)
	 * Note: This requires KnowledgeArticles_tags junction table relationship
	 */
	async getTagsByArticleId(_articleId: string): Promise<KnowledgeTag[]> {
		// This will be implemented when article-tag relationships are defined
		// For now, return empty array
		const tags: KnowledgeTag[] = [];
		return tags;
	}
}

export const tagRepository = new TagRepository();

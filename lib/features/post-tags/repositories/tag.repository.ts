/**
 * Blog Tags Repository
 * Database operations for blog tags
 */

import { PostType } from "@/lib/features/post/types";
import { CreateTagInput, GetTagsOptions, PostTag, UpdateTagInput } from "@/lib/features/post-tags/types";
import { prisma } from "@/lib/prisma";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class TagRepository {
	/**
	 * Find all tags with pagination
	 */
	async findMany(options: GetTagsOptions = {}) {
		const { page = 1, pageSize = 10, search = "", type, orderBy = "name", orderDir = "asc" } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (search) {
			where.OR = [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { slug: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		if (type) {
			where.type = type;
		}

		const [data, total] = await Promise.all([
			prisma.postTag.findMany({
				where,
				skip,
				take: pageSize,
				orderBy: { [orderBy]: orderDir },
				include: {
					_count: {
						select: { posts: true },
					},
				},
			}),
			prisma.postTag.count({ where }),
		]);

		return {
			data,
			total,
			page,
			pageCount: Math.ceil(total / pageSize),
			pageSize,
		};
	}

	/**
	 * Find tag by id
	 */
	async findById(id: string): Promise<PostTag | null> {
		const result = await prisma.postTag.findUnique({
			where: { id },
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return result as PostTag | null;
	}

	/**
	 * Find tag by slug
	 */
	async findBySlug(slug: string, type?: PostType): Promise<PostTag | null> {
		if (!type) {
			// If no type provided, try to find by slug only (for backward compatibility)
			// This might return multiple results, so we'll take the first one
			const result = await prisma.postTag.findFirst({
				where: { slug },
				include: {
					_count: {
						select: { posts: true },
					},
				},
			});
			return result as PostTag | null;
		}

		const result = await prisma.postTag.findUnique({
			where: { slug_type: { slug, type } },
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return result as PostTag | null;
	}

	/**
	 * Find all tags (no pagination)
	 */
	async findAll(type?: PostType): Promise<PostTag[]> {
		const results = await prisma.postTag.findMany({
			where: type ? { type } : {},
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return results as PostTag[];
	}

	/**
	 * Create new tag
	 */
	async create(data: CreateTagInput): Promise<PostTag> {
		const result = await prisma.postTag.create({
			data: {
				name: data.name,
				slug: data.slug,
				type: data.type,
				color: data.color || null,
			},
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return result as PostTag;
	}

	/**
	 * Update tag
	 */
	async update(id: string, data: UpdateTagInput): Promise<PostTag> {
		const result = await prisma.postTag.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name }),
				...(data.slug !== undefined && { slug: data.slug }),
				...(data.color !== undefined && { color: data.color }),
			},
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return result as PostTag;
	}

	/**
	 * Delete tag
	 */
	async delete(id: string): Promise<PostTag> {
		const result = await prisma.postTag.delete({
			where: { id },
		});
		return result as PostTag;
	}

	/**
	 * Check if slug is unique within the same type
	 */
	async isSlugUnique(slug: string, type: PostType, excludeId?: string): Promise<boolean> {
		const existing = await prisma.postTag.findFirst({
			where: {
				slug,
				type,
				...(excludeId && { NOT: { id: excludeId } }),
			},
		});
		return !existing;
	}

	/**
	 * Count total tags
	 */
	async count(): Promise<number> {
		return prisma.postTag.count();
	}
}

export const tagRepository = new TagRepository();

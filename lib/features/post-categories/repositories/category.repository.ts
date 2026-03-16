/**
 * Blog Categories Repository
 * Database operations for blog categories
 */

import { prisma } from "@/lib/prisma";

import { PostType } from "../../post/types";
import { CreateCategoryInput, GetCategoriesOptions, PostCategory, UpdateCategoryInput } from "../types";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class CategoryRepository {
	/**
	 * Find all categories with pagination
	 */
	async findMany(options: GetCategoriesOptions = {}) {
		const { page = 1, pageSize = 10, search = "", type, orderBy = "name", orderDir = "asc" } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (search) {
			where.OR = [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { slug: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		if (type) {
			where.type = type;
		}

		const [data, total] = await Promise.all([
			prisma.postCategory.findMany({
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
			prisma.postCategory.count({ where }),
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
	 * Find category by id
	 */
	async findById(id: string): Promise<PostCategory | null> {
		const result = await prisma.postCategory.findUnique({
			where: { id },
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return result as PostCategory | null;
	}

	/**
	 * Find category by slug
	 */
	async findBySlug(slug: string, type?: PostType): Promise<PostCategory | null> {
		if (!type) {
			// If no type provided, try to find by slug only (for backward compatibility)
			// This might return multiple results, so we'll take the first one
			const result = await prisma.postCategory.findFirst({
				where: { slug },
				include: {
					_count: {
						select: { posts: true },
					},
				},
			});
			return result as PostCategory | null;
		}

		const result = await prisma.postCategory.findUnique({
			where: { slug_type: { slug, type } },
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return result as PostCategory | null;
	}

	/**
	 * Find all categories (no pagination)
	 */
	async findAll(type?: PostType): Promise<PostCategory[]> {
		const results = await prisma.postCategory.findMany({
			where: type ? { type } : {},
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return results as PostCategory[];
	}

	async create(data: CreateCategoryInput): Promise<PostCategory> {
		const result = await prisma.postCategory.create({
			data: {
				name: data.name,
				slug: data.slug,
				type: data.type,
				description: data.description || null,
				color: data.color || null,
			},
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return result as PostCategory;
	}

	/**
	 * Update category
	 */
	async update(id: string, data: UpdateCategoryInput): Promise<PostCategory> {
		const result = await prisma.postCategory.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name }),
				...(data.slug !== undefined && { slug: data.slug }),
				...(data.description !== undefined && { description: data.description }),
				...(data.color !== undefined && { color: data.color }),
			},
			include: {
				_count: {
					select: { posts: true },
				},
			},
		});
		return result as PostCategory;
	}

	/**
	 * Delete category
	 */
	async delete(id: string): Promise<PostCategory> {
		const result = await prisma.postCategory.delete({
			where: { id },
		});
		return result as PostCategory;
	}

	/**
	 * Check if slug is unique within the same type
	 */
	async isSlugUnique(slug: string, type: PostType, excludeId?: string): Promise<boolean> {
		const existing = await prisma.postCategory.findFirst({
			where: {
				slug,
				type,
				...(excludeId && { NOT: { id: excludeId } }),
			},
		});
		return !existing;
	}

	/**
	 * Count total categories
	 */
	async count(): Promise<number> {
		return prisma.postCategory.count();
	}
}

export const categoryRepository = new CategoryRepository();

/**
 * Knowledge Categories Repository
 * Database operations for knowledge categories
 */

import { prisma } from "@/lib/prisma";

import { CreateCategoryInput, GetCategoriesOptions, KnowledgeCategory, UpdateCategoryInput } from "../types";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class CategoryRepository {
	/**
	 * Find all categories with pagination
	 */
	async findMany(options: GetCategoriesOptions = {}) {
		const { page = 1, pageSize = 10, search = "", orderBy = "order", orderDir = "asc" } = options;

		const skip = (page - 1) * pageSize;

		const where = search
			? {
					OR: [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { slug: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }],
				}
			: {};

		const [data, total] = await Promise.all([
			prisma.knowledgeCategory.findMany({
				where,
				skip,
				take: pageSize,
				orderBy: { [orderBy]: orderDir },
			}),
			prisma.knowledgeCategory.count({ where }),
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
	async findById(id: string): Promise<KnowledgeCategory | null> {
		return prisma.knowledgeCategory.findUnique({
			where: { id },
		});
	}

	/**
	 * Find category by slug
	 */
	async findBySlug(slug: string): Promise<KnowledgeCategory | null> {
		return prisma.knowledgeCategory.findUnique({
			where: { slug },
		});
	}

	/**
	 * Find all categories (no pagination)
	 */
	async findAll(): Promise<KnowledgeCategory[]> {
		return prisma.knowledgeCategory.findMany({
			orderBy: { order: "asc" },
		});
	}

	/**
	 * Create new category
	 */
	async create(data: CreateCategoryInput): Promise<KnowledgeCategory> {
		return prisma.knowledgeCategory.create({
			data: {
				name: data.name,
				slug: data.slug,
				description: data.description || null,
				color: data.color || null,
				icon: data.icon || null,
				order: data.order || 0,
			},
		});
	}

	/**
	 * Update category
	 */
	async update(id: string, data: UpdateCategoryInput): Promise<KnowledgeCategory> {
		return prisma.knowledgeCategory.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name }),
				...(data.slug !== undefined && { slug: data.slug }),
				...(data.description !== undefined && { description: data.description }),
				...(data.color !== undefined && { color: data.color }),
				...(data.icon !== undefined && { icon: data.icon }),
				...(data.order !== undefined && { order: data.order }),
			},
		});
	}

	/**
	 * Delete category
	 */
	async delete(id: string): Promise<KnowledgeCategory> {
		return prisma.knowledgeCategory.delete({
			where: { id },
		});
	}

	/**
	 * Check if slug is unique
	 */
	async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
		const existing = await prisma.knowledgeCategory.findFirst({
			where: {
				slug,
				...(excludeId && { NOT: { id: excludeId } }),
			},
		});
		return !existing;
	}

	/**
	 * Get max order value
	 */
	async getMaxOrder(): Promise<number> {
		const result = await prisma.knowledgeCategory.aggregate({
			_max: { order: true },
		});
		return result._max.order || 0;
	}

	/**
	 * Count total categories
	 */
	async count(): Promise<number> {
		return prisma.knowledgeCategory.count();
	}
}

export const categoryRepository = new CategoryRepository();

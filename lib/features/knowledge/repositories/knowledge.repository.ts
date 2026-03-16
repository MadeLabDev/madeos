/**
 * Knowledge Article Repository
 * Database operations for Knowledge articles
 */

import { prisma } from "@/lib/prisma";

import { CreateKnowledgeInput, KnowledgeWithRelations, PaginatedResult, UpdateKnowledgeInput } from "../types";

export class KnowledgeRepository {
	/**
	 * Find all articles with pagination and filtering
	 */
	static async findMany(
		options: {
			page?: number;
			pageSize?: number;
			search?: string;
			categoryId?: string;
			tagIds?: string[];
			isPublished?: boolean;
			type?: string; //  | 'knowledge' | 'course'
			eventId?: string;
			sortBy?: "createdAt" | "publishedAt" | "viewCount" | "title";
			sortOrder?: "asc" | "desc";
		} = {},
	): Promise<PaginatedResult<KnowledgeWithRelations>> {
		const { page = 1, pageSize = 10, search, categoryId, tagIds, isPublished, type, eventId, sortBy = "createdAt", sortOrder = "desc" } = options;

		const skip = (page - 1) * pageSize;

		// Build where clause
		const where: any = {};

		if (search) {
			where.OR = [{ title: { contains: search } }, { excerpt: { contains: search } }, { content: { contains: search } }];
		}

		if (categoryId) {
			where.categories = {
				some: {
					categoryId: categoryId,
				},
			};
		}

		if (isPublished !== undefined) {
			where.isPublished = isPublished;
		}

		if (type) {
			where.type = type;
		}

		if (eventId) {
			where.events = {
				some: {
					eventId: eventId,
				},
			};
		}

		// Handle tag filtering
		if (tagIds && tagIds.length > 0) {
			where.tags = {
				some: {
					tagId: {
						in: tagIds,
					},
				},
			};
		}

		// Fetch articles
		const [articles, total] = await Promise.all([
			prisma.knowledge.findMany({
				where,
				include: {
					categories: {
						include: { category: true },
					},
					tags: {
						include: { tag: true },
					},
					events: {
						include: { event: true },
					},
					assignedUsers: {
						include: { user: true },
					},
					assignedGroups: {
						include: { group: { include: { members: { include: { user: true } } } } },
					},
				},
				skip,
				take: pageSize,
				orderBy: {
					[sortBy]: sortOrder,
				},
			}),
			prisma.knowledge.count({ where }),
		]);

		// Transform to flatten categories and tags structure
		const transformedArticles = articles.map((article: any) => {
			try {
				const transformed = {
					...article,
					categories: Array.isArray(article.categories) ? article.categories.map((catJunction: any) => catJunction?.category).filter(Boolean) : [],
					tags: Array.isArray(article.tags) ? article.tags.map((tagJunction: any) => tagJunction?.tag).filter(Boolean) : [],
					events: Array.isArray(article.events) ? article.events.map((eventJunction: any) => eventJunction?.event).filter(Boolean) : [],
				};
				return transformed;
			} catch (error) {
				console.error("Error transforming article:", article.id, error);
				throw error;
			}
		}) as KnowledgeWithRelations[];

		return {
			data: transformedArticles,
			total,
			page,
			limit: pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	}

	/**
	 * Find article by ID
	 */
	static async findById(id: string): Promise<KnowledgeWithRelations | null> {
		const article = await prisma.knowledge.findUnique({
			where: { id },
			include: {
				categories: {
					include: { category: true },
				},
				tags: {
					include: { tag: true },
				},
				events: {
					include: { event: true },
				},
				assignedUsers: {
					include: { user: true },
				},
				assignedGroups: {
					include: { group: { include: { members: { include: { user: true } } } } },
				},
			},
		});

		if (!article) return null;

		// Flatten categories and tags structure
		try {
			return {
				...article,
				categories: Array.isArray((article as any).categories) ? (article as any).categories.map((catJunction: any) => catJunction?.category).filter(Boolean) : [],
				tags: Array.isArray((article as any).tags) ? (article as any).tags.map((tagJunction: any) => tagJunction?.tag).filter(Boolean) : [],
				events: Array.isArray((article as any).events) ? (article as any).events.map((eventJunction: any) => eventJunction?.event).filter(Boolean) : [],
				// Keep assignedUsers and assignedGroups as-is for permission checks
				assignedUsers: (article as any).assignedUsers || [],
				assignedGroups: (article as any).assignedGroups || [],
			} as any;
		} catch (error) {
			console.error("Error transforming article in findById:", id, error);
			throw error;
		}
	}

	/**
	 * Find article by slug
	 */
	static async findBySlug(slug: string): Promise<KnowledgeWithRelations | null> {
		const article = await prisma.knowledge.findUnique({
			where: { slug },
			include: {
				categories: {
					include: { category: true },
				},
				tags: {
					include: { tag: true },
				},
				events: {
					include: { event: true },
				},
				assignedUsers: {
					include: { user: true },
				},
				assignedGroups: {
					include: { group: { include: { members: { include: { user: true } } } } },
				},
			},
		});

		if (!article) return null;

		// Increment view count
		await prisma.knowledge.update({
			where: { id: article.id },
			data: { viewCount: { increment: 1 } },
		});

		// Flatten categories and tags structure
		try {
			return {
				...article,
				categories: Array.isArray((article as any).categories) ? (article as any).categories.map((catJunction: any) => catJunction?.category).filter(Boolean) : [],
				tags: Array.isArray((article as any).tags) ? (article as any).tags.map((tagJunction: any) => tagJunction?.tag).filter(Boolean) : [],
				events: Array.isArray((article as any).events) ? (article as any).events.map((eventJunction: any) => eventJunction?.event).filter(Boolean) : [],
			} as KnowledgeWithRelations;
		} catch (error) {
			console.error("Error transforming article in findBySlug:", slug, error);
			throw error;
		}
	}

	/**
	 * Create new article
	 */
	static async create(input: CreateKnowledgeInput): Promise<KnowledgeWithRelations> {
		const { tagIds = [], categoryIds = [], eventIds = [], tagNames, categoryId, publishedAt, assignedUserIds = [], assignedGroupIds = [], metaData, ...articleData } = input;

		if (!categoryIds || categoryIds.length === 0) {
			throw new Error("At least one category is required");
		}

		const article = await prisma.knowledge.create({
			data: {
				...articleData,
				metaData,
				categories: {
					create: categoryIds.map((categoryId) => ({
						category: { connect: { id: categoryId } },
					})),
				},
				tags:
					tagIds.length > 0
						? {
								create: tagIds.map((tagId) => ({
									tag: { connect: { id: tagId } },
								})),
							}
						: undefined,
				events:
					eventIds.length > 0
						? {
								create: eventIds.map((eventId) => ({
									event: { connect: { id: eventId } },
								})),
							}
						: undefined,
			},
			include: {
				categories: {
					include: { category: true },
				},
				tags: {
					include: { tag: true },
				},
				events: {
					include: { event: true },
				},
			},
		});

		// Assign users to article if visibility is private and assignedUserIds provided
		if (assignedUserIds && assignedUserIds.length > 0) {
			await prisma.knowledgeAssignedUser.createMany({
				data: assignedUserIds.map((userId) => ({
					knowledgeId: article.id,
					userId,
				})),
				skipDuplicates: true,
			});
		}

		// Assign groups to article if visibility is private and assignedGroupIds provided
		if (assignedGroupIds && assignedGroupIds.length > 0) {
			await prisma.knowledgeAssignedGroup.createMany({
				data: assignedGroupIds.map((groupId) => ({
					knowledgeId: article.id,
					groupId,
				})),
				skipDuplicates: true,
			});
		}

		// Flatten categories, tags, and events structure
		try {
			return {
				...article,
				categories: Array.isArray((article as any).categories) ? (article as any).categories.map((catJunction: any) => catJunction?.category).filter(Boolean) : [],
				tags: Array.isArray((article as any).tags) ? (article as any).tags.map((tagJunction: any) => tagJunction?.tag).filter(Boolean) : [],
				events: Array.isArray((article as any).events) ? (article as any).events.map((eventJunction: any) => eventJunction?.event).filter(Boolean) : [],
			} as KnowledgeWithRelations;
		} catch (error) {
			console.error("Error transforming created article:", article.id, error);
			throw error;
		}
	}

	/**
	 * Update article
	 */
	static async update(id: string, input: UpdateKnowledgeInput): Promise<KnowledgeWithRelations> {
		const { tagIds, categoryIds, eventIds, tagNames, categoryId, publishedAt, assignedUserIds, assignedGroupIds, metaData, ...articleData } = input;

		// Handle categories
		if (categoryIds !== undefined) {
			await prisma.knowledgeCategoriesOnKnowledge.deleteMany({
				where: { knowledgeId: id },
			});
		}

		// Handle tags
		if (tagIds !== undefined) {
			await prisma.knowledgeTagsOnKnowledge.deleteMany({
				where: { knowledgeId: id },
			});
		}

		// Handle events
		if (eventIds !== undefined) {
			await prisma.knowledgeEventsOnKnowledge.deleteMany({
				where: { knowledgeId: id },
			});
		}

		// Handle assigned users for private articles
		if (assignedUserIds !== undefined) {
			await prisma.knowledgeAssignedUser.deleteMany({
				where: { knowledgeId: id },
			});
		}

		// Handle assigned groups for private articles
		if (assignedGroupIds !== undefined) {
			await prisma.knowledgeAssignedGroup.deleteMany({
				where: { knowledgeId: id },
			});
		}

		const article = await prisma.knowledge.update({
			where: { id },
			data: {
				...articleData,
				metaData,
				...(categoryIds &&
					categoryIds.length > 0 && {
						categories: {
							create: categoryIds.map((catId) => ({
								category: { connect: { id: catId } },
							})),
						},
					}),
				...(tagIds &&
					tagIds.length > 0 && {
						tags: {
							create: tagIds.map((tagId) => ({
								tag: { connect: { id: tagId } },
							})),
						},
					}),
				...(eventIds &&
					eventIds.length > 0 && {
						events: {
							create: eventIds.map((eventId) => ({
								event: { connect: { id: eventId } },
							})),
						},
					}),
			},
			include: {
				categories: {
					include: { category: true },
				},
				tags: {
					include: { tag: true },
				},
				events: {
					include: { event: true },
				},
				assignedUsers: {
					include: { user: true },
				},
				assignedGroups: {
					include: { group: { include: { members: { include: { user: true } } } } },
				},
			},
		});

		// Assign users to article if assignedUserIds provided
		if (assignedUserIds && assignedUserIds.length > 0) {
			await prisma.knowledgeAssignedUser.createMany({
				data: assignedUserIds.map((userId) => ({
					knowledgeId: article.id,
					userId,
				})),
				skipDuplicates: true,
			});
		}

		// Assign groups to article if assignedGroupIds provided
		if (assignedGroupIds && assignedGroupIds.length > 0) {
			await prisma.knowledgeAssignedGroup.createMany({
				data: assignedGroupIds.map((groupId) => ({
					knowledgeId: article.id,
					groupId,
				})),
				skipDuplicates: true,
			});
		}

		// Flatten categories, tags, and events structure
		try {
			return {
				...article,
				categories: Array.isArray((article as any).categories) ? (article as any).categories.map((catJunction: any) => catJunction?.category).filter(Boolean) : [],
				tags: Array.isArray((article as any).tags) ? (article as any).tags.map((tagJunction: any) => tagJunction?.tag).filter(Boolean) : [],
				events: Array.isArray((article as any).events) ? (article as any).events.map((eventJunction: any) => eventJunction?.event).filter(Boolean) : [],
				assignedUsers: (article as any).assignedUsers || [],
				assignedGroups: (article as any).assignedGroups || [],
			} as KnowledgeWithRelations;
		} catch (error) {
			console.error("Error transforming updated article:", id, error);
			throw error;
		}
	}

	/**
	 * Delete article
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			await prisma.knowledge.delete({
				where: { id },
			});
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Delete multiple articles
	 */
	static async deleteMany(ids: string[]): Promise<number> {
		const result = await prisma.knowledge.deleteMany({
			where: {
				id: { in: ids },
			},
		});
		return result.count;
	}

	/**
	 * Check if slug exists
	 */
	static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
		const where: any = { slug };
		if (excludeId) {
			where.id = { not: excludeId };
		}

		const count = await prisma.knowledge.count({ where });
		return count > 0;
	}

	/**
	 * Increment view count for an article
	 */
	static async incrementViewCount(id: string): Promise<void> {
		await prisma.knowledge.update({
			where: { id },
			data: { viewCount: { increment: 1 } },
		});
	}

	/**
	 * Count total knowledge articles
	 */
	static async count(options: { isPublished?: boolean; type?: string } = {}): Promise<number> {
		const { isPublished, type } = options;

		const where: any = {};

		if (isPublished !== undefined) {
			where.isPublished = isPublished;
		}

		if (type) {
			where.type = type;
		}

		return await prisma.knowledge.count({ where });
	}
}

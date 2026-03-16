/**
 * Post Article Repository
 * Database operations for Post articles
 */

import { prisma } from "@/lib/prisma";

import { CreatePostInput, PaginatedResult, PostType, PostWithRelations, UpdatePostInput } from "../types";

export class PostRepository {
	/**
	 * Find all posts with pagination and filtering
	 */
	static async findMany(
		options: {
			page?: number;
			pageSize?: number;
			search?: string;
			categoryId?: string;
			tagIds?: string[];
			isPublished?: boolean;
			type?: PostType;
			sortBy?: "createdAt" | "publishedAt" | "viewCount" | "title";
			sortOrder?: "asc" | "desc";
		} = {},
	): Promise<PaginatedResult<PostWithRelations>> {
		const { page = 1, pageSize = 10, search, categoryId, tagIds, isPublished, type, sortBy = "createdAt", sortOrder = "desc" } = options;

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

		// Fetch posts
		const [posts, total] = await Promise.all([
			prisma.post.findMany({
				where,
				include: {
					categories: {
						include: { category: true },
					},
					tags: {
						include: { tag: true },
					},
				},
				skip,
				take: pageSize,
				orderBy: {
					[sortBy]: sortOrder,
				},
			}),
			prisma.post.count({ where }),
		]);

		// Transform to flatten categories and tags structure
		const transformedPosts = posts.map((post: any) => {
			try {
				const transformed = {
					...post,
					categories: Array.isArray(post.categories) ? post.categories.map((catJunction: any) => catJunction?.category).filter(Boolean) : [],
					tags: Array.isArray(post.tags) ? post.tags.map((tagJunction: any) => tagJunction?.tag).filter(Boolean) : [],
				};
				return transformed;
			} catch (error) {
				console.error("Error transforming post:", post.id, error);
				return post;
			}
		});

		return {
			items: transformedPosts,
			total,
			pageCount: Math.ceil(total / pageSize),
			currentPage: page,
		};
	}

	/**
	 * Find post by ID with relations
	 */
	static async findById(id: string): Promise<PostWithRelations | null> {
		const post = await prisma.post.findUnique({
			where: { id },
			include: {
				categories: {
					include: { category: true },
				},
				tags: {
					include: { tag: true },
				},
			},
		});

		if (!post) return null;

		// Transform
		return {
			...post,
			type: post.type as PostType,
			categories: post.categories.map((catJunction) => ({ ...catJunction.category, type: catJunction.category.type as PostType })),
			tags: post.tags.map((tagJunction) => ({ ...tagJunction.tag, type: tagJunction.tag.type as PostType })),
		};
	}

	/**
	 * Find post by slug with relations
	 */
	static async findBySlug(slug: string): Promise<PostWithRelations | null> {
		const post = await prisma.post.findUnique({
			where: { slug },
			include: {
				categories: {
					include: { category: true },
				},
				tags: {
					include: { tag: true },
				},
			},
		});

		if (!post) return null;

		// Transform
		return {
			...post,
			type: post.type as PostType,
			categories: post.categories.map((catJunction) => ({ ...catJunction.category, type: catJunction.category.type as PostType })),
			tags: post.tags.map((tagJunction) => ({ ...tagJunction.tag, type: tagJunction.tag.type as PostType })),
		};
	}

	/**
	 * Create new post
	 */
	static async create(input: CreatePostInput): Promise<PostWithRelations> {
		const { categoryIds, tagIds, tagNames, ...data } = input;

		// Handle tag creation if tagNames provided
		let finalTagIds = tagIds || [];
		if (tagNames && tagNames.length > 0) {
			const existingTags = await prisma.postTag.findMany({
				where: { name: { in: tagNames } },
			});
			const existingTagIds = existingTags.map((tag) => tag.id);
			const newTagNames = tagNames.filter((name) => !existingTags.some((tag) => tag.name === name));

			// Create new tags
			if (newTagNames.length > 0) {
				const newTags = await Promise.all(
					newTagNames.map((name) =>
						prisma.postTag.create({
							data: { name, slug: name.toLowerCase().replace(/\s+/g, "-"), type: data.type },
						}),
					),
				);
				finalTagIds = [...existingTagIds, ...newTags.map((tag) => tag.id)];
			} else {
				finalTagIds = existingTagIds;
			}
		}

		const post = await prisma.post.create({
			data: {
				...data,
				metaData: data.metaData || {},
				categories: categoryIds
					? {
							create: categoryIds.map((categoryId) => ({
								category: { connect: { id: categoryId } },
							})),
						}
					: undefined,
				tags: finalTagIds.length > 0 ? { create: finalTagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) } : undefined,
			},
			include: {
				categories: {
					include: { category: true },
				},
				tags: {
					include: { tag: true },
				},
			},
		});

		// Transform
		return {
			...post,
			type: post.type as PostType,
			categories: post.categories.map((catJunction) => ({ ...catJunction.category, type: catJunction.category.type as PostType })),
			tags: post.tags.map((tagJunction) => ({ ...tagJunction.tag, type: tagJunction.tag.type as PostType })),
		};
	}

	/**
	 * Update post
	 */
	static async update(id: string, input: UpdatePostInput): Promise<PostWithRelations> {
		const { categoryIds, tagIds, tagNames, ...data } = input;

		// Handle tag creation if tagNames provided
		let finalTagIds = tagIds;
		if (tagNames && tagNames.length > 0) {
			const existingTags = await prisma.postTag.findMany({
				where: { name: { in: tagNames } },
			});
			const existingTagIds = existingTags.map((tag) => tag.id);
			const newTagNames = tagNames.filter((name) => !existingTags.some((tag) => tag.name === name));

			// Create new tags
			if (newTagNames.length > 0) {
				const newTags = await Promise.all(
					newTagNames.map((name) =>
						prisma.postTag.create({
							data: { name, slug: name.toLowerCase().replace(/\s+/g, "-"), type: post.type },
						}),
					),
				);
				finalTagIds = [...(finalTagIds || []), ...existingTagIds, ...newTags.map((tag) => tag.id)];
			} else {
				finalTagIds = existingTagIds;
			}
		}

		// Update categories and tags
		const updateData: any = { ...data };
		if (data.metaData !== undefined) {
			updateData.metaData = data.metaData;
		}

		if (categoryIds !== undefined) {
			// Remove existing categories
			await prisma.postCategoriesOnPost.deleteMany({
				where: { postId: id },
			});

			// Add new categories
			if (categoryIds.length > 0) {
				updateData.categories = {
					create: categoryIds.map((categoryId) => ({
						category: { connect: { id: categoryId } },
					})),
				};
			}
		}

		if (finalTagIds !== undefined) {
			// Remove existing tags
			await prisma.postTagsOnPost.deleteMany({
				where: { postId: id },
			});

			// Add new tags
			if (finalTagIds.length > 0) {
				updateData.tags = {
					create: finalTagIds.map((tagId) => ({
						tag: { connect: { id: tagId } },
					})),
				};
			}
		}

		const post = await prisma.post.update({
			where: { id },
			data: updateData,
			include: {
				categories: {
					include: { category: true },
				},
				tags: {
					include: { tag: true },
				},
			},
		});

		// Transform
		return {
			...post,
			type: post.type as PostType,
			categories: post.categories.map((catJunction) => ({ ...catJunction.category, type: catJunction.category.type as PostType })),
			tags: post.tags.map((tagJunction) => ({ ...tagJunction.tag, type: tagJunction.tag.type as PostType })),
		};
	}

	/**
	 * Delete post
	 */
	static async delete(id: string): Promise<void> {
		await prisma.post.delete({
			where: { id },
		});
	}

	/**
	 * Increment view count
	 */
	static async incrementViewCount(id: string): Promise<void> {
		await prisma.post.update({
			where: { id },
			data: { viewCount: { increment: 1 } },
		});
	}
}

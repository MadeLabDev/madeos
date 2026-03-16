import { prisma } from "@/lib/prisma";

type Media = {
	id: string;
	name: string;
	url: string;
	type: string;
	size: number;
	visibility: string;
	uploadedById: string;
	createdAt: Date;
	updatedAt: Date;
	entityType?: string | null;
	entityId?: string | null;
	uploadedBy?: {
		id: string;
		name: string | null;
		email: string;
	};
};

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class MediaRepository {
	/**
	 * Get all media with filters and pagination
	 */
	async getAll(userId: string, userRoles: string[], page: number = 1, limit: number = 12, search?: string) {
		const skip = (page - 1) * limit;
		const isAdmin = userRoles.includes("admin");
		const isManager = userRoles.includes("manager");

		// Build where clause based on role
		let where: any = {};

		if (isAdmin || isManager) {
			// Admin/Manager see all media
			if (search) {
				where.name = {
					contains: search,
					...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
				};
			}
		} else {
			// Regular users see: own media + public media
			where = {
				OR: [
					{ uploadedById: userId }, // Own uploads
					{ visibility: "PUBLIC" }, // Public media
				],
				...(search && {
					name: {
						contains: search,
						...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
					},
				}),
			};
		}

		const [items, total] = await Promise.all([
			prisma.media.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					uploadedBy: { select: { id: true, name: true, email: true } },
				},
			}),
			prisma.media.count({ where }),
		]);

		return {
			items,
			total,
			pageCount: Math.ceil(total / limit),
			currentPage: page,
		};
	}

	/**
	 * Get media by ID
	 */
	async getById(id: string): Promise<Media | null> {
		return prisma.media.findUnique({
			where: { id },
			include: {
				uploadedBy: { select: { id: true, name: true, email: true } },
			},
		});
	}

	/**
	 * Create new media
	 */
	async create(data: { name: string; url: string; type: string; size: number; visibility: string; uploadedById: string }): Promise<Media> {
		return prisma.media.create({ data });
	}

	/**
	 * Update media visibility
	 */
	async updateVisibility(id: string, visibility: string): Promise<Media> {
		return prisma.media.update({
			where: { id },
			data: { visibility },
		});
	}

	/**
	 * Delete media
	 */
	async delete(id: string): Promise<Media> {
		return prisma.media.delete({ where: { id } });
	}

	/**
	 * Get user's media (only their uploads)
	 */
	async getUserMedia(userId: string, page: number = 1, limit: number = 12) {
		const skip = (page - 1) * limit;

		const [items, total] = await Promise.all([
			prisma.media.findMany({
				where: { uploadedById: userId },
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					uploadedBy: { select: { id: true, name: true, email: true } },
				},
			}),
			prisma.media.count({ where: { uploadedById: userId } }),
		]);

		return {
			items,
			total,
			pageCount: Math.ceil(total / limit),
			currentPage: page,
		};
	}
}

export const mediaRepository = new MediaRepository();

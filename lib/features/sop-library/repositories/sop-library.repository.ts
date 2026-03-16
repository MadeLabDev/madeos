import { prisma } from "@/lib/prisma";

import type { CreateSOPInput, GetSOPsOptions, SOPLibraryWithRelations, UpdateSOPInput } from "../types/sop-library.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * SOP Library Repository
 * Direct database operations for SOP management
 */

export class SOPLibraryRepository {
	/**
	 * Get all SOPs with filters and pagination
	 */
	static async getAllSOPs(options: GetSOPsOptions = {}): Promise<{ sops: SOPLibraryWithRelations[]; total: number }> {
		const { page = 1, limit = 10, search, status, category } = options;

		const skip = (page - 1) * limit;

		const where: any = {};

		if (search) {
			where.OR = [{ title: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { content: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		if (status) {
			where.status = status;
		}

		if (category) {
			where.category = category;
		}

		const [sops, total] = await Promise.all([
			prisma.sOPLibrary.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.sOPLibrary.count({ where }),
		]);

		return { sops, total };
	}

	/**
	 * Get SOP by ID
	 */
	static async getSOPById(id: string): Promise<SOPLibraryWithRelations | null> {
		return prisma.sOPLibrary.findUnique({
			where: { id },
		});
	}

	/**
	 * Get SOP by slug
	 */
	static async getSOPBySlug(slug: string): Promise<SOPLibraryWithRelations | null> {
		return prisma.sOPLibrary.findUnique({
			where: { slug },
		});
	}

	/**
	 * Create new SOP
	 */
	static async createSOP(data: CreateSOPInput): Promise<SOPLibraryWithRelations> {
		return prisma.sOPLibrary.create({
			data: {
				title: data.title,
				slug: data.slug,
				description: data.description,
				content: data.content,
				version: data.version || 1,
				status: data.status || "DRAFT",
				category: data.category,
				versionNotes: data.versionNotes,
				applicableDepartments: data.applicableDepartments,
				applicableRoles: data.applicableRoles,
				requiredCertifications: data.requiredCertifications,
				effectiveDate: data.effectiveDate,
				sunsetDate: data.sunsetDate,
				attachmentIds: data.attachmentIds,
				coverImageId: data.coverImageId,
				reviewCycleMonths: data.reviewCycleMonths || 12,
				createdBy: data.createdBy,
				metaData: data.metaData,
			},
		});
	}

	/**
	 * Update SOP
	 */
	static async updateSOP(id: string, data: UpdateSOPInput): Promise<SOPLibraryWithRelations> {
		const updateData: any = {};

		if (data.title !== undefined) updateData.title = data.title;
		if (data.slug !== undefined) updateData.slug = data.slug;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.content !== undefined) updateData.content = data.content;
		if (data.version !== undefined) updateData.version = data.version;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.category !== undefined) updateData.category = data.category;
		if (data.versionNotes !== undefined) updateData.versionNotes = data.versionNotes;
		if (data.applicableDepartments !== undefined) updateData.applicableDepartments = data.applicableDepartments;
		if (data.applicableRoles !== undefined) updateData.applicableRoles = data.applicableRoles;
		if (data.requiredCertifications !== undefined) updateData.requiredCertifications = data.requiredCertifications;
		if (data.effectiveDate !== undefined) updateData.effectiveDate = data.effectiveDate;
		if (data.sunsetDate !== undefined) updateData.sunsetDate = data.sunsetDate;
		if (data.attachmentIds !== undefined) updateData.attachmentIds = data.attachmentIds;
		if (data.coverImageId !== undefined) updateData.coverImageId = data.coverImageId;
		if (data.reviewCycleMonths !== undefined) updateData.reviewCycleMonths = data.reviewCycleMonths;
		if (data.lastReviewedBy !== undefined) updateData.lastReviewedBy = data.lastReviewedBy;
		if (data.lastReviewedAt !== undefined) updateData.lastReviewedAt = data.lastReviewedAt;
		if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;
		if (data.metaData !== undefined) updateData.metaData = data.metaData;

		return prisma.sOPLibrary.update({
			where: { id },
			data: updateData,
		});
	}

	/**
	 * Delete SOP
	 */
	static async deleteSOP(id: string): Promise<SOPLibraryWithRelations> {
		return prisma.sOPLibrary.delete({
			where: { id },
		});
	}

	/**
	 * Get all categories
	 */
	static async getAllCategories(): Promise<string[]> {
		const sops = await prisma.sOPLibrary.findMany({
			where: {
				category: {
					not: null,
				},
			},
			select: {
				category: true,
			},
			distinct: ["category"],
		});

		return sops.map((sop) => sop.category).filter((cat): cat is string => cat !== null);
	}

	/**
	 * Get SOP count by status
	 */
	static async getSOPCountByStatus(): Promise<Record<string, number>> {
		const counts = await prisma.sOPLibrary.groupBy({
			by: ["status"],
			_count: true,
		});

		return counts.reduce(
			(acc, item) => {
				acc[item.status] = item._count;
				return acc;
			},
			{} as Record<string, number>,
		);
	}
}

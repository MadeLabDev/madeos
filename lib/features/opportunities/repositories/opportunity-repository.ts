/**
 * Opportunity Repository - Database Operations
 */

import type { CreateOpportunityInput, UpdateOpportunityInput } from "@/lib/features/opportunities/types/opportunity.types";
import { prisma } from "@/lib/prisma";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

// ============================================================================
// OPPORTUNITY OPERATIONS
// ============================================================================

export async function getAllOpportunities(params?: { page?: number; limit?: number; search?: string; customerId?: string; stage?: string }): Promise<any> {
	const where: any = {};

	if (params?.customerId) {
		where.customerId = params.customerId;
	}

	if (params?.stage) {
		where.stage = params.stage;
	}

	if (params?.search) {
		where.OR = [{ title: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { source: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
	}

	// If pagination params provided, return paginated results
	if (params?.page || params?.limit) {
		const pageNum = params?.page || 1;
		const limitNum = params?.limit || 20;
		const skip = (pageNum - 1) * limitNum;

		const [data, total] = await Promise.all([
			prisma.opportunity.findMany({
				where,
				include: {
					customer: {
						select: {
							id: true,
							companyName: true,
							email: true,
						},
					},
					owner: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limitNum,
			}),
			prisma.opportunity.count({ where }),
		]);

		return {
			opportunities: data,
			total,
			page: pageNum,
			pageCount: Math.ceil(total / limitNum),
		};
	}

	// Otherwise, return all records
	return prisma.opportunity.findMany({
		where,
		include: {
			customer: {
				select: {
					id: true,
					companyName: true,
					email: true,
				},
			},
			owner: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function getOpportunityById(id: string) {
	return prisma.opportunity.findUnique({
		where: { id },
		include: {
			customer: true,
			owner: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			engagements: true,
		},
	});
}

export async function createOpportunity(data: CreateOpportunityInput) {
	return prisma.opportunity.create({
		data,
		include: {
			customer: true,
			owner: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
}

export async function updateOpportunity(id: string, data: UpdateOpportunityInput) {
	return prisma.opportunity.update({
		where: { id },
		data,
		include: {
			customer: true,
			owner: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
}

export async function deleteOpportunity(id: string) {
	return prisma.opportunity.delete({
		where: { id },
	});
}

export async function bulkDeleteOpportunities(ids: string[]) {
	return prisma.opportunity.deleteMany({
		where: {
			id: { in: ids },
		},
	});
}

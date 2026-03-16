import { prisma } from "@/lib/prisma";

import type { CampaignStatus, CreateMarketingCampaignInput, GetMarketingCampaignsOptions, MarketingCampaignWithRelations, UpdateMarketingCampaignInput } from "../types/marketing-campaign.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * MarketingCampaign Repository
 * Direct database operations for marketing campaigns
 */

export class MarketingCampaignRepository {
	/**
	 * Get all marketing campaigns with filters and pagination
	 */
	static async getAllMarketingCampaigns(options: GetMarketingCampaignsOptions = {}) {
		const { page = 1, pageSize = 10, status, type, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (status) {
			where.status = status;
		}

		if (type) {
			where.type = type;
		}

		if (search) {
			where.OR = [{ title: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { targetAudience: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [campaigns, total] = await Promise.all([
			prisma.marketingCampaign.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					createdBy: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					updatedBy: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					_count: {
						select: {
							emails: true,
							templates: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.marketingCampaign.count({ where }),
		]);

		return {
			campaigns,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get marketing campaign by ID
	 */
	static async getMarketingCampaignById(id: string): Promise<MarketingCampaignWithRelations | null> {
		return prisma.marketingCampaign.findUnique({
			where: { id },
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				_count: {
					select: {
						emails: true,
						templates: true,
					},
				},
			},
		});
	}

	/**
	 * Create a new marketing campaign
	 */
	static async createMarketingCampaign(data: CreateMarketingCampaignInput, userId: string): Promise<MarketingCampaignWithRelations> {
		return prisma.marketingCampaign.create({
			data: {
				...data,
				createdById: userId,
				updatedById: userId,
			},
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				_count: {
					select: {
						emails: true,
						templates: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing marketing campaign
	 */
	static async updateMarketingCampaign(id: string, data: UpdateMarketingCampaignInput, userId: string): Promise<MarketingCampaignWithRelations> {
		return prisma.marketingCampaign.update({
			where: { id },
			data: {
				...data,
				updatedById: userId,
			},
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				_count: {
					select: {
						emails: true,
						templates: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a marketing campaign
	 */
	static async deleteMarketingCampaign(id: string): Promise<MarketingCampaignWithRelations> {
		return prisma.marketingCampaign.delete({
			where: { id },
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				_count: {
					select: {
						emails: true,
						templates: true,
					},
				},
			},
		});
	}

	/**
	 * Get count of marketing campaigns by status
	 */
	static async getMarketingCampaignCountByStatus(): Promise<Record<CampaignStatus, number>> {
		const counts = await prisma.marketingCampaign.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<CampaignStatus, number>;
	}
}

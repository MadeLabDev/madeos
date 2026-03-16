import { prisma } from "@/lib/prisma";

import { CreateMarketingCampaignInput, MarketingCampaign, MarketingCampaignFilters, UpdateMarketingCampaignInput } from "../types";

export class MarketingCampaignRepository {
	/**
	 * Create a new marketing campaign
	 */
	async createCampaign(data: CreateMarketingCampaignInput & { createdById: string; updatedById: string }): Promise<MarketingCampaign> {
		console.log("Creating campaign with data:", data);
		return prisma.marketingCampaign.create({
			data: {
				...data,
				status: data.status || "DRAFT",
			},
		});
	} /**
	 * Get campaign by ID with relations
	 */
	async getCampaignById(id: string): Promise<MarketingCampaign | null> {
		return prisma.marketingCampaign.findUnique({
			where: { id },
			include: {
				createdBy: {
					select: { id: true, name: true, email: true },
				},
				updatedBy: {
					select: { id: true, name: true, email: true },
				},
				emails: {
					select: {
						id: true,
						subject: true,
						recipientEmail: true,
						status: true,
						sentAt: true,
					},
					orderBy: { createdAt: "desc" },
				},
				templates: {
					select: {
						id: true,
						name: true,
						type: true,
						isActive: true,
					},
				},
			},
		}) as any;
	}

	/**
	 * Get all campaigns with filtering and pagination
	 */
	async getCampaigns(filters: MarketingCampaignFilters = {}, page: number = 1, limit: number = 20): Promise<{ campaigns: MarketingCampaign[]; total: number }> {
		const where = this.buildCampaignWhereClause(filters);

		const [campaigns, total] = await Promise.all([
			prisma.marketingCampaign.findMany({
				where,
				include: {
					createdBy: {
						select: { id: true, name: true, email: true },
					},
					_count: {
						select: { emails: true },
					},
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.marketingCampaign.count({ where }),
		]);

		return { campaigns, total };
	}

	/**
	 * Update campaign
	 */
	async updateCampaign(id: string, data: UpdateMarketingCampaignInput & { updatedById: string; sentAt?: Date | null; scheduledAt?: Date | null }): Promise<MarketingCampaign> {
		return prisma.marketingCampaign.update({
			where: { id },
			data,
		});
	}

	/**
	 * Delete campaign
	 */
	async deleteCampaign(id: string): Promise<void> {
		await prisma.marketingCampaign.delete({
			where: { id },
		});
	}

	/**
	 * Get campaigns scheduled for sending
	 */
	async getScheduledCampaigns(): Promise<MarketingCampaign[]> {
		return prisma.marketingCampaign.findMany({
			where: {
				status: "SCHEDULED",
				scheduledAt: {
					lte: new Date(),
				},
			},
			include: {
				emails: true,
				templates: true,
			},
		});
	}

	/**
	 * Update campaign status
	 */
	async updateCampaignStatus(id: string, status: string, sentAt?: Date): Promise<MarketingCampaign> {
		return prisma.marketingCampaign.update({
			where: { id },
			data: {
				status: status as any,
				...(sentAt && { sentAt }),
			},
		});
	}

	private buildCampaignWhereClause(filters: MarketingCampaignFilters) {
		const where: any = {};

		if (filters.type) {
			where.type = filters.type;
		}

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.createdById) {
			where.createdById = filters.createdById;
		}

		if (filters.scheduledAfter || filters.scheduledBefore) {
			where.scheduledAt = {};
			if (filters.scheduledAfter) {
				where.scheduledAt.gte = filters.scheduledAfter;
			}
			if (filters.scheduledBefore) {
				where.scheduledAt.lte = filters.scheduledBefore;
			}
		}

		return where;
	}
}

export const marketingCampaignRepository = new MarketingCampaignRepository();

import { prisma } from "@/lib/prisma";

import { CampaignEmail, CampaignEmailFilters, CreateCampaignEmailInput } from "../types";

export class CampaignEmailRepository {
	/**
	 * Create a new campaign email
	 */
	async createEmail(data: CreateCampaignEmailInput & { sentById?: string }): Promise<CampaignEmail> {
		return prisma.campaignEmail.create({
			data: {
				...data,
				status: "PENDING",
			},
		});
	}

	/**
	 * Get email by ID
	 */
	async getEmailById(id: string): Promise<CampaignEmail | null> {
		return prisma.campaignEmail.findUnique({
			where: { id },
			include: {
				campaign: {
					select: {
						id: true,
						title: true,
						type: true,
						status: true,
					},
				},
				sentBy: {
					select: { id: true, name: true, email: true },
				},
			},
		}) as any;
	}

	/**
	 * Get emails by campaign ID
	 */
	async getEmailsByCampaignId(campaignId: string, page: number = 1, limit: number = 50): Promise<{ emails: CampaignEmail[]; total: number }> {
		const [emails, total] = await Promise.all([
			prisma.campaignEmail.findMany({
				where: { campaignId },
				include: {
					sentBy: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.campaignEmail.count({ where: { campaignId } }),
		]);

		return { emails: emails as any, total };
	}

	/**
	 * Get emails with filtering
	 */
	async getEmails(filters: CampaignEmailFilters = {}, page: number = 1, limit: number = 50): Promise<{ emails: CampaignEmail[]; total: number }> {
		const where = this.buildEmailWhereClause(filters);

		const [emails, total] = await Promise.all([
			prisma.campaignEmail.findMany({
				where,
				include: {
					campaign: {
						select: {
							id: true,
							title: true,
							type: true,
							status: true,
						},
					},
					sentBy: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.campaignEmail.count({ where }),
		]);

		return { emails: emails as any, total };
	}

	/**
	 * Update email status
	 */
	async updateEmailStatus(id: string, status: string, sentAt?: Date, openedAt?: Date, clickedAt?: Date, error?: string): Promise<CampaignEmail> {
		return prisma.campaignEmail.update({
			where: { id },
			data: {
				status: status as any,
				...(sentAt && { sentAt }),
				...(openedAt && { openedAt }),
				...(clickedAt && { clickedAt }),
				...(error && { error }),
			},
		});
	}

	/**
	 * Bulk update email statuses
	 */
	async bulkUpdateEmailStatuses(emailIds: string[], status: string, sentAt?: Date): Promise<void> {
		await prisma.campaignEmail.updateMany({
			where: {
				id: { in: emailIds },
			},
			data: {
				status: status as any,
				...(sentAt && { sentAt }),
			},
		});
	}

	/**
	 * Get pending emails for sending
	 */
	async getPendingEmails(limit: number = 100): Promise<CampaignEmail[]> {
		return prisma.campaignEmail.findMany({
			where: {
				status: "PENDING",
			},
			include: {
				campaign: {
					select: {
						id: true,
						title: true,
						type: true,
					},
				},
			},
			orderBy: { createdAt: "asc" },
			take: limit,
		}) as any;
	}

	/**
	 * Delete email
	 */
	async deleteEmail(id: string): Promise<void> {
		await prisma.campaignEmail.delete({
			where: { id },
		});
	}

	/**
	 * Get email statistics for a campaign
	 */
	async getCampaignEmailStats(campaignId: string): Promise<{
		total: number;
		sent: number;
		delivered: number;
		opened: number;
		clicked: number;
		bounced: number;
		complained: number;
	}> {
		const stats = await prisma.campaignEmail.groupBy({
			by: ["status"],
			where: { campaignId },
			_count: {
				status: true,
			},
		});

		const result = {
			total: 0,
			sent: 0,
			delivered: 0,
			opened: 0,
			clicked: 0,
			bounced: 0,
			complained: 0,
		};

		stats.forEach((stat) => {
			result.total += stat._count.status;
			switch (stat.status) {
				case "SENT":
					result.sent += stat._count.status;
					break;
				case "DELIVERED":
					result.delivered += stat._count.status;
					break;
				case "OPENED":
					result.opened += stat._count.status;
					break;
				case "CLICKED":
					result.clicked += stat._count.status;
					break;
				case "BOUNCED":
					result.bounced += stat._count.status;
					break;
				case "COMPLAINT":
					result.complained += stat._count.status;
					break;
			}
		});

		return result;
	}

	private buildEmailWhereClause(filters: CampaignEmailFilters) {
		const where: any = {};

		if (filters.campaignId) {
			where.campaignId = filters.campaignId;
		}

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.sentById) {
			where.sentById = filters.sentById;
		}

		if (filters.sentAfter || filters.sentBefore) {
			where.sentAt = {};
			if (filters.sentAfter) {
				where.sentAt.gte = filters.sentAfter;
			}
			if (filters.sentBefore) {
				where.sentAt.lte = filters.sentBefore;
			}
		}

		return where;
	}
}

export const campaignEmailRepository = new CampaignEmailRepository();

import type { SubscriptionAction } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export class SubscriptionHistoryRepository {
	/**
	 * Get subscription history for a user
	 */
	static async getUserHistory(userId: string, limit: number = 50) {
		return prisma.subscriptionHistory.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			take: limit,
		});
	}

	/**
	 * Get subscription history by subscription ID
	 */
	static async getSubscriptionHistory(subscriptionId: string) {
		return prisma.subscriptionHistory.findMany({
			where: { subscriptionId },
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Add history record
	 */
	static async addRecord(data: { subscriptionId: string; userId: string; actionType: SubscriptionAction | string; fromPlanId?: string; toPlanId?: string; amount: number; currency?: string; effectiveDate?: Date; invoiceId?: string; paymentId?: string; reason?: string; notes?: string }) {
		return prisma.subscriptionHistory.create({
			data: {
				...data,
				actionType: data.actionType as SubscriptionAction,
			},
		});
	}

	/**
	 * Get actions by type
	 */
	static async getActionsByType(userId: string, actionType: SubscriptionAction | string) {
		return prisma.subscriptionHistory.findMany({
			where: {
				userId,
				actionType: actionType as SubscriptionAction,
			},
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Get all downgrades for a user
	 */
	static async getUserDowngrades(userId: string) {
		return prisma.subscriptionHistory.findMany({
			where: {
				userId,
				actionType: "DOWNGRADED",
			},
			orderBy: { createdAt: "desc" },
		});
	}
}

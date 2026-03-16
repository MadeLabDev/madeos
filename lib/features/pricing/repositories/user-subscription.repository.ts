import { prisma } from "@/lib/prisma";

export class UserSubscriptionRepository {
	/**
	 * Get user's current subscription
	 */
	static async getUserSubscription(userId: string) {
		return prisma.userSubscription.findUnique({
			where: { userId },
			include: { plan: true },
		});
	}

	/**
	 * Get subscription by ID
	 */
	static async getSubscriptionById(id: string) {
		return prisma.userSubscription.findUnique({
			where: { id },
			include: { plan: true, history: true },
		});
	}

	/**
	 * Create user subscription
	 */
	static async createSubscription(userId: string, planId: string, data?: any) {
		try {
			return await prisma.userSubscription.create({
				data: {
					userId,
					planId,
					...data,
				},
				include: { plan: true },
			});
		} catch (error: any) {
			// Handle unique constraint violation
			if (error.code === "P2002" && error.meta?.target?.includes("userId")) {
				// User already has subscription, return existing one
				return prisma.userSubscription.findUnique({
					where: { userId },
					include: { plan: true },
				});
			}
			throw error;
		}
	}

	/**
	 * Update subscription
	 */
	static async updateSubscription(userId: string, data: any) {
		return prisma.userSubscription.update({
			where: { userId },
			data,
			include: { plan: true },
		});
	}

	/**
	 * Change subscription plan
	 */
	static async changePlan(userId: string, newPlanId: string, data?: any) {
		return prisma.userSubscription.update({
			where: { userId },
			data: {
				planId: newPlanId,
				...data,
			},
			include: { plan: true },
		});
	}

	/**
	 * Cancel subscription
	 */
	static async cancelSubscription(userId: string, cancelDate?: Date) {
		return prisma.userSubscription.update({
			where: { userId },
			data: {
				status: "CANCELLED",
				endDate: cancelDate || new Date(),
			},
			include: { plan: true },
		});
	}

	/**
	 * Reactivate subscription
	 */
	static async reactivateSubscription(userId: string, planId?: string) {
		const subscription = await prisma.userSubscription.findUnique({
			where: { userId },
		});

		if (!subscription) {
			throw new Error("Subscription not found");
		}

		return prisma.userSubscription.update({
			where: { userId },
			data: {
				status: "ACTIVE",
				endDate: null,
				planId: planId || subscription.planId,
				renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
			},
			include: { plan: true },
		});
	}

	/**
	 * Get subscriptions expiring soon
	 */
	static async getExpiringSubscriptions(daysInFuture: number = 7) {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + daysInFuture);

		return prisma.userSubscription.findMany({
			where: {
				status: "ACTIVE",
				renewalDate: {
					lte: futureDate,
				},
			},
			include: { plan: true },
		});
	}

	/**
	 * Get all active subscriptions
	 */
	static async getActiveSubscriptions() {
		return prisma.userSubscription.findMany({
			where: { status: "ACTIVE" },
			include: { plan: true },
		});
	}

	/**
	 * Schedule downgrade
	 */
	static async scheduleDowngrade(userId: string, downgradePlanId: string, effectiveDate: Date) {
		return prisma.userSubscription.update({
			where: { userId },
			data: {
				scheduledDowngradeAt: effectiveDate,
				scheduledDowngradePlanId: downgradePlanId,
			},
			include: { plan: true },
		});
	}

	/**
	 * Get subscriptions with scheduled downgrade
	 */
	static async getScheduledDowngrades() {
		return prisma.userSubscription.findMany({
			where: {
				scheduledDowngradeAt: {
					lte: new Date(),
				},
				NOT: {
					scheduledDowngradePlanId: null,
				},
			},
			include: { plan: true },
		});
	}

	/**
	 * Apply scheduled downgrade
	 */
	static async applyScheduledDowngrade(userId: string) {
		const subscription = await prisma.userSubscription.findUnique({
			where: { userId },
		});

		if (!subscription || !subscription.scheduledDowngradePlanId) {
			throw new Error("No scheduled downgrade found");
		}

		return prisma.userSubscription.update({
			where: { userId },
			data: {
				planId: subscription.scheduledDowngradePlanId,
				scheduledDowngradeAt: null,
				scheduledDowngradePlanId: null,
			},
			include: { plan: true },
		});
	}

	/**
	 * Get all subscriptions with user information (admin)
	 */
	static async getAllSubscriptionsWithUsers() {
		try {
			// Simplified query first to test
			return prisma.userSubscription.findMany({
				include: {
					plan: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							createdAt: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				take: 10, // Limit to 10 records for testing
			});
		} catch (error) {
			console.error("Error in getAllSubscriptionsWithUsers:", error);
			// Return empty array and don't throw error
			return [];
		}
	} /**
	 * Get active subscriptions count (admin)
	 */
	static async getActiveSubscriptionsCount() {
		try {
			return prisma.userSubscription.count({
				where: {
					status: "ACTIVE",
				},
			});
		} catch (error) {
			console.error("Error in getActiveSubscriptionsCount:", error);
			return 0; // Return 0 on error
		}
	}

	/**
	 * Get subscription by user ID
	 */
	static async getSubscriptionByUserId(userId: string) {
		return prisma.userSubscription.findUnique({
			where: { userId },
			include: { plan: true, history: true },
		});
	}
}

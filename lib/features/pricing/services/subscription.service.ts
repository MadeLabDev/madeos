import { InvoiceRepository, PricingPlanRepository, SubscriptionHistoryRepository, UserSubscriptionRepository } from "@/lib/features/pricing/repositories";
import type { CancelSubscriptionInput, ChangePlanInput, ReactivateSubscriptionInput } from "@/lib/features/pricing/types";

export class SubscriptionService {
	/**
	 * Get user subscription with all details
	 */
	static async getUserSubscriptionDetails(userId: string) {
		const subscription = await UserSubscriptionRepository.getUserSubscription(userId);

		if (!subscription) {
			// Return free plan as default
			const freePlan = await PricingPlanRepository.getPlanBySlug("free");
			if (!freePlan) {
				throw new Error("Free plan not found in database");
			}
			return {
				subscription: null,
				currentPlan: freePlan,
				history: [],
				invoices: [],
			};
		}

		// Check if plan still exists
		if (!subscription.plan) {
			throw new Error("User's subscription plan no longer exists in database");
		}

		const history = await SubscriptionHistoryRepository.getSubscriptionHistory(subscription.id);

		// Fetch plan details for history records
		const planIds = new Set<string>();
		history.forEach((record) => {
			if (record.fromPlanId) planIds.add(record.fromPlanId);
			if (record.toPlanId) planIds.add(record.toPlanId);
		});

		const plans = await PricingPlanRepository.getPlansByIds(Array.from(planIds));
		const planMap = new Map(plans.map((plan) => [plan.id, plan]));

		// Map plan details to history records
		const historyWithPlans = history.map((record) => ({
			...record,
			fromPlan: record.fromPlanId
				? {
						displayName: planMap.get(record.fromPlanId)?.displayName || "Unknown Plan",
						name: planMap.get(record.fromPlanId)?.name || "unknown",
					}
				: null,
			toPlan: record.toPlanId
				? {
						displayName: planMap.get(record.toPlanId)?.displayName || "Unknown Plan",
						name: planMap.get(record.toPlanId)?.name || "unknown",
					}
				: null,
		}));
		const invoices = await InvoiceRepository.getUserInvoices(userId);

		return {
			subscription,
			currentPlan: subscription.plan,
			history: historyWithPlans,
			invoices,
		};
	}

	/**
	 * Get all available plans for upgrade/downgrade
	 */
	static async getAvailablePlans() {
		return PricingPlanRepository.getActivePlans();
	}

	/**
	 * Change user's subscription plan
	 */
	static async changePlan(data: ChangePlanInput) {
		const { userId, newPlanId, reason } = data;

		// Validate new plan exists
		const newPlan = await PricingPlanRepository.getPlanById(newPlanId);
		if (!newPlan) {
			throw new Error("Plan not found");
		}

		// Get current subscription
		const subscription = await UserSubscriptionRepository.getUserSubscription(userId);
		if (!subscription) {
			throw new Error("Subscription not found");
		}

		const oldPlanId = subscription.planId;

		// Determine if upgrade or downgrade
		const oldPlan = await PricingPlanRepository.getPlanById(oldPlanId);
		if (!oldPlan) {
			throw new Error("Current plan not found");
		}

		const isUpgrade = newPlan.monthlyPrice > oldPlan.monthlyPrice;
		const actionType = isUpgrade ? "UPGRADED" : "DOWNGRADED";

		if (isUpgrade) {
			// Immediate upgrade
			const updated = await UserSubscriptionRepository.changePlan(userId, newPlanId, {
				status: "ACTIVE",
			});

			// Record history
			await SubscriptionHistoryRepository.addRecord({
				subscriptionId: subscription.id,
				userId,
				actionType,
				fromPlanId: oldPlanId,
				toPlanId: newPlanId,
				amount: newPlan.monthlyPrice,
				reason,
			});

			return updated;
		} else {
			// For downgrade, schedule for end of current period
			const effectiveDate = subscription.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

			const updated = await UserSubscriptionRepository.scheduleDowngrade(userId, newPlanId, effectiveDate);

			// Record history with effective date
			await SubscriptionHistoryRepository.addRecord({
				subscriptionId: subscription.id,
				userId,
				actionType,
				fromPlanId: oldPlanId,
				toPlanId: newPlanId,
				amount: newPlan.monthlyPrice,
				effectiveDate,
				reason: reason || "User scheduled downgrade",
			});

			return updated;
		}
	}

	/**
	 * Cancel subscription
	 */
	static async cancelSubscription(data: CancelSubscriptionInput) {
		const { userId, reason, cancelImmediately = false } = data;

		const subscription = await UserSubscriptionRepository.getUserSubscription(userId);
		if (!subscription) {
			throw new Error("Subscription not found");
		}

		const cancelDate = cancelImmediately ? new Date() : subscription.renewalDate || new Date();

		const updated = await UserSubscriptionRepository.cancelSubscription(userId, cancelDate);

		// Record history
		await SubscriptionHistoryRepository.addRecord({
			subscriptionId: subscription.id,
			userId,
			actionType: "CANCELLED",
			fromPlanId: subscription.planId,
			amount: 0,
			effectiveDate: cancelDate,
			reason: reason || "User cancelled subscription",
		});

		return updated;
	}

	/**
	 * Reactivate cancelled subscription
	 */
	static async reactivateSubscription(data: ReactivateSubscriptionInput) {
		const { userId, planId } = data;

		const subscription = await UserSubscriptionRepository.getUserSubscription(userId);
		if (!subscription) {
			throw new Error("Subscription not found");
		}

		const reactivatedPlanId = planId || subscription.planId;

		const updated = await UserSubscriptionRepository.reactivateSubscription(userId, reactivatedPlanId);

		// Record history
		await SubscriptionHistoryRepository.addRecord({
			subscriptionId: subscription.id,
			userId,
			actionType: "REACTIVATED",
			toPlanId: reactivatedPlanId,
			amount: updated.plan.monthlyPrice,
		});

		return updated;
	}

	/**
	 * Get subscription history
	 */
	static async getSubscriptionHistory(userId: string) {
		return SubscriptionHistoryRepository.getUserHistory(userId);
	}

	/**
	 * Get subscription invoices
	 */
	static async getUserInvoices(userId: string) {
		return InvoiceRepository.getUserInvoices(userId);
	}

	/**
	 * Check if user can upgrade to a plan
	 */
	static async canUpgradeTo(userId: string, targetPlanId: string) {
		const subscription = await UserSubscriptionRepository.getUserSubscription(userId);
		const targetPlan = await PricingPlanRepository.getPlanById(targetPlanId);

		if (!targetPlan) {
			return false;
		}

		if (!subscription) {
			// Free user can upgrade to any plan
			return true;
		}

		const currentPlan = subscription.plan;
		return targetPlan.monthlyPrice >= currentPlan.monthlyPrice;
	}

	/**
	 * Migrate user to a plan (admin function)
	 */
	static async migrateUserToplan(userId: string, planId: string, reason: string) {
		const subscription = await UserSubscriptionRepository.getUserSubscription(userId);
		const newPlan = await PricingPlanRepository.getPlanById(planId);

		if (!newPlan) {
			throw new Error("Plan not found");
		}

		if (!subscription) {
			// Create new subscription
			const created = await UserSubscriptionRepository.createSubscription(userId, planId);

			if (!created) {
				throw new Error("Failed to create subscription");
			}

			await SubscriptionHistoryRepository.addRecord({
				subscriptionId: created.id,
				userId,
				actionType: "CREATED",
				toPlanId: planId,
				amount: newPlan.monthlyPrice,
				reason: reason || "Admin migration",
			});

			return created;
		}

		// Update existing subscription
		const updated = await UserSubscriptionRepository.changePlan(userId, planId, {
			status: "ACTIVE",
		});

		await SubscriptionHistoryRepository.addRecord({
			subscriptionId: subscription.id,
			userId,
			actionType: "UPGRADED",
			fromPlanId: subscription.planId,
			toPlanId: planId,
			amount: newPlan.monthlyPrice,
			reason: reason || "Admin migration",
		});

		return updated;
	}

	/**
	 * Handle scheduled downgrades (cron job)
	 */
	static async applyScheduledDowngrades() {
		const scheduled = await UserSubscriptionRepository.getScheduledDowngrades();

		const results = [];
		for (const subscription of scheduled) {
			try {
				const updated = await UserSubscriptionRepository.applyScheduledDowngrade(subscription.userId);
				results.push({
					userId: subscription.userId,
					success: true,
					message: "Downgrade applied",
					data: updated,
				});
			} catch (error) {
				results.push({
					userId: subscription.userId,
					success: false,
					message: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		return results;
	}

	/**
	 * Check trial status
	 */
	static async checkTrialStatus(userId: string) {
		const subscription = await UserSubscriptionRepository.getUserSubscription(userId);

		if (!subscription || !subscription.trialEndDate) {
			return { isTrialing: false, daysLeft: 0 };
		}

		const now = new Date();
		const isTrialing = subscription.trialEndDate > now;
		const daysLeft = Math.ceil((subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

		return { isTrialing, daysLeft };
	}
}

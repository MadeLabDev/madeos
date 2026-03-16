import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import { InvoiceRepository, UserSubscriptionRepository } from "../repositories";

/**
 * Admin action to get all user subscriptions across the system
 */
export async function getAllUserSubscriptionsAction(): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");

		const subscriptions = await UserSubscriptionRepository.getAllSubscriptionsWithUsers();
		return {
			success: true,
			message: "Subscriptions retrieved successfully",
			data: subscriptions,
		};
	} catch (error) {
		console.error("Error fetching all subscriptions:", error);
		return {
			success: false,
			message: `Failed to retrieve subscriptions: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Admin action to get all invoices across the system
 */
export async function getAllInvoicesAction(): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");

		const invoices = await InvoiceRepository.getAllInvoicesWithUsers();
		return {
			success: true,
			message: "Invoices retrieved successfully",
			data: invoices,
		};
	} catch (error) {
		console.error("Error fetching all invoices:", error);
		return {
			success: false,
			message: `Failed to retrieve invoices: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Admin action to get billing statistics
 */
export async function getBillingStatisticsAction(): Promise<ActionResult> {
	await requirePermission("finance", "read");

	try {
		const [totalRevenue, activeSubscriptions, totalInvoices, recentPayments] = await Promise.all([InvoiceRepository.getTotalRevenue(), UserSubscriptionRepository.getActiveSubscriptionsCount(), InvoiceRepository.getTotalInvoicesCount(), InvoiceRepository.getRecentPayments(10)]);

		return {
			success: true,
			message: "Billing statistics retrieved successfully",
			data: {
				totalRevenue,
				activeSubscriptions,
				totalInvoices,
				recentPayments,
			},
		};
	} catch (error) {
		console.error("Error fetching billing statistics:", error);
		return {
			success: false,
			message: `Failed to retrieve billing statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Admin action to get subscription details for a specific user
 */
export async function getUserSubscriptionDetailsAction(userId: string): Promise<ActionResult> {
	await requirePermission("finance", "read");

	try {
		const subscription = await UserSubscriptionRepository.getSubscriptionByUserId(userId);
		const invoices = await InvoiceRepository.getInvoicesByUserId(userId);

		return {
			success: true,
			message: "User subscription details retrieved successfully",
			data: {
				subscription,
				invoices,
			},
		};
	} catch (error) {
		console.error("Error fetching user subscription details:", error);
		return {
			success: false,
			message: "Failed to retrieve user subscription details",
		};
	}
}

"use server";

import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { InvoiceRepository, PricingPlanRepository, SubscriptionHistoryRepository, UserSubscriptionRepository } from "@/lib/features/pricing/repositories";
import { SubscriptionService } from "@/lib/features/pricing/services";
import type { CancelSubscriptionInput, ChangePlanInput } from "@/lib/features/pricing/types";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

/**
 * Get user's subscription details
 */
export async function getSubscriptionDetailsAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		const details = await SubscriptionService.getUserSubscriptionDetails(session.user.id);
		return {
			success: true,
			message: "Subscription details fetched",
			data: details,
		};
	} catch (error) {
		console.error("Error fetching subscription details:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch subscription details",
		};
	}
}

/**
 * Get available plans for upgrade/downgrade
 */
export async function getAvailablePlansAction(): Promise<ActionResult> {
	try {
		const plans = await SubscriptionService.getAvailablePlans();
		return {
			success: true,
			message: "Plans fetched",
			data: plans,
		};
	} catch (error) {
		console.error("Error fetching plans:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch plans",
		};
	}
}

/**
 * Change subscription plan
 */
export async function changePlanAction(input: ChangePlanInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		// User can only change their own subscription
		if (input.userId !== session.user.id) {
			return { success: false, message: "Unauthorized" };
		}

		const updated = await SubscriptionService.changePlan(input);

		return {
			success: true,
			message: "Plan changed successfully",
			data: updated,
		};
	} catch (error) {
		console.error("Error changing plan:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to change plan",
		};
	}
}

/**
 * Cancel subscription
 */
export async function cancelSubscriptionAction(input: CancelSubscriptionInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		// User can only cancel their own subscription
		if (input.userId !== session.user.id) {
			return { success: false, message: "Unauthorized" };
		}

		const cancelled = await SubscriptionService.cancelSubscription(input);

		return {
			success: true,
			message: "Subscription cancelled successfully",
			data: cancelled,
		};
	} catch (error) {
		console.error("Error cancelling subscription:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to cancel subscription",
		};
	}
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscriptionAction(userId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		if (userId !== session.user.id) {
			return { success: false, message: "Unauthorized" };
		}

		const reactivated = await SubscriptionService.reactivateSubscription({ userId });

		return {
			success: true,
			message: "Subscription reactivated successfully",
			data: reactivated,
		};
	} catch (error) {
		console.error("Error reactivating subscription:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to reactivate subscription",
		};
	}
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistoryAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		const history = await SubscriptionService.getSubscriptionHistory(session.user.id);

		return {
			success: true,
			message: "History fetched",
			data: history,
		};
	} catch (error) {
		console.error("Error fetching history:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch history",
		};
	}
}

/**
 * Get user invoices
 */
export async function getInvoicesAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		const invoices = await SubscriptionService.getUserInvoices(session.user.id);

		return {
			success: true,
			message: "Invoices fetched",
			data: invoices,
		};
	} catch (error) {
		console.error("Error fetching invoices:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch invoices",
		};
	}
}

/**
 * Check trial status
 */
export async function checkTrialStatusAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		const trialStatus = await SubscriptionService.checkTrialStatus(session.user.id);

		return {
			success: true,
			message: "Trial status fetched",
			data: trialStatus,
		};
	} catch (error) {
		console.error("Error checking trial status:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to check trial status",
		};
	}
}

/**
 * Initialize user subscription with Free plan
 * Called during user signup/first login
 */
export async function initializeUserSubscriptionAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		// Verify user exists in database
		const userExists = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { id: true },
		});

		if (!userExists) {
			return {
				success: false,
				message: "User account not found in database. Please sign out and sign in again.",
			};
		}

		// Check if user already has a subscription
		const existing = await UserSubscriptionRepository.getUserSubscription(session.user.id);
		if (existing) {
			return {
				success: true,
				message: "User already has a subscription",
				data: existing,
			};
		}

		// Get free plan
		const freePlan = await PricingPlanRepository.getPlanBySlug("free");
		if (!freePlan) {
			return {
				success: false,
				message: "Free plan not found in database",
			};
		}

		// Create subscription with free plan
		const subscription = await UserSubscriptionRepository.createSubscription(session.user.id, freePlan.id, {
			startDate: new Date(),
			renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
			autoRenew: true,
			status: "ACTIVE",
		});

		if (!subscription) {
			return {
				success: false,
				message: "Failed to create subscription",
			};
		}

		// Log the creation
		await SubscriptionHistoryRepository.addRecord({
			subscriptionId: subscription.id,
			userId: session.user.id,
			actionType: "UPGRADED", // Use UPGRADED as initial subscription
			toPlanId: freePlan.id,
			amount: 0,
			effectiveDate: new Date(),
			reason: "Initial subscription with free plan",
		});

		return {
			success: true,
			message: "Subscription initialized successfully",
			data: subscription,
		};
	} catch (error) {
		console.error("Error initializing subscription:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to initialize subscription",
		};
	}
}

/**
 * Create Stripe payment intent for checkout
 */
export async function createStripePaymentIntentAction(planId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		// Get plan details
		const plan = await PricingPlanRepository.getPlanById(planId);
		if (!plan) {
			return { success: false, message: "Plan not found" };
		}

		// Initialize Stripe
		const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
			apiVersion: "2025-12-15.clover",
		}); // Create payment intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(plan.monthlyPrice * 100), // Convert to cents
			currency: "usd",
			metadata: {
				userId: session.user.id,
				planId: plan.id,
				planName: plan.name,
			},
			description: `Subscription to ${plan.displayName}`,
			automatic_payment_methods: {
				enabled: true,
			},
		});

		return {
			success: true,
			message: "Payment intent created",
			data: {
				clientSecret: paymentIntent.client_secret,
				paymentIntentId: paymentIntent.id,
			},
		};
	} catch (error) {
		console.error("Error creating payment intent:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create payment intent",
		};
	}
}

/**
 * Get invoice details for PDF generation
 */
export async function getInvoiceDetailsAction(invoiceId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		// Verify invoice belongs to user
		const invoice = await InvoiceRepository.getInvoiceById(invoiceId);
		if (!invoice) {
			return { success: false, message: "Invoice not found" };
		}

		if (invoice.userId !== session.user.id) {
			return { success: false, message: "Access denied" };
		}

		return {
			success: true,
			message: "Invoice details retrieved",
			data: invoice,
		};
	} catch (error) {
		console.error("Error getting invoice details:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get invoice details",
		};
	}
}

/**
 * Create invoice for subscription
 */
export async function createInvoiceAction(data: { userId: string; subscriptionId?: string; amount: number; currency?: string; billingPeriodStart: Date; billingPeriodEnd: Date; description?: string; notes?: string }): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		// Only allow creating invoices for own account (or admin)
		if (data.userId !== session.user.id) {
			try {
				await requirePermission("finance", "create");
			} catch {
				return { success: false, message: "Access denied" };
			}
		}

		const invoiceNumber = await InvoiceRepository.generateInvoiceNumber();
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term

		const invoice = await InvoiceRepository.createInvoice({
			...data,
			invoiceNumber,
			dueDate,
			description: data.description || "Subscription payment",
		});

		return {
			success: true,
			message: "Invoice created successfully",
			data: invoice,
		};
	} catch (error) {
		console.error("Error creating invoice:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create invoice",
		};
	}
}

/**
 * Handle successful payment and create invoice
 */
export async function handlePaymentSuccessAction(data: { userId: string; planId: string; paymentId: string; amount: number; currency?: string; billingPeriodStart: Date; billingPeriodEnd: Date }): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		if (data.userId !== session.user.id) {
			return { success: false, message: "Access denied" };
		}

		// Change plan first
		const changeResult = await SubscriptionService.changePlan({
			userId: data.userId,
			newPlanId: data.planId,
			reason: "Paid plan activation via Stripe checkout",
		});

		if (!changeResult) {
			throw new Error("Failed to change plan");
		}

		// Create invoice
		const invoiceResult = await createInvoiceAction({
			userId: data.userId,
			subscriptionId: changeResult.id,
			amount: data.amount,
			currency: data.currency || "USD",
			billingPeriodStart: data.billingPeriodStart,
			billingPeriodEnd: data.billingPeriodEnd,
			description: `Payment for ${changeResult.plan?.name || "plan"} subscription`,
			notes: `Payment ID: ${data.paymentId}`,
		});

		if (!invoiceResult.success) {
			throw new Error("Failed to create invoice");
		}

		// Mark invoice as paid
		await InvoiceRepository.markAsPaid((invoiceResult.data as any).id, data.paymentId);

		return {
			success: true,
			message: "Payment processed and invoice created successfully",
			data: {
				subscription: changeResult,
				invoice: invoiceResult.data,
			},
		};
	} catch (error) {
		console.error("Error handling payment success:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to process payment",
		};
	}
}

/**
 * Create Stripe setup intent for payment method setup
 */
export async function createStripeSetupIntentAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		// Initialize Stripe
		const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
			apiVersion: "2025-12-15.clover",
		});

		// Create setup intent
		const setupIntent = await stripe.setupIntents.create({
			payment_method_types: ["card"],
			metadata: {
				userId: session.user.id,
			},
			usage: "off_session", // Allow future payments
		});

		return {
			success: true,
			message: "Setup intent created",
			data: {
				clientSecret: setupIntent.client_secret,
				setupIntentId: setupIntent.id,
			},
		};
	} catch (error) {
		console.error("Error creating setup intent:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create setup intent",
		};
	}
}

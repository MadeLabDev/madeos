import type { InvoiceStatus, SubscriptionAction, SubscriptionStatus } from "@/generated/prisma/enums";

export type { SubscriptionStatus, SubscriptionAction, InvoiceStatus };

export interface PricingPlan {
	id: string;
	name: string;
	slug: string;
	displayName: string;
	description?: string | null;
	icon?: string | null;
	monthlyPrice: number;
	annualPrice?: number | null;
	currency: string;
	features?: string[] | null;
	limitations?: string[] | null;
	tier: string;
	order: number;
	isActive: boolean;
	isFeatured: boolean;
	billingCycle: string;
	trialDays: number;
	metadata?: any;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserSubscription {
	id: string;
	userId: string;
	planId: string;
	plan: PricingPlan;
	startDate: Date;
	endDate?: Date | null;
	renewalDate?: Date | null;
	autoRenew: boolean;
	status: SubscriptionStatus;
	lastPaymentDate?: Date | null;
	nextPaymentDate?: Date | null;
	lastPaymentId?: string | null;
	trialEndDate?: Date | null;
	scheduledDowngradeAt?: Date | null;
	scheduledDowngradePlanId?: string | null;
	metadata?: any;
	createdAt: Date;
	updatedAt: Date;
}

export interface SubscriptionHistoryRecord {
	id: string;
	subscriptionId: string;
	userId: string;
	actionType: SubscriptionAction;
	fromPlanId?: string | null;
	fromPlan?: {
		displayName: string;
		name: string;
	} | null;
	toPlanId?: string | null;
	toPlan?: {
		displayName: string;
		name: string;
	} | null;
	amount: number;
	currency: string;
	effectiveDate?: Date | null;
	invoiceId?: string | null;
	paymentId?: string | null;
	reason?: string | null;
	notes?: string | null;
	createdAt: Date;
}

export interface Invoice {
	id: string;
	userId: string;
	subscriptionId?: string | null;
	invoiceNumber: string;
	amount: number;
	currency: string;
	issuedAt: Date;
	dueDate: Date;
	paidAt?: Date | null;
	status: InvoiceStatus;
	billingPeriodStart: Date;
	billingPeriodEnd: Date;
	paymentId?: string | null;
	paymentMethod?: string | null;
	description?: string | null;
	notes?: string | null;
	metadata?: any;
	createdAt: Date;
	updatedAt: Date;
}

// Input types for creating/updating
export interface CreatePricingPlanInput {
	name: string;
	slug: string;
	displayName: string;
	description?: string;
	icon?: string;
	monthlyPrice: number;
	annualPrice?: number;
	currency?: string;
	features?: string[];
	limitations?: string[];
	tier: string;
	order?: number;
	isActive?: boolean;
	isFeatured?: boolean;
	billingCycle?: string;
	trialDays?: number;
	metadata?: any;
}

export interface UpdatePricingPlanInput {
	name?: string;
	displayName?: string;
	description?: string;
	icon?: string;
	monthlyPrice?: number;
	annualPrice?: number;
	features?: string[];
	limitations?: string[];
	order?: number;
	isActive?: boolean;
	isFeatured?: boolean;
	trialDays?: number;
	metadata?: any;
}

export interface ChangePlanInput {
	userId: string;
	newPlanId: string;
	reason?: string;
}

export interface ScheduleDowngradeInput {
	userId: string;
	downgradeplanId: string;
	effectiveDate: Date;
	reason?: string;
}

export interface CancelSubscriptionInput {
	userId: string;
	reason?: string;
	cancelImmediately?: boolean;
}

export interface ReactivateSubscriptionInput {
	userId: string;
	planId?: string;
}

export type ActionResult = {
	success: boolean;
	message: string;
	data?: any;
};

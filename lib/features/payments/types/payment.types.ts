import type { Payment, PaymentStatus } from "@/generated/prisma/client";

// Base types
export type { PaymentStatus };

// ActionResult is now imported from @/lib/types

// Payment with relations
export interface PaymentWithRelations extends Payment {
	user?: {
		id: string;
		name: string | null;
		email: string;
	};
	tickets?: {
		id: string;
		qrCode: string;
		status: string;
	}[];
	_count?: {
		tickets: number;
	};
}

// List result with pagination
export interface PaymentListResult {
	payments: PaymentWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreatePaymentInput {
	userId: string;
	amount: number;
	currency?: string;
	status?: PaymentStatus;
	paymentMethod?: string;
	paymentId?: string;
	description?: string;
	metadata?: any;
}

// Update input
export interface UpdatePaymentInput {
	amount?: number;
	currency?: string;
	status?: PaymentStatus;
	paymentMethod?: string;
	paymentId?: string;
	description?: string;
	metadata?: any;
}

// Get options with filters
export interface GetPaymentsOptions {
	page?: number;
	pageSize?: number;
	userId?: string;
	status?: PaymentStatus;
	search?: string;
}

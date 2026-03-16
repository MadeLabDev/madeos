import type { Invoice, InvoiceStatus } from "@/generated/prisma/client";

// Base types
export type { InvoiceStatus };

// ActionResult is now imported from @/lib/types

// Invoice with relations
export interface InvoiceWithRelations extends Invoice {
	user?: {
		id: string;
		name: string | null;
		email: string;
	};
	subscription?: {
		id: string;
		status: string;
	} | null;
}

// List result with pagination
export interface InvoiceListResult {
	invoices: InvoiceWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateInvoiceInput {
	userId: string;
	subscriptionId?: string;
	invoiceNumber: string;
	amount: number;
	currency?: string;
	dueDate: Date;
	status?: InvoiceStatus;
	billingPeriodStart: Date;
	billingPeriodEnd: Date;
	paymentMethod?: string;
	description?: string;
	notes?: string;
	metadata?: any;
}

// Update input
export interface UpdateInvoiceInput {
	amount?: number;
	currency?: string;
	dueDate?: Date;
	paidAt?: Date;
	status?: InvoiceStatus;
	billingPeriodStart?: Date;
	billingPeriodEnd?: Date;
	paymentId?: string;
	paymentMethod?: string;
	description?: string;
	notes?: string;
	metadata?: any;
}

// Get options with filters
export interface GetInvoicesOptions {
	page?: number;
	pageSize?: number;
	userId?: string;
	status?: InvoiceStatus;
	search?: string;
}

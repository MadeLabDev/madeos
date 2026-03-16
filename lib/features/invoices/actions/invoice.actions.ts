"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { InvoiceService } from "../services/invoice.service";
import type { CreateInvoiceInput, GetInvoicesOptions, UpdateInvoiceInput } from "../types/invoice.types";

/**
 * Get all invoices with filters and pagination
 */
export async function listInvoicesAction(options: GetInvoicesOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");
		const result = await InvoiceService.getAllInvoices(options);
		return { success: true, message: "Invoices retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single invoice by ID
 */
export async function getInvoiceAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");
		const invoice = await InvoiceService.getInvoiceById(id);

		if (!invoice) {
			return { success: false, message: "Invoice not found" };
		}

		return { success: true, message: "Invoice retrieved", data: invoice };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new invoice
 */
export async function createInvoiceAction(data: CreateInvoiceInput): Promise<ActionResult> {
	try {
		await requirePermission("finance", "create");

		const invoice = await InvoiceService.createInvoice(data);

		// Trigger real-time update
		await getPusher().trigger("private-global", "invoice_update", {
			action: "invoice_created",
			invoice,
		});

		// Revalidate paths
		revalidatePath("/finance/invoices");

		return { success: true, message: "Invoice created", data: invoice };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing invoice
 */
export async function updateInvoiceAction(id: string, data: UpdateInvoiceInput): Promise<ActionResult> {
	try {
		await requirePermission("finance", "update");

		const invoice = await InvoiceService.updateInvoice(id, data);

		// Trigger real-time update
		await getPusher().trigger("private-global", "invoice_update", {
			action: "invoice_updated",
			invoice,
		});

		// Revalidate paths
		revalidatePath("/finance/invoices");
		revalidatePath(`/finance/invoices/${id}`);

		return { success: true, message: "Invoice updated", data: invoice };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete an invoice
 */
export async function deleteInvoiceAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("finance", "delete");

		const invoice = await InvoiceService.deleteInvoice(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "invoice_update", {
			action: "invoice_deleted",
			invoiceId: id,
		});

		// Revalidate paths
		revalidatePath("/finance/invoices");

		return { success: true, message: "Invoice deleted", data: invoice };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaidAction(id: string, paymentId?: string): Promise<ActionResult> {
	try {
		await requirePermission("finance", "update");

		const invoice = await InvoiceService.markInvoiceAsPaid(id, paymentId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "invoice_update", {
			action: "invoice_paid",
			invoice,
		});

		// Revalidate paths
		revalidatePath("/finance/invoices");
		revalidatePath(`/finance/invoices/${id}`);

		return { success: true, message: "Invoice marked as paid", data: invoice };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");
		const statistics = await InvoiceService.getInvoiceStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

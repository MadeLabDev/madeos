"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { PaymentService } from "../services/payment.service";
import type { CreatePaymentInput, GetPaymentsOptions, UpdatePaymentInput } from "../types/payment.types";

/**
 * Get all payments with filters and pagination
 */
export async function listPaymentsAction(options: GetPaymentsOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");
		const result = await PaymentService.getAllPayments(options);
		return { success: true, message: "Payments retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single payment by ID
 */
export async function getPaymentAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");
		const payment = await PaymentService.getPaymentById(id);

		if (!payment) {
			return { success: false, message: "Payment not found" };
		}

		return { success: true, message: "Payment retrieved", data: payment };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get payments by user
 */
export async function getPaymentsByUserAction(userId: string): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");
		const payments = await PaymentService.getPaymentsByUser(userId);
		return { success: true, message: "Payments retrieved", data: payments };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new payment
 */
export async function createPaymentAction(data: CreatePaymentInput): Promise<ActionResult> {
	try {
		await requirePermission("finance", "create");

		const payment = await PaymentService.createPayment(data);

		// Trigger real-time update
		await getPusher().trigger("private-global", "payment_update", {
			action: "payment_created",
			payment,
		});

		// Revalidate paths
		revalidatePath("/finance/payments");

		return { success: true, message: "Payment created", data: payment };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing payment
 */
export async function updatePaymentAction(id: string, data: UpdatePaymentInput): Promise<ActionResult> {
	try {
		await requirePermission("finance", "update");

		const payment = await PaymentService.updatePayment(id, data);

		// Trigger real-time update
		await getPusher().trigger("private-global", "payment_update", {
			action: "payment_updated",
			payment,
		});

		// Revalidate paths
		revalidatePath("/finance/payments");
		revalidatePath(`/finance/payments/${id}`);

		return { success: true, message: "Payment updated", data: payment };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a payment
 */
export async function deletePaymentAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("finance", "delete");

		const payment = await PaymentService.deletePayment(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "payment_update", {
			action: "payment_deleted",
			paymentId: id,
		});

		// Revalidate paths
		revalidatePath("/finance/payments");

		return { success: true, message: "Payment deleted", data: payment };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get payment statistics
 */
export async function getPaymentStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("finance", "read");
		const statistics = await PaymentService.getPaymentStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

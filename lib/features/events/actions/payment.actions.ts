/**
 * Payment Actions
 * Server actions for Payment management
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";

import { PaymentService } from "../services";
import type { CreatePaymentInput } from "../types";

/**
 * Create payment
 */
export async function createPaymentAction(data: CreatePaymentInput) {
	try {
		await requirePermission("events", "create");

		const result = await PaymentService.createPayment(data);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create payment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update payment status
 */
export async function updatePaymentStatusAction(id: string, status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED") {
	try {
		await requirePermission("events", "update");

		const result = await PaymentService.updatePaymentStatus(id, status);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update payment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Complete payment
 */
export async function completePaymentAction(id: string) {
	try {
		await requirePermission("events", "update");

		const result = await PaymentService.completePayment(id);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to complete payment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Fail payment
 */
export async function failPaymentAction(id: string) {
	try {
		await requirePermission("events", "update");

		const result = await PaymentService.failPayment(id);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to fail payment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Refund payment
 */
export async function refundPaymentAction(id: string) {
	try {
		await requirePermission("events", "delete");

		const result = await PaymentService.refundPayment(id);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to refund payment: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get payment statistics
 */
export async function getPaymentStatsAction() {
	try {
		const result = await PaymentService.getStats();
		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to get payment statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

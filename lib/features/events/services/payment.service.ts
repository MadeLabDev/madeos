/**
 * Payment Service
 * Business logic for Payments
 */

import type { ActionResult } from "@/lib/types";

import { PaymentRepository } from "../repositories";
import type { CreatePaymentInput, PaymentFilters, PaymentWithRelations } from "../types";

export class PaymentService {
	/**
	 * Get payment by ID
	 */
	static async getPaymentById(id: string): Promise<PaymentWithRelations | null> {
		try {
			return await PaymentRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch payment: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get payment by external payment ID
	 */
	static async getPaymentByPaymentId(paymentId: string): Promise<PaymentWithRelations | null> {
		try {
			return await PaymentRepository.findByPaymentId(paymentId);
		} catch (error) {
			throw new Error(`Failed to fetch payment: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get payments with filters
	 */
	static async getPayments(filters: PaymentFilters = {}, options: { skip?: number; take?: number } = {}): Promise<PaymentWithRelations[]> {
		try {
			return await PaymentRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch payments: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create payment
	 */
	static async createPayment(data: CreatePaymentInput): Promise<ActionResult<PaymentWithRelations>> {
		try {
			const payment = await PaymentRepository.create(data);
			return {
				success: true,
				data: payment,
				message: "Payment created successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create payment",
			};
		}
	}

	/**
	 * Update payment status
	 */
	static async updatePaymentStatus(id: string, status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"): Promise<ActionResult<PaymentWithRelations>> {
		try {
			const payment = await PaymentRepository.update(id, { status });
			return {
				success: true,
				data: payment,
				message: `Payment status updated to ${status}`,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update payment",
			};
		}
	}

	/**
	 * Complete payment
	 */
	static async completePayment(id: string): Promise<ActionResult<PaymentWithRelations>> {
		try {
			const payment = await PaymentRepository.update(id, { status: "COMPLETED" });
			return {
				success: true,
				data: payment,
				message: "Payment completed successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to complete payment",
			};
		}
	}

	/**
	 * Fail payment
	 */
	static async failPayment(id: string): Promise<ActionResult<PaymentWithRelations>> {
		try {
			const payment = await PaymentRepository.update(id, { status: "FAILED" });
			return {
				success: true,
				data: payment,
				message: "Payment marked as failed",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update payment",
			};
		}
	}

	/**
	 * Refund payment
	 */
	static async refundPayment(id: string): Promise<ActionResult<PaymentWithRelations>> {
		try {
			const payment = await PaymentRepository.update(id, { status: "REFUNDED" });
			return {
				success: true,
				data: payment,
				message: "Payment refunded successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to refund payment",
			};
		}
	}

	/**
	 * Get payment statistics
	 */
	static async getStats(filters: PaymentFilters = {}): Promise<
		ActionResult<{
			total: number;
			completed: number;
			pending: number;
			failed: number;
			refunded: number;
			totalAmount: number;
		}>
	> {
		try {
			const stats = await PaymentRepository.getStats(filters);
			return {
				success: true,
				message: "Payment statistics retrieved successfully",
				data: stats,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get payment statistics",
			};
		}
	}

	/**
	 * Get total revenue
	 */
	static async getTotalRevenue(filters: PaymentFilters = {}): Promise<ActionResult<number>> {
		try {
			const revenue = await PaymentRepository.getTotalRevenue(filters);
			return {
				success: true,
				message: "Total revenue retrieved successfully",
				data: revenue,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get revenue",
			};
		}
	}
}

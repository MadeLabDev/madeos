import { PaymentRepository } from "../repositories/payment.repository";
import type { CreatePaymentInput, GetPaymentsOptions, UpdatePaymentInput } from "../types/payment.types";

/**
 * Payment Service
 * Business logic and validation for payments
 */

export class PaymentService {
	/**
	 * Get all payments with filters
	 */
	static async getAllPayments(options: GetPaymentsOptions = {}) {
		return PaymentRepository.getAllPayments(options);
	}

	/**
	 * Get payment by ID
	 */
	static async getPaymentById(id: string) {
		return PaymentRepository.getPaymentById(id);
	}

	/**
	 * Get payments by user
	 */
	static async getPaymentsByUser(userId: string) {
		return PaymentRepository.getPaymentsByUser(userId);
	}

	/**
	 * Create a new payment
	 */
	static async createPayment(data: CreatePaymentInput) {
		// Validation
		if (!data.userId) {
			throw new Error("User ID is required");
		}

		if (data.amount <= 0) {
			throw new Error("Amount must be positive");
		}

		return PaymentRepository.createPayment(data);
	}

	/**
	 * Update an existing payment
	 */
	static async updatePayment(id: string, data: UpdatePaymentInput) {
		// Validation
		if (data.amount !== undefined && data.amount <= 0) {
			throw new Error("Amount must be positive");
		}

		return PaymentRepository.updatePayment(id, data);
	}

	/**
	 * Delete a payment
	 */
	static async deletePayment(id: string) {
		return PaymentRepository.deletePayment(id);
	}

	/**
	 * Get payment statistics
	 */
	static async getPaymentStatistics() {
		const countByStatus = await PaymentRepository.getPaymentCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}

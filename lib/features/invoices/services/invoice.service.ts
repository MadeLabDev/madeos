import { InvoiceRepository } from "../repositories/invoice.repository";
import type { CreateInvoiceInput, GetInvoicesOptions, UpdateInvoiceInput } from "../types/invoice.types";

/**
 * Invoice Service
 * Business logic and validation for invoices
 */

export class InvoiceService {
	/**
	 * Get all invoices with filters
	 */
	static async getAllInvoices(options: GetInvoicesOptions = {}) {
		return InvoiceRepository.getAllInvoices(options);
	}

	/**
	 * Get invoice by ID
	 */
	static async getInvoiceById(id: string) {
		return InvoiceRepository.getInvoiceById(id);
	}

	/**
	 * Get invoice by number
	 */
	static async getInvoiceByNumber(invoiceNumber: string) {
		return InvoiceRepository.getInvoiceByNumber(invoiceNumber);
	}

	/**
	 * Create a new invoice
	 */
	static async createInvoice(data: CreateInvoiceInput) {
		// Validation
		if (!data.userId) {
			throw new Error("User ID is required");
		}

		if (!data.invoiceNumber?.trim()) {
			throw new Error("Invoice number is required");
		}

		if (data.amount <= 0) {
			throw new Error("Amount must be positive");
		}

		// Check if invoice number already exists
		const existing = await InvoiceRepository.getInvoiceByNumber(data.invoiceNumber);
		if (existing) {
			throw new Error("Invoice number already exists");
		}

		// Validate dates
		if (data.billingPeriodEnd <= data.billingPeriodStart) {
			throw new Error("Billing period end must be after start");
		}

		return InvoiceRepository.createInvoice(data);
	}

	/**
	 * Update an existing invoice
	 */
	static async updateInvoice(id: string, data: UpdateInvoiceInput) {
		// Validation
		if (data.amount !== undefined && data.amount <= 0) {
			throw new Error("Amount must be positive");
		}

		if (data.billingPeriodEnd && data.billingPeriodStart && data.billingPeriodEnd <= data.billingPeriodStart) {
			throw new Error("Billing period end must be after start");
		}

		return InvoiceRepository.updateInvoice(id, data);
	}

	/**
	 * Delete an invoice
	 */
	static async deleteInvoice(id: string) {
		return InvoiceRepository.deleteInvoice(id);
	}

	/**
	 * Mark invoice as paid
	 */
	static async markInvoiceAsPaid(id: string, paymentId?: string) {
		const invoice = await InvoiceRepository.getInvoiceById(id);
		if (!invoice) {
			throw new Error("Invoice not found");
		}

		if (invoice.status === "PAID") {
			throw new Error("Invoice is already paid");
		}

		return InvoiceRepository.markInvoiceAsPaid(id, paymentId);
	}

	/**
	 * Get invoice statistics
	 */
	static async getInvoiceStatistics() {
		const countByStatus = await InvoiceRepository.getInvoiceCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}

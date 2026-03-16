import { prisma } from "@/lib/prisma";

export class InvoiceRepository {
	/**
	 * Get user invoices
	 */
	static async getUserInvoices(userId: string, limit: number = 20) {
		return prisma.invoice.findMany({
			where: { userId },
			orderBy: { issuedAt: "desc" },
			take: limit,
		});
	}

	/**
	 * Get invoice by ID
	 */
	static async getInvoiceById(id: string) {
		return prisma.invoice.findUnique({
			where: { id },
		});
	}

	/**
	 * Get invoice by number
	 */
	static async getInvoiceByNumber(invoiceNumber: string) {
		return prisma.invoice.findUnique({
			where: { invoiceNumber },
		});
	}

	/**
	 * Create invoice
	 */
	static async createInvoice(data: { userId: string; subscriptionId?: string; invoiceNumber: string; amount: number; currency?: string; dueDate: Date; billingPeriodStart: Date; billingPeriodEnd: Date; description?: string; notes?: string; metadata?: any }) {
		return prisma.invoice.create({
			data,
		});
	}

	/**
	 * Update invoice
	 */
	static async updateInvoice(
		id: string,
		data: {
			status?: string;
			paidAt?: Date | null;
			paymentId?: string | null;
			paymentMethod?: string | null;
			notes?: string | null;
		},
	) {
		return prisma.invoice.update({
			where: { id },
			data: {
				...(data.status !== undefined && { status: data.status as any }),
				...(data.paidAt !== undefined && { paidAt: data.paidAt }),
				...(data.paymentId !== undefined && { paymentId: data.paymentId }),
				...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod }),
				...(data.notes !== undefined && { notes: data.notes }),
			},
		});
	}

	/**
	 * Get pending invoices
	 */
	static async getPendingInvoices() {
		return prisma.invoice.findMany({
			where: { status: "PENDING" },
			orderBy: { issuedAt: "asc" },
		});
	}

	/**
	 * Get overdue invoices
	 */
	static async getOverdueInvoices() {
		return prisma.invoice.findMany({
			where: {
				status: { in: ["PENDING", "OVERDUE"] },
				dueDate: { lt: new Date() },
			},
			orderBy: { dueDate: "asc" },
		});
	}

	/**
	 * Mark invoice as paid
	 */
	static async markAsPaid(id: string, paymentId: string) {
		return prisma.invoice.update({
			where: { id },
			data: {
				status: "PAID",
				paidAt: new Date(),
				paymentId,
			},
		});
	}

	/**
	 * Get invoices in date range
	 */
	static async getInvoicesInRange(startDate: Date, endDate: Date) {
		return prisma.invoice.findMany({
			where: {
				issuedAt: {
					gte: startDate,
					lte: endDate,
				},
			},
			orderBy: { issuedAt: "desc" },
		});
	}

	/**
	 * Generate invoice number
	 */
	static async generateInvoiceNumber(): Promise<string> {
		const count = await prisma.invoice.count();
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const sequence = String(count + 1).padStart(5, "0");
		return `INV-${year}${month}-${sequence}`;
	}

	/**
	 * Get all invoices with user information (admin)
	 */
	static async getAllInvoicesWithUsers(limit: number = 50) {
		try {
			return prisma.invoice.findMany({
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: { issuedAt: "desc" },
				take: limit,
			});
		} catch (error) {
			console.error("Error in getAllInvoicesWithUsers:", error);
			return []; // Return empty array on error
		}
	}

	/**
	 * Get total revenue (admin)
	 */
	static async getTotalRevenue() {
		try {
			const result = await prisma.invoice.aggregate({
				where: { status: "PAID" },
				_sum: { amount: true },
			});
			return result._sum.amount || 0;
		} catch (error) {
			console.error("Error in getTotalRevenue:", error);
			return 0; // Return 0 on error
		}
	}

	/**
	 * Get total invoices count (admin)
	 */
	static async getTotalInvoicesCount() {
		try {
			return prisma.invoice.count();
		} catch (error) {
			console.error("Error in getTotalInvoicesCount:", error);
			return 0; // Return 0 on error
		}
	}

	/**
	 * Get recent payments (admin)
	 */
	static async getRecentPayments(limit: number = 10) {
		try {
			return prisma.invoice.findMany({
				where: { status: "PAID" },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: { paidAt: "desc" },
				take: limit,
			});
		} catch (error) {
			console.error("Error in getRecentPayments:", error);
			return []; // Return empty array on error
		}
	}

	/**
	 * Get invoices by user ID
	 */
	static async getInvoicesByUserId(userId: string) {
		return prisma.invoice.findMany({
			where: { userId },
			orderBy: { issuedAt: "desc" },
		});
	}
}

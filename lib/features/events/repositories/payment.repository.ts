/**
 * Payment Repository
 * Database operations for Payments
 */

import { TransactionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { PaymentFilters, PaymentWithRelations } from "../types";

export class PaymentRepository {
	/**
	 * Find payment by ID with relations
	 */
	static async findById(id: string): Promise<PaymentWithRelations | null> {
		return prisma.payment.findUnique({
			where: { id },
			include: {
				user: true,
				tickets: {
					include: {
						ticketType: {
							include: {
								event: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Find payment by external payment ID
	 */
	static async findByPaymentId(paymentId: string): Promise<PaymentWithRelations | null> {
		return prisma.payment.findFirst({
			where: { paymentId },
			include: {
				user: true,
				tickets: {
					include: {
						ticketType: {
							include: {
								event: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Find payments with filters and pagination
	 */
	static async findMany(filters: PaymentFilters = {}, options: { skip?: number; take?: number } = {}): Promise<PaymentWithRelations[]> {
		const where: any = {};

		if (filters.userId) where.userId = filters.userId;
		if (filters.status) where.status = filters.status;
		if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		return prisma.payment.findMany({
			where,
			include: {
				user: true,
				tickets: {
					include: {
						ticketType: {
							include: {
								event: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Create new payment
	 */
	static async create(data: { userId: string; amount: number; currency?: string; status?: TransactionStatus; paymentMethod?: string; paymentId?: string; description?: string; metadata?: any }): Promise<PaymentWithRelations> {
		return prisma.payment.create({
			data,
			include: {
				user: true,
				tickets: {
					include: {
						ticketType: {
							include: {
								event: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Update payment
	 */
	static async update(
		id: string,
		data: Partial<{
			status: TransactionStatus;
			amount: number;
			paymentMethod: string;
			paymentId: string;
			metadata: any;
		}>,
	): Promise<PaymentWithRelations> {
		return prisma.payment.update({
			where: { id },
			data,
			include: {
				user: true,
				tickets: {
					include: {
						ticketType: {
							include: {
								event: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Delete payment
	 */
	static async delete(id: string): Promise<PaymentWithRelations> {
		return prisma.payment.delete({
			where: { id },
			include: {
				user: true,
				tickets: {
					include: {
						ticketType: {
							include: {
								event: true,
							},
						},
					},
				},
			},
		});
	}

	/**
	 * Count payments with filters
	 */
	static async count(filters: PaymentFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.userId) where.userId = filters.userId;
		if (filters.status) where.status = filters.status;
		if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		return prisma.payment.count({ where });
	}

	/**
	 * Get total revenue
	 */
	static async getTotalRevenue(filters: PaymentFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.userId) where.userId = filters.userId;
		if (filters.status) where.status = filters.status;
		if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		const result = await prisma.payment.aggregate({
			where,
			_sum: {
				amount: true,
			},
		});

		return result._sum.amount || 0;
	}

	/**
	 * Get payment statistics
	 */
	static async getStats(filters: PaymentFilters = {}): Promise<{
		total: number;
		completed: number;
		pending: number;
		failed: number;
		refunded: number;
		totalAmount: number;
	}> {
		const where: any = {};

		if (filters.userId) where.userId = filters.userId;
		if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		const total = await prisma.payment.count({ where });
		const completed = await prisma.payment.count({ where: { ...where, status: "COMPLETED" } });
		const pending = await prisma.payment.count({ where: { ...where, status: "PENDING" } });
		const failed = await prisma.payment.count({ where: { ...where, status: "FAILED" } });
		const refunded = await prisma.payment.count({ where: { ...where, status: "REFUNDED" } });

		const result = await prisma.payment.aggregate({
			where: { ...where, status: "COMPLETED" },
			_sum: {
				amount: true,
			},
		});

		return {
			total,
			completed,
			pending,
			failed,
			refunded,
			totalAmount: result._sum.amount || 0,
		};
	}
}

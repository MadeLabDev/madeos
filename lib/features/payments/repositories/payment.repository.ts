import { prisma } from "@/lib/prisma";

import type { CreatePaymentInput, GetPaymentsOptions, PaymentStatus, PaymentWithRelations, UpdatePaymentInput } from "../types/payment.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * Payment Repository
 * Direct database operations for payments
 */

export class PaymentRepository {
	/**
	 * Get all payments with filters and pagination
	 */
	static async getAllPayments(options: GetPaymentsOptions = {}) {
		const { page = 1, pageSize = 10, userId, status, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (userId) {
			where.userId = userId;
		}

		if (status) {
			where.status = status;
		}

		if (search) {
			where.OR = [{ paymentId: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [payments, total] = await Promise.all([
			prisma.payment.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					_count: {
						select: {
							tickets: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.payment.count({ where }),
		]);

		return {
			payments,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get payment by ID
	 */
	static async getPaymentById(id: string): Promise<PaymentWithRelations | null> {
		return prisma.payment.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				tickets: {
					select: {
						id: true,
						qrCode: true,
						status: true,
					},
				},
				_count: {
					select: {
						tickets: true,
					},
				},
			},
		});
	}

	/**
	 * Create a new payment
	 */
	static async createPayment(data: CreatePaymentInput): Promise<PaymentWithRelations> {
		return prisma.payment.create({
			data,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				_count: {
					select: {
						tickets: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing payment
	 */
	static async updatePayment(id: string, data: UpdatePaymentInput): Promise<PaymentWithRelations> {
		return prisma.payment.update({
			where: { id },
			data,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				_count: {
					select: {
						tickets: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a payment
	 */
	static async deletePayment(id: string): Promise<PaymentWithRelations> {
		return prisma.payment.delete({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}

	/**
	 * Get count of payments by status
	 */
	static async getPaymentCountByStatus(): Promise<Record<PaymentStatus, number>> {
		const counts = await prisma.payment.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<PaymentStatus, number>;
	}

	/**
	 * Get payments by user
	 */
	static async getPaymentsByUser(userId: string): Promise<PaymentWithRelations[]> {
		return prisma.payment.findMany({
			where: { userId },
			include: {
				_count: {
					select: {
						tickets: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}
}

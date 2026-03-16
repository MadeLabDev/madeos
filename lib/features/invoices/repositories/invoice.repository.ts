import { prisma } from "@/lib/prisma";

import type { CreateInvoiceInput, GetInvoicesOptions, InvoiceStatus, InvoiceWithRelations, UpdateInvoiceInput } from "../types/invoice.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * Invoice Repository
 * Direct database operations for invoices
 */

export class InvoiceRepository {
	/**
	 * Get all invoices with filters and pagination
	 */
	static async getAllInvoices(options: GetInvoicesOptions = {}) {
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
			where.OR = [{ invoiceNumber: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [invoices, total] = await Promise.all([
			prisma.invoice.findMany({
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
					subscription: {
						select: {
							id: true,
							status: true,
						},
					},
				},
				orderBy: { issuedAt: "desc" },
			}),
			prisma.invoice.count({ where }),
		]);

		return {
			invoices,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get invoice by ID
	 */
	static async getInvoiceById(id: string): Promise<InvoiceWithRelations | null> {
		return prisma.invoice.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				subscription: {
					select: {
						id: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get invoice by invoice number
	 */
	static async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithRelations | null> {
		return prisma.invoice.findUnique({
			where: { invoiceNumber },
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
	 * Create a new invoice
	 */
	static async createInvoice(data: CreateInvoiceInput): Promise<InvoiceWithRelations> {
		return prisma.invoice.create({
			data,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				subscription: {
					select: {
						id: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing invoice
	 */
	static async updateInvoice(id: string, data: UpdateInvoiceInput): Promise<InvoiceWithRelations> {
		return prisma.invoice.update({
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
				subscription: {
					select: {
						id: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Delete an invoice
	 */
	static async deleteInvoice(id: string): Promise<InvoiceWithRelations> {
		return prisma.invoice.delete({
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
	 * Get count of invoices by status
	 */
	static async getInvoiceCountByStatus(): Promise<Record<InvoiceStatus, number>> {
		const counts = await prisma.invoice.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<InvoiceStatus, number>;
	}

	/**
	 * Mark invoice as paid
	 */
	static async markInvoiceAsPaid(id: string, paymentId?: string): Promise<InvoiceWithRelations> {
		return prisma.invoice.update({
			where: { id },
			data: {
				status: "PAID",
				paidAt: new Date(),
				...(paymentId && { paymentId }),
			},
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
}

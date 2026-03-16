/**
 * Customer Repository - Database Operations
 */

import type { CreateCustomerInput, CreateEngagementInput, UpdateCustomerInput, UpdateEngagementInput } from "@/lib/features/customers/types/customer.types";
import { prisma } from "@/lib/prisma";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

// ============================================================================
// CUSTOMER OPERATIONS
// ============================================================================

export async function getAllCustomers(params?: { page?: number; limit?: number; search?: string; type?: string }): Promise<any> {
	const where: any = {
		parentId: null, // Only get parent customers (main accounts)
	};

	if (params?.type) {
		where.type = params.type;
	}

	if (params?.search) {
		where.OR = [{ companyName: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { email: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { phone: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { contactName: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
	}

	// If pagination params provided, return paginated results
	if (params?.page || params?.limit) {
		const pageNum = params?.page || 1;
		const limitNum = params?.limit || 20;
		const skip = (pageNum - 1) * limitNum;

		const [data, total] = await Promise.all([
			prisma.customer.findMany({
				where,
				include: {
					locations: {
						select: {
							id: true,
							companyName: true,
							email: true,
							city: true,
							state: true,
						},
					},
					contacts: true,
				},
				orderBy: { companyName: "asc" },
				skip,
				take: limitNum,
			}),
			prisma.customer.count({ where }),
		]);

		return {
			customers: data,
			total,
			page: pageNum,
			pageCount: Math.ceil(total / limitNum),
		};
	}

	// Otherwise, return all records
	return prisma.customer.findMany({
		where,
		include: {
			locations: {
				select: {
					id: true,
					companyName: true,
					email: true,
					city: true,
					state: true,
				},
			},
			contacts: true,
		},
		orderBy: { companyName: "asc" },
	});
}

export async function getCustomerById(id: string) {
	return prisma.customer.findUnique({
		where: { id },
		include: {
			parent: true,
			locations: true,
		},
	});
}

/**
 * Get customer with all nested info (including parent and siblings)
 */
export async function getCustomerWithRelations(id: string) {
	const customer = await prisma.customer.findUnique({
		where: { id },
		include: {
			parent: {
				include: {
					locations: true,
				},
			},
			locations: true,
		},
	});

	return customer;
}

export async function createCustomer(data: CreateCustomerInput) {
	return prisma.customer.create({
		data: {
			companyName: data.companyName,
			email: data.email,
			phone: data.phone,
			website: data.website,
			address: data.address,
			city: data.city,
			state: data.state,
			zipCode: data.zipCode,
			country: data.country || "USA",
			contactName: data.contactName,
			contactTitle: data.contactTitle,
			contactEmail: data.contactEmail,
			contactPhone: data.contactPhone,
			type: data.type || "STANDARD",
			taxId: data.taxId,
			discountPercent: data.discountPercent || 0,
			paymentTermsDays: data.paymentTermsDays || 30,
			creditLimit: data.creditLimit,
			parentId: data.parentId || null,
			notes: data.notes,
		},
		include: {
			parent: true,
			locations: true,
		},
	});
}

export async function updateCustomer(id: string, data: UpdateCustomerInput) {
	return prisma.customer.update({
		where: { id },
		data: {
			companyName: data.companyName,
			email: data.email,
			phone: data.phone,
			website: data.website,
			address: data.address,
			city: data.city,
			state: data.state,
			zipCode: data.zipCode,
			country: data.country,
			contactName: data.contactName,
			contactTitle: data.contactTitle,
			contactEmail: data.contactEmail,
			contactPhone: data.contactPhone,
			type: data.type,
			taxId: data.taxId,
			discountPercent: data.discountPercent,
			paymentTermsDays: data.paymentTermsDays,
			creditLimit: data.creditLimit,
			parentId: data.parentId ?? undefined,
			notes: data.notes,
			isActive: data.isActive,
			updatedAt: new Date(),
		},
		include: {
			parent: true,
			locations: true,
		},
	});
}

export async function deleteCustomer(id: string) {
	return prisma.customer.delete({
		where: { id },
	});
}

/**
 * Delete multiple customers
 */
export async function deleteMultipleCustomers(ids: string[]) {
	if (ids.length === 0) throw new Error("No customer IDs provided");

	const result = await prisma.customer.deleteMany({
		where: {
			id: { in: ids },
		},
	});

	return { count: result.count };
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string) {
	return prisma.customer.findUnique({
		where: { email },
		include: {
			parent: true,
			locations: true,
		},
	});
}

/**
 * Search customers (parent or child)
 */
export async function searchCustomers(query: string, limit: number = 20) {
	return prisma.customer.findMany({
		where: {
			OR: [{ companyName: { contains: query, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { email: { contains: query, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { contactName: { contains: query, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }],
		},
		include: {
			parent: true,
			locations: true,
			contacts: true,
		},
		take: limit,
		orderBy: { companyName: "asc" },
	});
}

// ============================================================================
// ENGAGEMENT OPERATIONS
// ============================================================================

export async function getAllEngagements(params?: { page?: number; limit?: number; search?: string; customerId?: string; status?: string }): Promise<{ engagements: any[]; total: number }> {
	const where: any = {};

	if (params?.customerId) {
		where.customerId = params.customerId;
	}

	if (params?.status && params.status !== "ALL") {
		where.status = params.status;
	}

	if (params?.search) {
		where.OR = [{ title: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
	}

	const pageNum = params?.page || 1;
	const limitNum = params?.limit || 50;
	const skip = (pageNum - 1) * limitNum;

	const [engagements, total] = await Promise.all([
		prisma.engagement.findMany({
			where,
			include: {
				customer: {
					include: {
						contacts: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: limitNum,
		}),
		prisma.engagement.count({ where }),
	]);

	return { engagements, total };
}

export async function getEngagementById(id: string) {
	return prisma.engagement.findUnique({
		where: { id },
		include: {
			customer: {
				include: {
					contacts: true,
				},
			},
		},
	});
}

export async function createEngagement(data: CreateEngagementInput & { createdBy: string }) {
	return prisma.engagement.create({
		data: {
			...data,
			updatedBy: data.createdBy,
		},
		include: {
			customer: {
				include: {
					contacts: true,
				},
			},
		},
	});
}

export async function updateEngagement(id: string, data: UpdateEngagementInput & { updatedBy: string }) {
	return prisma.engagement.update({
		where: { id },
		data,
		include: {
			customer: {
				include: {
					contacts: true,
				},
			},
		},
	});
}

export async function deleteEngagement(id: string) {
	return prisma.engagement.delete({
		where: { id },
	});
}

export async function deleteMultipleEngagements(ids: string[]) {
	if (ids.length === 0) throw new Error("No engagement IDs provided");

	const result = await prisma.engagement.deleteMany({
		where: {
			id: { in: ids },
		},
	});

	return { count: result.count };
}

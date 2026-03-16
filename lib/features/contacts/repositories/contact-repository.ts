/**
 * Contact Repository - Database Operations
 */

import type { CreateContactInput, UpdateContactInput } from "@/lib/features/contacts/types/contact.types";
import { prisma } from "@/lib/prisma";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

// ============================================================================
// CONTACT OPERATIONS
// ============================================================================

export async function getAllContacts(params?: { page?: number; limit?: number; search?: string; customerId?: string }): Promise<any> {
	const where: any = {};

	if (params?.customerId) {
		where.customerId = params.customerId;
	}

	if (params?.search) {
		where.OR = [{ firstName: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { lastName: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { email: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { phone: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { title: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
	}

	// If pagination params provided, return paginated results
	if (params?.page || params?.limit) {
		const pageNum = params?.page || 1;
		const limitNum = params?.limit || 20;
		const skip = (pageNum - 1) * limitNum;

		const [data, total] = await Promise.all([
			prisma.contact.findMany({
				where,
				include: {
					customer: {
						select: {
							id: true,
							companyName: true,
							email: true,
						},
					},
				},
				orderBy: { firstName: "asc" },
				skip,
				take: limitNum,
			}),
			prisma.contact.count({ where }),
		]);

		return {
			contacts: data,
			total,
			page: pageNum,
			pageCount: Math.ceil(total / limitNum),
		};
	}

	// Otherwise, return all records
	return prisma.contact.findMany({
		where,
		include: {
			customer: {
				select: {
					id: true,
					companyName: true,
					email: true,
				},
			},
		},
		orderBy: { firstName: "asc" },
	});
}

export async function getContactById(id: string) {
	return prisma.contact.findUnique({
		where: { id },
		include: {
			customer: true,
		},
	});
}

export async function createContact(data: CreateContactInput) {
	return prisma.contact.create({
		data,
		include: {
			customer: true,
		},
	});
}

export async function updateContact(id: string, data: UpdateContactInput) {
	return prisma.contact.update({
		where: { id },
		data,
		include: {
			customer: true,
		},
	});
}

export async function deleteContact(id: string) {
	return prisma.contact.delete({
		where: { id },
	});
}

export async function bulkDeleteContacts(ids: string[]) {
	return prisma.contact.deleteMany({
		where: {
			id: { in: ids },
		},
	});
}

export async function getContactByEmail(email: string) {
	return prisma.contact.findUnique({
		where: { email },
	});
}

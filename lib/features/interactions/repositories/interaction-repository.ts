/**
 * Interaction Repository - Database Operations
 */

import { prisma } from "@/lib/prisma";

import type { CreateInteractionInput, UpdateInteractionInput } from "../types/interaction.types";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

// ============================================================================
// INTERACTION OPERATIONS
// ============================================================================

export async function getAllInteractions(params?: { page?: number; limit?: number; search?: string; customerId?: string; contactId?: string; type?: string }): Promise<any> {
	const where: any = {};

	if (params?.customerId) {
		where.customerId = params.customerId;
	}

	if (params?.contactId) {
		where.contactId = params.contactId;
	}

	if (params?.type) {
		where.type = params.type;
	}

	if (params?.search) {
		where.OR = [{ subject: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { outcome: { contains: params.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
	}

	// If pagination params provided, return paginated results
	if (params?.page || params?.limit) {
		const pageNum = params?.page || 1;
		const limitNum = params?.limit || 20;
		const skip = (pageNum - 1) * limitNum;

		const [data, total] = await Promise.all([
			prisma.interaction.findMany({
				where,
				orderBy: { date: "desc" },
				skip,
				take: limitNum,
			}),
			prisma.interaction.count({ where }),
		]);

		return {
			interactions: data,
			total,
			page: pageNum,
			pageCount: Math.ceil(total / limitNum),
		};
	}

	// Otherwise, return all records
	return prisma.interaction.findMany({
		where,
		orderBy: { date: "desc" },
	});
}

export async function getInteractionById(id: string) {
	return prisma.interaction.findUnique({
		where: { id },
	});
}

export async function createInteraction(data: CreateInteractionInput) {
	return prisma.interaction.create({
		data,
	});
}

export async function updateInteraction(id: string, data: UpdateInteractionInput) {
	return prisma.interaction.update({
		where: { id },
		data,
	});
}

export async function deleteInteraction(id: string) {
	return prisma.interaction.delete({
		where: { id },
	});
}

export async function bulkDeleteInteractions(ids: string[]) {
	return prisma.interaction.deleteMany({
		where: {
			id: { in: ids },
		},
	});
}

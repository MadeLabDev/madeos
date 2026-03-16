import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Form Data repository - Database operations for external form submissions
 */

/**
 * Find all form submissions with pagination and optional key filter
 */
export async function findAllFormData(params?: { skip?: number; take?: number; keyFilter?: string }) {
	const { skip = 0, take = 20, keyFilter } = params || {};

	const where: Prisma.ExternalFormDataWhereInput = keyFilter ? { key: keyFilter } : {};

	const [data, total] = await Promise.all([
		prisma.externalFormData.findMany({
			where,
			select: {
				id: true,
				key: true,
				data: true,
				createdAt: true,
				ipAddress: true,
				userAgent: true,
				referer: true,
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take,
		}),
		prisma.externalFormData.count({ where }),
	]);

	return { data, total };
}

/**
 * Find form submission by ID
 */
export async function findFormDataById(id: string) {
	return prisma.externalFormData.findUnique({
		where: { id },
		select: {
			id: true,
			key: true,
			data: true,
			createdAt: true,
			ipAddress: true,
			userAgent: true,
			referer: true,
		},
	});
}

/**
 * Find all form submissions by key (no pagination - for backward compatibility with old API)
 */
export async function findFormDataByKey(key: string) {
	return prisma.externalFormData.findMany({
		where: { key },
		select: {
			data: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

/**
 * Create new form submission
 */
export async function createFormData(data: { key: string; field: any; ipAddress?: string; userAgent?: string; referer?: string }) {
	return prisma.externalFormData.create({
		data: {
			key: data.key,
			data: {
				field: data.field,
			},
			ipAddress: data.ipAddress,
			userAgent: data.userAgent,
			referer: data.referer,
		},
		select: {
			id: true,
			key: true,
			createdAt: true,
		},
	});
}

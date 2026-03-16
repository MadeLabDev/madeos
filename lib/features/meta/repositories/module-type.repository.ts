/**
 * ModuleType Repository - Database operations using Prisma
 */

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Get case-insensitive mode setting from environment
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true";

/**
 * Get all module types with pagination
 */
export async function findAllModuleTypes(params?: { skip?: number; take?: number; search?: string; isEnabled?: boolean }) {
	const { skip = 0, take = 50, search, isEnabled } = params || {};

	const where: Prisma.ModuleTypeWhereInput = {
		AND: [
			search
				? {
						OR: [{ key: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }],
					}
				: {},
			isEnabled !== undefined ? { isEnabled } : {},
		],
	};

	const [moduleTypes, total] = await Promise.all([
		prisma.moduleType.findMany({
			where,
			skip,
			take,
			orderBy: [{ order: "asc" }, { createdAt: "desc" }],
		}),
		prisma.moduleType.count({ where }),
	]);

	return { moduleTypes, total };
}

/**
 * Get module type by ID
 */
export async function findModuleTypeById(id: string) {
	return prisma.moduleType.findUnique({
		where: { id },
	});
}

/**
 * Get module type by key
 */
export async function findModuleTypeByKey(key: string) {
	return prisma.moduleType.findUnique({
		where: { key },
	});
}

/**
 * Get all enabled module types
 */
export async function findEnabledModuleTypes() {
	return prisma.moduleType.findMany({
		where: { isEnabled: true },
		orderBy: [{ order: "asc" }, { name: "asc" }],
	});
}

/**
 * Get module types by system
 */
export async function findModuleTypesBySystem(system: string) {
	return prisma.moduleType.findMany({
		where: { system, isEnabled: true },
		orderBy: [{ order: "asc" }, { name: "asc" }],
	});
}

/**
 * Create module type
 */
export async function createModuleType(input: { key: string; name: string; description?: string; system?: string; fieldSchema: any; isEnabled?: boolean; order?: number; createdBy?: string }) {
	return prisma.moduleType.create({
		data: {
			key: input.key,
			name: input.name,
			description: input.description,
			system: input.system ?? "meta",
			fieldSchema: input.fieldSchema,
			lockedFields: [],
			isEnabled: input.isEnabled ?? true,
			order: input.order ?? 0,
			createdBy: input.createdBy,
		},
	});
}

/**
 * Update module type
 */
export async function updateModuleType(
	id: string,
	input: Partial<{
		key: string;
		name: string;
		description: string | null;
		system: string;
		fieldSchema: any;
		isEnabled: boolean;
		order: number;
		updatedBy: string;
	}>,
) {
	return prisma.moduleType.update({
		where: { id },
		data: input,
	});
}

/**
 * Delete module type
 */
export async function deleteModuleType(id: string) {
	return prisma.moduleType.delete({
		where: { id },
	});
}

/**
 * Batch delete module types
 */
export async function deleteModuleTypes(ids: string[]) {
	return prisma.moduleType.deleteMany({
		where: { id: { in: ids } },
	});
}

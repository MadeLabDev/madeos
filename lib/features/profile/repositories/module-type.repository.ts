/**
 * ModuleType Repository for Profile Feature
 * Handles database operations for module type definitions
 */

import { prisma } from "@/lib/prisma";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * Find all module types with pagination and filters
 */
export async function findAllModuleTypes(params?: { skip?: number; take?: number; search?: string; isEnabled?: boolean; system?: string }) {
	const { skip = 0, take = 20, search, isEnabled = true, system } = params || {};

	const where: any = {};
	if (search) {
		where.OR = [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { key: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
	}
	if (isEnabled !== undefined) {
		where.isEnabled = isEnabled;
	}
	if (system) {
		where.system = system;
	}

	const [moduleTypes, total] = await Promise.all([
		prisma.moduleType.findMany({
			where,
			skip,
			take,
			orderBy: { order: "asc" },
		}),
		prisma.moduleType.count({ where }),
	]);

	return { moduleTypes, total };
}

/**
 * Find module type by ID
 */
export async function findModuleTypeById(id: string) {
	return prisma.moduleType.findUnique({
		where: { id },
	});
}

/**
 * Find module type by key (unique identifier)
 */
export async function findModuleTypeByKey(key: string) {
	return prisma.moduleType.findUnique({
		where: { key },
	});
}

/**
 * Find module type by system (system identifier)
 */
export async function findModuleTypeBySystem(system: string) {
	return prisma.moduleType.findFirst({
		where: { system },
	});
}

/**
 * Find all enabled module types
 */
export async function findEnabledModuleTypes() {
	return prisma.moduleType.findMany({
		where: { isEnabled: true },
		orderBy: { order: "asc" },
	});
}

/**
 * Create module type
 */
export async function createModuleType(data: { key: string; name: string; description?: string; fieldSchema: any; isEnabled?: boolean; order?: number; createdBy?: string }) {
	return prisma.moduleType.create({
		data: {
			key: data.key,
			name: data.name,
			description: data.description,
			fieldSchema: data.fieldSchema as any,
			lockedFields: [],
			isEnabled: data.isEnabled ?? true,
			order: data.order ?? 0,
			createdBy: data.createdBy,
		},
	});
}

/**
 * Update module type
 */
export async function updateModuleType(
	id: string,
	data: Partial<{
		key: string;
		name: string;
		description: string;
		fieldSchema: any;
		isEnabled: boolean;
		order: number;
		updatedBy: string;
	}>,
) {
	const updateData: any = {};

	if (data.key !== undefined) updateData.key = data.key;
	if (data.name !== undefined) updateData.name = data.name;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.fieldSchema !== undefined) updateData.fieldSchema = data.fieldSchema;
	if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
	if (data.order !== undefined) updateData.order = data.order;
	if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;

	return prisma.moduleType.update({
		where: { id },
		data: updateData,
	});
}

/**
 * Delete module type (only if no instances exist)
 */
export async function deleteModuleType(id: string) {
	// Check if module type has instances
	const instanceCount = await prisma.moduleInstance.count({
		where: { moduleTypeId: id },
	});

	if (instanceCount > 0) {
		throw new Error(`Cannot delete module type with ${instanceCount} existing instances`);
	}

	return prisma.moduleType.delete({
		where: { id },
	});
}

/**
 * Get module types for specific profile
 */
export async function findModuleTypesForProfile() {
	// Return all enabled module types for profile system
	return prisma.moduleType.findMany({
		where: { isEnabled: true, system: "profile" },
		orderBy: { order: "asc" },
	});
}

/**
 * Get module types for specific system
 */
export async function findModuleTypesBySystem(system: string) {
	return prisma.moduleType.findMany({
		where: { isEnabled: true, system },
		orderBy: { order: "asc" },
	});
}

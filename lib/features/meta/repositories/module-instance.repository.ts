/**
 * ModuleInstance Repository - Database operations using Prisma
 */

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Get module instances with pagination
 */
export async function findAllModuleInstances(params?: { skip?: number; take?: number; moduleTypeId?: string; entityName?: string; entityId?: string; isActive?: boolean }) {
	const { skip = 0, take = 50, moduleTypeId, entityName, entityId, isActive } = params || {};

	const where: Prisma.ModuleInstanceWhereInput = {
		AND: [moduleTypeId ? { moduleTypeId } : {}, entityName ? { entityName } : {}, entityId ? { entityId } : {}, isActive !== undefined ? { isActive } : {}].filter((w) => Object.keys(w).length > 0),
	};

	const [instances, total] = await Promise.all([
		prisma.moduleInstance.findMany({
			where,
			skip,
			take,
			include: { moduleType: true },
			orderBy: { createdAt: "desc" },
		}),
		prisma.moduleInstance.count({ where }),
	]);

	return { instances, total };
}

/**
 * Get module instance by ID
 */
export async function findModuleInstanceById(id: string) {
	return prisma.moduleInstance.findUnique({
		where: { id },
		include: { moduleType: true },
	});
}

/**
 * Get module instance by moduleTypeId and entityId
 */
export async function findModuleInstanceByModuleAndEntity(moduleTypeId: string, entityId: string) {
	return prisma.moduleInstance.findUnique({
		where: {
			moduleTypeId_entityId: {
				moduleTypeId,
				entityId,
			},
		},
		include: { moduleType: true },
	});
}

/**
 * Get all instances for an entity
 */
export async function findInstancesByEntity(entityId: string, entityName?: string) {
	return prisma.moduleInstance.findMany({
		where: {
			entityId,
			...(entityName && { entityName }),
		},
		include: { moduleType: true },
		orderBy: { createdAt: "desc" },
	});
}

/**
 * Create module instance
 */
export async function createModuleInstance(input: { moduleTypeId: string; entityId: string; entityName: string; fieldValues: any; isActive?: boolean; createdBy?: string }) {
	return prisma.moduleInstance.create({
		data: {
			moduleTypeId: input.moduleTypeId,
			entityId: input.entityId,
			entityName: input.entityName,
			fieldValues: input.fieldValues,
			isActive: input.isActive ?? true,
			createdBy: input.createdBy,
		},
		include: { moduleType: true },
	});
}

/**
 * Update module instance
 */
export async function updateModuleInstance(
	id: string,
	input: Partial<{
		fieldValues: any;
		isActive: boolean;
		updatedBy: string;
	}>,
) {
	return prisma.moduleInstance.update({
		where: { id },
		data: input,
		include: { moduleType: true },
	});
}

/**
 * Delete module instance
 */
export async function deleteModuleInstance(id: string) {
	return prisma.moduleInstance.delete({
		where: { id },
		include: { moduleType: true },
	});
}

/**
 * Delete instances by moduleTypeId
 */
export async function deleteInstancesByModuleType(moduleTypeId: string) {
	return prisma.moduleInstance.deleteMany({
		where: { moduleTypeId },
	});
}

/**
 * Delete instances by entity
 */
export async function deleteInstancesByEntity(entityId: string, entityName?: string) {
	return prisma.moduleInstance.deleteMany({
		where: {
			entityId,
			...(entityName && { entityName }),
		},
	});
}

/**
 * Upsert module instance (create or update)
 */
export async function upsertModuleInstance(moduleTypeId: string, entityId: string, entityName: string, fieldValues: any, userId?: string) {
	return prisma.moduleInstance.upsert({
		where: {
			moduleTypeId_entityId: {
				moduleTypeId,
				entityId,
			},
		},
		create: {
			moduleTypeId,
			entityId,
			entityName,
			fieldValues,
			createdBy: userId,
		},
		update: {
			fieldValues,
			updatedBy: userId,
		},
		include: { moduleType: true },
	});
}

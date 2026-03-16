/**
 * Knowledge Module Type Repository
 * Database operations for Knowledge Module Types used in Profile Builder
 */

import { prisma } from "@/lib/prisma";

import { CreateKnowledgeModuleTypeInput, KnowledgeModuleType, UpdateKnowledgeModuleTypeInput } from "../types";

export class KnowledgeModuleTypeRepository {
	/**
	 * Get all module types
	 */
	static async findMany(): Promise<KnowledgeModuleType[]> {
		const moduleTypes = await prisma.knowledgeModuleType.findMany({
			orderBy: { order: "asc" },
		});

		return moduleTypes.map((mt) => ({
			...mt,
			fieldSchema: mt.fieldSchema as Record<string, any> | null,
		}));
	}

	/**
	 * Find enabled module types
	 */
	static async findEnabledModuleTypes(): Promise<KnowledgeModuleType[]> {
		const moduleTypes = await prisma.knowledgeModuleType.findMany({
			where: { isEnabled: true },
			orderBy: { order: "asc" },
		});

		return moduleTypes.map((mt) => ({
			...mt,
			fieldSchema: mt.fieldSchema as Record<string, any> | null,
		}));
	}

	/**
	 * Find module type by ID
	 */
	static async findById(id: string): Promise<KnowledgeModuleType | null> {
		const moduleType = await prisma.knowledgeModuleType.findUnique({
			where: { id },
		});

		if (!moduleType) return null;

		return {
			...moduleType,
			fieldSchema: moduleType.fieldSchema as Record<string, any> | null,
		};
	}

	/**
	 * Find module type by key
	 */
	static async findByKey(key: string): Promise<KnowledgeModuleType | null> {
		const moduleType = await prisma.knowledgeModuleType.findUnique({
			where: { key },
		});

		if (!moduleType) return null;

		return {
			...moduleType,
			fieldSchema: moduleType.fieldSchema as Record<string, any> | null,
		};
	}

	/**
	 * Create new module type
	 */
	static async create(input: CreateKnowledgeModuleTypeInput): Promise<KnowledgeModuleType> {
		const moduleType = await prisma.knowledgeModuleType.create({
			data: {
				system: "knowledge",
				...input,
			},
		});

		return {
			...moduleType,
			fieldSchema: moduleType.fieldSchema as Record<string, any> | null,
		};
	}

	/**
	 * Update module type
	 */
	static async update(id: string, input: UpdateKnowledgeModuleTypeInput): Promise<KnowledgeModuleType> {
		const moduleType = await prisma.knowledgeModuleType.update({
			where: { id },
			data: input,
		});

		return {
			...moduleType,
			fieldSchema: moduleType.fieldSchema as Record<string, any> | null,
		};
	}

	/**
	 * Delete module type
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			await prisma.knowledgeModuleType.delete({
				where: { id },
			});
			return true;
		} catch {
			return false;
		}
	}
}

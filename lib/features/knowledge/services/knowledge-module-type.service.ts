/**
 * Knowledge Module Type Service
 * Business logic for Knowledge Module Types used in Profile Builder
 */

import type { ActionResult } from "@/lib/types";

import { KnowledgeModuleTypeRepository } from "../repositories";
import type { CreateKnowledgeModuleTypeInput, KnowledgeModuleType, UpdateKnowledgeModuleTypeInput } from "../types";

export class KnowledgeModuleTypeService {
	/**
	 * Get all module types
	 */
	static async getModuleTypes(): Promise<KnowledgeModuleType[]> {
		try {
			return await KnowledgeModuleTypeRepository.findMany();
		} catch (error) {
			throw new Error(`Failed to fetch module types: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get enabled module types only
	 */
	static async getEnabledModuleTypes(): Promise<KnowledgeModuleType[]> {
		try {
			return await KnowledgeModuleTypeRepository.findEnabledModuleTypes();
		} catch (error) {
			throw new Error(`Failed to fetch module types: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get module type by ID
	 */
	static async getModuleTypeById(id: string): Promise<KnowledgeModuleType | null> {
		try {
			return await KnowledgeModuleTypeRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch module type: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get module type by key
	 */
	static async getModuleTypeByKey(key: string): Promise<KnowledgeModuleType | null> {
		try {
			return await KnowledgeModuleTypeRepository.findByKey(key);
		} catch (error) {
			throw new Error(`Failed to fetch module type: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new module type
	 */
	static async createModuleType(input: CreateKnowledgeModuleTypeInput): Promise<ActionResult> {
		try {
			const moduleType = await KnowledgeModuleTypeRepository.create(input);

			return {
				success: true,
				message: "Module type created successfully",
				data: moduleType,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create module type",
			};
		}
	}

	/**
	 * Update module type
	 */
	static async updateModuleType(id: string, input: UpdateKnowledgeModuleTypeInput): Promise<ActionResult> {
		try {
			// Check module type exists
			const moduleType = await KnowledgeModuleTypeRepository.findById(id);
			if (!moduleType) {
				return {
					success: false,
					message: "Module type not found",
				};
			}

			const updated = await KnowledgeModuleTypeRepository.update(id, input);

			return {
				success: true,
				message: "Module type updated successfully",
				data: updated,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update module type",
			};
		}
	}

	/**
	 * Delete module type
	 */
	static async deleteModuleType(id: string): Promise<ActionResult> {
		try {
			// Check module type exists
			const moduleType = await KnowledgeModuleTypeRepository.findById(id);
			if (!moduleType) {
				return {
					success: false,
					message: "Module type not found",
				};
			}

			const deleted = await KnowledgeModuleTypeRepository.delete(id);
			if (!deleted) {
				return {
					success: false,
					message: "Failed to delete module type",
				};
			}

			return {
				success: true,
				message: "Module type deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete module type",
			};
		}
	}
}

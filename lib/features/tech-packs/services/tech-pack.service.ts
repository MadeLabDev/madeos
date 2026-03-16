import { TechPackRepository } from "../repositories/tech-pack.repository";
import type { CreateTechPackInput, GetTechPacksOptions, UpdateTechPackInput } from "../types/tech-pack.types";

/**
 * TechPack Service
 * Business logic and validation for tech packs
 */

export class TechPackService {
	/**
	 * Get all tech packs with filters
	 */
	static async getAllTechPacks(options: GetTechPacksOptions = {}) {
		return TechPackRepository.getAllTechPacks(options);
	}

	/**
	 * Get tech pack by ID
	 */
	static async getTechPackById(id: string) {
		return TechPackRepository.getTechPackById(id);
	}

	/**
	 * Get tech pack by product design
	 */
	static async getTechPackByProductDesign(productDesignId: string) {
		return TechPackRepository.getTechPackByProductDesign(productDesignId);
	}

	/**
	 * Create a new tech pack
	 */
	static async createTechPack(data: CreateTechPackInput, userId?: string) {
		// Validation
		if (!data.name?.trim()) {
			throw new Error("Name is required");
		}

		if (!data.productDesignId) {
			throw new Error("Product design ID is required");
		}

		if (!data.decorationMethod?.trim()) {
			throw new Error("Decoration method is required");
		}

		// Check if product design already has a tech pack
		const existing = await TechPackRepository.getTechPackByProductDesign(data.productDesignId);
		if (existing) {
			throw new Error("Tech pack already exists for this product design");
		}

		return TechPackRepository.createTechPack(data, userId);
	}

	/**
	 * Update an existing tech pack
	 */
	static async updateTechPack(id: string, data: UpdateTechPackInput, userId?: string) {
		// Validation
		if (data.name !== undefined && !data.name.trim()) {
			throw new Error("Name cannot be empty");
		}

		if (data.decorationMethod !== undefined && !data.decorationMethod.trim()) {
			throw new Error("Decoration method cannot be empty");
		}

		return TechPackRepository.updateTechPack(id, data, userId);
	}

	/**
	 * Delete a tech pack
	 */
	static async deleteTechPack(id: string) {
		return TechPackRepository.deleteTechPack(id);
	}

	/**
	 * Approve a tech pack
	 */
	static async approveTechPack(id: string, userId?: string) {
		return TechPackRepository.approveTechPack(id, userId);
	}

	/**
	 * Finalize a tech pack
	 */
	static async finalizeTechPack(id: string, userId?: string) {
		return TechPackRepository.finalizeTechPack(id, userId);
	}

	/**
	 * Get tech pack statistics
	 */
	static async getTechPackStatistics() {
		const countByStatus = await TechPackRepository.getTechPackCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}

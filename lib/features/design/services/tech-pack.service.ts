/**
 * TechPack Service
 * Business logic for TechPacks
 */

import type { ActionResult } from "@/lib/types";

import { TechPackRepository } from "../repositories";
import type { CreateTechPackInput, TechPack, TechPackFilters, UpdateTechPackInput } from "../types";

export class TechPackService {
	/**
	 * Get all tech packs with filtering
	 */
	static async getTechPacks(filters: TechPackFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TechPack[]> {
		try {
			return await TechPackRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch tech packs: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get tech pack by ID
	 */
	static async getTechPackById(id: string): Promise<TechPack | null> {
		try {
			return await TechPackRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch tech pack: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get tech pack by design ID
	 */
	static async getTechPackByDesignId(designId: string): Promise<TechPack | null> {
		try {
			return await TechPackRepository.findByDesignId(designId);
		} catch (error) {
			throw new Error(`Failed to fetch tech pack: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new tech pack
	 */
	static async createTechPack(input: CreateTechPackInput & { createdBy: string }): Promise<ActionResult<TechPack>> {
		try {
			if (!input.productDesignId?.trim()) {
				return {
					success: false,
					message: "Product design ID is required",
				};
			}

			if (!input.name?.trim()) {
				return {
					success: false,
					message: "Tech pack name is required",
				};
			}

			if (!input.decorationMethod?.trim()) {
				return {
					success: false,
					message: "Decoration method is required",
				};
			}

			const techPack = await TechPackRepository.create(input);

			return {
				success: true,
				message: "Tech pack created",
				data: techPack,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create tech pack",
			};
		}
	}

	/**
	 * Update tech pack
	 */
	static async updateTechPack(id: string, input: UpdateTechPackInput & { updatedBy: string }): Promise<ActionResult<TechPack>> {
		try {
			const existing = await TechPackRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Tech pack not found",
				};
			}

			const techPack = await TechPackRepository.update(id, input);

			return {
				success: true,
				message: "Tech pack updated",
				data: techPack,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update tech pack",
			};
		}
	}

	/**
	 * Delete tech pack
	 */
	static async deleteTechPack(id: string): Promise<ActionResult<void>> {
		try {
			const existing = await TechPackRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Tech pack not found",
				};
			}

			await TechPackRepository.delete(id);

			return {
				success: true,
				message: "Tech pack deleted",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete tech pack",
			};
		}
	}

	/**
	 * Bulk delete tech packs
	 */
	static async bulkDeleteTechPacks(ids: string[]): Promise<ActionResult<{ deletedCount: number }>> {
		try {
			if (!ids || ids.length === 0) {
				return {
					success: false,
					message: "No IDs provided for deletion",
				};
			}

			// Check if all tech packs exist
			const existingTechPacks = await TechPackRepository.findMany();
			const existingIds = existingTechPacks.map((techPack) => techPack.id);
			const nonExistentIds = ids.filter((id) => !existingIds.includes(id));

			if (nonExistentIds.length > 0) {
				return {
					success: false,
					message: `Tech packs not found: ${nonExistentIds.join(", ")}`,
				};
			}

			const result = await TechPackRepository.deleteMany(ids);

			return {
				success: true,
				message: "Tech packs deleted",
				data: { deletedCount: result.count },
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to bulk delete tech packs",
			};
		}
	}
}

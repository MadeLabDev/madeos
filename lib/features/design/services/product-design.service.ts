/**
 * ProductDesign Service
 * Business logic for ProductDesigns
 */

import type { ActionResult } from "@/lib/types";

import { ProductDesignRepository } from "../repositories";
import type { CreateProductDesignInput, ProductDesignFilters, ProductDesignWithRelations, UpdateProductDesignInput } from "../types";

export class ProductDesignService {
	/**
	 * Get all designs with pagination and filtering
	 */
	static async getProductDesigns(filters: ProductDesignFilters = {}, options: { skip?: number; take?: number } = {}): Promise<ProductDesignWithRelations[]> {
		try {
			return await ProductDesignRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch designs: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get design by ID
	 */
	static async getProductDesignById(id: string): Promise<ProductDesignWithRelations | null> {
		try {
			return await ProductDesignRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch design: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new design
	 */
	static async createProductDesign(input: CreateProductDesignInput & { createdBy: string }): Promise<ActionResult<ProductDesignWithRelations>> {
		try {
			if (!input.name?.trim()) {
				return {
					success: false,
					message: "Design name is required",
				};
			}

			if (!input.designProjectId?.trim()) {
				return {
					success: false,
					message: "Design project ID is required",
				};
			}

			const design = await ProductDesignRepository.create(input);

			return {
				success: true,
				message: "Product design created",
				data: design,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create design",
			};
		}
	}

	/**
	 * Update design
	 */
	static async updateProductDesign(id: string, input: UpdateProductDesignInput & { updatedBy: string }): Promise<ActionResult<ProductDesignWithRelations>> {
		try {
			const existing = await ProductDesignRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Design not found",
				};
			}

			const design = await ProductDesignRepository.update(id, input);

			return {
				success: true,
				message: "Product design updated",
				data: design,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update design",
			};
		}
	}

	/**
	 * Delete design
	 */
	static async deleteProductDesign(id: string): Promise<ActionResult<void>> {
		try {
			const existing = await ProductDesignRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Design not found",
				};
			}

			await ProductDesignRepository.delete(id);

			return {
				success: true,
				message: "Product design deleted",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete design",
			};
		}
	}

	/**
	 * Bulk delete product designs
	 */
	static async bulkDeleteProductDesigns(ids: string[]): Promise<ActionResult<{ deletedCount: number }>> {
		try {
			if (!ids || ids.length === 0) {
				return {
					success: false,
					message: "No IDs provided for deletion",
				};
			}

			// Check if all designs exist
			const existingDesigns = await ProductDesignRepository.findMany();
			const existingIds = existingDesigns.map((design) => design.id);
			const nonExistentIds = ids.filter((id) => !existingIds.includes(id));

			if (nonExistentIds.length > 0) {
				return {
					success: false,
					message: `Product designs not found: ${nonExistentIds.join(", ")}`,
				};
			}

			const result = await ProductDesignRepository.deleteMany(ids);

			return {
				success: true,
				message: "Product designs deleted",
				data: { deletedCount: result.count },
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to bulk delete product designs",
			};
		}
	}

	/**
	 * Get designs by project ID
	 */
	static async getDesignsByProjectId(projectId: string): Promise<ProductDesignWithRelations[]> {
		try {
			return await ProductDesignRepository.findByProjectId(projectId);
		} catch (error) {
			throw new Error(`Failed to fetch designs: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get design versions
	 */
	static async getDesignVersions(parentDesignId: string): Promise<ProductDesignWithRelations[]> {
		try {
			return await ProductDesignRepository.findVersions(parentDesignId);
		} catch (error) {
			throw new Error(`Failed to fetch versions: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get designs by IDs
	 */
	static async getProductDesignsByIds(ids: string[]): Promise<ProductDesignWithRelations[]> {
		try {
			return await ProductDesignRepository.findByIds(ids);
		} catch (error) {
			throw new Error(`Failed to fetch designs: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}

import { ProductDesignRepository } from "../repositories/product-design.repository";
import type { CreateProductDesignInput, GetProductDesignsOptions, UpdateProductDesignInput } from "../types/product-design.types";

/**
 * ProductDesign Service
 * Business logic and validation for product designs
 */

export class ProductDesignService {
	/**
	 * Get all product designs with filters
	 */
	static async getAllProductDesigns(options: GetProductDesignsOptions = {}) {
		return ProductDesignRepository.getAllProductDesigns(options);
	}

	/**
	 * Get product design by ID
	 */
	static async getProductDesignById(id: string) {
		return ProductDesignRepository.getProductDesignById(id);
	}

	/**
	 * Get product designs by project
	 */
	static async getProductDesignsByProject(designProjectId: string) {
		return ProductDesignRepository.getProductDesignsByProject(designProjectId);
	}

	/**
	 * Create a new product design
	 */
	static async createProductDesign(data: CreateProductDesignInput, userId?: string) {
		// Validation
		if (!data.name?.trim()) {
			throw new Error("Name is required");
		}

		if (!data.designProjectId) {
			throw new Error("Design project ID is required");
		}

		return ProductDesignRepository.createProductDesign(data, userId);
	}

	/**
	 * Update an existing product design
	 */
	static async updateProductDesign(id: string, data: UpdateProductDesignInput, userId?: string) {
		// Validation
		if (data.name !== undefined && !data.name.trim()) {
			throw new Error("Name cannot be empty");
		}

		return ProductDesignRepository.updateProductDesign(id, data, userId);
	}

	/**
	 * Delete a product design
	 */
	static async deleteProductDesign(id: string) {
		return ProductDesignRepository.deleteProductDesign(id);
	}

	/**
	 * Get product design statistics
	 */
	static async getProductDesignStatistics() {
		const countByStatus = await ProductDesignRepository.getProductDesignCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}

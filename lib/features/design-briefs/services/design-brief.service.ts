import { DesignBriefRepository } from "../repositories/design-brief.repository";
import type { CreateDesignBriefInput, GetDesignBriefsOptions, UpdateDesignBriefInput } from "../types/design-brief.types";

/**
 * DesignBrief Service
 * Business logic and validation for design briefs
 */

export class DesignBriefService {
	/**
	 * Get all design briefs with filters
	 */
	static async getAllDesignBriefs(options: GetDesignBriefsOptions = {}) {
		return DesignBriefRepository.getAllDesignBriefs(options);
	}

	/**
	 * Get design brief by ID
	 */
	static async getDesignBriefById(id: string) {
		return DesignBriefRepository.getDesignBriefById(id);
	}

	/**
	 * Get design brief by design project
	 */
	static async getDesignBriefByProject(designProjectId: string) {
		return DesignBriefRepository.getDesignBriefByProject(designProjectId);
	}

	/**
	 * Create a new design brief
	 */
	static async createDesignBrief(data: CreateDesignBriefInput, userId?: string) {
		// Validation
		if (!data.designProjectId) {
			throw new Error("Design project ID is required");
		}

		// Check if design project already has a brief
		const existing = await DesignBriefRepository.getDesignBriefByProject(data.designProjectId);
		if (existing) {
			throw new Error("Design brief already exists for this project");
		}

		if (data.budget !== undefined && data.budget < 0) {
			throw new Error("Budget cannot be negative");
		}

		return DesignBriefRepository.createDesignBrief(data, userId);
	}

	/**
	 * Update an existing design brief
	 */
	static async updateDesignBrief(id: string, data: UpdateDesignBriefInput, userId?: string) {
		// Validation
		if (data.budget !== undefined && data.budget < 0) {
			throw new Error("Budget cannot be negative");
		}

		return DesignBriefRepository.updateDesignBrief(id, data, userId);
	}

	/**
	 * Delete a design brief
	 */
	static async deleteDesignBrief(id: string) {
		return DesignBriefRepository.deleteDesignBrief(id);
	}

	/**
	 * Approve a design brief
	 */
	static async approveDesignBrief(id: string, userId?: string) {
		return DesignBriefRepository.approveDesignBrief(id, userId);
	}

	/**
	 * Get design brief statistics
	 */
	static async getDesignBriefStatistics() {
		const countByStatus = await DesignBriefRepository.getDesignBriefCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}

/**
 * DesignBrief Service
 * Business logic for DesignBriefs
 */

import type { ActionResult } from "@/lib/types";

import { DesignBriefRepository } from "../repositories";
import type { CreateDesignBriefInput, DesignBrief, DesignBriefFilters, DesignBriefWithRelations, UpdateDesignBriefInput } from "../types";

export class DesignBriefService {
	/**
	 * Get all briefs with filtering
	 */
	static async getDesignBriefs(filters: DesignBriefFilters = {}, options: { skip?: number; take?: number } = {}): Promise<DesignBriefWithRelations[]> {
		try {
			return await DesignBriefRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch briefs: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get brief by ID
	 */
	static async getDesignBriefById(id: string): Promise<DesignBriefWithRelations | null> {
		try {
			return await DesignBriefRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch brief: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get brief by project ID
	 */
	static async getDesignBriefByProjectId(projectId: string): Promise<DesignBrief | null> {
		try {
			return await DesignBriefRepository.findByProjectId(projectId);
		} catch (error) {
			throw new Error(`Failed to fetch brief: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new brief
	 */
	static async createDesignBrief(input: CreateDesignBriefInput & { createdBy: string }): Promise<ActionResult<DesignBrief>> {
		try {
			if (!input.designProjectId?.trim()) {
				return {
					success: false,
					message: "Design project ID is required",
				};
			}

			// Check if a brief already exists for this design project
			const existingBrief = await DesignBriefRepository.findByProjectId(input.designProjectId);
			if (existingBrief) {
				return {
					success: false,
					message: "A design brief already exists for this design project. Each project can only have one brief.",
				};
			}

			const brief = await DesignBriefRepository.create(input);

			return {
				success: true,
				message: "Design brief created",
				data: brief,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create brief",
			};
		}
	}

	/**
	 * Update brief
	 */
	static async updateDesignBrief(id: string, input: UpdateDesignBriefInput & { updatedBy: string }): Promise<ActionResult<DesignBrief>> {
		try {
			const existing = await DesignBriefRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Brief not found",
				};
			}

			const brief = await DesignBriefRepository.update(id, input);

			return {
				success: true,
				message: "Design brief updated",
				data: brief,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update brief",
			};
		}
	}

	/**
	 * Delete brief
	 */
	static async deleteDesignBrief(id: string): Promise<ActionResult<void>> {
		try {
			const existing = await DesignBriefRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Brief not found",
				};
			}

			await DesignBriefRepository.delete(id);

			return {
				success: true,
				message: "Design brief deleted",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete brief",
			};
		}
	}

	/**
	 * Bulk delete briefs
	 */
	static async bulkDeleteDesignBriefs(ids: string[]): Promise<ActionResult<{ deletedCount: number }>> {
		try {
			if (!ids || ids.length === 0) {
				return {
					success: false,
					message: "No IDs provided for deletion",
				};
			}

			// Check if all briefs exist
			const existingBriefs = await DesignBriefRepository.findMany();
			const existingIds = existingBriefs.map((brief) => brief.id);
			const nonExistentIds = ids.filter((id) => !existingIds.includes(id));

			if (nonExistentIds.length > 0) {
				return {
					success: false,
					message: `Briefs not found: ${nonExistentIds.join(", ")}`,
				};
			}

			const result = await DesignBriefRepository.deleteMany(ids);

			return {
				success: true,
				message: "Design briefs deleted",
				data: { deletedCount: result.count },
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to bulk delete briefs",
			};
		}
	}
}

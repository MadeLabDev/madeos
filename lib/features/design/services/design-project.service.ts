/**
 * DesignProject Service
 * Business logic for DesignProjects
 */

import type { ActionResult } from "@/lib/types";

import { DesignProjectRepository } from "../repositories";
import type { CreateDesignProjectInput, DesignProjectFilters, DesignProjectWithRelations, UpdateDesignProjectInput } from "../types";

export class DesignProjectService {
	/**
	 * Get all design projects with pagination and filtering
	 */
	static async getDesignProjects(filters: DesignProjectFilters = {}, options: { skip?: number; take?: number } = {}): Promise<DesignProjectWithRelations[]> {
		try {
			return await DesignProjectRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch design projects: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single design project by ID
	 */
	static async getDesignProjectById(id: string): Promise<DesignProjectWithRelations | null> {
		try {
			return await DesignProjectRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch design project: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new design project
	 */
	static async createDesignProject(input: CreateDesignProjectInput & { createdBy: string }): Promise<ActionResult<DesignProjectWithRelations>> {
		try {
			if (!input.title?.trim()) {
				return {
					success: false,
					message: "Title is required",
				};
			}

			if (!input.engagementId?.trim()) {
				return {
					success: false,
					message: "Engagement ID is required",
				};
			}

			if (!input.customerId?.trim()) {
				return {
					success: false,
					message: "Customer ID is required",
				};
			}

			const designProject = await DesignProjectRepository.create(input);

			return {
				success: true,
				message: "Design project created",
				data: designProject,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create design project",
			};
		}
	}

	/**
	 * Update design project
	 */
	static async updateDesignProject(id: string, input: UpdateDesignProjectInput & { updatedBy: string }): Promise<ActionResult<DesignProjectWithRelations>> {
		try {
			const existingProject = await DesignProjectRepository.findById(id);
			if (!existingProject) {
				return {
					success: false,
					message: "Design project not found",
				};
			}

			const designProject = await DesignProjectRepository.update(id, input);

			return {
				success: true,
				message: "Design project updated",
				data: designProject,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update design project",
			};
		}
	}

	/**
	 * Delete design project
	 */
	static async deleteDesignProject(id: string): Promise<ActionResult<void>> {
		try {
			const existingProject = await DesignProjectRepository.findById(id);
			if (!existingProject) {
				return {
					success: false,
					message: "Design project not found",
				};
			}

			await DesignProjectRepository.delete(id);

			return {
				success: true,
				message: "Design project deleted",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete design project",
			};
		}
	}

	/**
	 * Bulk delete design projects
	 */
	static async bulkDeleteDesignProjects(ids: string[]): Promise<ActionResult<{ deletedCount: number }>> {
		try {
			if (!ids || ids.length === 0) {
				return {
					success: false,
					message: "No IDs provided for deletion",
				};
			}

			// Check if all projects exist
			const existingProjects = await DesignProjectRepository.findMany();
			const existingIds = existingProjects.map((project) => project.id);
			const nonExistentIds = ids.filter((id) => !existingIds.includes(id));

			if (nonExistentIds.length > 0) {
				return {
					success: false,
					message: `Design projects not found: ${nonExistentIds.join(", ")}`,
				};
			}

			const result = await DesignProjectRepository.deleteMany(ids);

			return {
				success: true,
				message: "Design projects deleted",
				data: { deletedCount: result.count },
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to bulk delete design projects",
			};
		}
	}

	/**
	 * Get projects by engagement ID
	 */
	static async getProjectsByEngagementId(engagementId: string): Promise<DesignProjectWithRelations[]> {
		try {
			return await DesignProjectRepository.findByEngagementId(engagementId);
		} catch (error) {
			throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get projects by customer ID
	 */
	static async getProjectsByCustomerId(customerId: string): Promise<DesignProjectWithRelations[]> {
		try {
			return await DesignProjectRepository.findByCustomerId(customerId);
		} catch (error) {
			throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}

import type { ActionResult } from "@/lib/types";

import { ImplementationPlanRepository } from "../repositories/implementation-plan.repository";
import type { CreateImplementationPlanInput, GetImplementationPlansOptions, ImplementationPlanListResult, ImplementationPlanWithRelations, UpdateImplementationPlanInput } from "../types/implementation-plan.types";

/**
 * Implementation Plan Service
 * Business logic and validation for implementation plan management
 */

export class ImplementationPlanService {
	/**
	 * Get all implementation plans with pagination
	 */
	static async getAllPlans(options: GetImplementationPlansOptions = {}): Promise<ImplementationPlanListResult> {
		const { page = 1, limit = 10 } = options;

		const { plans, total } = await ImplementationPlanRepository.getAllPlans(options);

		const totalPages = Math.ceil(total / limit);

		return {
			plans,
			total,
			page,
			limit,
			totalPages,
		};
	}

	/**
	 * Get implementation plan by ID
	 */
	static async getPlanById(id: string): Promise<ActionResult<ImplementationPlanWithRelations>> {
		try {
			const plan = await ImplementationPlanRepository.getPlanById(id);

			if (!plan) {
				return {
					success: false,
					message: "Implementation plan not found",
				};
			}

			return {
				success: true,
				message: "Implementation plan retrieved successfully",
				data: plan,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to retrieve implementation plan";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Get implementation plan by training engagement
	 */
	static async getPlanByTrainingEngagement(trainingEngagementId: string): Promise<ActionResult<ImplementationPlanWithRelations>> {
		try {
			const plan = await ImplementationPlanRepository.getPlanByTrainingEngagement(trainingEngagementId);

			if (!plan) {
				return {
					success: false,
					message: "Implementation plan not found for this training engagement",
				};
			}

			return {
				success: true,
				message: "Implementation plan retrieved successfully",
				data: plan,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to retrieve implementation plan";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Create new implementation plan
	 */
	static async createPlan(data: CreateImplementationPlanInput): Promise<ActionResult<ImplementationPlanWithRelations>> {
		try {
			// Validate required fields
			if (!data.title?.trim()) {
				return {
					success: false,
					message: "Title is required",
				};
			}

			if (!data.trainingEngagementId) {
				return {
					success: false,
					message: "Training engagement is required",
				};
			}

			if (!data.startDate || !data.endDate) {
				return {
					success: false,
					message: "Start date and end date are required",
				};
			}

			if (data.startDate >= data.endDate) {
				return {
					success: false,
					message: "End date must be after start date",
				};
			}

			// Check if plan already exists for this engagement
			const existing = await ImplementationPlanRepository.getPlanByTrainingEngagement(data.trainingEngagementId);
			if (existing) {
				return {
					success: false,
					message: "Implementation plan already exists for this training engagement",
				};
			}

			// Calculate duration if not provided
			if (!data.estimatedDurationDays) {
				const durationMs = data.endDate.getTime() - data.startDate.getTime();
				data.estimatedDurationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
			}

			const plan = await ImplementationPlanRepository.createPlan(data);

			return {
				success: true,
				message: "Implementation plan created successfully",
				data: plan,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create implementation plan";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Update implementation plan
	 */
	static async updatePlan(id: string, data: UpdateImplementationPlanInput): Promise<ActionResult<ImplementationPlanWithRelations>> {
		try {
			// Check if plan exists
			const existing = await ImplementationPlanRepository.getPlanById(id);
			if (!existing) {
				return {
					success: false,
					message: "Implementation plan not found",
				};
			}

			// Validate title if provided
			if (data.title !== undefined && !data.title?.trim()) {
				return {
					success: false,
					message: "Title cannot be empty",
				};
			}

			// Validate dates if provided
			if (data.startDate && data.endDate) {
				if (data.startDate >= data.endDate) {
					return {
						success: false,
						message: "End date must be after start date",
					};
				}
			}

			const plan = await ImplementationPlanRepository.updatePlan(id, data);

			return {
				success: true,
				message: "Implementation plan updated successfully",
				data: plan,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update implementation plan";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Delete implementation plan
	 */
	static async deletePlan(id: string): Promise<ActionResult<ImplementationPlanWithRelations>> {
		try {
			// Check if plan exists
			const existing = await ImplementationPlanRepository.getPlanById(id);
			if (!existing) {
				return {
					success: false,
					message: "Implementation plan not found",
				};
			}

			const plan = await ImplementationPlanRepository.deletePlan(id);

			return {
				success: true,
				message: "Implementation plan deleted successfully",
				data: plan,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete implementation plan";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Update plan progress
	 */
	static async updateProgress(id: string, totalTasks: number, completedTasks: number): Promise<ActionResult<ImplementationPlanWithRelations>> {
		try {
			// Check if plan exists
			const existing = await ImplementationPlanRepository.getPlanById(id);
			if (!existing) {
				return {
					success: false,
					message: "Implementation plan not found",
				};
			}

			if (completedTasks > totalTasks) {
				return {
					success: false,
					message: "Completed tasks cannot exceed total tasks",
				};
			}

			const plan = await ImplementationPlanRepository.updateProgress(id, totalTasks, completedTasks);

			return {
				success: true,
				message: "Plan progress updated successfully",
				data: plan,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update progress";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Get plan statistics
	 */
	static async getPlanStatistics(): Promise<ActionResult<any>> {
		try {
			const countsByStatus = await ImplementationPlanRepository.getPlanCountByStatus();

			return {
				success: true,
				message: "Statistics retrieved successfully",
				data: {
					countsByStatus,
				},
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to retrieve statistics";
			return {
				success: false,
				message,
			};
		}
	}
}

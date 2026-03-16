/**
 * ImplementationPlan Service
 * Business logic for ImplementationPlans
 */

import type { ActionResult } from "@/lib/types";

import { ImplementationPlanRepository } from "../repositories";
import type { CreateImplementationPlanInput, ImplementationPlanFilters, ImplementationPlanWithRelations, UpdateImplementationPlanInput } from "../types";

export class ImplementationPlanService {
	/**
	 * Get all implementation plans with pagination and filtering
	 */
	static async getImplementationPlans(filters: ImplementationPlanFilters = {}, options: { skip?: number; take?: number } = {}): Promise<ImplementationPlanWithRelations[]> {
		try {
			return await ImplementationPlanRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch implementation plans: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single implementation plan by ID
	 */
	static async getImplementationPlanById(id: string): Promise<ImplementationPlanWithRelations | null> {
		try {
			return await ImplementationPlanRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch implementation plan: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new implementation plan
	 */
	static async createImplementationPlan(input: CreateImplementationPlanInput & { createdBy: string }): Promise<ActionResult<ImplementationPlanWithRelations>> {
		try {
			const implementationPlan = await ImplementationPlanRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Implementation plan created successfully",
				data: implementationPlan,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create implementation plan",
			};
		}
	}

	/**
	 * Update implementation plan
	 */
	static async updateImplementationPlan(id: string, input: UpdateImplementationPlanInput & { updatedBy: string }): Promise<ActionResult<ImplementationPlanWithRelations>> {
		try {
			// Check if implementation plan exists
			const existingImplementationPlan = await ImplementationPlanRepository.findById(id);
			if (!existingImplementationPlan) {
				return {
					success: false,
					message: "Implementation plan not found",
				};
			}

			const implementationPlan = await ImplementationPlanRepository.update(id, input);

			return {
				success: true,
				message: "Implementation plan updated successfully",
				data: implementationPlan,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update implementation plan",
			};
		}
	}

	/**
	 * Delete implementation plan
	 */
	static async deleteImplementationPlan(id: string): Promise<ActionResult<void>> {
		try {
			// Check if implementation plan exists
			const existingImplementationPlan = await ImplementationPlanRepository.findById(id);
			if (!existingImplementationPlan) {
				return {
					success: false,
					message: "Implementation plan not found",
				};
			}

			await ImplementationPlanRepository.delete(id);

			return {
				success: true,
				message: "Implementation plan deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete implementation plan",
			};
		}
	}
}

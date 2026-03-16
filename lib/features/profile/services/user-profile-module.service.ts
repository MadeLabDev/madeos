/**
 * User Profile Module Service
 * Business logic for managing profile modules
 */

import type { ActionResult } from "@/lib/types";

import { UserProfileModuleRepository } from "../repositories";
import type { AddModuleInput, UpdateModuleInput } from "../types";

export class UserProfileModuleService {
	/**
	 * Get all modules for a profile
	 */
	static async getProfileModules(profileId: string) {
		return UserProfileModuleRepository.getByProfileId(profileId);
	}

	/**
	 * Get visible modules for public profile
	 */
	static async getVisibleModules(profileId: string) {
		return UserProfileModuleRepository.getVisibleByProfileId(profileId);
	}

	/**
	 * Add module to profile
	 */
	static async addModule(profileId: string, input: AddModuleInput): Promise<ActionResult> {
		try {
			// Validate input
			if (!input.data || Object.keys(input.data).length === 0) {
				return {
					success: false,
					message: "Module data cannot be empty",
				};
			}

			await UserProfileModuleRepository.create(profileId, {
				moduleTypeId: input.moduleTypeId,
				data: input.data,
				column: input.column || 1,
			});

			return {
				success: true,
				message: "Module added successfully",
				data: module,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to add module",
			};
		}
	}

	/**
	 * Update module
	 */
	static async updateModule(moduleId: string, input: UpdateModuleInput): Promise<ActionResult> {
		try {
			await UserProfileModuleRepository.update(moduleId, input);

			return {
				success: true,
				message: "Module updated successfully",
				data: module,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update module",
			};
		}
	}

	/**
	 * Delete module
	 */
	static async deleteModule(moduleId: string): Promise<ActionResult> {
		try {
			await UserProfileModuleRepository.delete(moduleId);

			return {
				success: true,
				message: "Module deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete module",
			};
		}
	}

	/**
	 * Reorder modules (after drag-drop)
	 */
	static async reorderModules(
		updates: Array<{
			moduleId: string;
			order: number;
			column: number;
		}>,
	): Promise<ActionResult> {
		try {
			// Validate updates
			if (!Array.isArray(updates) || updates.length === 0) {
				return {
					success: false,
					message: "Invalid reorder data",
				};
			}

			await UserProfileModuleRepository.reorder(updates);

			return {
				success: true,
				message: "Modules reordered successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to reorder modules",
			};
		}
	}

	/**
	 * Toggle module visibility
	 */
	static async toggleVisibility(moduleId: string, isVisible: boolean): Promise<ActionResult> {
		try {
			await UserProfileModuleRepository.toggleVisibility(moduleId, isVisible);

			return {
				success: true,
				message: isVisible ? "Module visible" : "Module hidden",
				data: module,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to toggle visibility",
			};
		}
	}
}

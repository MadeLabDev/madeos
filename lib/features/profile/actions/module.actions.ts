/**
 * User Profile Module Server Actions
 * Server-side actions for module management (add, update, delete, reorder, visibility)
 */

"use server";

import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

import { moduleTypeService, UserProfileModuleService, UserProfileService } from "../services";
import { AddModuleInput, UpdateModuleInput } from "../types";

/**
 * Add module to profile
 */
export async function addModuleAction(profileId: string, input: AddModuleInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Verify user owns this profile
		const profile = await UserProfileService.getProfileById(profileId, false);
		if (!profile || profile.userId !== session.user.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		const result = await UserProfileModuleService.addModule(profileId, input);
		return result;
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
export async function updateModuleAction(profileId: string, moduleId: string, input: UpdateModuleInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Verify user owns this profile
		const profile = await UserProfileService.getProfileById(profileId, false);
		if (!profile || profile.userId !== session.user.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		const result = await UserProfileModuleService.updateModule(moduleId, input);
		return result;
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
export async function deleteModuleAction(profileId: string, moduleId: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Verify user owns this profile
		const profile = await UserProfileService.getProfileById(profileId, false);
		if (!profile || profile.userId !== session.user.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		const result = await UserProfileModuleService.deleteModule(moduleId);
		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete module",
		};
	}
}

/**
 * Reorder modules after drag-drop
 */
export async function reorderModulesAction(
	profileId: string,
	updates: Array<{
		moduleId: string;
		order: number;
		column: number;
	}>,
): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Verify user owns this profile
		const profile = await UserProfileService.getProfileById(profileId, false);
		if (!profile || profile.userId !== session.user.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		const result = await UserProfileModuleService.reorderModules(updates);
		return result;
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
export async function toggleModuleVisibilityAction(profileId: string, moduleId: string, isVisible: boolean): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Verify user owns this profile
		const profile = await UserProfileService.getProfileById(profileId, false);
		if (!profile || profile.userId !== session.user.id) {
			return {
				success: false,
				message: "Unauthorized",
			};
		}

		const result = await UserProfileModuleService.toggleVisibility(moduleId, isVisible);
		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to toggle visibility",
		};
	}
}

/**
 * Get available module types for adding to profile
 * Only returns profile system modules (excludes blog, knowledge, product, etc.)
 */
export async function getAvailableModuleTypesAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const moduleTypes = await moduleTypeService.getModuleTypesForProfile();

		return {
			success: true,
			message: "Module types retrieved",
			data: moduleTypes,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get module types",
		};
	}
}

/**
 * Get profile meta module type (Profile Meta)
 * Returns the module type definition that contains the schema for basic profile information fields
 */
export async function getProfileMetaModuleTypeAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const profileMeta = await moduleTypeService.getModuleTypeBySystem("meta");

		if (!profileMeta) {
			return {
				success: false,
				message: "Profile meta module type not found",
			};
		}

		return {
			success: true,
			message: "Profile meta retrieved",
			data: profileMeta,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get profile meta",
		};
	}
}

/**
 * Get all module types with system='meta'
 * Returns all module type definitions that belong to the meta system
 */
export async function getMetaSystemModuleTypesAction(): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const metaModuleTypes = await moduleTypeService.getModuleTypesBySystem("meta");

		return {
			success: true,
			message: "Meta system module types retrieved",
			data: metaModuleTypes,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get meta system module types",
		};
	}
}

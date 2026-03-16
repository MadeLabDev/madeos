/**
 * UserProfileModule Repository
 * Database operations for profile modules
 */

import { prisma } from "@/lib/prisma";

export class UserProfileModuleRepository {
	/**
	 * Get all modules for a profile
	 */
	static async getByProfileId(profileId: string) {
		return prisma.userProfileModule.findMany({
			where: { profileId },
			orderBy: [{ column: "asc" }, { order: "asc" }],
		});
	}

	/**
	 * Get module by ID
	 */
	static async getById(moduleId: string) {
		return prisma.userProfileModule.findUnique({
			where: { id: moduleId },
		});
	}

	/**
	 * Add module to profile
	 */
	static async create(
		profileId: string,
		data: {
			moduleTypeId?: string;
			data: Record<string, any>;
			column?: number;
		},
	) {
		// Get current max order for this column
		const maxOrder = await prisma.userProfileModule.findFirst({
			where: {
				profileId,
				column: data.column || 1,
			},
			orderBy: { order: "desc" },
			select: { order: true },
		});

		return prisma.userProfileModule.create({
			data: {
				profileId,
				moduleTypeId: data.moduleTypeId,
				data: data.data,
				column: data.column || 1,
				order: (maxOrder?.order || 0) + 1,
			},
		});
	}

	/**
	 * Update module
	 */
	static async update(
		moduleId: string,
		data: {
			data?: Record<string, any>;
			order?: number;
			column?: number;
			isVisible?: boolean;
		},
	) {
		return prisma.userProfileModule.update({
			where: { id: moduleId },
			data,
		});
	}

	/**
	 * Delete module
	 */
	static async delete(moduleId: string) {
		return prisma.userProfileModule.delete({
			where: { id: moduleId },
		});
	}

	/**
	 * Reorder modules after drag-drop
	 */
	static async reorder(
		updates: Array<{
			moduleId: string;
			order: number;
			column: number;
		}>,
	) {
		// Update all in transaction
		return prisma.$transaction(
			updates.map((update) =>
				prisma.userProfileModule.update({
					where: { id: update.moduleId },
					data: {
						order: update.order,
						column: update.column,
					},
				}),
			),
		);
	}

	/**
	 * Toggle module visibility
	 */
	static async toggleVisibility(moduleId: string, isVisible: boolean) {
		return prisma.userProfileModule.update({
			where: { id: moduleId },
			data: { isVisible },
		});
	}

	/**
	 * Get visible modules (for public profile)
	 */
	static async getVisibleByProfileId(profileId: string) {
		return prisma.userProfileModule.findMany({
			where: {
				profileId,
				isVisible: true,
			},
			orderBy: [{ column: "asc" }, { order: "asc" }],
		});
	}
}

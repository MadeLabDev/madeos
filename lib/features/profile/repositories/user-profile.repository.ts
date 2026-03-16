/**
 * UserProfile Repository
 * Database operations for user profiles
 */

import { prisma } from "@/lib/prisma";

import { UserProfileWithModules } from "../types";

// Helper function to transform raw profile to UserProfile type
function transformProfile(rawProfile: any): any {
	if (!rawProfile) return null;

	const metaData = (rawProfile.metaData as Record<string, any>) || {};

	// Return profile with all metaData fields flattened to top level
	// for backward compatibility with existing UI components
	return {
		...rawProfile,
		...metaData, // Spread all metaData fields to top level
	};
}

export class UserProfileRepository {
	/**
	 * Get user profile by user ID
	 */
	static async getByUserId(userId: string, includeModules = true): Promise<UserProfileWithModules | null> {
		const profile = await prisma.userProfile.findUnique({
			where: { userId },
			include: {
				modules: includeModules ? { orderBy: { order: "asc" } } : false,
			},
		});

		return profile ? transformProfile(profile) : null;
	}

	/**
	 * Get user profile by ID
	 */
	static async getById(id: string, includeModules = true) {
		const profile = await prisma.userProfile.findUnique({
			where: { id },
			include: {
				modules: includeModules ? { orderBy: { order: "asc" } } : false,
			},
		});

		return profile ? transformProfile(profile) : null;
	}

	/**
	 * Get user profile by slug (public profile)
	 */
	static async getBySlug(slug: string) {
		const profile = await prisma.userProfile.findUnique({
			where: { slug },
			include: {
				modules: { where: { isVisible: true }, orderBy: { order: "asc" } },
			},
		});

		return profile ? transformProfile(profile) : null;
	}

	/**
	 * Create new user profile
	 * Accepts dynamic metaData fields - all fields except the static ones go to metaData JSON
	 */
	static async create(
		userId: string,
		data: {
			// Static fields
			isPublic?: boolean;
			slug?: string;
			metaTitle?: string;
			metaDescription?: string;
			// Dynamic metaData fields (anything else goes to metaData JSON)
			[key: string]: any;
		},
	) {
		// Separate static fields from dynamic metaData fields
		const staticFields = ["isPublic", "slug", "metaTitle", "metaDescription"];
		const createData: any = { userId };
		const metaData: any = {};

		// Process all fields
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				if (staticFields.includes(key)) {
					createData[key] = value;
				} else {
					// All other fields go to metaData
					metaData[key] = value;
				}
			}
		});

		// Set defaults
		if (!("isPublic" in createData)) {
			createData.isPublic = false;
		}

		// Add metaData
		createData.metaData = metaData;

		const profile = await prisma.userProfile.create({
			data: createData,
		});

		return transformProfile(profile);
	}

	/**
	 * Update user profile
	 * Supports both static fields (isPublic, slug, metaTitle, metaDescription)
	 * and dynamic metaData fields (stored as JSON)
	 */
	static async update(
		profileId: string,
		data: {
			// Static fields
			isPublic?: boolean;
			slug?: string;
			metaTitle?: string;
			metaDescription?: string;
			// Dynamic metaData fields (anything else goes to metaData JSON)
			[key: string]: any;
		},
	) {
		// Separate static fields from dynamic metaData fields
		const staticFields = ["isPublic", "slug", "metaTitle", "metaDescription"];
		const updateData: any = {};
		const metaDataUpdates: any = {};

		// Process all fields
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined) {
				if (staticFields.includes(key)) {
					updateData[key] = value;
				} else {
					// All other fields go to metaData
					metaDataUpdates[key] = value;
				}
			}
		});

		// Get current profile to merge metaData
		if (Object.keys(metaDataUpdates).length > 0) {
			const currentProfile = await prisma.userProfile.findUnique({
				where: { id: profileId },
				select: { metaData: true },
			});

			const currentMetaData = (currentProfile?.metaData as Record<string, any>) || {};
			updateData.metaData = {
				...currentMetaData,
				...metaDataUpdates,
			};
		}

		const profile = await prisma.userProfile.update({
			where: { id: profileId },
			data: updateData,
			include: { modules: { orderBy: { order: "asc" } } },
		});

		return transformProfile(profile);
	}

	/**
	 * Increment view count for public profile
	 */
	static async incrementViewCount(profileId: string) {
		const profile = await prisma.userProfile.update({
			where: { id: profileId },
			data: {
				viewCount: { increment: 1 },
				lastViewedAt: new Date(),
			},
		});

		return transformProfile(profile);
	}

	/**
	 * Delete user profile
	 */
	static async delete(profileId: string) {
		return prisma.userProfile.delete({
			where: { id: profileId },
		});
	}
}

/**
 * User Profile Service
 * Business logic for user profiles
 */

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

import { UserProfileRepository } from "../repositories";
import type { CreateProfileInput, UpdateProfileInput, UserProfile, UserProfileWithModules } from "../types";

export class UserProfileService {
	/**
	 * Get or create user profile
	 */
	static async getOrCreateProfile(userId: string): Promise<UserProfileWithModules> {
		// First verify user exists in database
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			throw new Error(`User with ID ${userId} does not exist in database`);
		}

		let profile = await UserProfileRepository.getByUserId(userId);

		if (!profile) {
			// Auto-create profile if not exists
			const newProfile = await UserProfileRepository.create(userId, {
				displayName: undefined,
				headline: undefined,
			});
			profile = newProfile as UserProfileWithModules;
		}

		return profile as UserProfileWithModules;
	}

	/**
	 * Get user profile by ID
	 */
	static async getProfileById(profileId: string, includeModules = true): Promise<UserProfileWithModules | null> {
		const result = await UserProfileRepository.getById(profileId, includeModules);
		return result as UserProfileWithModules | null;
	}

	/**
	 * Get user profile by user ID
	 */
	static async getProfileByUserId(userId: string, includeModules = true): Promise<UserProfileWithModules | null> {
		return UserProfileRepository.getByUserId(userId, includeModules) as Promise<UserProfileWithModules | null>;
	}

	/**
	 * Get public profile by slug
	 */
	static async getPublicProfileBySlug(slug: string) {
		return UserProfileRepository.getBySlug(slug);
	}

	/**
	 * Create new profile
	 */
	static async createProfile(userId: string, input: CreateProfileInput): Promise<ActionResult<UserProfile>> {
		try {
			// Check if profile already exists
			const existing = await UserProfileRepository.getByUserId(userId, false);
			if (existing) {
				return {
					success: false,
					message: "Profile already exists for this user",
				};
			}

			const profile = await UserProfileRepository.create(userId, input);

			return {
				success: true,
				message: "Profile created successfully",
				data: profile,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create profile",
			};
		}
	}

	/**
	 * Update profile
	 */
	static async updateProfile(profileId: string, input: UpdateProfileInput): Promise<ActionResult<UserProfileWithModules>> {
		try {
			const profile = await UserProfileRepository.update(profileId, input);

			return {
				success: true,
				message: "Profile updated successfully",
				data: profile as UserProfileWithModules,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update profile",
			};
		}
	}

	/**
	 * Generate slug from display name
	 */
	static generateSlug(displayName: string): string {
		return displayName
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	/**
	 * Check if slug is available
	 */
	static async isSlugAvailable(slug: string): Promise<boolean> {
		const profile = await UserProfileRepository.getBySlug(slug);
		return !profile;
	}

	/**
	 * Delete profile
	 */
	static async deleteProfile(profileId: string): Promise<ActionResult> {
		try {
			await UserProfileRepository.delete(profileId);

			return {
				success: true,
				message: "Profile deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete profile",
			};
		}
	}

	/**
	 * Increment public profile view count
	 */
	static async recordProfileView(profileId: string) {
		try {
			await UserProfileRepository.incrementViewCount(profileId);
		} catch (error) {
			// Silently fail - not critical for app to work
			console.error("Failed to record profile view:", error);
		}
	}
}

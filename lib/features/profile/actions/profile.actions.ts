/**
 * User Profile Server Actions
 * Server-side actions for profile CRUD operations
 */

"use server";

import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

import { UserProfileService } from "../services";
import { CreateProfileInput, UpdateProfileInput } from "../types";

/**
 * Get current user's profile
 */
export async function getMyProfileAction(): Promise<ActionResult<{ profile: any; isOwner: boolean }>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const profile = await UserProfileService.getOrCreateProfile(session.user.id);

		return {
			success: true,
			message: "Profile retrieved successfully",
			data: {
				profile,
				isOwner: true,
			},
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch profile";

		// If user doesn't exist in database (old session), return a clear error
		if (message.includes("does not exist in database")) {
			return {
				success: false,
				message: "Your session is invalid. Please log in again.",
			};
		}

		return {
			success: false,
			message,
		};
	}
}

/**
 * Create user profile
 */
export async function createProfileAction(input: CreateProfileInput): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const result = await UserProfileService.createProfile(session.user.id, input);
		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create profile",
		};
	}
}

/**
 * Update user profile
 */
export async function updateProfileAction(profileId: string, input: UpdateProfileInput): Promise<ActionResult> {
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

		const result = await UserProfileService.updateProfile(profileId, input);
		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update profile",
		};
	}
}

/**
 * Get public profile by slug (anyone can view)
 */
export async function getPublicProfileAction(slug: string): Promise<ActionResult> {
	try {
		const profile = await UserProfileService.getPublicProfileBySlug(slug);

		if (!profile) {
			return {
				success: false,
				message: "Profile not found",
			};
		}

		if (!profile.isPublic) {
			return {
				success: false,
				message: "Profile is private",
			};
		}

		// Record view
		await UserProfileService.recordProfileView(profile.id);

		return {
			success: true,
			message: "Public profile retrieved successfully",
			data: { profile, isOwner: false },
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch profile",
		};
	}
}

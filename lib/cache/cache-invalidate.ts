/**
 * Server-only cache invalidation functions
 * Must be called from Server Components or Server Actions
 * This file is separate from cache-helpers.ts to avoid importing revalidateTag in client components
 */

import { revalidateTag } from "next/cache";

import { CACHE_ENABLED, CACHE_TAGS } from "./cache-helpers";

/**
 * Invalidate all user-related caches
 * Call this when user data changes (update profile, change password, etc.)
 *
 * @param userId - Optional user ID for granular invalidation
 */
export async function invalidateUserCache(userId?: string): Promise<void> {
	if (!CACHE_ENABLED) return;

	try {
		revalidateTag(CACHE_TAGS.USERS, "");
		if (userId) {
			revalidateTag(`user:${userId}`, "");
		}
	} catch (error) {
		console.error("Failed to invalidate user cache:", error);
	}
}

/**
 * Invalidate user profile cache
 * Call this when user profile is updated
 *
 * @param userId - Optional user ID for granular invalidation
 */
export async function invalidateUserProfileCache(userId?: string): Promise<void> {
	if (!CACHE_ENABLED) return;

	try {
		revalidateTag(CACHE_TAGS.USER_PROFILE, "");
		if (userId) {
			revalidateTag(`user-profile:${userId}`, "");
		}
	} catch (error) {
		console.error("Failed to invalidate user profile cache:", error);
	}
}

/**
 * Invalidate all settings cache
 * Call this when any setting changes
 */
export async function invalidateSettingsCache(): Promise<void> {
	if (!CACHE_ENABLED) return;

	try {
		revalidateTag(CACHE_TAGS.SETTINGS, "");
	} catch (error) {
		console.error("Failed to invalidate settings cache:", error);
	}
}

/**
 * Invalidate specific setting cache
 * Call this when a specific setting changes
 *
 * @param key - The settings key that changed
 */
export async function invalidateSettingsCacheByKey(key: string): Promise<void> {
	if (!CACHE_ENABLED) return;

	try {
		revalidateTag(CACHE_TAGS.SETTINGS, "");
		revalidateTag(`settings:${key}`, "");
	} catch (error) {
		console.error(`Failed to invalidate settings cache for key ${key}:`, error);
	}
}

/**
 * Invalidate all caches at once
 * Use carefully - only on major changes or user logout
 */
export async function invalidateAllCaches(): Promise<void> {
	if (!CACHE_ENABLED) return;

	invalidateUserCache();
	invalidateUserProfileCache();
	invalidateSettingsCache();
}

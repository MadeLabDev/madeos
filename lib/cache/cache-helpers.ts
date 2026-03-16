/**
 * Cache constants and configuration
 * Safe to import in any component (client or server)
 * Invalidation functions moved to cache-invalidate.ts for server-only use
 *
 * Enable/Disable caching via NEXT_PUBLIC_ENABLE_CACHE environment variable
 * - Not set or false: Caching disabled (original behavior)
 * - true: Caching enabled
 */

/**
 * Cache feature flag
 * Set NEXT_PUBLIC_ENABLE_CACHE=true in .env.local to enable caching
 * Defaults to false (disabled) unless explicitly enabled
 */
export const CACHE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CACHE === "true";

/**
 * Cache tag constants
 * Use these tags to group related cache entries
 */
export const CACHE_TAGS = {
	USERS: "users",
	USER_PROFILE: "user-profile",
	SETTINGS: "settings",
} as const;

/**
 * Export cache status for debugging
 * Shows if caching is enabled and what tags are available
 */
export const CACHE_STATUS = {
	enabled: CACHE_ENABLED,
	tags: CACHE_TAGS,
	message: CACHE_ENABLED ? "✅ Caching ENABLED" : "❌ Caching DISABLED",
};

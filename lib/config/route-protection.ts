/**
 * Route Protection Configuration
 * Defines which routes require which permissions
 * Used by middleware to check access before rendering
 */

export interface RouteProtectionConfig {
	module: string;
	action: string;
}

/**
 * Route to module/action mapping
 * Maps route patterns to their corresponding module and required permission action
 */
export const ROUTE_PROTECTION_MAP: Record<string, RouteProtectionConfig> = {
	// Users
	"/users": { module: "users", action: "read" },
	"/users/new": { module: "users", action: "create" },
	"/users/[id]/edit": { module: "users", action: "update" },

	// Roles
	"/roles": { module: "roles", action: "read" },
	"/roles/new": { module: "roles", action: "create" },
	"/roles/[id]": { module: "roles", action: "read" },
	"/roles/[id]/edit": { module: "roles", action: "update" },

	// Customers
	"/customers": { module: "customers", action: "read" },
	"/customers/new": { module: "customers", action: "create" },
	"/customers/[id]/edit": { module: "customers", action: "update" },

	// Reports
	"/reports": { module: "reports", action: "read" },

	// Settings
	"/settings": { module: "settings", action: "read" },

	// Pricing & Billing
	"/pricing": { module: "settings", action: "read" }, // Pricing is part of settings
	"/checkout": { module: "settings", action: "read" }, // Checkout requires read access
	"/payment": { module: "settings", action: "read" }, // Payment history requires read access
};

/**
 * Find protection config for a pathname
 * Handles both exact matches and dynamic route patterns like [id]
 *
 * @param pathname - The request pathname
 * @returns Protection config if found, null otherwise
 */
export function findProtection(pathname: string): RouteProtectionConfig | null {
	// Direct exact match
	if (ROUTE_PROTECTION_MAP[pathname]) {
		return ROUTE_PROTECTION_MAP[pathname];
	}

	// Check for dynamic routes
	// /users/123 -> matches /users/[id]
	const parts = pathname.split("/").filter(Boolean);

	// Try to find a matching pattern
	for (const [pattern, protection] of Object.entries(ROUTE_PROTECTION_MAP)) {
		const patternParts = pattern.split("/").filter(Boolean);

		// Must have same number of parts
		if (patternParts.length !== parts.length) continue;

		// Check if all parts match (dynamic parts are in brackets like [id])
		let isMatch = true;
		for (let i = 0; i < patternParts.length; i++) {
			const patternPart = patternParts[i];
			const urlPart = parts[i];

			if (!patternPart || !urlPart) {
				isMatch = false;
				break;
			}

			// Dynamic parts (e.g., [id]) match any value
			if (patternPart.startsWith("[") && patternPart.endsWith("]")) {
				continue;
			}

			// Static parts must match exactly
			if (patternPart !== urlPart) {
				isMatch = false;
				break;
			}
		}

		if (isMatch) {
			return protection;
		}
	}

	return null;
}

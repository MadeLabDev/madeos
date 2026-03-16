/**
 * Protected/System Module Types
 * These 4 default types can only be seeded from database and cannot be:
 * - Created via UI
 * - Updated via UI
 * - Deleted via UI
 *
 * They are system types that define core metadata schemas
 */

export const PROTECTED_MODULE_TYPE_KEYS = ["blog", "knowngle", "product", "order", "meta"] as const;

export type ProtectedModuleTypeKey = (typeof PROTECTED_MODULE_TYPE_KEYS)[number];

/**
 * Check if a module type key is protected (system type)
 */
export function isProtectedModuleType(key: string): boolean {
	return PROTECTED_MODULE_TYPE_KEYS.includes(key as ProtectedModuleTypeKey);
}

/**
 * Check if a module type is protected by its ID or key
 */
export function isProtectedModuleTypeById(moduleTypeOrKey: { key?: string; id?: string } | string | null): boolean {
	if (!moduleTypeOrKey) return false;

	if (typeof moduleTypeOrKey === "string") {
		// If it looks like a key (lowercase, underscore, numbers)
		if (/^[a-z_][a-z0-9_]*$/.test(moduleTypeOrKey)) {
			return isProtectedModuleType(moduleTypeOrKey);
		}
		// Otherwise assume it's an ID, which is never protected in our case
		return false;
	}

	if (moduleTypeOrKey.key) {
		return isProtectedModuleType(moduleTypeOrKey.key);
	}

	return false;
}

/**
 * Get error message for protected module type operation
 */
export function getProtectedTypeErrorMessage(operation: "create" | "update" | "delete"): string {
	const operationText = {
		create: "created",
		update: "updated",
		delete: "deleted",
	}[operation];

	return `System module types (blog, knowngle, product, order, meta) cannot be ${operationText} via UI. These types are protected and can only be managed through database seeding.`;
}

/**
 * Protected types metadata for reference
 */
export const PROTECTED_TYPES_METADATA = {
	blog: {
		name: "Blog Meta",
		description: "Metadata schema for blog posts (SEO, OG tags)",
	},
	knowngle: {
		name: "Knowledge Base Meta",
		description: "Metadata schema for knowledge base articles",
	},
	product: {
		name: "Product Meta",
		description: "Metadata schema for product catalog",
	},
	meta: {
		name: "Profile Meta",
		description: "Metadata schema for profile",
	},
} as const;

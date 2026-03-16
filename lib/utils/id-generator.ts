import { createId } from "@paralleldrive/cuid2";

/**
 * Generate a secure CUID2 identifier
 * Replacement for deprecated cuid package
 */
export function generateId(): string {
	return createId();
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use generateId() instead
 */
export const cuid = generateId;

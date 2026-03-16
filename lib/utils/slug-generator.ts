/**
 * Slug Generator Utility
 * Converts any text to URL-friendly slug format
 * Handles Vietnamese characters with diacritical marks, special characters, spaces, etc.
 */

/**
 * Generate slug from title/name
 * Removes diacritical marks, special characters, converts to lowercase, replaces spaces with hyphens
 * @param text - Input text to convert to slug
 * @returns URL-friendly slug (max 150 chars)
 * @example
 * generateSlug("Thiết kế Logo") // → "thiet-ke-logo"
 * generateSlug("Print Hustlers & Co.") // → "print-hustlers-co"
 */
export function generateSlug(text: string): string {
	if (!text || typeof text !== "string") return "";

	return text
		.trim()
		.toLowerCase()
		.normalize("NFD") // Decompose unicode characters (é → e + ´)
		.replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
		.replace(/[^a-z0-9\s-]/g, "") // Remove special characters, keep only alphanumeric, spaces, hyphens
		.replace(/\s+/g, "-") // Replace multiple spaces with single hyphen
		.replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
		.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
		.substring(0, 150); // Limit to 150 chars
}

/**
 * Validate slug format
 * Returns true if slug matches the format produced by generateSlug
 * @param slug - Slug to validate
 * @returns True if slug is valid
 */
export function isValidSlug(slug: string): boolean {
	// Slug should only contain lowercase alphanumeric and hyphens
	// No leading/trailing hyphens, no multiple consecutive hyphens
	return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug);
}

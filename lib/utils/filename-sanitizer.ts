/**
 * Sanitize filename by removing spaces, special characters, and unicode
 * Keeps only alphanumeric, hyphens, and underscores
 *
 * Examples:
 * - "Print Hustlers 2025.jpg" → "PrintHustlers2025.jpg"
 * - "Thiết kế logo.png" → "Thitklogo.png"
 * - "logo-design (final).png" → "logo-design-final.png"
 */
export function sanitizeFilename(filename: string): string {
	// Split filename and extension
	const lastDotIndex = filename.lastIndexOf(".");
	const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex).toLowerCase() : "";
	const nameWithoutExt = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;

	// Sanitize the name part
	const sanitized = nameWithoutExt
		.normalize("NFD") // Decompose unicode characters (é → e + ´)
		.replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
		.replace(/[^a-zA-Z0-9_-]/g, "") // Keep only alphanumeric, underscore, hyphen
		.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single
		.substring(0, 100); // Limit to 100 chars to avoid too long filenames

	// If sanitized is empty, use a default name
	const cleanName = sanitized || "file";

	return `${cleanName}${extension}`;
}

/**
 * Generate a unique filename with timestamp and random string
 */
export function generateUniqueFilename(originalFilename: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const extension = originalFilename.includes(".") ? "." + originalFilename.split(".").pop()!.toLowerCase() : "";
	const cleanName = sanitizeFilename(originalFilename.replace(extension, ""));

	return `${cleanName}-${timestamp}-${random}${extension}`;
}

/**
 * Test cases for filename sanitization
 */
export const SANITIZE_TEST_CASES = [
	{
		input: "Print Hustlers 2025.jpg",
		expected: "PrintHustlers2025.jpg",
		description: "Remove spaces",
	},
	{
		input: "Thiết kế logo.png",
		expected: "Thitklogo.png",
		description: "Remove Vietnamese diacritics",
	},
	{
		input: "设计文件.psd",
		expected: ".psd",
		description: "Remove Chinese characters",
	},
	{
		input: "logo-design (final).png",
		expected: "logo-design-final.png",
		description: "Remove special characters",
	},
	{
		input: "file!!!###@@@.txt",
		expected: "file.txt",
		description: "Remove special characters",
	},
	{
		input: "café_résumé.pdf",
		expected: "cafe_resume.pdf",
		description: "Remove accents",
	},
	{
		input: "---file---.doc",
		expected: "file.doc",
		description: "Remove multiple leading/trailing hyphens",
	},
	{
		input: "a very long filename with many words that should be truncated to reasonable length.txt",
		expected: "averylongfilenamewithmanywordsthatshouldbetrun.txt",
		description: "Truncate to reasonable length",
	},
];

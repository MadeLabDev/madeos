import { Metadata } from "next";

import { generateCrudMetadata } from "./metadata";

/**
 * Create metadata for a list or detail page
 * @param title - The page title (e.g., "Contacts", "Users")
 * @returns Metadata object
 */
export function createPageMetadata(title: string): Metadata {
	return generateCrudMetadata(title);
}

/**
 * Type for list page search parameters
 * Use for consistent searchParams typing across all list pages
 */
export type ListPageSearchParams = Promise<{
	page?: string;
	search?: string;
	pageSize?: string;
	[key: string]: string | undefined;
}>;

/**
 * Type for detail page params
 * Use for consistent params typing across all detail pages
 */
export type DetailPageParams = Promise<{
	id: string;
}>;

/**
 * Shared action types for server actions across all features
 * Use this instead of defining ActionResult in individual features
 */

/**
 * Standard result type for server actions
 * @template T - The type of data returned on success
 */
export interface ActionResult<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
	error?: string;
}

/**
 * Pagination parameters for list actions
 */
export interface PaginationParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

/**
 * Paginated response wrapper
 * @template T - The type of items in the data array
 */
export interface PaginatedResult<T = unknown> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/**
 * Bulk operation result for mass actions
 */
export interface BulkOperationResult<T = unknown> {
	totalCount: number;
	successCount: number;
	failureCount: number;
	skipCount?: number;
	results: {
		item: T;
		success: boolean;
		message: string;
	}[];
}

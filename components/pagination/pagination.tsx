"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export interface PaginationProps {
	/** Current page number (1-indexed) */
	page: number;
	/** Total items count */
	total: number;
	/** Items per page */
	pageSize?: number;
	/** Current search query (optional) */
	search?: string;
	/** Item name for display (e.g., "users", "pantones", "orders") */
	itemName?: string;
	/** Base URL for pagination links (e.g., "/users", "/pantones") */
	baseUrl: string;
	/** Whether to use Link (default) or router.push */
	useRouter?: boolean;
	/** Type parameter for filtering */
	type?: string;
	/** Additional query parameters */
	customerId?: string;
	status?: string;
}

export function Pagination({ page, total, pageSize = 20, search, itemName = "items", baseUrl, useRouter: useRouterMode = false, type, customerId, status }: PaginationProps) {
	const router = useRouter();

	// Calculate pagination info
	const currentPage = page || 1;
	const pageCount = Math.ceil(total / pageSize);
	const hasNextPage = currentPage < pageCount;
	const hasPrevPage = currentPage > 1;

	// Calculate item range
	const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(currentPage * pageSize, total);

	// Build URL with search params
	const buildUrl = (newPage: number) => {
		// Check if baseUrl already has query params
		const separator = baseUrl.includes("?") ? "&" : "?";
		let result = `${baseUrl}${separator}page=${newPage}`;
		if (type) {
			result += `&type=${encodeURIComponent(type)}`;
		}
		if (search) {
			result += `&search=${encodeURIComponent(search)}`;
		}
		if (pageSize && pageSize !== 20) {
			result += `&pageSize=${pageSize}`;
		}
		if (customerId) {
			result += `&customerId=${encodeURIComponent(customerId)}`;
		}
		if (status) {
			result += `&status=${encodeURIComponent(status)}`;
		}
		return result;
	};

	// Handle navigation
	const handlePrevious = () => {
		if (useRouterMode && hasPrevPage) {
			router.push(buildUrl(currentPage - 1));
		}
	};

	const handleNext = () => {
		if (useRouterMode && hasNextPage) {
			router.push(buildUrl(currentPage + 1));
		}
	};

	return (
		<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			{/* Item counter */}
			<div className="text-center text-sm text-gray-600 sm:text-left">
				Showing {total === 0 ? 0 : startItem} to {endItem} of {total} {itemName}
			</div>

			{/* Navigation buttons */}
			<div className="flex justify-center gap-2 sm:justify-end">
				{hasPrevPage &&
					(useRouterMode ? (
						<Button
							variant="outline"
							size="sm"
							onClick={handlePrevious}
							className="gap-1 sm:gap-2">
							<ChevronLeft className="h-4 w-4" />
							<span className="xs:inline hidden">Previous</span>
						</Button>
					) : (
						<Link href={buildUrl(currentPage - 1)}>
							<Button
								variant="outline"
								size="sm"
								className="gap-1 sm:gap-2">
								<ChevronLeft className="h-4 w-4" />
								<span className="xs:inline hidden">Previous</span>
							</Button>
						</Link>
					))}

				{hasNextPage &&
					(useRouterMode ? (
						<Button
							variant="outline"
							size="sm"
							onClick={handleNext}
							className="gap-1 sm:gap-2">
							<span className="xs:inline hidden">Next</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
					) : (
						<Link href={buildUrl(currentPage + 1)}>
							<Button
								variant="outline"
								size="sm"
								className="gap-1 sm:gap-2">
								<span className="xs:inline hidden">Next</span>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</Link>
					))}
			</div>
		</div>
	);
}

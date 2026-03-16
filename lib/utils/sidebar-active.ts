import type { SidebarMenuItem } from "@/lib/config/sidebar-menu";

/**
 * Kiểm tra xem một menu item có active hay không
 * @param item Menu item cần kiểm tra
 * @param pathname URL path hiện tại
 * @param searchParams Query parameters hiện tại
 * @returns true nếu menu item là active
 */
export function isMenuItemActive(item: SidebarMenuItem, pathname: string, searchParams?: string): boolean {
	const currentPath = pathname + (searchParams ? "?" + searchParams : "");

	// 1. Exact match with href (including query)
	if (currentPath === item.href) return true;

	// 2. Check matchPaths if available
	if (item.matchPaths && item.matchPaths.length > 0) {
		for (const pattern of item.matchPaths) {
			if (isPathMatching(currentPath, pattern)) {
				return true;
			}
		}
	}

	// 3. For items with # href (parent items), check children
	if (item.href.startsWith("#")) {
		if (item.children && item.children.length > 0) {
			return item.children.some((child) => isMenuItemActive(child, pathname, searchParams));
		}
		return false;
	}

	// 4. Skip fallback logic if explicit matchPaths are defined
	// Items with matchPaths should be matched ONLY by those patterns
	if (item.matchPaths && item.matchPaths.length > 0) {
		return false;
	}

	const itemPath = item.href.split("?")[0] || "";
	const itemQuery = item.href.split("?")[1] || "";

	// If item has query, both path and query must match
	if (itemQuery && !currentPath.includes(itemQuery)) {
		return false;
	}

	// Check path match
	if (itemPath && pathname.startsWith(itemPath)) {
		// For exact path match only (not sub-paths)
		// This prevents /customers from matching /contact
		const pathParts = itemPath.split("/").filter(Boolean);
		const currentParts = pathname.split("/").filter(Boolean);

		// Allow match if paths are same depth or child has more parts
		// Example: /customers matches /customers, /customers/123, etc.
		if (currentParts.slice(0, pathParts.length).join("/") === pathParts.join("/")) {
			return true;
		}
	}

	return false;
}

/**
 * Kiểm tra xem một menu item hoặc bất kỳ child của nó có active hay không
 * @param item Menu item cần kiểm tra
 * @param pathname URL path hiện tại
 * @param searchParams Query parameters hiện tại
 * @returns true nếu item hoặc child nào đó active
 */
export function isMenuItemOrChildActive(item: SidebarMenuItem, pathname: string, searchParams?: string): boolean {
	// Check if item itself is active
	if (isMenuItemActive(item, pathname, searchParams)) {
		return true;
	}

	// Check if any child is active
	if (item.children && item.children.length > 0) {
		return item.children.some((child) => isMenuItemOrChildActive(child, pathname, searchParams));
	}

	return false;
}

/**
 * Helper function để match path với pattern
 * Hỗ trợ cả exact match và wildcard match
 * @param path Path hiện tại (có thể có query)
 * @param pattern Pattern để match (có thể có query)
 * @returns true nếu match
 */
function isPathMatching(path: string, pattern: string): boolean {
	// Exact match
	if (path === pattern) return true;

	// Pattern with query: extract both
	const [patternPath, patternQuery] = pattern.split("?");
	const [currentPath, currentQuery] = path.split("?");

	// If pattern has query, current query must match (support wildcards)
	if (patternQuery) {
		if (!currentQuery) return false;

		// Support wildcard matching in query parameters
		const patternQueryRegex = patternQuery.replace(/\*/g, ".*");
		const regex = new RegExp("^" + patternQueryRegex + "$");
		if (!regex.test(currentQuery)) {
			return false;
		}
	}

	// Path matching: support * wildcard and :id placeholder
	// * → .* (matches anything)
	// :id → cuid format (c followed by exactly 24 alphanumeric chars = 25 chars total)
	const regexPattern = (patternPath || "").replace(/\*/g, ".*").replace(/:id/g, "c[a-z0-9]{24}");
	const regex = new RegExp("^" + regexPattern + "$");
	return regex.test(currentPath || "");
}

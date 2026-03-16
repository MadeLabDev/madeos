import { describe, expect,it } from "vitest";

import type { SidebarMenuItem } from "@/lib/config/sidebar-menu";
import { isMenuItemActive, isMenuItemOrChildActive } from "@/lib/utils/sidebar-active";

describe("Sidebar Active State Detection", () => {
	const createMenuItem = (href: string, matchPaths?: string[]): SidebarMenuItem => ({
		label: "Test",
		href,
		icon: () => null as any,
		matchPaths,
	});

	const createParentMenuItem = (
		href: string,
		children: SidebarMenuItem[],
		matchPaths?: string[]
	): SidebarMenuItem => ({
		label: "Parent",
		href,
		icon: () => null as any,
		children,
		matchPaths,
	});

	describe("isMenuItemActive", () => {
		it("should match exact href", () => {
			const item = createMenuItem("/dashboard");
			expect(isMenuItemActive(item, "/dashboard")).toBe(true);
		});

		it("should match href with query parameters", () => {
			const item = createMenuItem("/customers?type=customer");
			expect(isMenuItemActive(item, "/customers", "type=customer")).toBe(true);
		});

		it("should not match different paths", () => {
			const item = createMenuItem("/dashboard");
			expect(isMenuItemActive(item, "/contacts")).toBe(false);
		});

		it("should match using matchPaths", () => {
			const item = createMenuItem("/post?type=blog", [
				"/post?type=blog",
				"/post/categories?type=blog",
			]);
			expect(isMenuItemActive(item, "/post/categories", "type=blog")).toBe(true);
		});

		it("should support wildcard in matchPaths", () => {
			const item = createMenuItem("/customers", ["/customers?type=*"]);
			expect(isMenuItemActive(item, "/customers", "type=partner")).toBe(true);
			expect(isMenuItemActive(item, "/customers", "type=vendor")).toBe(true);
		});

		it("should match parent items with # href by checking children", () => {
			const child = createMenuItem("/customers?type=customer");
			const parent = createParentMenuItem("#customers", [child]);
			expect(isMenuItemActive(parent, "/customers", "type=customer")).toBe(true);
		});

		it("should match path starting with base path", () => {
			const item = createMenuItem("/customers");
			expect(isMenuItemActive(item, "/customers")).toBe(true);
			expect(isMenuItemActive(item, "/customers/123")).toBe(true);
			expect(isMenuItemActive(item, "/customers/123/edit")).toBe(true);
		});

		it("should not match similar but different paths", () => {
			const item = createMenuItem("/customers");
			expect(isMenuItemActive(item, "/contact")).toBe(false);
			expect(isMenuItemActive(item, "/customersapi")).toBe(false);
		});
	});

	describe("isMenuItemOrChildActive", () => {
		it("should return true if item itself is active", () => {
			const item = createMenuItem("/dashboard");
			expect(isMenuItemOrChildActive(item, "/dashboard")).toBe(true);
		});

		it("should return true if any child is active", () => {
			const child1 = createMenuItem("/knowledge/123");
			const child2 = createMenuItem("/knowledge/456");
			const parent = createParentMenuItem("#knowledge", [child1, child2]);

			expect(isMenuItemOrChildActive(parent, "/knowledge/123")).toBe(true);
			expect(isMenuItemOrChildActive(parent, "/knowledge/456")).toBe(true);
		});

		it("should return true for nested children", () => {
			const grandchild = createMenuItem("/post/categories?type=blog");
			const child = createParentMenuItem("/post?type=blog", [grandchild]);
			const parent = createParentMenuItem("#blog", [child]);

			expect(isMenuItemOrChildActive(parent, "/post/categories", "type=blog")).toBe(true);
		});

		it("should return false if item and children are not active", () => {
			const child = createMenuItem("/knowledge");
			const parent = createParentMenuItem("#knowledge", [child]);
			expect(isMenuItemOrChildActive(parent, "/customers")).toBe(false);
		});
	});

	describe("Real-world scenarios", () => {
		it("should handle Business Ecosystem menu", () => {
			const customers = createMenuItem("/customers?type=customer", [
				"/customers",
				"/customers?type=customer",
			]);
			const partners = createMenuItem("/customers?type=partner", [
				"/customers?type=partner",
			]);
			const vendors = createMenuItem("/customers?type=vendor", [
				"/customers?type=vendor",
			]);

			const parent = createParentMenuItem(
				"#customers",
				[customers, partners, vendors],
				[
					"/customers",
					"/customers?type=*",
					"/contacts",
					"/opportunities",
					"/engagements",
					"/interactions",
				]
			);

			// Navigating to customers
			expect(isMenuItemActive(customers, "/customers", "type=customer")).toBe(true);
			expect(isMenuItemOrChildActive(parent, "/customers", "type=customer")).toBe(true);

			// Navigating to partners
			expect(isMenuItemActive(partners, "/customers", "type=partner")).toBe(true);
			expect(isMenuItemOrChildActive(parent, "/customers", "type=partner")).toBe(true);

			// Navigating to contacts (should still activate parent)
			expect(isMenuItemActive(parent, "/contacts")).toBe(true);
		});

		it("should handle Knowledge Base menu", () => {
			const articles = createMenuItem("/knowledge");
			const categories = createMenuItem("/knowledge/categories");
			const tags = createMenuItem("/knowledge/tags");

			const parent = createParentMenuItem(
				"#training-knowledge",
				[articles, categories, tags],
				["/course", "/knowledge", "/knowledge/categories", "/knowledge/tags"]
			);

			expect(isMenuItemOrChildActive(parent, "/knowledge")).toBe(true);
			expect(isMenuItemOrChildActive(parent, "/knowledge/123")).toBe(true);
			expect(isMenuItemOrChildActive(parent, "/knowledge/categories")).toBe(true);
			expect(isMenuItemOrChildActive(parent, "/course")).toBe(true);
		});

		it("should handle Sponsors with query parameters", () => {
			const list = createMenuItem("/post?type=sponsor");
			const categories = createMenuItem("/post/categories?type=sponsor");
			const tags = createMenuItem("/post/tags?type=sponsor");

			const parent = createParentMenuItem(
				"/post?type=sponsor",
				[list, categories, tags],
				[
					"/?type=sponsor",
					"/post?type=sponsor",
					"/post/categories?type=sponsor",
					"/post/tags?type=sponsor",
				]
			);

			expect(isMenuItemActive(parent, "/post", "type=sponsor")).toBe(true);
			expect(isMenuItemActive(parent, "/post/categories", "type=sponsor")).toBe(true);
			expect(isMenuItemActive(parent, "/post/tags", "type=sponsor")).toBe(true);

			// Should not match different type
			expect(isMenuItemActive(parent, "/post", "type=blog")).toBe(false);
		});
	});
});

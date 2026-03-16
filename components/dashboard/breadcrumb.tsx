"use client";

import React from "react";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Breadcrumb as BreadcrumbUI, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/lib/contexts/breadcrumb-context";

const ROUTE_LABELS: Record<string, string> = {
	dashboard: "Dashboard",
	orders: "Orders",
	customers: "Customers",
	inventory: "Inventory",
	design: "Design",
	shipping: "Shipping",
	reports: "Reports",
	settings: "Settings",
	users: "Users",
	roles: "Roles",
	shirts: "Shirts",
	sizes: "Sizes",
	colors: "Colors",
	brands: "Brands",
	course: "Course",
	new: "New",
	edit: "Edit",
	meta: "Meta",
	marketing: "Marketing",
	microsites: "Microsites",
	sponsors: "Sponsors",
	"module-types": "Module Types",
	"module-instances": "Module Instances",
	"user-groups": "User Groups",
	"test-management": "Testing x Development",
	"training-support": "Training x Support",
	"design-projects": "Design x Development",
	events: "Events x Education",
};

// Convert kebab-case to Title Case
const kebabToTitleCase = (str: string): string => {
	return str
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export function Breadcrumb() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const segments = pathname.split("/").filter((segment) => segment);
	const { overrides } = useBreadcrumb();

	// Don't show breadcrumb on home page
	if (segments.length === 0) {
		return null;
	}

	const buildBreadcrumbs = () => {
		const breadcrumbs: Array<{
			label: string;
			href: string;
			icon?: typeof Home;
		}> = [
			{
				label: "",
				href: "/",
				icon: Home,
			},
		];

		// Handle special case: /shirts/[type]/[id]/edit
		if (segments[0] === "shirts" && segments.length >= 3) {
			const type = segments[1] || "";
			const itemId = segments[2] || "";
			const isEditPage = segments[segments.length - 1] === "edit";

			// Add "Shirts" link
			breadcrumbs.push({
				label: "Shirts",
				href: "/shirts",
			});

			// Add type link with query string (e.g., /shirts?type=sizes)
			const typeLabel = ROUTE_LABELS[type] || type;
			breadcrumbs.push({
				label: typeLabel,
				href: `/shirts?type=${type}`,
			});

			// Add item name if override exists (non-clickable)
			const itemOverride = overrides.find((o) => o.segment === itemId);
			if (itemOverride) {
				breadcrumbs.push({
					label: itemOverride.label,
					href: "#", // Non-clickable
				});
			}

			// Add Edit label if edit page (non-clickable)
			if (isEditPage) {
				breadcrumbs.push({
					label: "Edit",
					href: "#", // Non-clickable
				});
			}

			return breadcrumbs;
		}

		// Handle special case: /post/* routes with type parameter
		if (segments[0] === "post") {
			const type = searchParams.get("type") || "blog";
			const typeLabel = type === "blog" ? "Blog Posts" : `${type.charAt(0).toUpperCase() + type.slice(1)} Posts`;
			const typeQuery = type === "blog" ? "" : `?type=${type}`;

			// Add "Posts" link with type
			breadcrumbs.push({
				label: typeLabel,
				href: `/post${typeQuery}`,
			});

			// Handle sub-routes
			if (segments[1] === "categories") {
				const categoryLabel = type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`;
				breadcrumbs.push({
					label: categoryLabel,
					href: `/post/categories${typeQuery}`,
				});

				if (segments[2] && segments[2] !== "new") {
					// Category detail or edit
					const categoryId = segments[2];
					const categoryOverride = overrides.find((o) => o.segment === categoryId);
					if (categoryOverride) {
						breadcrumbs.push({
							label: categoryOverride.label,
							href: `/post/categories/${categoryId}${typeQuery}`,
						});
					}

					if (segments[3] === "edit") {
						breadcrumbs.push({
							label: "Edit",
							href: "#", // Non-clickable
						});
					}
				} else if (segments[2] === "new") {
					breadcrumbs.push({
						label: "Create New Category",
						href: "#", // Non-clickable
					});
				}
			} else if (segments[1] === "tags") {
				const tagLabel = type === "blog" ? "Blog Tags" : `${type.charAt(0).toUpperCase() + type.slice(1)} Tags`;
				breadcrumbs.push({
					label: tagLabel,
					href: `/post/tags${typeQuery}`,
				});

				if (segments[2] && segments[2] !== "new") {
					// Tag detail or edit
					const tagId = segments[2];
					const tagOverride = overrides.find((o) => o.segment === tagId);
					if (tagOverride) {
						breadcrumbs.push({
							label: tagOverride.label,
							href: `/post/tags/${tagId}${typeQuery}`,
						});
					}

					if (segments[3] === "edit") {
						breadcrumbs.push({
							label: "Edit",
							href: "#", // Non-clickable
						});
					}
				} else if (segments[2] === "new") {
					breadcrumbs.push({
						label: "Create New Tag",
						href: "#", // Non-clickable
					});
				}
			} else if (segments[1] === "new") {
				breadcrumbs.push({
					label: "Create New Post",
					href: "#", // Non-clickable
				});
			} else if (segments[1] && segments[1] !== "new") {
				// Post detail or edit
				const postId = segments[1];
				const postOverride = overrides.find((o) => o.segment === postId);
				if (postOverride) {
					breadcrumbs.push({
						label: postOverride.label,
						href: `/post/${postId}${typeQuery}`,
					});
				}

				if (segments[2] === "edit") {
					breadcrumbs.push({
						label: "Edit",
						href: "#", // Non-clickable
					});
				}
			}

			return breadcrumbs;
		}

		// Default logic for other routes
		let currentPath = "";
		segments.forEach((segment) => {
			currentPath += `/${segment}`;

			// Check if there's an override for this segment
			const override = overrides.find((o) => o.segment === segment);
			const baseLabel = override ? override.label : ROUTE_LABELS[segment] || kebabToTitleCase(segment);

			breadcrumbs.push({
				label: baseLabel,
				href: currentPath,
			});
		});

		return breadcrumbs;
	};

	const breadcrumbs = buildBreadcrumbs();

	return (
		<BreadcrumbUI>
			<BreadcrumbList>
				{breadcrumbs.map((crumb, index) => {
					const isLast = index === breadcrumbs.length - 1;
					const Icon = crumb.icon;
					const isNonClickable = crumb.href === "#";

					return (
						<React.Fragment key={`${crumb.href}-${index}`}>
							<BreadcrumbItem>
								{isLast || isNonClickable ? (
									<BreadcrumbPage className="flex items-center gap-1">
										{Icon && <Icon className="h-4 w-4" />}
										{crumb.label}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link
											href={crumb.href}
											className="flex items-center gap-1">
											{Icon && <Icon className="h-4 w-4" />}
											{crumb.label}
										</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast && (
								<BreadcrumbSeparator>
									<ChevronRight className="h-4 w-4" />
								</BreadcrumbSeparator>
							)}
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</BreadcrumbUI>
	);
}

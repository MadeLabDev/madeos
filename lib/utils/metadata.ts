import type { Metadata } from "next";

/**
 * Application metadata configuration
 */
export const APP_CONFIG = {
	name: "MADE Laboratory",
	description: "Business management system",
	url: process.env.NEXT_PUBLIC_APP_URL || "https://app.madelab.io",
	ogImage: "/og-image.jpg",
	twitterHandle: "@madelab",
} as const;

/**
 * Page metadata templates for consistent formatting
 */
export const METADATA_TEMPLATES = {
	default: {
		title: {
			default: APP_CONFIG.name,
			template: `%s | ${APP_CONFIG.name}`,
		},
		description: APP_CONFIG.description,
		keywords: ["business management", "shop management", "customers"],
		creator: "MadeLab",
		publisher: "MadeLab",
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		metadataBase: new URL(APP_CONFIG.url),
		openGraph: {
			type: "website",
			locale: "en_US",
			siteName: APP_CONFIG.name,
			images: [
				{
					url: APP_CONFIG.ogImage,
					width: 1200,
					height: 630,
					alt: APP_CONFIG.name,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: APP_CONFIG.name,
			description: APP_CONFIG.description,
			images: [APP_CONFIG.ogImage],
			creator: APP_CONFIG.twitterHandle,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large" as const,
				"max-snippet": -1,
			},
		},
	},

	dashboard: {
		title: {
			default: `Dashboard | ${APP_CONFIG.name}`,
			template: `%s | ${APP_CONFIG.name}`,
		},
		description: "Dashboard overview and management tools",
	},

	auth: {
		title: {
			default: `Authentication | ${APP_CONFIG.name}`,
			template: `%s | ${APP_CONFIG.name}`,
		},
		description: "Secure login and account management",
		robots: {
			index: false,
			follow: false,
		},
	},
};

/**
 * Generate consistent metadata for pages
 */
export function generatePageMetadata(pageTitle?: string, pageDescription?: string, options: Partial<Metadata> = {}): Metadata {
	const baseMetadata = METADATA_TEMPLATES.default;

	return {
		...baseMetadata,
		title: pageTitle
			? {
					default: pageTitle,
					template: baseMetadata.title.template,
				}
			: baseMetadata.title,
		description: pageDescription || baseMetadata.description,
		...options,
	};
}

/**
 * Generate metadata for dashboard pages
 */
export function generateDashboardMetadata(pageTitle?: string, pageDescription?: string, options: Partial<Metadata> = {}): Metadata {
	const dashboardBase = METADATA_TEMPLATES.dashboard;

	return {
		...METADATA_TEMPLATES.default,
		...dashboardBase,
		title: pageTitle
			? {
					default: pageTitle,
					template: dashboardBase.title.template,
				}
			: dashboardBase.title,
		description: pageDescription || dashboardBase.description,
		...options,
	};
}

/**
 * Generate metadata for authentication pages
 */
export function generateAuthMetadata(pageTitle?: string, pageDescription?: string, options: Partial<Metadata> = {}): Metadata {
	const authBase = METADATA_TEMPLATES.auth;

	return {
		...METADATA_TEMPLATES.default,
		...authBase,
		title: pageTitle
			? {
					default: pageTitle,
					template: authBase.title.template,
				}
			: authBase.title,
		description: pageDescription || authBase.description,
		...options,
	};
}

/**
 * Generate metadata for CRUD pages (list, create, edit, view)
 */
export function generateCrudMetadata(entityName: string, action?: "list" | "create" | "edit" | "view", entityTitle?: string, options: Partial<Metadata> = {}): Metadata {
	const actionLabels = {
		list: `${entityName}`,
		create: `Add ${entityName.slice(0, -1)}`,
		edit: `Edit ${entityTitle || entityName.slice(0, -1)}`,
		view: `View ${entityTitle || entityName.slice(0, -1)}`,
	};

	const descriptions = {
		list: `Manage ${entityName.toLowerCase()} and their information`,
		create: `Create a new ${entityName.slice(0, -1).toLowerCase()}`,
		edit: `Edit ${entityTitle || entityName.slice(0, -1).toLowerCase()} information`,
		view: `View ${entityTitle || entityName.slice(0, -1).toLowerCase()} details`,
	};

	const pageTitle = action ? actionLabels[action] : entityName;
	const pageDescription = action ? descriptions[action] : `Manage ${entityName.toLowerCase()}`;

	return generateDashboardMetadata(pageTitle, pageDescription, options);
}

/**
 * Generate metadata for error pages
 */
export function generateErrorMetadata(errorCode: number, errorTitle: string, errorDescription: string, options: Partial<Metadata> = {}): Metadata {
	return {
		...METADATA_TEMPLATES.default,
		title: `${errorCode} - ${errorTitle} | ${APP_CONFIG.name}`,
		description: errorDescription,
		robots: {
			index: false,
			follow: false,
		},
		...options,
	};
}

/**
 * Format post type name for display
 * Converts "blog" -> "Blog", "sponsor" -> "Sponsor", etc.
 */
export function formatPostTypeName(type: string): string {
	if (type === "blog") return "Blog";
	return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format customer type name for display
 * Converts "customer" -> "Customer", "partner" -> "Partner", etc.
 */
export function formatCustomerTypeName(type: string): string {
	return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Get post type display names for UI elements
 */
export function getPostTypeLabels(type: string) {
	const formattedType = formatPostTypeName(type);

	return {
		// Formatted type name
		formattedType,

		// Page titles
		createTitle: `Create New ${formattedType}`,
		editTitle: `Edit ${formattedType}`,

		// Button labels
		createButton: `Create ${formattedType}`,
		updateButton: `Update ${formattedType}`,
		publishLabel: `Publish this ${formattedType.toLowerCase()}`,

		// Descriptions
		createDescription: `Add a new ${formattedType.toLowerCase()} post`,
		editDescription: (title: string) => `Updating: ${title}`,

		// Breadcrumb labels
		createBreadcrumb: `Create New ${formattedType}`,
		editBreadcrumb: "Edit",

		// Page titles for metadata
		postsTitle: type === "blog" ? "Blog Posts" : `${formattedType} Posts`,

		// Form placeholders and messages
		titlePlaceholder: `${formattedType} title`,
		noItemsFound: `No ${formattedType.toLowerCase()}s found`,
		manageDescription: `Manage ${formattedType.toLowerCase()} posts and articles`,

		// Dialog titles
		deleteTitle: `Delete ${formattedType}`,
		deleteError: `Failed to delete ${formattedType.toLowerCase()}`,
		bulkDeleteError: `Failed to delete ${formattedType.toLowerCase()}s`,
		deleteSuccess: `${formattedType} deleted successfully`,
		bulkDeleteSuccess: (count: number) => `${count} ${formattedType.toLowerCase()}s deleted successfully`,
	};
}

/**
 * Get customer type display names for UI elements
 */
export function getCustomerTypeLabels(type: string) {
	const formattedType = formatCustomerTypeName(type);

	return {
		// Formatted type name
		formattedType,

		// Page titles
		createTitle: `Create New ${formattedType}`,
		editTitle: `Edit ${formattedType}`,

		// Button labels
		createButton: `Create ${formattedType}`,
		updateButton: `Update ${formattedType}`,

		// Descriptions
		createDescription: `Add a new ${formattedType.toLowerCase()} account`,
		editDescription: (title: string) => `Updating: ${title}`,

		// Breadcrumb labels
		createBreadcrumb: `Create New ${formattedType}`,
		editBreadcrumb: "Edit",

		// Page titles for metadata
		customersTitle: type === "customer" ? "Customers" : `${formattedType}s`,

		// Form placeholders and messages
		namePlaceholder: `${formattedType} name`,
		noItemsFound: `No ${formattedType.toLowerCase()}s found`,
		manageDescription: `Manage ${formattedType.toLowerCase()} accounts and relationships`,

		// Dialog titles
		deleteTitle: `Delete ${formattedType}`,
		deleteError: `Failed to delete ${formattedType.toLowerCase()}`,
		bulkDeleteError: `Failed to delete ${formattedType.toLowerCase()}s`,
		deleteSuccess: `${formattedType} deleted successfully`,
		bulkDeleteSuccess: (count: number) => `${count} ${formattedType.toLowerCase()}s deleted successfully`,
	};
}

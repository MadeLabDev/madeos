/**
 * Design Search Actions
 * Server actions for searching Design data
 */

"use server";

import { prisma } from "@/lib/prisma";

import { getAllEngagements } from "../../customers/services/customer-service";
import { getAllCustomers } from "../../customers/services/customer-service";
import { getUsers } from "../../users/services/user-service";
import { DesignProjectService, DesignReviewService, ProductDesignService } from "../services";

/**
 * Search design projects by title or description
 */
export async function searchDesignProjects(query: string) {
	try {
		const projects = await DesignProjectService.getDesignProjects(
			{
				search: query || undefined,
			},
			{ take: 10 },
		);

		return {
			success: true,
			data: projects,
		};
	} catch (error) {
		return {
			success: false,
			message: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Search product designs by name or description (filtered by design project)
 */
export async function searchProductDesignsByProject(designProjectId: string, query: string = "", limit: number = 20) {
	try {
		const designs = await ProductDesignService.getProductDesigns(
			{
				designProjectId,
				search: query || undefined,
			},
			{ take: limit },
		);

		return {
			success: true,
			data: designs.map((design) => ({
				value: design.id,
				label: design.name,
				description: `${design.designType} - ${design.status}`,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Search product designs by name or description (all projects)
 */
export async function searchProductDesigns(query: string = "", limit: number = 20) {
	try {
		const designs = await ProductDesignService.getProductDesigns(
			{
				search: query || undefined,
			},
			{ take: limit },
		);

		return {
			success: true,
			data: designs.map((design) => ({
				value: design.id,
				label: design.name,
				description: `${design.designType} - ${design.status}`,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Search media files for selection
 */
export async function searchMediaFiles(query: string = "", limit: number = 20) {
	try {
		const mediaFiles = await prisma.media.findMany({
			where: {
				visibility: "PUBLIC", // Only show public files
				OR: query ? [{ name: { contains: query } }, { type: { contains: query } }] : undefined,
			},
			include: {
				uploadedBy: {
					select: {
						name: true,
						email: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: limit,
		});

		return {
			success: true,
			data: mediaFiles.map((media) => ({
				value: media.id,
				label: media.name,
				description: `${media.type} - ${media.uploadedBy?.name || "Unknown"}`,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to search media files: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Get media files by IDs
 */
export async function getMediaFilesByIds(ids: string[]) {
	try {
		const mediaFiles = await prisma.media.findMany({
			where: {
				id: { in: ids },
			},
			include: {
				uploadedBy: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		});

		return {
			success: true,
			data: mediaFiles.map((media) => ({
				value: media.id,
				label: media.name,
				description: `${media.type} - ${media.uploadedBy?.name || "Unknown"}`,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to get media files: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Get product design by ID for form initialization
 */
export async function getProductDesignForForm(id: string) {
	try {
		const design = await ProductDesignService.getProductDesignById(id);
		if (!design) {
			return {
				success: false,
				message: "Product design not found",
			};
		}

		return {
			success: true,
			data: design,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch product design: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get product designs by IDs
 */
export async function getProductDesignsByIds(ids: string[]) {
	try {
		const designs = await ProductDesignService.getProductDesignsByIds(ids);
		return {
			success: true,
			data: designs.map((design) => ({
				value: design.id,
				label: design.name,
				description: `${design.designType} - ${design.status}`,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to get product designs: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Search reviews by feedback or reviewer name
 */
export async function searchDesignReviews(query: string) {
	try {
		const reviews = await DesignReviewService.getDesignReviews(
			{
				search: query || undefined,
			},
			{ take: 10 },
		);

		return {
			success: true,
			data: reviews,
		};
	} catch (error) {
		return {
			success: false,
			message: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Search engagements for selection (filtered by DESIGN type)
 */
export async function searchEngagements(query: string = "", limit: number = 20) {
	try {
		const result = await getAllEngagements({
			search: query || undefined,
			pageSize: limit,
		});

		// Filter for DESIGN type engagements only
		const designEngagements = result.engagements.filter((engagement) => engagement.type === "DESIGN");

		return {
			success: true,
			data: designEngagements.map((engagement) => ({
				value: engagement.id,
				label: engagement.title,
				description: `${engagement.customer?.companyName || "Unknown"} - ${engagement.description?.slice(0, 50)}${engagement.description && engagement.description.length > 50 ? "..." : ""}`,
				customer: engagement.customer,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to search engagements: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Search users for selection
 */
export async function searchUsers(query: string = "", limit: number = 20) {
	try {
		const result = await getUsers({
			search: query || undefined,
			pageSize: limit,
		});

		return {
			success: true,
			data: result.users.map((user) => ({
				value: user.id,
				label: user.name || user.email,
				description: user.email,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to search users: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Search customers for selection
 */
export async function searchCustomers(query: string = "", limit: number = 20) {
	try {
		const result = await getAllCustomers({
			search: query || undefined,
			pageSize: limit,
		});

		return {
			success: true,
			data: result.customers.map((customer) => ({
				value: customer.id,
				label: customer.companyName,
				description: customer.email,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to search customers: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

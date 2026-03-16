"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

import { SponsorMaterialService } from "../services";
import { CreateSponsorMaterialInput, SponsorMaterial, SponsorMaterialFilters, UpdateSponsorMaterialInput } from "../types/index";

const sponsorMaterialService = new SponsorMaterialService();

/**
 * Create a new sponsor material
 */
export async function createSponsorMaterialAction(data: CreateSponsorMaterialInput): Promise<ActionResult<SponsorMaterial>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);

	// Validate that the user exists in the database
	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true },
	});

	if (!userExists) {
		console.error("User not found in database:", session.user.id);

		// In development mode, try to find a valid user as fallback
		if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
			console.log("Dev mode: trying to find a valid user as fallback");
			const fallbackUser = await prisma.user.findFirst({
				select: { id: true, email: true },
			});

			if (fallbackUser) {
				console.log("Using fallback user:", fallbackUser);
				return await sponsorMaterialService.createMaterial(data, fallbackUser.id);
			}
		}

		return {
			success: false,
			message: "User not found",
		};
	}

	return await sponsorMaterialService.createMaterial(data, session.user.id);
}

/**
 * Get material by ID
 */
export async function getSponsorMaterialByIdAction(id: string): Promise<ActionResult<SponsorMaterial | null>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return await sponsorMaterialService.getMaterialById(id);
}

/**
 * Get materials by event ID
 */
export async function getSponsorMaterialsByEventIdAction(eventId: string): Promise<ActionResult<SponsorMaterial[]>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return await sponsorMaterialService.getMaterialsByEventId(eventId);
}

/**
 * Get materials by sponsor ID
 */
export async function getSponsorMaterialsBySponsorIdAction(sponsorId: string): Promise<ActionResult<SponsorMaterial[]>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return await sponsorMaterialService.getMaterialsBySponsorId(sponsorId);
}

/**
 * Get all materials with pagination and filters
 */
export async function getSponsorMaterialsAction(filters: SponsorMaterialFilters = {}, page: number = 1, limit: number = 20): Promise<ActionResult<{ materials: SponsorMaterial[]; total: number }>> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Authentication required",
			};
		}

		return await sponsorMaterialService.getMaterials(filters, page, limit);
	} catch (error) {
		console.error("Error in getSponsorMaterialsAction:", error);
		return {
			success: false,
			message: "Failed to retrieve sponsor materials",
		};
	}
}

/**
 * Get overdue materials
 */
export async function getOverdueSponsorMaterialsAction(): Promise<ActionResult<SponsorMaterial[]>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return await sponsorMaterialService.getOverdueMaterials();
}

/**
 * Update material
 */
export async function updateSponsorMaterialAction(id: string, data: UpdateSponsorMaterialInput): Promise<ActionResult<SponsorMaterial>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);

	// Validate that the user exists in the database
	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true },
	});

	if (!userExists) {
		console.error("User not found in database:", session.user.id);

		// In development mode, try to find a valid user as fallback
		if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
			console.log("Dev mode: trying to find a valid user as fallback");
			const fallbackUser = await prisma.user.findFirst({
				select: { id: true, email: true },
			});

			if (fallbackUser) {
				console.log("Using fallback user:", fallbackUser);
				return await sponsorMaterialService.updateMaterial(id, data, fallbackUser.id);
			}
		}

		return {
			success: false,
			message: "User not found",
		};
	}

	return await sponsorMaterialService.updateMaterial(id, data, session.user.id);
}

/**
 * Update material status
 */
export async function updateSponsorMaterialStatusAction(id: string, status: string, approvedById?: string): Promise<ActionResult<SponsorMaterial>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);

	// Validate that the user exists in the database
	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true },
	});

	if (!userExists) {
		console.error("User not found in database:", session.user.id);

		// In development mode, try to find a valid user as fallback
		if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
			console.log("Dev mode: trying to find a valid user as fallback");
			const fallbackUser = await prisma.user.findFirst({
				select: { id: true, email: true },
			});

			if (fallbackUser) {
				console.log("Using fallback user:", fallbackUser);
				return await sponsorMaterialService.updateStatus(id, status, fallbackUser.id, approvedById);
			}
		}

		return {
			success: false,
			message: "User not found",
		};
	}

	return await sponsorMaterialService.updateStatus(id, status, session.user.id, approvedById);
}

/**
 * Delete material
 */
export async function deleteSponsorMaterialAction(id: string): Promise<ActionResult<SponsorMaterial>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);

	// Validate that the user exists in the database
	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true },
	});

	if (!userExists) {
		console.error("User not found in database:", session.user.id);

		// In development mode, try to find a valid user as fallback
		if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
			console.log("Dev mode: trying to find a valid user as fallback");
			const fallbackUser = await prisma.user.findFirst({
				select: { id: true, email: true },
			});

			if (fallbackUser) {
				console.log("Using fallback user:", fallbackUser);
				return await sponsorMaterialService.deleteMaterial(id);
			}
		}

		return {
			success: false,
			message: "User not found",
		};
	}

	return await sponsorMaterialService.deleteMaterial(id);
}

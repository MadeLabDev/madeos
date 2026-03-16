"use server";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { marketingCampaignService } from "../services";
import { CreateMarketingCampaignInput, MarketingCampaign, MarketingCampaignFilters, UpdateMarketingCampaignInput } from "../types";

/**
 * Create a new marketing campaign
 */
export async function createMarketingCampaignAction(data: CreateMarketingCampaignInput): Promise<ActionResult<MarketingCampaign>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);
	console.log("Session user:", session.user);

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
				const result = await marketingCampaignService.createCampaign(data, fallbackUser.id);
				if (result.success) {
					await broadcastToAll("marketing_campaign_update", {
						action: "marketing_campaign_created",
						campaign: result.data,
						timestamp: new Date().toISOString(),
					});
				}
				return result;
			}
		}

		return {
			success: false,
			message: "User not found in database. Please log in again.",
		};
	}

	console.log("User exists in database:", userExists);

	const result = await marketingCampaignService.createCampaign(data, session.user.id);
	if (result.success) {
		await broadcastToAll("marketing_campaign_update", {
			action: "marketing_campaign_created",
			campaign: result.data,
			timestamp: new Date().toISOString(),
		});
	}
	return result;
}

/**
 * Get campaign by ID
 */
export async function getMarketingCampaignAction(id: string): Promise<MarketingCampaign | null> {
	return marketingCampaignService.getCampaignById(id);
}

/**
 * Get campaigns with filtering and pagination
 */
export async function getMarketingCampaignsAction(filters: MarketingCampaignFilters = {}, page: number = 1, limit: number = 20): Promise<{ campaigns: MarketingCampaign[]; total: number }> {
	try {
		await requirePermission("marketing", "read");
		return await marketingCampaignService.getCampaigns(filters, page, limit);
	} catch (error) {
		console.error("Error getting campaigns:", error);
		return { campaigns: [], total: 0 };
	}
}

/**
 * Update campaign
 */
export async function updateMarketingCampaignAction(id: string, data: UpdateMarketingCampaignInput): Promise<ActionResult<MarketingCampaign>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	const result = await marketingCampaignService.updateCampaign(id, data, session.user.id);
	if (result.success) {
		await broadcastToAll("marketing_campaign_update", {
			action: "marketing_campaign_updated",
			campaign: result.data,
			campaignId: id,
			timestamp: new Date().toISOString(),
		});
	}
	return result;
}

/**
 * Delete campaign
 */
export async function deleteMarketingCampaignAction(id: string): Promise<ActionResult<void>> {
	const result = await marketingCampaignService.deleteCampaign(id);
	if (result.success) {
		await broadcastToAll("marketing_campaign_update", {
			action: "marketing_campaign_deleted",
			campaignId: id,
			timestamp: new Date().toISOString(),
		});
	}
	return result;
}

/**
 * Schedule campaign for sending
 */
export async function scheduleMarketingCampaignAction(id: string, scheduledAt: Date): Promise<ActionResult<MarketingCampaign>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return marketingCampaignService.scheduleCampaign(id, scheduledAt, session.user.id);
}

/**
 * Cancel scheduled campaign
 */
export async function cancelMarketingCampaignAction(id: string): Promise<ActionResult<MarketingCampaign>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return marketingCampaignService.cancelCampaign(id, session.user.id);
}

/**
 * Send campaign immediately
 */
export async function sendMarketingCampaignNowAction(id: string): Promise<ActionResult<MarketingCampaign>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return marketingCampaignService.sendCampaignNow(id, session.user.id);
}

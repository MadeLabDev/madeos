"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { MarketingCampaignService } from "../services/marketing-campaign.service";
import type { CreateMarketingCampaignInput, GetMarketingCampaignsOptions, UpdateMarketingCampaignInput } from "../types/marketing-campaign.types";

/**
 * Get all marketing campaigns with filters and pagination
 */
export async function listMarketingCampaignsAction(options: GetMarketingCampaignsOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("marketing", "read");
		const result = await MarketingCampaignService.getAllMarketingCampaigns(options);
		return { success: true, message: "Marketing campaigns retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single marketing campaign by ID
 */
export async function getMarketingCampaignAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("marketing", "read");
		const campaign = await MarketingCampaignService.getMarketingCampaignById(id);

		if (!campaign) {
			return { success: false, message: "Marketing campaign not found" };
		}

		return { success: true, message: "Marketing campaign retrieved", data: campaign };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new marketing campaign
 */
export async function createMarketingCampaignAction(data: CreateMarketingCampaignInput): Promise<ActionResult> {
	try {
		await requirePermission("marketing", "create");
		const session = await auth();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, message: "Unauthorized" };
		}

		const campaign = await MarketingCampaignService.createMarketingCampaign(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "marketing_campaign_update", {
			action: "campaign_created",
			campaign,
		});

		// Revalidate paths
		revalidatePath("/marketing/campaigns");

		return { success: true, message: "Marketing campaign created", data: campaign };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing marketing campaign
 */
export async function updateMarketingCampaignAction(id: string, data: UpdateMarketingCampaignInput): Promise<ActionResult> {
	try {
		await requirePermission("marketing", "update");
		const session = await auth();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, message: "Unauthorized" };
		}

		const campaign = await MarketingCampaignService.updateMarketingCampaign(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "marketing_campaign_update", {
			action: "campaign_updated",
			campaign,
		});

		// Revalidate paths
		revalidatePath("/marketing/campaigns");
		revalidatePath(`/marketing/campaigns/${id}`);

		return { success: true, message: "Marketing campaign updated", data: campaign };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a marketing campaign
 */
export async function deleteMarketingCampaignAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("marketing", "delete");

		const campaign = await MarketingCampaignService.deleteMarketingCampaign(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "marketing_campaign_update", {
			action: "campaign_deleted",
			campaignId: id,
		});

		// Revalidate paths
		revalidatePath("/marketing/campaigns");

		return { success: true, message: "Marketing campaign deleted", data: campaign };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get marketing campaign statistics
 */
export async function getMarketingCampaignStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("marketing", "read");
		const statistics = await MarketingCampaignService.getMarketingCampaignStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

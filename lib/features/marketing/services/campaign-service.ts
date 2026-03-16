import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { marketingCampaignRepository } from "../repositories";
import { CreateMarketingCampaignInput, MarketingCampaign, MarketingCampaignFilters, UpdateMarketingCampaignInput } from "../types";

export class MarketingCampaignService {
	/**
	 * Create a new marketing campaign
	 */
	async createCampaign(data: CreateMarketingCampaignInput, userId: string): Promise<ActionResult<MarketingCampaign>> {
		try {
			await requirePermission("marketing", "create");

			const campaign = await marketingCampaignRepository.createCampaign({
				...data,
				createdById: userId,
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "campaign_update", {
				action: "campaign_created",
				campaign: {
					id: campaign.id,
					title: campaign.title,
					type: campaign.type,
					status: campaign.status,
				},
			});

			revalidatePath("/marketing/campaigns");

			return {
				success: true,
				message: "Campaign created successfully",
				data: campaign,
			};
		} catch (error) {
			console.error("Error creating campaign:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create campaign",
			};
		}
	}

	/**
	 * Get campaign by ID
	 */
	async getCampaignById(id: string): Promise<MarketingCampaign | null> {
		try {
			await requirePermission("marketing", "read");
			return await marketingCampaignRepository.getCampaignById(id);
		} catch (error) {
			console.error("Error getting campaign:", error);
			return null;
		}
	}

	/**
	 * Get campaigns with filtering and pagination
	 */
	async getCampaigns(filters: MarketingCampaignFilters = {}, page: number = 1, limit: number = 20): Promise<{ campaigns: MarketingCampaign[]; total: number }> {
		try {
			await requirePermission("marketing", "read");
			return await marketingCampaignRepository.getCampaigns(filters, page, limit);
		} catch (error) {
			console.error("Error getting campaigns:", error);
			return { campaigns: [], total: 0 };
		}
	}

	/**
	 * Update campaign
	 */
	async updateCampaign(id: string, data: UpdateMarketingCampaignInput, userId: string): Promise<ActionResult<MarketingCampaign>> {
		try {
			await requirePermission("marketing", "update");

			const campaign = await marketingCampaignRepository.updateCampaign(id, {
				...data,
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "campaign_update", {
				action: "campaign_updated",
				campaign: {
					id: campaign.id,
					title: campaign.title,
					status: campaign.status,
				},
			});

			revalidatePath("/marketing/campaigns");
			revalidatePath(`/marketing/campaigns/${id}`);

			return {
				success: true,
				message: "Campaign updated successfully",
				data: campaign,
			};
		} catch (error) {
			console.error("Error updating campaign:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update campaign",
			};
		}
	}

	/**
	 * Delete campaign
	 */
	async deleteCampaign(id: string): Promise<ActionResult<void>> {
		try {
			await requirePermission("marketing", "delete");

			// Check if campaign has sent emails
			const campaignWithEmails = (await marketingCampaignRepository.getCampaignById(id)) as any;
			if (!campaignWithEmails) {
				return {
					success: false,
					message: "Campaign not found",
				};
			}

			if (campaignWithEmails.emails.some((email: any) => email.status !== "PENDING")) {
				return {
					success: false,
					message: "Cannot delete campaign with sent emails",
				};
			}
			await marketingCampaignRepository.deleteCampaign(id);

			// Real-time notification
			await getPusher().trigger("private-global", "campaign_update", {
				action: "campaign_deleted",
				campaignId: id,
			});

			revalidatePath("/marketing/campaigns");

			return {
				success: true,
				message: "Campaign deleted successfully",
			};
		} catch (error) {
			console.error("Error deleting campaign:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete campaign",
			};
		}
	}

	/**
	 * Schedule campaign for sending
	 */
	async scheduleCampaign(id: string, scheduledAt: Date, userId: string): Promise<ActionResult<MarketingCampaign>> {
		try {
			await requirePermission("marketing", "update");

			const campaign = await marketingCampaignRepository.updateCampaign(id, {
				status: "SCHEDULED",
				scheduledAt,
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "campaign_update", {
				action: "campaign_scheduled",
				campaign: {
					id: campaign.id,
					title: campaign.title,
					scheduledAt: campaign.scheduledAt,
				},
			});

			revalidatePath("/marketing/campaigns");
			revalidatePath(`/marketing/campaigns/${id}`);

			return {
				success: true,
				message: "Campaign scheduled successfully",
				data: campaign,
			};
		} catch (error) {
			console.error("Error scheduling campaign:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to schedule campaign",
			};
		}
	}

	/**
	 * Cancel scheduled campaign
	 */
	async cancelCampaign(id: string, userId: string): Promise<ActionResult<MarketingCampaign>> {
		try {
			await requirePermission("marketing", "update");

			const campaign = await marketingCampaignRepository.updateCampaign(id, {
				status: "CANCELLED",
				scheduledAt: undefined,
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "campaign_update", {
				action: "campaign_cancelled",
				campaign: {
					id: campaign.id,
					title: campaign.title,
				},
			});

			revalidatePath("/marketing/campaigns");
			revalidatePath(`/marketing/campaigns/${id}`);

			return {
				success: true,
				message: "Campaign cancelled successfully",
				data: campaign,
			};
		} catch (error) {
			console.error("Error cancelling campaign:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to cancel campaign",
			};
		}
	}

	/**
	 * Send campaign immediately
	 */
	async sendCampaignNow(id: string, userId: string): Promise<ActionResult<MarketingCampaign>> {
		try {
			await requirePermission("marketing", "update");

			const campaign = await marketingCampaignRepository.updateCampaign(id, {
				status: "SENDING",
				sentAt: new Date(),
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "campaign_update", {
				action: "campaign_sending",
				campaign: {
					id: campaign.id,
					title: campaign.title,
				},
			});

			revalidatePath("/marketing/campaigns");
			revalidatePath(`/marketing/campaigns/${id}`);

			return {
				success: true,
				message: "Campaign sending started",
				data: campaign,
			};
		} catch (error) {
			console.error("Error sending campaign:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to send campaign",
			};
		}
	}
}

export const marketingCampaignService = new MarketingCampaignService();

import { MarketingCampaignRepository } from "../repositories/marketing-campaign.repository";
import type { CreateMarketingCampaignInput, GetMarketingCampaignsOptions, UpdateMarketingCampaignInput } from "../types/marketing-campaign.types";

/**
 * MarketingCampaign Service
 * Business logic and validation for marketing campaigns
 */

export class MarketingCampaignService {
	/**
	 * Get all marketing campaigns with filters
	 */
	static async getAllMarketingCampaigns(options: GetMarketingCampaignsOptions = {}) {
		return MarketingCampaignRepository.getAllMarketingCampaigns(options);
	}

	/**
	 * Get marketing campaign by ID
	 */
	static async getMarketingCampaignById(id: string) {
		return MarketingCampaignRepository.getMarketingCampaignById(id);
	}

	/**
	 * Create a new marketing campaign
	 */
	static async createMarketingCampaign(data: CreateMarketingCampaignInput, userId: string) {
		// Validation
		if (!data.title?.trim()) {
			throw new Error("Title is required");
		}

		if (!userId) {
			throw new Error("User ID is required");
		}

		return MarketingCampaignRepository.createMarketingCampaign(data, userId);
	}

	/**
	 * Update an existing marketing campaign
	 */
	static async updateMarketingCampaign(id: string, data: UpdateMarketingCampaignInput, userId: string) {
		// Validation
		if (data.title !== undefined && !data.title.trim()) {
			throw new Error("Title cannot be empty");
		}

		if (!userId) {
			throw new Error("User ID is required");
		}

		return MarketingCampaignRepository.updateMarketingCampaign(id, data, userId);
	}

	/**
	 * Delete a marketing campaign
	 */
	static async deleteMarketingCampaign(id: string) {
		return MarketingCampaignRepository.deleteMarketingCampaign(id);
	}

	/**
	 * Get marketing campaign statistics
	 */
	static async getMarketingCampaignStatistics() {
		const countByStatus = await MarketingCampaignRepository.getMarketingCampaignCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}

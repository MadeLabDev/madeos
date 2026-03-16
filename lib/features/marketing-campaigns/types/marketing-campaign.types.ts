import type { CampaignStatus, CampaignType, MarketingCampaign } from "@/generated/prisma/client";

// Base types
export type { CampaignStatus, CampaignType };

// ActionResult is now imported from @/lib/types

// MarketingCampaign with relations
export interface MarketingCampaignWithRelations extends MarketingCampaign {
	createdBy: {
		id: string;
		name: string | null;
		email: string;
	};
	updatedBy: {
		id: string;
		name: string | null;
		email: string;
	};
	_count?: {
		emails: number;
		templates: number;
	};
}

// List result with pagination
export interface MarketingCampaignListResult {
	campaigns: MarketingCampaignWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateMarketingCampaignInput {
	title: string;
	description?: string;
	type?: CampaignType;
	status?: CampaignStatus;
	targetAudience?: string;
	scheduledAt?: Date;
}

// Update input
export interface UpdateMarketingCampaignInput {
	title?: string;
	description?: string;
	type?: CampaignType;
	status?: CampaignStatus;
	targetAudience?: string;
	scheduledAt?: Date;
	sentAt?: Date;
}

// Get options with filters
export interface GetMarketingCampaignsOptions {
	page?: number;
	pageSize?: number;
	status?: CampaignStatus;
	type?: CampaignType;
	search?: string;
}

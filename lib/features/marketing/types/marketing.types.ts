/**
 * Marketing feature types
 */

import { CampaignStatus, CampaignType, EmailStatus, MaterialStatus, MaterialType, TemplateType } from "@/generated/prisma/enums";

// Base types from Prisma
export type MarketingCampaign = {
	id: string;
	title: string;
	description?: string | null;
	type: CampaignType;
	status: CampaignStatus;
	targetAudience?: string | null;
	scheduledAt?: Date | null;
	sentAt?: Date | null;
	createdById: string;
	updatedById: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: {
		id: string;
		firstName?: string;
		lastName?: string;
		email?: string;
	};
	updatedBy?: {
		id: string;
		firstName?: string;
		lastName?: string;
		email?: string;
	};
};

export type CampaignEmail = {
	id: string;
	campaignId: string;
	subject: string;
	content: string;
	recipientEmail: string;
	recipientName?: string | null;
	status: EmailStatus;
	sentAt?: Date | null;
	openedAt?: Date | null;
	clickedAt?: Date | null;
	error?: string | null;
	sentById?: string | null;
	createdAt: Date;
};

export type CampaignTemplate = {
	id: string;
	name: string;
	subject: string;
	content: string;
	type: TemplateType;
	isActive: boolean;
	createdById: string;
	updatedById: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: {
		id: string;
		name?: string | null;
		email?: string;
	};
	updatedBy?: {
		id: string;
		name?: string | null;
		email?: string;
	};
};

export type EventMicrosite = {
	id: string;
	eventId: string;
	event?: {
		id: string;
		title: string;
		startDate: Date;
		endDate: Date;
		location?: string | null;
		status: CampaignStatus;
	};
	heroTitle: string;
	heroSubtitle?: string | null;
	heroImageId?: string | null;
	heroImage?: {
		id: string;
		name: string;
		url: string;
	};
	description: string;
	agenda?: string;
	speakers?: string;
	sponsors?: string;
	ctaText?: string;
	ctaUrl?: string;
	isPublished: boolean;
	publishedAt?: Date;
	createdById: string;
	updatedById: string;
	createdBy?: {
		id: string;
		name?: string;
		email?: string;
	};
	updatedBy?: {
		id: string;
		name?: string;
		email?: string;
	};
	createdAt: Date;
	updatedAt: Date;
};

export type SponsorMaterial = {
	id: string;
	eventId: string;
	event?: {
		id: string;
		title: string;
		startDate: Date;
		endDate: Date;
		location?: string | null;
		status: CampaignStatus;
	};
	sponsorId: string;
	title: string;
	description?: string | null;
	type: MaterialType;
	fileId?: string;
	file?: {
		id: string;
		name: string;
		url: string;
		size: number;
	};
	url?: string;
	dueDate?: Date;
	status: MaterialStatus;
	notes?: string;
	createdById: string;
	updatedById: string;
	approvedById?: string;
	createdBy?: {
		id: string;
		name?: string;
		email?: string;
	};
	updatedBy?: {
		id: string;
		name?: string;
		email?: string;
	};
	approvedBy?: {
		id: string;
		name?: string;
		email?: string;
	};
	createdAt: Date;
	updatedAt: Date;
};

// Input types for creating/updating
export type CreateMarketingCampaignInput = {
	title: string;
	description?: string;
	type: CampaignType;
	targetAudience?: string;
	scheduledAt?: Date;
	status?: CampaignStatus;
};

export type UpdateMarketingCampaignInput = Partial<CreateMarketingCampaignInput> & {
	status?: CampaignStatus;
};

export type CreateCampaignEmailInput = {
	campaignId: string;
	subject: string;
	content: string;
	recipientEmail: string;
	recipientName?: string;
};

export type CreateCampaignTemplateInput = {
	name: string;
	subject: string;
	content: string;
	type: TemplateType;
};

export type UpdateCampaignTemplateInput = Partial<CreateCampaignTemplateInput> & {
	isActive?: boolean;
};

export type CreateEventMicrositeInput = {
	eventId: string;
	heroTitle: string;
	heroSubtitle?: string | null;
	heroImageId?: string | null;
	description: string;
	agenda?: string;
	speakers?: string;
	sponsors?: string;
	ctaText?: string;
	ctaUrl?: string;
};

export type UpdateEventMicrositeInput = Partial<CreateEventMicrositeInput> & {
	isPublished?: boolean;
};

export type CreateSponsorMaterialInput = {
	eventId: string;
	sponsorId: string;
	title: string;
	description?: string | null;
	type: MaterialType;
	fileId?: string | null;
	url?: string;
	dueDate?: Date;
	notes?: string;
};

export type UpdateSponsorMaterialInput = Partial<CreateSponsorMaterialInput> & {
	status?: MaterialStatus;
};

// List/filter types
export type CampaignTemplateFilters = {
	search?: string;
	type?: TemplateType;
	isActive?: boolean;
};

export type MarketingCampaignFilters = {
	type?: CampaignType;
	status?: CampaignStatus;
	createdById?: string;
	scheduledAfter?: Date;
	scheduledBefore?: Date;
};

export type CampaignEmailFilters = {
	campaignId?: string;
	status?: EmailStatus;
	sentById?: string;
	sentAfter?: Date;
	sentBefore?: Date;
};

export type SponsorMaterialFilters = {
	eventId?: string;
	sponsorId?: string;
	status?: MaterialStatus;
	dueBefore?: Date;
	dueAfter?: Date;
};

// Form data types
export type EventMicrositeFormData = {
	eventId: string;
	heroTitle: string;
	heroSubtitle?: string | null;
	heroImageId?: string | null;
	description: string;
	agenda?: string;
	speakers?: string;
	sponsors?: string;
	ctaText?: string;
	ctaUrl?: string;
	isPublished: boolean;
};

export type SponsorMaterialFormData = {
	eventId: string;
	sponsorId: string;
	title: string;
	description?: string | null;
	type: MaterialType;
	fileId?: string;
	url?: string;
	dueDate?: string;
	notes?: string;
};

// Constants
export const MATERIAL_TYPES = [
	{ value: "ASSET", label: "Asset" },
	{ value: "LOGO", label: "Logo" },
	{ value: "BANNER", label: "Banner" },
	{ value: "PRESENTATION", label: "Presentation" },
	{ value: "CONTRACT", label: "Contract" },
	{ value: "REPORT", label: "Report" },
] as const;

// Action result type (following project pattern)
export type ActionResult<T = any> = {
	success: boolean;
	message: string;
	data?: T;
};

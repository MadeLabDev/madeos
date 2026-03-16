import type { DesignBrief, DesignBriefStatus } from "@/generated/prisma/client";

// Base types
export type { DesignBriefStatus };

// ActionResult is now imported from @/lib/types

// DesignBrief with relations
export interface DesignBriefWithRelations extends DesignBrief {
	designProject?: {
		id: string;
		title: string;
		status: string;
	};
}

// List result with pagination
export interface DesignBriefListResult {
	designBriefs: DesignBriefWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateDesignBriefInput {
	designProjectId: string;
	brandAssets?: string;
	targetAudience?: string;
	constraints?: string;
	inspirations?: string;
	deliverables?: string;
	budget?: number;
	timeline?: string;
	notes?: string;
	mediaIds?: string;
	status?: DesignBriefStatus;
	metaData?: any;
}

// Update input
export interface UpdateDesignBriefInput {
	brandAssets?: string;
	targetAudience?: string;
	constraints?: string;
	inspirations?: string;
	deliverables?: string;
	budget?: number;
	timeline?: string;
	notes?: string;
	mediaIds?: string;
	status?: DesignBriefStatus;
	approvedAt?: Date;
	approvedBy?: string;
	metaData?: any;
}

// Get options with filters
export interface GetDesignBriefsOptions {
	page?: number;
	pageSize?: number;
	designProjectId?: string;
	status?: DesignBriefStatus;
	search?: string;
}

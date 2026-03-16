import type { TechPack, TechPackStatus } from "@/generated/prisma/client";

// Base types
export type { TechPackStatus };

// ActionResult is now imported from @/lib/types

// TechPack with relations
export interface TechPackWithRelations extends TechPack {
	productDesign?: {
		id: string;
		name: string;
		status: string;
	};
}

// List result with pagination
export interface TechPackListResult {
	techPacks: TechPackWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateTechPackInput {
	productDesignId: string;
	name: string;
	description?: string;
	sizing?: any;
	materials?: any;
	colors?: any;
	decorationMethod: string;
	productionNotes?: string;
	qualitySpecs?: any;
	outputFiles?: string;
	status?: TechPackStatus;
	metaData?: any;
}

// Update input
export interface UpdateTechPackInput {
	name?: string;
	description?: string;
	sizing?: any;
	materials?: any;
	colors?: any;
	decorationMethod?: string;
	productionNotes?: string;
	qualitySpecs?: any;
	outputFiles?: string;
	status?: TechPackStatus;
	approvedAt?: Date;
	approvedBy?: string;
	metaData?: any;
}

// Get options with filters
export interface GetTechPacksOptions {
	page?: number;
	pageSize?: number;
	productDesignId?: string;
	status?: TechPackStatus;
	decorationMethod?: string;
	search?: string;
}

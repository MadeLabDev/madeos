import type { ProductDesign, ProductDesignStatus } from "@/generated/prisma/client";

// Base types
export type { ProductDesignStatus };

// ActionResult is now imported from @/lib/types

// ProductDesign with relations
export interface ProductDesignWithRelations extends ProductDesign {
	designProject?: {
		id: string;
		title: string;
		status: string;
	};
	parentDesign?: {
		id: string;
		name: string;
		version: number;
	} | null;
	techPack?: {
		id: string;
		name: string;
		status: string;
	} | null;
	_count?: {
		versions: number;
		reviews: number;
	};
}

// List result with pagination
export interface ProductDesignListResult {
	productDesigns: ProductDesignWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateProductDesignInput {
	designProjectId: string;
	name: string;
	description?: string;
	designType?: string;
	productType?: string;
	mockupUrl?: string;
	graphicSpecsFile?: string;
	layerInfo?: any;
	colorSeparations?: string;
	status?: ProductDesignStatus;
	feasibilityNotes?: string;
	compatibilityCheck?: boolean;
	decorationDetails?: any;
	mediaIds?: string;
	version?: number;
	parentDesignId?: string;
	assignedTo?: string;
	startedAt?: Date;
	metaData?: any;
}

// Update input
export interface UpdateProductDesignInput {
	name?: string;
	description?: string;
	designType?: string;
	productType?: string;
	mockupUrl?: string;
	graphicSpecsFile?: string;
	layerInfo?: any;
	colorSeparations?: string;
	status?: ProductDesignStatus;
	feasibilityNotes?: string;
	compatibilityCheck?: boolean;
	decorationDetails?: any;
	mediaIds?: string;
	version?: number;
	assignedTo?: string;
	startedAt?: Date;
	completedAt?: Date;
	metaData?: any;
}

// Get options with filters
export interface GetProductDesignsOptions {
	page?: number;
	pageSize?: number;
	designProjectId?: string;
	status?: ProductDesignStatus;
	designType?: string;
	assignedTo?: string;
	search?: string;
}

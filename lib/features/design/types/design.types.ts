import { DesignBriefStatus, DesignDeckStatus, DesignProjectStatus, DesignReviewStatus, ProductDesignStatus, TechPackStatus } from "@/generated/prisma/enums";
import { ApprovalStatus, ProjectStatus, PublishStatus } from "@/lib/config/module-types";

// ============================================================================
// BASE TYPES (matching Prisma models)
// ============================================================================

export type DesignProject = {
	id: string;
	engagementId: string;
	customerId: string;
	title: string;
	description?: string | null;
	status: DesignProjectStatus;
	priority: string;
	requestedBy: string;
	assignedTo?: string | null;
	startDate?: Date | null;
	dueDate?: Date | null;
	completedAt?: Date | null;
	budget?: number | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type DesignBrief = {
	id: string;
	designProjectId: string;
	brandAssets?: string | null;
	targetAudience?: string | null;
	constraints?: string | null;
	inspirations?: string | null;
	deliverables?: string | null;
	budget?: number | null;
	timeline?: string | null;
	notes?: string | null;
	mediaIds?: string | null;
	status: DesignBriefStatus;
	approvedAt?: Date | null;
	approvedBy?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type ProductDesign = {
	id: string;
	designProjectId: string;
	name: string;
	description?: string | null;
	designType: string;
	productType?: string | null;
	mockupUrl?: string | null;
	graphicSpecsFile?: string | null;
	layerInfo?: any;
	colorSeparations?: string | null;
	status: ProductDesignStatus;
	feasibilityNotes?: string | null;
	compatibilityCheck: boolean;
	decorationDetails?: any;
	mediaIds?: string | null;
	version: number;
	parentDesignId?: string | null;
	assignedTo?: string | null;
	startedAt?: Date | null;
	completedAt?: Date | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type TechPack = {
	id: string;
	productDesignId: string;
	name: string;
	description?: string | null;
	sizing?: any;
	materials?: any;
	colors?: any;
	decorationMethod: string;
	productionNotes?: string | null;
	qualitySpecs?: any;
	outputFiles?: string | null;
	status: TechPackStatus;
	approvedAt?: Date | null;
	approvedBy?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type DesignDeck = {
	id: string;
	designProjectId: string;
	title: string;
	description?: string | null;
	coverUrl?: string | null;
	designIds?: string | null;
	deckUrl?: string | null;
	mediaIds?: string | null;
	status: DesignDeckStatus;
	publishedAt?: Date | null;
	publishedBy?: string | null;
	version: number;
	notes?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type DesignDeckSlide = {
	id?: string;
	deckId: string;
	slideIndex: number;
	title: string;
	description?: string | null;
	imageUrl?: string | null;
	notes?: string | null;
	metaData?: any;
};

export type DesignReview = {
	id: string;
	designProjectId: string;
	productDesignId?: string | null;
	reviewerName: string;
	reviewerEmail?: string | null;
	feedback?: string | null;
	approvalStatus: DesignReviewStatus;
	approvedAt?: Date | null;
	approvedBy?: string | null;
	requestedAt?: Date | null;
	requestedBy?: string | null;
	notes?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

// ============================================================================
// INPUT TYPES (for create/update operations)
// ============================================================================

export type CreateDesignProjectInput = {
	engagementId: string;
	customerId: string;
	title: string;
	description?: string;
	priority?: string;
	requestedBy: string;
	assignedTo?: string | null;
	startDate?: Date;
	dueDate?: Date;
	budget?: number;
	metaData?: any;
	createdBy?: string;
	updatedBy?: string;
};

export type UpdateDesignProjectInput = Partial<CreateDesignProjectInput> & {
	status?: DesignProjectStatus;
	completedAt?: Date;
};

export type CreateDesignBriefInput = {
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
	requestedBy?: string;
	createdBy?: string;
	updatedBy?: string;
};

export type UpdateDesignBriefInput = Partial<CreateDesignBriefInput> & {
	status?: DesignBriefStatus;
	approvedAt?: Date;
	approvedBy?: string;
};

export type CreateProductDesignInput = {
	designProjectId: string;
	name: string;
	description?: string;
	designType?: string;
	productType?: string;
	mockupUrl?: string;
	graphicSpecsFile?: string;
	layerInfo?: any;
	colorSeparations?: string;
	decorationDetails?: any;
	mediaIds?: string;
	parentDesignId?: string;
	assignedTo?: string;
	createdBy?: string;
	updatedBy?: string;
};

export type UpdateProductDesignInput = Partial<CreateProductDesignInput> & {
	status?: ProductDesignStatus;
	feasibilityNotes?: string;
	compatibilityCheck?: boolean;
	completedAt?: Date;
};

export type CreateTechPackInput = {
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
	createdBy?: string;
	updatedBy?: string;
};

export type UpdateTechPackInput = Partial<CreateTechPackInput> & {
	status?: TechPackStatus;
	approvedAt?: Date;
	approvedBy?: string;
};

export type CreateDesignDeckInput = {
	designProjectId: string;
	title: string;
	description?: string;
	coverUrl?: string;
	designIds?: string;
	deckUrl?: string;
	mediaIds?: string;
	status?: DesignDeckStatus;
	notes?: string;
	createdBy?: string;
	updatedBy?: string;
};

export type UpdateDesignDeckInput = Partial<CreateDesignDeckInput> & {
	publishedAt?: Date;
	publishedBy?: string;
};

export type CreateDesignReviewInput = {
	productDesignId?: string;
	designProjectId: string;
	reviewerName: string;
	reviewerEmail?: string;
	feedback?: string;
	notes?: string;
};

export type UpdateDesignReviewInput = Partial<CreateDesignReviewInput> & {
	approvalStatus?: DesignReviewStatus;
	approvedAt?: Date;
	approvedBy?: string;
};

// ============================================================================
// FILTER TYPES (for query operations)
// ============================================================================

export type DesignProjectFilters = {
	engagementId?: string;
	customerId?: string;
	status?: DesignProjectStatus;
	assignedTo?: string;
	requestedBy?: string;
	dueDate?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
};

export type DesignProjectListParams = DesignProjectFilters;

export type DesignBriefFilters = {
	designProjectId?: string;
	status?: DesignBriefStatus;
	createdAfter?: Date;
	createdBefore?: Date;
};

export type ProductDesignFilters = {
	designProjectId?: string;
	designType?: string;
	productType?: string;
	status?: ProductDesignStatus;
	assignedTo?: string;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
};

export type ProductDesignListParams = ProductDesignFilters;

export type TechPackFilters = {
	productDesignId?: string;
	decorationMethod?: string;
	status?: TechPackStatus;
	createdAfter?: Date;
	createdBefore?: Date;
};

export type DesignDeckFilters = {
	designProjectId?: string;
	status?: DesignDeckStatus;
	publishedAfter?: Date;
	publishedBefore?: Date;
	search?: string;
};

export type DesignReviewFilters = {
	designProjectId?: string;
	productDesignId?: string;
	approvalStatus?: DesignReviewStatus;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
};

// ============================================================================
// RELATION TYPES (with nested relations)
// ============================================================================

export type DesignProjectWithRelations = {
	id: string;
	engagementId: string;
	customerId: string;
	title: string;
	description?: string | null;
	status: DesignProjectStatus;
	priority: string;
	requestedBy: string;
	assignedTo?: string | null;
	startDate?: Date | null;
	dueDate?: Date | null;
	completedAt?: Date | null;
	budget?: number | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	engagement?: any;
	customer?: any;
	brief?: DesignBrief | null;
	designs?: ProductDesign[];
	deck?: DesignDeck | null;
	reviews?: DesignReview[];
};

export type DesignBriefWithRelations = {
	id: string;
	designProjectId: string;
	brandAssets?: string | null;
	targetAudience?: string | null;
	constraints?: string | null;
	inspirations?: string | null;
	deliverables?: string | null;
	budget?: number | null;
	timeline?: string | null;
	notes?: string | null;
	mediaIds?: string | null;
	status: DesignBriefStatus;
	approvedAt?: Date | null;
	approvedBy?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	designProject?: DesignProject;
};

export type ProductDesignWithRelations = {
	id: string;
	designProjectId: string;
	name: string;
	description?: string | null;
	designType: string;
	productType?: string | null;
	mockupUrl?: string | null;
	graphicSpecsFile?: string | null;
	layerInfo?: any;
	colorSeparations?: string | null;
	status: ProductDesignStatus;
	feasibilityNotes?: string | null;
	compatibilityCheck: boolean;
	decorationDetails?: any;
	mediaIds?: string | null;
	version: number;
	parentDesignId?: string | null;
	assignedTo?: string | null;
	startedAt?: Date | null;
	completedAt?: Date | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	designProject?: DesignProject;
	versions?: ProductDesign[];
	techPack?: TechPack | null;
	reviews?: DesignReview[];
};

export type DesignDeckWithRelations = {
	id: string;
	designProjectId: string;
	title: string;
	description?: string | null;
	coverUrl?: string | null;
	designIds?: string | null;
	deckUrl?: string | null;
	mediaIds?: string | null;
	status: DesignDeckStatus;
	publishedAt?: Date | null;
	publishedBy?: string | null;
	version: number;
	notes?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	designProject?: DesignProject;
};

export type DesignReviewWithRelations = {
	id: string;
	designProjectId: string;
	productDesignId?: string | null;
	reviewerName: string;
	reviewerEmail?: string | null;
	feedback?: string | null;
	approvalStatus: DesignReviewStatus;
	approvedAt?: Date | null;
	approvedBy?: string | null;
	requestedAt?: Date | null;
	requestedBy?: string | null;
	notes?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	designProject?: DesignProject;
	productDesign?: ProductDesign | null;
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

// ActionResult is now imported from @/lib/types

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class DesignError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode: number = 400,
	) {
		super(message);
		this.name = "DesignError";
	}
}

// ============================================================================
// RE-EXPORT ENUMS
// ============================================================================

export type { ProjectStatus, ApprovalStatus, PublishStatus };

// Legacy type aliases for backward compatibility

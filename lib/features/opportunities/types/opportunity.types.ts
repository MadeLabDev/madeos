import { OpportunityStage } from "@/generated/prisma/enums";

type Opportunity = {
	id: string;
	customerId: string;
	title: string;
	description?: string | null;
	value?: number | null;
	stage: OpportunityStage;
	probability?: number | null;
	expectedClose?: Date | null;
	ownerId: string;
	source?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	customer: any; // Customer relation
	owner: {
		id: string;
		name: string | null;
		email: string;
	};
	engagements: any[]; // Engagement relation
};

/**
 * Opportunity Types
 */
export type OpportunityResponse = Opportunity;

export interface CreateOpportunityInput {
	title: string;
	description?: string;
	value?: number;
	stage?: OpportunityStage;
	probability?: number;
	expectedClose?: Date;
	ownerId: string;
	source?: string;
	customerId: string;
	metaData?: Record<string, any>;
}

export interface UpdateOpportunityInput {
	title?: string;
	description?: string;
	value?: number;
	stage?: OpportunityStage;
	probability?: number;
	expectedClose?: Date;
	ownerId?: string;
	source?: string;
	customerId?: string;
	metaData?: Record<string, any>;
}

export interface OpportunityListParams {
	page?: number;
	pageSize?: number;
	search?: string;
	customerId?: string;
	stage?: OpportunityStage;
}

export interface OpportunityFilters {
	search?: string;
	customerId?: string;
	stage?: string;
	ownerId?: string;
}

export interface OpportunityFormData {
	title: string;
	description?: string;
	value?: number;
	stage: string;
	probability?: number;
	expectedClose?: Date;
	customerId: string;
	ownerId: string;
	source?: string;
}

export interface OpportunityListPageProps {
	searchParams: {
		search?: string;
		customerId?: string;
		stage?: string;
		ownerId?: string;
		page?: string;
		limit?: string;
	};
}

export interface OpportunityDetailPageProps {
	params: {
		id: string;
	};
}

export interface EditOpportunityPageProps {
	params: {
		id: string;
	};
}

export type { Opportunity };

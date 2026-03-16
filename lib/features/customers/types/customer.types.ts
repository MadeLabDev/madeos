/**
 * Customer Types
 */
export type Customer = {
	id: string;
	companyName: string;
	email: string;
	phone?: string | null;
	website?: string | null;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	contactName: string;
	contactTitle?: string | null;
	contactEmail?: string | null;
	contactPhone?: string | null;
	type: string;
	taxId?: string | null;
	parentId?: string | null;
	discountPercent: number;
	paymentTermsDays: number;
	creditLimit?: number | null;
	isActive: boolean;
	notes?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type CustomerResponse = Customer;

import { EngagementStatus, EngagementType } from "@/generated/prisma/enums";

/**
 * Engagement Types
 */
export type Engagement = {
	id: string;
	opportunityId?: string | null;
	customerId: string;
	title: string;
	type: EngagementType;
	status: EngagementStatus;
	priority?: string | null;
	startDate?: Date | null;
	dueDate?: Date | null;
	completedAt?: Date | null;
	budget?: number | null;
	description?: string | null;
	assignedTo?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export interface CreateCustomerInput {
	companyName: string;
	email: string;
	phone?: string;
	website?: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	country?: string;
	contactName: string;
	contactTitle?: string;
	contactEmail?: string;
	contactPhone?: string;
	type?: string;
	taxId?: string;
	discountPercent?: number;
	paymentTermsDays?: number;
	creditLimit?: number;
	parentId?: string;
	notes?: string;
	metaData?: Record<string, any>;
}

export interface UpdateCustomerInput {
	companyName?: string;
	email?: string;
	phone?: string;
	website?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	contactName?: string;
	contactTitle?: string;
	contactEmail?: string;
	contactPhone?: string;
	type?: string;
	taxId?: string;
	discountPercent?: number;
	paymentTermsDays?: number;
	creditLimit?: number;
	parentId?: string | null;
	notes?: string;
	isActive?: boolean;
	metaData?: Record<string, any>;
}

/**
 * Customer List Query Params
 */
export interface CustomerListParams {
	page?: number;
	pageSize?: number;
	search?: string;
	type?: string;
	isActive?: boolean;
}

/**
 * Paginated Response
 */
export interface PaginatedCustomerResponse {
	customers: CustomerResponse[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

/**
 * Customer with locations (parent + children)
 */
export interface CustomerWithLocations extends CustomerResponse {
	locations: CustomerResponse[];
}

/**
 * List Props for components
 */
export interface CustomerListProps {
	page?: number;
	search?: string;
}

/**
 * Engagement Types
 */
export type EngagementResponse = Engagement & {
	customer?: {
		id: string;
		companyName: string;
		email: string;
	};
};

export interface CreateEngagementInput {
	customerId: string;
	title: string;
	type: EngagementType;
	status?: EngagementStatus;
	priority?: string;
	startDate?: Date;
	dueDate?: Date;
	budget?: number;
	description?: string;
	assignedTo?: string;
	metaData?: Record<string, any>;
}

export interface UpdateEngagementInput {
	title?: string;
	type?: EngagementType;
	status?: EngagementStatus;
	priority?: string;
	startDate?: Date;
	dueDate?: Date;
	budget?: number;
	description?: string;
	assignedTo?: string;
	metaData?: Record<string, any>;
}

export interface EngagementListParams {
	page?: number;
	pageSize?: number;
	search?: string;
	customerId?: string;
	status?: string;
}

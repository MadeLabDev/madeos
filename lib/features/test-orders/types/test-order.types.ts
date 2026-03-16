import type { TestOrder, TestOrderStatus } from "@/generated/prisma/client";

// Base types
export type { TestOrderStatus };

// TestOrder with relations
export interface TestOrderWithRelations extends TestOrder {
	engagement?: {
		id: string;
		title: string;
		status: string;
	};
	contact?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	} | null;
	samples?: {
		id: string;
		name: string;
		status: string;
	}[];
	testSuites?: {
		id: string;
		testSuiteId: string;
	}[];
	tests?: {
		id: string;
		name: string;
		status: string;
	}[];
	reports?: {
		id: string;
		title: string;
		status: string;
	}[];
	_count?: {
		samples: number;
		testSuites: number;
		tests: number;
		reports: number;
		interactions: number;
	};
}

// List result with pagination
export interface TestOrderListResult {
	testOrders: TestOrderWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateTestOrderInput {
	engagementId: string;
	title: string;
	description?: string;
	status?: TestOrderStatus;
	priority?: string;
	requestedBy: string;
	assignedTo?: string;
	contactId?: string;
	startDate?: Date;
	dueDate?: Date;
	budget?: number;
	notes?: string;
	metaData?: any;
}

// Update input
export interface UpdateTestOrderInput {
	title?: string;
	description?: string;
	status?: TestOrderStatus;
	priority?: string;
	assignedTo?: string;
	contactId?: string;
	startDate?: Date;
	dueDate?: Date;
	completedAt?: Date;
	budget?: number;
	notes?: string;
	metaData?: any;
}

// Get options with filters
export interface GetTestOrdersOptions {
	page?: number;
	pageSize?: number;
	engagementId?: string;
	status?: TestOrderStatus;
	assignedTo?: string;
	search?: string;
}

import type { TestSuite } from "@/generated/prisma/client";

// TestSuite with relations
export interface TestSuiteWithRelations extends TestSuite {
	tests?: {
		id: string;
		name: string;
		status: string;
	}[];
	orders?: {
		id: string;
		testOrderId: string;
	}[];
	_count?: {
		tests: number;
		orders: number;
	};
}

// List result with pagination
export interface TestSuiteListResult {
	testSuites: TestSuiteWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateTestSuiteInput {
	name: string;
	description?: string;
	category?: string;
	isActive?: boolean;
	estimatedHours?: number;
	metaData?: any;
}

// Update input
export interface UpdateTestSuiteInput {
	name?: string;
	description?: string;
	category?: string;
	isActive?: boolean;
	estimatedHours?: number;
	metaData?: any;
}

// Get options with filters
export interface GetTestSuitesOptions {
	page?: number;
	pageSize?: number;
	category?: string;
	isActive?: boolean;
	search?: string;
}

/**
 * Test Types
 */

import type { Test, TestStatus } from "@/generated/prisma/client";

export type { Test, TestStatus };

export interface TestWithRelations extends Test {
	testOrder?: {
		id: string;
		title: string;
	};
	testSuite?: {
		id: string;
		name: string;
	};
	sample?: {
		id: string;
		name: string;
	};
}

export interface CreateTestInput {
	testOrderId?: string;
	testSuiteId?: string;
	sampleId?: string;
	name: string;
	description?: string;
	method?: string;
	parameters?: any;
	expectedResult?: string;
	actualResult?: string;
	status?: TestStatus;
	startedAt?: Date;
	completedAt?: Date;
	performedBy?: string;
	notes?: string;
	data?: any;
	mediaIds?: string;
	metaData?: any;
}

export interface UpdateTestInput {
	name?: string;
	description?: string;
	method?: string;
	parameters?: any;
	expectedResult?: string;
	actualResult?: string;
	status?: TestStatus;
	startedAt?: Date;
	completedAt?: Date;
	performedBy?: string;
	notes?: string;
	data?: any;
	mediaIds?: string;
	metaData?: any;
}

export interface TestListResult {
	tests: TestWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

export interface GetTestsOptions {
	page?: number;
	pageSize?: number;
	testOrderId?: string;
	testSuiteId?: string;
	sampleId?: string;
	status?: TestStatus;
	search?: string;
}

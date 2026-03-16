import { ProcessStatus, ProjectStatus, PublishStatus, ReportStatus, SampleStatus, SampleType, TestStatus } from "@/generated/prisma/enums";
import type { ActionResult, PaginatedResult } from "@/lib/types";

// Re-export shared types for convenience
export type { ActionResult, PaginatedResult };

// Define local types for models not exported by @prisma/client
type TestOrder = {
	id: string;
	engagementId: string;
	title: string;
	description?: string | null;
	status: ProjectStatus;
	priority: string;
	requestedBy: string;
	assignedTo?: string | null;
	contactId?: string | null;
	startDate?: Date | null;
	dueDate?: Date | null;
	completedAt?: Date | null;
	budget?: number | null;
	notes?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

type Sample = {
	id: string;
	testOrderId: string;
	name: string;
	description?: string | null;
	type: SampleType;
	quantity: number;
	receivedDate?: Date | null;
	receivedFrom?: string | null;
	storageLocation?: string | null;
	condition?: string | null;
	status: SampleStatus;
	notes?: string | null;
	mediaIds?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	testOrder: any; // TestOrder - simplified to avoid circular refs
	tests: any[]; // Test relation
};

type TestSuite = {
	id: string;
	name: string;
	description?: string | null;
	category?: string | null;
	isActive: boolean;
	estimatedHours?: number | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	orders?: {
		id: string;
		testOrderId: string;
		testSuiteId: string;
		assignedAt: Date;
		assignedBy?: string | null;
		testOrder: {
			id: string;
			engagementId: string;
			title: string;
			description?: string | null;
			status: ProjectStatus;
			priority: string;
			requestedBy: string;
			assignedTo?: string | null;
			contactId?: string | null;
			startDate?: Date | null;
			dueDate?: Date | null;
			completedAt?: Date | null;
			budget?: number | null;
			notes?: string | null;
			metaData?: any;
			createdAt: Date;
			updatedAt: Date;
			createdBy?: string | null;
			updatedBy?: string | null;
		};
	}[];
	tests?: Test[];
};

type TestSuiteOnOrder = {
	id: string;
	testOrderId: string;
	testSuiteId: string;
	assignedAt: Date;
	assignedBy?: string | null;
	testOrder: TestOrder;
	testSuite: TestSuite;
};

type Test = {
	id: string;
	testOrderId?: string | null;
	testSuiteId?: string | null;
	sampleId?: string | null;
	name: string;
	description?: string | null;
	method?: string | null;
	parameters?: any;
	expectedResult?: string | null;
	actualResult?: string | null;
	status: TestStatus;
	startedAt?: Date | null;
	completedAt?: Date | null;
	performedBy?: string | null;
	notes?: string | null;
	data?: any;
	mediaIds?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	testOrder?: {
		id: string;
		engagementId: string;
		title: string;
		description?: string | null;
		status: TestOrderStatus;
		priority: string;
		requestedBy: string;
		assignedTo?: string | null;
		contactId?: string | null;
		startDate?: Date | null;
		dueDate?: Date | null;
		completedAt?: Date | null;
		budget?: number | null;
		notes?: string | null;
		metaData?: any;
		createdAt: Date;
		updatedAt: Date;
		createdBy?: string | null;
		updatedBy?: string | null;
	} | null;
	testSuite?: {
		id: string;
		name: string;
		description?: string | null;
		category?: string | null;
		isActive: boolean;
		estimatedHours?: number | null;
		metaData?: any;
		createdAt: Date;
		updatedAt: Date;
		createdBy?: string | null;
		updatedBy?: string | null;
	} | null;
	sample?: {
		id: string;
		testOrderId: string;
		name: string;
		description?: string | null;
		type: SampleType;
		quantity: number;
		receivedDate?: Date | null;
		receivedFrom?: string | null;
		storageLocation?: string | null;
		condition?: string | null;
		status: SampleStatus;
		notes?: string | null;
		mediaIds?: string | null;
		metaData?: any;
		createdAt: Date;
		updatedAt: Date;
		createdBy?: string | null;
		updatedBy?: string | null;
	} | null;
};

type TestReport = {
	id: string;
	testOrderId: string;
	title: string;
	summary?: string | null;
	findings?: string | null;
	recommendations?: string | null;
	status: ReportStatus;
	version: number;
	generatedAt?: Date | null;
	approvedAt?: Date | null;
	approvedBy?: string | null;
	publishedAt?: Date | null;
	mediaId?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
	testOrder?: {
		id: string;
		engagementId: string;
		title: string;
		description?: string | null;
		status: TestOrderStatus;
		priority: string;
		requestedBy: string;
		assignedTo?: string | null;
		contactId?: string | null;
		startDate?: Date | null;
		dueDate?: Date | null;
		completedAt?: Date | null;
		budget?: number | null;
		notes?: string | null;
		metaData?: any;
		createdAt: Date;
		updatedAt: Date;
		createdBy?: string | null;
		updatedBy?: string | null;
	} | null;
};

// Re-export Prisma enums for convenience
export { ProjectStatus, SampleType, SampleStatus, ProcessStatus, PublishStatus, TestStatus };

// Legacy type aliases for backward compatibility
export type TestOrderStatus = ProjectStatus;

// Re-export local types
export type { TestOrder, Sample, TestSuite, TestSuiteOnOrder, Test, TestReport };

// Base types with relations
export type TestOrderWithRelations = TestOrder & {
	engagement?: any; // Engagement
	samples?: {
		id: string;
		testOrderId: string;
		name: string;
		description?: string | null;
		type: SampleType;
		quantity: number;
		receivedDate?: Date | null;
		receivedFrom?: string | null;
		storageLocation?: string | null;
		condition?: string | null;
		status: SampleStatus;
		notes?: string | null;
		mediaIds?: string | null;
		metaData?: any;
		createdAt: Date;
		updatedAt: Date;
		createdBy?: string | null;
		updatedBy?: string | null;
	}[];
	testSuites?: {
		id: string;
		testOrderId: string;
		testSuiteId: string;
		assignedAt: Date;
		assignedBy?: string | null;
		testSuite: {
			id: string;
			name: string;
			description?: string | null;
			category?: string | null;
			isActive: boolean;
			estimatedHours?: number | null;
			metaData?: any;
			createdAt: Date;
			updatedAt: Date;
			createdBy?: string | null;
			updatedBy?: string | null;
		};
	}[];
	tests?: Test[];
	reports?: {
		id: string;
		testOrderId: string;
		title: string;
		summary?: string | null;
		findings?: string | null;
		recommendations?: string | null;
		status: ReportStatus;
		version: number;
		generatedAt?: Date | null;
		approvedAt?: Date | null;
		approvedBy?: string | null;
		publishedAt?: Date | null;
		mediaId?: string | null;
		metaData?: any;
		createdAt: Date;
		updatedAt: Date;
		createdBy?: string | null;
		updatedBy?: string | null;
	}[];
	interactions?: any[]; // Related interactions
	contact?: any; // Primary contact
	// Note: requestedBy, assignedTo, createdBy, updatedBy are string IDs, not relations
};

export type SampleWithRelations = Sample & {
	testOrder?: {
		id: string;
		engagementId: string;
		title: string;
		description?: string | null;
		status: TestOrderStatus;
		priority: string;
		requestedBy: string;
		assignedTo?: string | null;
		contactId?: string | null;
		startDate?: Date | null;
		dueDate?: Date | null;
		completedAt?: Date | null;
		budget?: number | null;
		notes?: string | null;
		metaData?: any;
		createdAt: Date;
		updatedAt: Date;
		createdBy?: string | null;
		updatedBy?: string | null;
	};
	tests?: any[]; // Test relation
	media?: any[]; // Media attachments
	createdBy?: any; // User
	updatedBy?: any; // User
};

export type TestSuiteWithRelations = TestSuite;

export type TestWithRelations = Test;

export type TestReportWithRelations = TestReport;

// Form types for API
export type CreateTestOrderInput = {
	engagementId: string;
	title: string;
	description?: string;
	priority?: string;
	requestedBy: string;
	assignedTo?: string | null;
	contactId?: string | null; // Primary contact for this test order
	startDate?: Date;
	dueDate?: Date;
	budget?: number;
	notes?: string;
	metaData?: any;
};

export type UpdateTestOrderInput = Partial<CreateTestOrderInput> & {
	status?: TestOrderStatus;
	completedAt?: Date;
};

export type CreateSampleInput = {
	testOrderId: string;
	name: string;
	description?: string;
	type?: SampleType;
	quantity?: number;
	receivedDate?: Date;
	receivedFrom?: string;
	storageLocation?: string;
	condition?: string;
	notes?: string;
	mediaIds?: string;
	metaData?: any;
};

export type UpdateSampleInput = Partial<CreateSampleInput> & {
	status?: SampleStatus;
};

export type CreateTestSuiteInput = {
	name: string;
	description?: string;
	category?: string;
	estimatedHours?: number;
	metaData?: any;
};

export type UpdateTestSuiteInput = Partial<CreateTestSuiteInput> & {
	isActive?: boolean;
};

export type AssignTestSuiteInput = {
	testOrderId: string;
	testSuiteId: string;
};

export type CreateTestInput = {
	testOrderId?: string;
	testSuiteId?: string;
	sampleId?: string;
	name: string;
	description?: string;
	method?: string;
	parameters?: any;
	expectedResult?: string;
	notes?: string;
	mediaIds?: string;
	metaData?: any;
};

export type UpdateTestInput = Partial<CreateTestInput> & {
	status?: TestStatus;
	actualResult?: string;
	startedAt?: Date;
	completedAt?: Date;
	performedBy?: string;
	data?: any;
};

export type CreateTestReportInput = {
	testOrderId: string;
	title: string;
	summary?: string;
	findings?: string;
	recommendations?: string;
	metaData?: any;
};

export type UpdateTestReportInput = Partial<CreateTestReportInput> & {
	status?: ReportStatus;
	version?: number;
	approvedAt?: Date;
	approvedBy?: string;
	publishedAt?: Date;
	mediaId?: string;
};

// Error types
export class TestingError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode: number = 400,
	) {
		super(message);
		this.name = "TestingError";
	}
}

// Utility types
export type TestOrderFilters = {
	engagementId?: string;
	status?: TestOrderStatus;
	assignedTo?: string;
	requestedBy?: string;
	contactId?: string;
	dueDate?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
};

export type SampleFilters = {
	testOrderId?: string;
	status?: SampleStatus;
	type?: SampleType;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
};

export type TestSuiteFilters = {
	category?: string;
	isActive?: boolean;
	search?: string;
};

export type TestFilters = {
	testOrderId?: string;
	testSuiteId?: string;
	sampleId?: string;
	status?: TestStatus;
	performedBy?: string;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
};

export type TestReportFilters = {
	testOrderId?: string;
	status?: ReportStatus;
	approvedBy?: string;
	publishedAt?: Date;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

// ActionResult and PaginatedResult are now imported from @/lib/types

/**
 * TestingPaginatedResult - Testing-specific paginated result
 */
export interface TestingPaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

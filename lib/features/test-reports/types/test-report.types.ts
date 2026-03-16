import type { ReportStatus, TestReport } from "@/generated/prisma/client";

// Base types
export type { ReportStatus };

// ActionResult is now imported from @/lib/types

// TestReport with relations
export interface TestReportWithRelations extends TestReport {
	testOrder?: {
		id: string;
		title: string;
		status: string;
	};
}

// List result with pagination
export interface TestReportListResult {
	testReports: TestReportWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateTestReportInput {
	testOrderId: string;
	title: string;
	summary?: string;
	findings?: string;
	recommendations?: string;
	status?: ReportStatus;
	version?: number;
	generatedAt?: Date;
	mediaId?: string;
	metaData?: any;
}

// Update input
export interface UpdateTestReportInput {
	title?: string;
	summary?: string;
	findings?: string;
	recommendations?: string;
	status?: ReportStatus;
	version?: number;
	generatedAt?: Date;
	approvedAt?: Date;
	approvedBy?: string;
	publishedAt?: Date;
	mediaId?: string;
	metaData?: any;
}

// Get options with filters
export interface GetTestReportsOptions {
	page?: number;
	pageSize?: number;
	testOrderId?: string;
	status?: ReportStatus;
	search?: string;
}

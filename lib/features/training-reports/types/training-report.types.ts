import type { CompetencyLevel, ReportStatus, ReportType, TrainingReport } from "@/generated/prisma/client";

// Base types
export type { ReportType, ReportStatus, CompetencyLevel };

// ActionResult is now imported from @/lib/types

// TrainingReport with relations
export interface TrainingReportWithRelations extends TrainingReport {
	trainingEngagement?: {
		id: string;
		title: string;
		status: string;
	};
}

// List result with pagination
export interface TrainingReportListResult {
	trainingReports: TrainingReportWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateTrainingReportInput {
	trainingEngagementId: string;
	title: string;
	description?: string;
	reportType?: ReportType;
	totalParticipants?: number;
	totalAttended?: number;
	completionRate?: number;
	averageScore?: number;
	overallCompetency?: CompetencyLevel;
	passedCount?: number;
	failedCount?: number;
	averageAttendance?: number;
	certificationsIssued?: number;
	certificationTemplate?: string;
	keyFindings?: string;
	recommendations?: string;
	successMetrics?: any;
	status?: ReportStatus;
	publishedAt?: Date;
	publishedBy?: string;
	reportFileId?: string;
	certificatesFileId?: string;
	reportDate?: Date;
	metaData?: any;
}

// Update input
export interface UpdateTrainingReportInput {
	title?: string;
	description?: string;
	reportType?: ReportType;
	totalParticipants?: number;
	totalAttended?: number;
	completionRate?: number;
	averageScore?: number;
	overallCompetency?: CompetencyLevel;
	passedCount?: number;
	failedCount?: number;
	averageAttendance?: number;
	certificationsIssued?: number;
	certificationTemplate?: string;
	keyFindings?: string;
	recommendations?: string;
	successMetrics?: any;
	status?: ReportStatus;
	publishedAt?: Date;
	publishedBy?: string;
	reportFileId?: string;
	certificatesFileId?: string;
	reportDate?: Date;
	metaData?: any;
}

// Get options with filters
export interface GetTrainingReportsOptions {
	page?: number;
	pageSize?: number;
	reportType?: ReportType;
	status?: ReportStatus;
	trainingEngagementId?: string;
	search?: string;
}

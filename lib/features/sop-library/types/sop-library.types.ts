import type { SOPLibrary, SOPStatus } from "@/generated/prisma/client";

/**
 * SOP Library Types
 * Standard Operating Procedures library management
 */

export type SOPLibraryWithRelations = SOPLibrary & {
	createdByUser?: {
		id: string;
		name: string | null;
		email: string;
	} | null;
	updatedByUser?: {
		id: string;
		name: string | null;
		email: string;
	} | null;
};

export interface CreateSOPInput {
	title: string;
	slug: string;
	description?: string;
	content: string;
	category?: string;
	version?: number;
	versionNotes?: string;
	applicableDepartments?: string;
	applicableRoles?: string;
	requiredCertifications?: string;
	status?: SOPStatus;
	effectiveDate?: Date;
	sunsetDate?: Date;
	attachmentIds?: string;
	coverImageId?: string;
	reviewCycleMonths?: number;
	createdBy?: string;
	metaData?: any;
}

export interface UpdateSOPInput extends Partial<CreateSOPInput> {
	id?: string;
	updatedBy?: string;
	lastReviewedBy?: string;
	lastReviewedAt?: Date;
}

export interface GetSOPsOptions {
	page?: number;
	limit?: number;
	search?: string;
	status?: SOPStatus;
	category?: string;
}

export interface SOPListResult {
	sops: SOPLibraryWithRelations[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// ActionResult is now imported from @/lib/types

import type { Sample, SampleStatus, SampleType } from "@/generated/prisma/client";

// Re-export shared types

// Base types
export type { SampleType, SampleStatus };

// ActionResult is now imported from @/lib/types

// Sample with relations
export interface SampleWithRelations extends Sample {
	testOrder?: {
		id: string;
		title: string;
		status: string;
	};
	tests?: {
		id: string;
		name: string;
		status: string;
	}[];
	_count?: {
		tests: number;
	};
}

// List result with pagination
export interface SampleListResult {
	samples: SampleWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateSampleInput {
	testOrderId: string;
	name: string;
	description?: string;
	type?: SampleType;
	quantity?: number;
	receivedDate?: Date;
	receivedFrom?: string;
	storageLocation?: string;
	condition?: string;
	status?: SampleStatus;
	notes?: string;
	mediaIds?: string;
	metaData?: any;
}

// Update input
export interface UpdateSampleInput {
	name?: string;
	description?: string;
	type?: SampleType;
	quantity?: number;
	receivedDate?: Date;
	receivedFrom?: string;
	storageLocation?: string;
	condition?: string;
	status?: SampleStatus;
	notes?: string;
	mediaIds?: string;
	metaData?: any;
}

// Get options with filters
export interface GetSamplesOptions {
	page?: number;
	pageSize?: number;
	testOrderId?: string;
	type?: SampleType;
	status?: SampleStatus;
	search?: string;
}

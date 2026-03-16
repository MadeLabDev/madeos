/**
 * Form Data UI Component Types
 * Types for components in app/(dashboard)/form-data/*
 */

/**
 * Form Data UI Component Types
 * Types for components in app/(dashboard)/form-data/*
 */

type JsonValue = any; // Prisma JSON type

export interface FormDataItem {
	id: string;
	key: string;
	data: JsonValue;
	ipAddress?: string | null;
	userAgent?: string | null;
	referer?: string | null;
	createdAt: Date;
}

export interface FormDataListProps {
	page: number;
	keyFilter?: string;
	pageSize: number;
}

export interface FormDataResponse {
	success: boolean;
	data: FormDataItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	message?: string;
}

import { SITE_CONFIG } from "@/lib";
import * as formDataRepository from "@/lib/features/form-data/repositories/form-data-repository";

/**
 * Form Data service - Business logic for external form submissions
 */

/**
 * Get all form submissions with pagination and optional key filter
 */
export async function getFormData(params?: { page?: number; pageSize?: number; keyFilter?: string }) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), keyFilter } = params || {};
	const skip = (page - 1) * pageSize;

	const result = await formDataRepository.findAllFormData({
		skip,
		take: pageSize,
		keyFilter,
	});

	return {
		data: result.data,
		total: result.total,
		page,
		pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
}

/**
 * Get form submission by ID
 */
export async function getFormDataById(id: string) {
	const formData = await formDataRepository.findFormDataById(id);
	if (!formData) {
		throw new Error("Form submission not found");
	}
	return formData;
}

/**
 * Get all form submissions by key (for backward compatibility API)
 */
export async function getFormDataByKey(key: string) {
	return formDataRepository.findFormDataByKey(key);
}

/**
 * Create new form submission
 */
export async function createFormData(input: { key: string; field: any; ipAddress?: string; userAgent?: string; referer?: string }) {
	// Validate required fields
	if (!input.key) {
		throw new Error("Missing required field: key");
	}

	if (!input.field) {
		throw new Error("Missing required field: field");
	}

	return formDataRepository.createFormData(input);
}

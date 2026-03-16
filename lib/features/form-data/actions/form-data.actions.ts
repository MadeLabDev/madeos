"use server";

import { SITE_CONFIG } from "@/lib";
import { requirePermission } from "@/lib/permissions";

import * as formDataService from "../services/form-data-service";
import type { FormDataResponse } from "../types";

// ActionResult is now imported from @/lib/types

/**
 * Get all form submissions with pagination and optional key filter (for dashboard)
 */
export async function getFormDataAction(params: { keyFilter?: string; page: number; pageSize: number }): Promise<FormDataResponse> {
	try {
		// Check permission
		await requirePermission("meta", "read");

		const result = await formDataService.getFormData({
			page: params.page || 1,
			pageSize: params.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize"),
			keyFilter: params.keyFilter,
		});

		return {
			success: true,
			data: result.data,
			total: result.total,
			page: result.page,
			limit: result.pageSize,
			totalPages: result.totalPages,
		};
	} catch (error) {
		console.error("[Form Data Action Error]", error);
		return {
			success: false,
			data: [],
			total: 0,
			page: params.page,
			limit: params.pageSize,
			totalPages: 0,
			message: error instanceof Error ? error.message : "Failed to fetch form data",
		};
	}
}

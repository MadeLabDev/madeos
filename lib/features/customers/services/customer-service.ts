/**
 * Customer Service - Business Logic
 */

import { SITE_CONFIG } from "@/lib";
import * as customerRepository from "@/lib/features/customers/repositories/customer-repository";
import type { CreateCustomerInput, CreateEngagementInput, CustomerListParams, CustomerResponse, CustomerWithLocations, EngagementListParams, EngagementResponse, PaginatedCustomerResponse, UpdateCustomerInput, UpdateEngagementInput } from "@/lib/features/customers/types/customer.types";
import type { ActionResult } from "@/lib/types";

// ============================================================================
// CUSTOMER SERVICE
// ============================================================================

export async function getAllCustomers(params?: CustomerListParams): Promise<PaginatedCustomerResponse> {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), search, type } = params || {};

	const result = await customerRepository.getAllCustomers({
		page,
		limit: pageSize,
		search,
		type,
	});

	return {
		customers: result.customers,
		total: result.total,
		page,
		pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
}

export async function getCustomerById(id: string): Promise<CustomerWithLocations> {
	const customer = await customerRepository.getCustomerById(id);
	if (!customer) throw new Error("Customer not found");
	return customer as any;
}

export async function createCustomer(data: CreateCustomerInput): Promise<CustomerResponse> {
	// Validate required fields
	if (!data.companyName?.trim()) throw new Error("Company name is required");
	if (!data.email?.trim()) throw new Error("Email is required");
	if (!data.address?.trim()) throw new Error("Address is required");
	if (!data.city?.trim()) throw new Error("City is required");
	if (!data.state?.trim()) throw new Error("State is required");
	if (!data.zipCode?.trim()) throw new Error("Zip code is required");
	if (!data.contactName?.trim()) throw new Error("Contact name is required");

	// Check email uniqueness
	const existing = await customerRepository.getCustomerByEmail(data.email);
	if (existing) throw new Error("Email already in use");

	return customerRepository.createCustomer(data) as any;
}

export async function updateCustomer(id: string, data: UpdateCustomerInput): Promise<CustomerResponse> {
	// Verify customer exists
	await getCustomerById(id);

	// If email is being updated, check uniqueness (excluding current customer)
	if (data.email) {
		const existing = await customerRepository.getCustomerByEmail(data.email);
		if (existing && existing.id !== id) {
			throw new Error("Email already in use");
		}
	}

	return customerRepository.updateCustomer(id, data) as any;
}

export async function deleteCustomer(id: string): Promise<CustomerResponse> {
	// Verify customer exists
	await getCustomerById(id);

	return customerRepository.deleteCustomer(id) as any;
}

export async function deleteMultipleCustomers(ids: string[]): Promise<{ count: number }> {
	if (ids.length === 0) throw new Error("No customer IDs provided");

	const result = await customerRepository.deleteMultipleCustomers(ids);
	return result;
}

export async function searchCustomers(query: string, limit: number = 20): Promise<CustomerResponse[]> {
	if (!query?.trim()) return [];

	const results = await customerRepository.searchCustomers(query, limit);
	return results as any[];
}

/**
 * Get customer info including parent and all siblings/locations
 */
export async function getCustomerHierarchy(id: string) {
	const customer = await customerRepository.getCustomerWithRelations(id);
	if (!customer) throw new Error("Customer not found");

	// If this is a location (has parent), include all siblings
	if (customer.parentId) {
		const parent = customer.parent;
		const siblings = parent?.locations || [];
		return {
			customer,
			parent,
			siblings,
			isLocation: true,
		};
	}

	// If this is a parent (has locations), include all
	return {
		customer,
		parent: null,
		locations: customer.locations,
		isParent: true,
	};
}

// ============================================================================
// ENGAGEMENT SERVICE
// ============================================================================

export async function getAllEngagements(params?: EngagementListParams): Promise<{ engagements: EngagementResponse[]; total: number }> {
	const { page = 1, pageSize = 50, search, customerId, status } = params || {};

	const result = await customerRepository.getAllEngagements({
		page,
		limit: pageSize,
		search,
		customerId,
		status,
	});

	return {
		engagements: result.engagements,
		total: result.total,
	};
}

export async function getEngagementById(id: string): Promise<EngagementResponse> {
	const engagement = await customerRepository.getEngagementById(id);
	if (!engagement) throw new Error("Engagement not found");
	return engagement;
}

export async function createEngagement(data: CreateEngagementInput & { createdBy: string }): Promise<ActionResult<EngagementResponse>> {
	try {
		// Validate required fields
		if (!data.customerId?.trim()) throw new Error("Customer is required");
		if (!data.title?.trim()) throw new Error("Title is required");
		if (!data.type?.trim()) throw new Error("Type is required");

		const engagement = await customerRepository.createEngagement(data);
		return {
			success: true,
			message: "Engagement created successfully",
			data: engagement,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create engagement",
		};
	}
}

export async function updateEngagement(id: string, data: UpdateEngagementInput & { updatedBy: string }): Promise<ActionResult<EngagementResponse>> {
	try {
		const engagement = await customerRepository.updateEngagement(id, data);
		return {
			success: true,
			message: "Engagement updated successfully",
			data: engagement,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update engagement",
		};
	}
}

export async function deleteEngagement(id: string): Promise<ActionResult> {
	try {
		await customerRepository.deleteEngagement(id);
		return {
			success: true,
			message: "Engagement deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete engagement",
		};
	}
}

export async function deleteMultipleEngagements(ids: string[]): Promise<ActionResult<{ count: number }>> {
	try {
		if (ids.length === 0) throw new Error("No engagement IDs provided");

		const result = await customerRepository.deleteMultipleEngagements(ids);
		return {
			success: true,
			message: `${result.count} engagement(s) deleted successfully`,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete engagements",
		};
	}
}

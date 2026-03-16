"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/config/site";
import * as customerService from "@/lib/features/customers/services/customer-service";
import type { CreateCustomerInput, CustomerListParams, UpdateCustomerInput } from "@/lib/features/customers/types/customer.types";
import type { CreateEngagementInput, EngagementListParams, UpdateEngagementInput } from "@/lib/features/customers/types/customer.types";
import { moduleTypeService } from "@/lib/features/profile/services";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

// ============================================================================
// CUSTOMER ACTIONS
// ============================================================================

export async function getCustomersAction(params?: CustomerListParams & { pageSize?: number }): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const pageSize = params?.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize");
		const result = await customerService.getAllCustomers({
			page: params?.page || 1,
			pageSize: pageSize,
			search: params?.search || "",
			type: params?.type,
		});

		return {
			success: true,
			message: "Customers retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve customers",
		};
	}
}

export async function getCustomerByIdAction(id: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const customer = await customerService.getCustomerById(id);
		return {
			success: true,
			message: "Customer retrieved successfully",
			data: customer,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve customer",
		};
	}
}

export async function getCustomerHierarchyAction(id: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const hierarchy = await customerService.getCustomerHierarchy(id);
		return {
			success: true,
			message: "Customer hierarchy retrieved successfully",
			data: hierarchy,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve customer hierarchy",
		};
	}
}

export async function createCustomerAction(data: CreateCustomerInput): Promise<ActionResult> {
	try {
		await requirePermission("customers", "create");

		const customer = await customerService.createCustomer(data);

		await getPusher().trigger("private-global", "customer_update", {
			action: "customer_created",
			customer,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/customers");
		return {
			success: true,
			message: "Customer created successfully",
			data: customer,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create customer",
		};
	}
}

export async function updateCustomerAction(id: string, data: UpdateCustomerInput): Promise<ActionResult> {
	try {
		await requirePermission("customers", "update");

		const customer = await customerService.updateCustomer(id, data);

		await getPusher().trigger("private-global", "customer_update", {
			action: "customer_updated",
			customer,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/customers");
		revalidatePath(`/customers/${id}`);
		return {
			success: true,
			message: "Customer updated successfully",
			data: customer,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update customer",
		};
	}
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const customer = await customerService.deleteCustomer(id);

		await getPusher().trigger("private-global", "customer_update", {
			action: "customer_deleted",
			customerId: id,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/customers");
		return {
			success: true,
			message: "Customer deleted successfully",
			data: customer,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete customer",
		};
	}
}

export async function bulkDeleteCustomersAction(ids: string[]): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const result = await customerService.deleteMultipleCustomers(ids);

		await getPusher().trigger("private-global", "customer_update", {
			action: "customers_deleted",
			count: result.count,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/customers");
		return {
			success: true,
			message: `${result.count} customer(s) deleted successfully`,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete customers",
		};
	}
}

export async function searchCustomersAction(query: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		if (!query?.trim()) {
			return {
				success: true,
				message: "Search query empty",
				data: [],
			};
		}

		const results = await customerService.searchCustomers(query, 20);
		return {
			success: true,
			message: "Customers searched successfully",
			data: results,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to search customers",
		};
	}
}

/**
 * Export customer as vCard
 */
export async function exportVCardAction(customerId: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const customer = await customerService.getCustomerById(customerId);
		if (!customer) {
			return {
				success: false,
				message: "Customer not found",
			};
		}

		// Generate vCard content with customer information
		const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${customer.contactName}
ORG:${customer.companyName}
TITLE:${customer.contactTitle || ""}
EMAIL:${customer.email}
TEL:${customer.phone || ""}
TEL;TYPE=WORK:${customer.contactPhone || ""}
ADR;TYPE=WORK:;;${customer.address};${customer.city};${customer.state};${customer.zipCode};${customer.country}
URL:${customer.website || ""}
NOTE:${customer.notes || ""}
REV:${customer.createdAt.toISOString()}
END:VCARD`;

		return {
			success: true,
			message: "vCard generated successfully",
			data: {
				vCard: vCardContent,
				filename: `${customer.companyName}_${customer.contactName}.vcf`,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to export vCard",
		};
	}
}

/**
 * Get module types for customer system
 */
export async function getCustomerSystemModuleTypesAction(system: string): Promise<ActionResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		const customerModuleTypes = await moduleTypeService.getModuleTypesBySystem(system);

		return {
			success: true,
			message: "Customer system module types retrieved",
			data: customerModuleTypes,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get customer system module types",
		};
	}
}

// ============================================================================
// ENGAGEMENT ACTIONS
// ============================================================================

export async function getEngagementsAction(params?: EngagementListParams): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const result = await customerService.getAllEngagements(params || {});

		return {
			success: true,
			message: "Engagements retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve engagements",
		};
	}
}

export async function getEngagementByIdAction(id: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const engagement = await customerService.getEngagementById(id);
		return {
			success: true,
			message: "Engagement retrieved successfully",
			data: engagement,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve engagement",
		};
	}
}

export async function createEngagementAction(data: CreateEngagementInput): Promise<ActionResult> {
	try {
		// Check permission
		const user = await requirePermission("customers", "create");

		const result = await customerService.createEngagement({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			revalidatePath("/customers");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create engagement",
		};
	}
}

export async function updateEngagementAction(id: string, data: UpdateEngagementInput): Promise<ActionResult> {
	try {
		// Check permission
		const user = await requirePermission("customers", "update");

		const result = await customerService.updateEngagement(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/customers");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update engagement",
		};
	}
}

export async function deleteEngagementAction(id: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "delete");

		const result = await customerService.deleteEngagement(id);

		if (result.success) {
			revalidatePath("/customers");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete engagement",
		};
	}
}

export async function bulkDeleteEngagementsAction(ids: string[]): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const result = await customerService.deleteMultipleEngagements(ids);

		if (result.success) {
			revalidatePath("/engagements");
			revalidatePath("/customers");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete engagements",
		};
	}
}

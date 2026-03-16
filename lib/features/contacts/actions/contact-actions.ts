"use server";

import { revalidatePath } from "next/cache";

import { SITE_CONFIG } from "@/lib/config/site";
import * as contactService from "@/lib/features/contacts/services/contact-service";
import type { ContactListParams, CreateContactInput, UpdateContactInput } from "@/lib/features/contacts/types/contact.types";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

// ============================================================================
// CONTACT ACTIONS
// ============================================================================

export async function getContactsAction(params?: ContactListParams & { pageSize?: number }): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const pageSize = params?.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize");
		const result = await contactService.getAllContacts({
			page: params?.page || 1,
			pageSize: pageSize,
			search: params?.search || "",
			customerId: params?.customerId,
		});

		return {
			success: true,
			message: "Contacts retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve contacts",
		};
	}
}

export async function getContactByIdAction(id: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const contact = await contactService.getContactById(id);
		return {
			success: true,
			message: "Contact retrieved successfully",
			data: contact,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve contact",
		};
	}
}

export async function createContactAction(data: CreateContactInput): Promise<ActionResult> {
	try {
		await requirePermission("customers", "create");

		const contact = await contactService.createContact(data);

		// Index in vector search (non-blocking)
		try {
			const { indexContact } = await import("@/lib/features/vector-search/actions");
			await indexContact(contact.id, contact.firstName || "", contact.lastName || "", contact.email || "", contact.phone || "", contact.title || "");
		} catch (indexError) {
			console.warn("Failed to index contact:", indexError);
		}

		await getPusher().trigger("private-global", "contact_update", {
			action: "contact_created",
			contact,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/contacts");
		return {
			success: true,
			message: "Contact created successfully",
			data: contact,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create contact",
		};
	}
}

export async function updateContactAction(id: string, data: UpdateContactInput): Promise<ActionResult> {
	try {
		await requirePermission("customers", "update");

		const contact = await contactService.updateContact(id, data);

		// Re-index in vector search (non-blocking)
		try {
			const { deleteEntityVectors, indexContact } = await import("@/lib/features/vector-search/actions");
			// Delete old vectors
			await deleteEntityVectors("contacts", id);
			// Index updated content
			await indexContact(contact.id, contact.firstName || "", contact.lastName || "", contact.email || "", contact.phone || "", contact.title || "");
		} catch (indexError) {
			console.warn("Failed to re-index contact:", indexError);
		}

		await getPusher().trigger("private-global", "contact_update", {
			action: "contact_updated",
			contact,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/contacts");
		return {
			success: true,
			message: "Contact updated successfully",
			data: contact,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update contact",
		};
	}
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const contact = await contactService.deleteContact(id);

		// Clean up vectors (non-blocking)
		try {
			const { deleteEntityVectors } = await import("@/lib/features/vector-search/actions");
			await deleteEntityVectors("contacts", id);
		} catch (indexError) {
			console.warn("Failed to delete contact vectors:", indexError);
		}

		await getPusher().trigger("private-global", "contact_update", {
			action: "contact_deleted",
			contact,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/contacts");
		return {
			success: true,
			message: "Contact deleted successfully",
			data: contact,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete contact",
		};
	}
}

export async function bulkDeleteContactsAction(ids: string[]): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const result = await contactService.deleteMultipleContacts(ids);

		await getPusher().trigger("private-global", "contact_update", {
			action: "contacts_bulk_deleted",
			ids,
			count: result.count,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/contacts");
		return {
			success: true,
			message: `${result.count} contacts deleted successfully`,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete contacts",
		};
	}
}

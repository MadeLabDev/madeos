/**
 * Contact Service - Business Logic
 */

import { SITE_CONFIG } from "@/lib";
import * as contactRepository from "@/lib/features/contacts/repositories/contact-repository";
import type { ContactListParams, CreateContactInput, UpdateContactInput } from "@/lib/features/contacts/types/contact.types";

// ============================================================================
// CONTACT SERVICE
// ============================================================================

export async function getAllContacts(params?: ContactListParams) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), search, customerId } = params || {};

	const result = await contactRepository.getAllContacts({
		page,
		limit: pageSize,
		search,
		customerId,
	});

	return {
		contacts: result.contacts,
		total: result.total,
		page,
		pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
}

export async function getContactById(id: string) {
	const contact = await contactRepository.getContactById(id);
	if (!contact) throw new Error("Contact not found");
	return contact;
}

export async function createContact(data: CreateContactInput) {
	// Validate required fields
	if (!data.firstName?.trim()) throw new Error("First name is required");
	if (!data.lastName?.trim()) throw new Error("Last name is required");
	if (!data.email?.trim()) throw new Error("Email is required");
	if (!data.customerId?.trim()) throw new Error("Customer ID is required");

	// Check email uniqueness
	const existing = await contactRepository.getContactByEmail(data.email);
	if (existing) throw new Error("Email already in use");

	return contactRepository.createContact(data);
}

export async function updateContact(id: string, data: UpdateContactInput) {
	// Verify contact exists
	await getContactById(id);

	// If email is being updated, check uniqueness (excluding current contact)
	if (data.email) {
		const existing = await contactRepository.getContactByEmail(data.email);
		if (existing && existing.id !== id) {
			throw new Error("Email already in use");
		}
	}

	return contactRepository.updateContact(id, data);
}

export async function deleteContact(id: string) {
	// Verify contact exists
	await getContactById(id);

	return contactRepository.deleteContact(id);
}

export async function deleteMultipleContacts(ids: string[]) {
	if (ids.length === 0) throw new Error("No contact IDs provided");

	return contactRepository.bulkDeleteContacts(ids);
}

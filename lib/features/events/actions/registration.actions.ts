/**
 * Registration Actions
 * Server actions for Event Registrations
 */

"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";

import { RegistrationService } from "../services";
import { CreateRegistrationInput, RegistrationWithRelations, TicketSource } from "../types";

/**
 * Register user for event (handles returning users automatically)
 */
export async function registerUserForEvent(eventId: string, userId: string, ticketSource: "INTERNAL" | "EXTERNAL" | "MANUAL" = "INTERNAL", customData?: any) {
	try {
		// Check permission to register for events
		await requirePermission("events", "create");

		const result = await RegistrationService.registerUserForEvent(eventId, userId, ticketSource, customData);

		if (result.success) {
			revalidatePath(`/events/${eventId}`);
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to register user: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create registration
 */
export async function createRegistration(data: CreateRegistrationInput) {
	try {
		await requirePermission("events", "create");

		const result = await RegistrationService.createRegistration(data);

		if (result.success) {
			revalidatePath(`/events/${data.eventId}`);
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create registration: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update registration
 */
export async function updateRegistration(id: string, data: Partial<CreateRegistrationInput>) {
	try {
		await requirePermission("events", "update");

		const result = await RegistrationService.updateRegistration(id, data);

		if (result.success) {
			revalidatePath(`/events/${result.data?.eventId}`);
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update registration: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete registration
 */
export async function deleteRegistration(id: string) {
	try {
		await requirePermission("events", "delete");

		const result = await RegistrationService.deleteRegistration(id);

		if (result.success) {
			revalidatePath(`/events/${result.data?.eventId}`);
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete registration: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Confirm registration
 */
export async function confirmRegistration(id: string) {
	try {
		await requirePermission("events", "update");

		const result = await RegistrationService.confirmRegistration(id);

		if (result.success) {
			revalidatePath(`/events/${result.data?.eventId}`);
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to confirm registration: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Cancel registration
 */
export async function cancelRegistration(id: string) {
	try {
		await requirePermission("events", "update");

		const result = await RegistrationService.cancelRegistration(id);

		if (result.success) {
			revalidatePath(`/events/${result.data?.eventId}`);
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to cancel registration: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create manual registration for external purchases
 */
export async function createManualRegistration(data: { email: string; name?: string; eventId: string; ticketTypeId: string; quantity?: number; ticketSource?: TicketSource; externalTicketId?: string; customData?: any }) {
	try {
		await requirePermission("events", "create");

		// Import user service
		const { getUserByEmail, createUser } = await import("@/lib/features/users/services/user-service");

		// Try to find existing user
		let user;
		try {
			user = await getUserByEmail(data.email);
		} catch (error) {
			// User not found, create new user
			const { getRoleByName } = await import("@/lib/features/users/services/user-service");
			const userRole = await getRoleByName("user");
			if (!userRole) {
				throw new Error('Default "user" role not found');
			}

			user = await createUser({
				email: data.email,
				name: data.name,
				roleIds: [userRole.id],
			});
		}

		// Create registration
		const registrationData = {
			eventId: data.eventId,
			userId: user.id,
			ticketSource: data.ticketSource || TicketSource.EXTERNAL,
			externalTicketId: data.externalTicketId,
			customData: data.customData,
		};

		const result = await RegistrationService.createRegistration(registrationData);

		if (result.success && result.data) {
			// Create tickets
			const { TicketRepository } = await import("../repositories");
			for (let i = 0; i < (data.quantity || 1); i++) {
				const qrCode = crypto.randomUUID();
				await TicketRepository.create({
					ticketTypeId: data.ticketTypeId,
					userId: user.id,
					qrCode,
					registrationId: result.data.id,
				});
			}

			revalidatePath(`/events/${data.eventId}`);
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create manual registration: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get event registrations for check-in
 */
export async function getEventRegistrations(
	eventId: string,
	pagination?: { skip?: number; take?: number },
	filters?: { search?: string; status?: string },
): Promise<{
	success: boolean;
	data?: RegistrationWithRelations[] | { registrations: RegistrationWithRelations[]; total: number };
	message: string;
}> {
	try {
		await requirePermission("events", "read");

		const result = await RegistrationService.getRegistrations(
			{
				eventId,
				search: filters?.search,
				status: filters?.status as any,
			},
			pagination,
		);

		if (pagination) {
			return {
				success: true,
				data: result,
				message: "Event registrations retrieved successfully",
			};
		} else {
			return {
				success: true,
				data: result.registrations,
				message: "Event registrations retrieved successfully",
			};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to get event registrations: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get user registrations for check-in
 */
export async function getUserRegistrations(userId: string): Promise<{
	success: boolean;
	data?: RegistrationWithRelations[];
	message: string;
}> {
	try {
		await requirePermission("events", "read");

		const result = await RegistrationService.getRegistrations({
			userId,
		});

		return {
			success: true,
			data: result.registrations,
			message: "User registrations retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to get user registrations: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Search registrations by user name or email for a specific event
 */
export async function searchRegistration(eventId: string, searchTerm: string) {
	try {
		await requirePermission("events", "read");

		const result = await RegistrationService.searchRegistrations(eventId, searchTerm);

		if (result.success && result.data && result.data.length > 0) {
			return {
				success: true,
				data: result.data[0], // Return the first match
				message: "Registration found successfully",
			};
		} else {
			return {
				success: false,
				message: "No registration found",
			};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to search registrations: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update registration status
 */
export async function updateRegistrationStatus(id: string, status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "REFUNDED") {
	try {
		await requirePermission("events", "update");

		const result = await RegistrationService.updateRegistrationStatus(id, status);

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update registration status: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

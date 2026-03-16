/**
 * Registration Service
 * Business logic for Event Registrations
 */

import type { ActionResult } from "@/lib/types";

import { RegistrationRepository } from "../repositories";
import type { CreateRegistrationInput, RegistrationFilters, RegistrationWithRelations } from "../types";

export class RegistrationService {
	/**
	 * Get all registrations with pagination and filtering
	 */
	static async getRegistrations(filters: RegistrationFilters = {}, options: { skip?: number; take?: number } = {}): Promise<{ registrations: RegistrationWithRelations[]; total: number }> {
		try {
			const [registrations, total] = await Promise.all([RegistrationRepository.findMany(filters, options), RegistrationRepository.count(filters)]);
			return { registrations, total };
		} catch (error) {
			throw new Error(`Failed to fetch registrations: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get registration by ID
	 */
	static async getRegistrationById(id: string): Promise<RegistrationWithRelations | null> {
		try {
			return await RegistrationRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch registration: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Check if user is registered for event
	 */
	static async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
		try {
			return await RegistrationRepository.isUserRegistered(eventId, userId);
		} catch (error) {
			throw new Error(`Failed to check registration status: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Register user for event (auto-handle returning users)
	 * If user is already registered, returns existing registration
	 * If not registered, creates new registration
	 */
	static async registerUserForEvent(eventId: string, userId: string, ticketSource: "INTERNAL" | "EXTERNAL" | "MANUAL" = "INTERNAL", customData?: any): Promise<ActionResult<RegistrationWithRelations>> {
		try {
			const registration = await RegistrationRepository.registerUserForEvent(eventId, userId, ticketSource, customData);
			return {
				success: true,
				data: registration,
				message: "User registered successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to register user: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Create new registration
	 */
	static async createRegistration(data: CreateRegistrationInput): Promise<ActionResult<RegistrationWithRelations>> {
		try {
			const registration = await RegistrationRepository.create(data);
			return {
				success: true,
				data: registration,
				message: "Registration created successfully",
			};
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
	static async updateRegistration(id: string, data: Partial<CreateRegistrationInput>): Promise<ActionResult<RegistrationWithRelations>> {
		try {
			const registration = await RegistrationRepository.update(id, data);
			return {
				success: true,
				data: registration,
				message: "Registration updated successfully",
			};
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
	static async deleteRegistration(id: string): Promise<ActionResult<RegistrationWithRelations>> {
		try {
			const registration = await RegistrationRepository.delete(id);
			return {
				success: true,
				data: registration,
				message: "Registration deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to delete registration: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Confirm registration (change status to CONFIRMED)
	 */
	static async confirmRegistration(id: string): Promise<ActionResult<RegistrationWithRelations>> {
		try {
			const registration = await RegistrationRepository.update(id, { status: "CONFIRMED" } as any);
			return {
				success: true,
				data: registration,
				message: "Registration confirmed successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to confirm registration: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Cancel registration (change status to CANCELLED)
	 */
	static async cancelRegistration(id: string): Promise<ActionResult<RegistrationWithRelations>> {
		try {
			const registration = await RegistrationRepository.update(id, { status: "CANCELLED" } as any);
			return {
				success: true,
				data: registration,
				message: "Registration cancelled successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to cancel registration: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Update registration status
	 */
	static async updateRegistrationStatus(id: string, status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "REFUNDED"): Promise<ActionResult<RegistrationWithRelations>> {
		try {
			const registration = await RegistrationRepository.update(id, { status } as any);
			return {
				success: true,
				data: registration,
				message: `Registration status updated to ${status}`,
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to update registration status: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Check in attendee
	 */
	static async checkInAttendee(id: string, checkedInById: string): Promise<ActionResult<RegistrationWithRelations>> {
		try {
			const registration = await RegistrationRepository.checkIn(id, checkedInById);
			return {
				success: true,
				data: registration,
				message: "Attendee checked in successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to check in attendee: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	/**
	 * Search registrations by user name or email for a specific event
	 */
	static async searchRegistrations(eventId: string, searchTerm: string): Promise<ActionResult<RegistrationWithRelations[]>> {
		try {
			const registrations = await RegistrationRepository.searchRegistrations(eventId, searchTerm);
			return {
				success: true,
				data: registrations,
				message: "Registrations searched successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: `Failed to search registrations: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}
}

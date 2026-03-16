/**
 * CheckIn Actions
 * Server actions for Check-In management
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

import { CheckInService } from "../services";
import type { CheckInInput } from "../types";

/**
 * Check in attendee
 */
export async function checkInAttendeeAction(registrationId: string, checkedInById: string, location?: string) {
	try {
		await requirePermission("events", "update");

		// Validate that the user performing check-in exists
		const checkedInByUser = await prisma.user.findUnique({
			where: { id: checkedInById },
			select: { id: true, email: true },
		});

		if (!checkedInByUser) {
			return {
				success: false,
				message: "Invalid user session. Please log in again.",
			};
		}

		// First, create the check-in record
		const checkInResult = await CheckInService.createCheckIn({
			registrationId,
			checkedInById,
			location,
		});

		// Then update registration to CHECKED_IN status
		if (checkInResult.success) {
			// Import repository directly to avoid type issues
			const { RegistrationRepository } = await import("../repositories");
			const registration = await RegistrationRepository.update(registrationId, {
				status: "CHECKED_IN",
				checkedInAt: new Date(),
				checkedInById,
			} as any);

			if (registration) {
				revalidatePath("/events");
				revalidatePath("/events/check-in");
				revalidatePath(`/events/${registration.eventId}`);
				return {
					success: true,
					data: registration,
					message: "Attendee checked in successfully",
				};
			} else {
				return {
					success: false,
					message: "Failed to update registration",
				};
			}
		}

		return checkInResult;
	} catch (error) {
		console.error("Check-in error:", error);
		return {
			success: false,
			message: `Failed to check in attendee: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create check-in record
 */
export async function createCheckInAction(data: CheckInInput) {
	try {
		await requirePermission("events", "update");

		const result = await CheckInService.createCheckIn(data);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create check-in: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update check-in
 */
export async function updateCheckInAction(id: string, data: Partial<{ location: string; deviceInfo: any }>) {
	try {
		await requirePermission("events", "update");

		const result = await CheckInService.updateCheckIn(id, data);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update check-in: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete check-in
 */
export async function deleteCheckInAction(id: string) {
	try {
		await requirePermission("events", "delete");

		const result = await CheckInService.deleteCheckIn(id);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete check-in: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get event check-in statistics
 */
export async function getEventCheckInStatsAction(eventId: string) {
	try {
		const result = await CheckInService.getEventStats(eventId);
		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to get check-in statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get recent check-ins for a user
 */
export async function getRecentCheckInsAction(userId: string, options: { limit?: number; page?: number; pageSize?: number } = {}) {
	try {
		await requirePermission("events", "read");

		const { limit, page = 1, pageSize } = options;
		const take = pageSize || limit || 5;
		const skip = pageSize ? (page - 1) * pageSize : 0;

		const checkIns = await CheckInService.getCheckInsByUser(userId, { skip, take });
		const recentRegistrations = checkIns.map((checkIn) => checkIn.registration).filter(Boolean);

		// Get total count for pagination
		const totalCheckIns = await CheckInService.countByUser(userId);

		return {
			success: true,
			data: recentRegistrations,
			total: totalCheckIns,
			message: "Recent check-ins retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to get recent check-ins: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * CheckIn Service
 * Business logic for Check-Ins
 */

import type { ActionResult } from "@/lib/types";

import { CheckInRepository } from "../repositories";
import type { CheckInWithRelations } from "../repositories/checkin.repository";
import type { CheckInInput } from "../types";

export class CheckInService {
	/**
	 * Get check-in by ID
	 */
	static async getCheckInById(id: string): Promise<CheckInWithRelations | null> {
		try {
			return await CheckInRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch check-in: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get check-ins by registration
	 */
	static async getCheckInsByRegistration(registrationId: string, options: { skip?: number; take?: number } = {}): Promise<CheckInWithRelations[]> {
		try {
			return await CheckInRepository.findByRegistrationId(registrationId, options);
		} catch (error) {
			throw new Error(`Failed to fetch check-ins: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get check-ins by event
	 */
	static async getCheckInsByEvent(eventId: string, options: { skip?: number; take?: number } = {}): Promise<CheckInWithRelations[]> {
		try {
			return await CheckInRepository.findByEventId(eventId, options);
		} catch (error) {
			throw new Error(`Failed to fetch check-ins: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get check-ins by user (who performed check-in)
	 */
	static async getCheckInsByUser(checkedInById: string, options: { skip?: number; take?: number } = {}): Promise<CheckInWithRelations[]> {
		try {
			return await CheckInRepository.findByCheckedInById(checkedInById, options);
		} catch (error) {
			throw new Error(`Failed to fetch check-ins: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create check-in
	 */
	static async createCheckIn(data: CheckInInput): Promise<ActionResult<CheckInWithRelations>> {
		try {
			const checkIn = await CheckInRepository.create({
				registrationId: data.registrationId,
				checkedInById: data.checkedInById,
				location: data.location,
				deviceInfo: data.deviceInfo,
			});

			return {
				success: true,
				data: checkIn,
				message: "Check-in recorded successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create check-in",
			};
		}
	}

	/**
	 * Update check-in details
	 */
	static async updateCheckIn(id: string, data: Partial<{ location: string; deviceInfo: any }>): Promise<ActionResult<CheckInWithRelations>> {
		try {
			const checkIn = await CheckInRepository.update(id, data);

			return {
				success: true,
				data: checkIn,
				message: "Check-in updated successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update check-in",
			};
		}
	}

	/**
	 * Delete check-in
	 */
	static async deleteCheckIn(id: string): Promise<ActionResult<CheckInWithRelations>> {
		try {
			const checkIn = await CheckInRepository.delete(id);

			return {
				success: true,
				data: checkIn,
				message: "Check-in deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete check-in",
			};
		}
	}

	/**
	 * Get event check-in statistics
	 */
	static async getEventStats(eventId: string): Promise<
		ActionResult<{
			totalCheckedIn: number;
			todayCheckedIn: number;
			lastCheckInAt?: Date;
		}>
	> {
		try {
			const stats = await CheckInRepository.getEventStats(eventId);

			return {
				success: true,
				message: "Check-in statistics retrieved successfully",
				data: stats,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get check-in statistics",
			};
		}
	}

	/**
	 * Count check-ins by user (who performed check-in)
	 */
	static async countByUser(checkedInById: string): Promise<number> {
		try {
			return await CheckInRepository.countByCheckedInById(checkedInById);
		} catch (error) {
			throw new Error(`Failed to count check-ins: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Count check-ins by date range
	 */
	static async countByDateRange(eventId: string, startDate: Date, endDate: Date): Promise<number> {
		try {
			return await CheckInRepository.countByDateRange(eventId, startDate, endDate);
		} catch (error) {
			throw new Error(`Failed to count check-ins: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}

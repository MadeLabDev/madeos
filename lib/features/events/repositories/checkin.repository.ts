/**
 * CheckIn Repository
 * Database operations for Check-Ins
 */

import { prisma } from "@/lib/prisma";

/**
 * CheckIn Types
 */
export type CheckIn = {
	id: string;
	registrationId: string;
	checkedInAt: Date;
	checkedInById: string;
	location?: string | null;
	deviceInfo?: any;
	createdAt: Date;
};

export interface CheckInWithRelations extends CheckIn {
	registration?: any;
	checkedInBy?: any;
}

export class CheckInRepository {
	/**
	 * Find check-in by ID with relations
	 */
	static async findById(id: string): Promise<CheckInWithRelations | null> {
		return prisma.checkIn.findUnique({
			where: { id },
			include: {
				registration: {
					include: {
						user: true,
						event: true,
					},
				},
				checkedInBy: true,
			},
		});
	}

	/**
	 * Find check-ins by registration ID
	 */
	static async findByRegistrationId(registrationId: string, options: { skip?: number; take?: number } = {}): Promise<CheckInWithRelations[]> {
		return prisma.checkIn.findMany({
			where: { registrationId },
			include: {
				registration: {
					include: {
						user: true,
						event: true,
					},
				},
				checkedInBy: true,
			},
			orderBy: { checkedInAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Find check-ins by event ID
	 */
	static async findByEventId(eventId: string, options: { skip?: number; take?: number } = {}): Promise<CheckInWithRelations[]> {
		return prisma.checkIn.findMany({
			where: {
				registration: {
					eventId,
				},
			},
			include: {
				registration: {
					include: {
						user: true,
						event: true,
					},
				},
				checkedInBy: true,
			},
			orderBy: { checkedInAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Find check-ins by checked-in-by user ID
	 */
	static async findByCheckedInById(checkedInById: string, options: { skip?: number; take?: number } = {}): Promise<CheckInWithRelations[]> {
		return prisma.checkIn.findMany({
			where: { checkedInById },
			include: {
				registration: {
					include: {
						user: true,
						event: true,
					},
				},
				checkedInBy: true,
			},
			orderBy: { checkedInAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Create new check-in
	 */
	static async create(data: { registrationId: string; checkedInById: string; location?: string; deviceInfo?: any }): Promise<CheckInWithRelations> {
		return prisma.checkIn.create({
			data,
			include: {
				registration: {
					include: {
						user: true,
						event: true,
					},
				},
				checkedInBy: true,
			},
		});
	}

	/**
	 * Update check-in
	 */
	static async update(
		id: string,
		data: Partial<{
			location: string;
			deviceInfo: any;
		}>,
	): Promise<CheckInWithRelations> {
		return prisma.checkIn.update({
			where: { id },
			data,
			include: {
				registration: {
					include: {
						user: true,
						event: true,
					},
				},
				checkedInBy: true,
			},
		});
	}

	/**
	 * Delete check-in
	 */
	static async delete(id: string): Promise<CheckInWithRelations> {
		return prisma.checkIn.delete({
			where: { id },
			include: {
				registration: {
					include: {
						user: true,
						event: true,
					},
				},
				checkedInBy: true,
			},
		});
	}

	/**
	 * Count check-ins by checked-in-by user ID
	 */
	static async countByCheckedInById(checkedInById: string): Promise<number> {
		return prisma.checkIn.count({
			where: { checkedInById },
		});
	}

	/**
	 * Count check-ins by date range
	 */
	static async countByDateRange(eventId: string, startDate: Date, endDate: Date): Promise<number> {
		return prisma.checkIn.count({
			where: {
				registration: {
					eventId,
				},
				checkedInAt: {
					gte: startDate,
					lte: endDate,
				},
			},
		});
	}

	/**
	 * Get check-in statistics for event
	 */
	static async getEventStats(eventId: string): Promise<{
		totalCheckedIn: number;
		todayCheckedIn: number;
		lastCheckInAt?: Date;
	}> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const totalCheckedIn = await prisma.checkIn.count({
			where: {
				registration: {
					eventId,
				},
			},
		});

		const todayCheckedIn = await prisma.checkIn.count({
			where: {
				registration: {
					eventId,
				},
				checkedInAt: {
					gte: today,
					lt: tomorrow,
				},
			},
		});

		const lastCheckIn = await prisma.checkIn.findFirst({
			where: {
				registration: {
					eventId,
				},
			},
			orderBy: { checkedInAt: "desc" },
			select: { checkedInAt: true },
		});

		return {
			totalCheckedIn,
			todayCheckedIn,
			lastCheckInAt: lastCheckIn?.checkedInAt,
		};
	}
}

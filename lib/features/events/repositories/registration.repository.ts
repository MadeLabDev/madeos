/**
 * Registration Repository
 * Database operations for Event Registrations
 */

import { prisma } from "@/lib/prisma";

import { CreateRegistrationInput, RegistrationFilters, RegistrationWithRelations } from "../types";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class RegistrationRepository {
	/**
	 * Find registration by ID with relations
	 */
	static async findById(id: string): Promise<RegistrationWithRelations | null> {
		return prisma.registration.findUnique({
			where: { id },
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
			},
		});
	}

	/**
	 * Find registrations with filters and pagination
	 */
	static async findMany(filters: RegistrationFilters = {}, options: { skip?: number; take?: number } = {}): Promise<RegistrationWithRelations[]> {
		const where: any = {};

		if (filters.eventId) where.eventId = filters.eventId;
		if (filters.userId) where.userId = filters.userId;
		if (filters.status) where.status = filters.status;
		if (filters.ticketSource) where.ticketSource = filters.ticketSource;
		if (filters.checkedIn !== undefined) where.checkedInAt = filters.checkedIn ? { not: null } : null;

		if (filters.createdAfter) where.registeredAt = { gte: filters.createdAfter };
		if (filters.createdBefore) where.registeredAt = { lte: filters.createdBefore };

		if (filters.search) {
			where.OR = [{ user: { name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } }, { user: { email: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } }, { tickets: { some: { ticketType: { name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } } } }];
		}

		return prisma.registration.findMany({
			where,
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
				tickets: {
					include: {
						ticketType: true,
					},
				},
			},
			orderBy: { registeredAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Check if user is already registered for an event
	 */
	static async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
		const count = await prisma.registration.count({
			where: {
				eventId,
				userId,
				status: { not: "CANCELLED" }, // Consider cancelled registrations as not registered
			},
		});
		return count > 0;
	}

	/**
	 * Create new registration
	 */
	static async create(data: CreateRegistrationInput): Promise<RegistrationWithRelations> {
		return prisma.registration.create({
			data,
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
			},
		});
	}

	/**
	 * Update registration
	 */
	static async update(id: string, data: Partial<CreateRegistrationInput>): Promise<RegistrationWithRelations> {
		return prisma.registration.update({
			where: { id },
			data,
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
			},
		});
	}

	/**
	 * Delete registration
	 */
	static async delete(id: string): Promise<RegistrationWithRelations> {
		return prisma.registration.delete({
			where: { id },
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
			},
		});
	}

	/**
	 * Count registrations with filters
	 */
	static async count(filters: RegistrationFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.eventId) where.eventId = filters.eventId;
		if (filters.userId) where.userId = filters.userId;
		if (filters.status) where.status = filters.status;
		if (filters.ticketSource) where.ticketSource = filters.ticketSource;
		if (filters.checkedIn !== undefined) where.checkedInAt = filters.checkedIn ? { not: null } : null;

		if (filters.createdAfter) where.registeredAt = { gte: filters.createdAfter };
		if (filters.createdBefore) where.registeredAt = { lte: filters.createdBefore };

		if (filters.search) {
			where.OR = [{ user: { name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } }, { user: { email: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } }, { tickets: { some: { ticketType: { name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } } } } }];
		}

		return prisma.registration.count({ where });
	}

	/**
	 * Register user for event (create if not exists, return existing if already registered)
	 */
	static async registerUserForEvent(eventId: string, userId: string, ticketSource: "INTERNAL" | "EXTERNAL" | "MANUAL" = "INTERNAL", customData?: any): Promise<RegistrationWithRelations> {
		// Check if user is already registered
		const existingRegistration = await prisma.registration.findFirst({
			where: {
				eventId,
				userId,
				status: { not: "CANCELLED" },
			},
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
			},
		});

		if (existingRegistration) {
			return existingRegistration;
		}

		// Create new registration
		return prisma.registration.create({
			data: {
				eventId,
				userId,
				ticketSource,
				customData,
				status: "PENDING",
			},
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
			},
		});
	}

	/**
	 * Check in attendee
	 */
	static async checkIn(id: string, checkedInById: string): Promise<RegistrationWithRelations> {
		// First create a check-in record
		await prisma.checkIn.create({
			data: {
				registrationId: id,
				checkedInById,
			},
		});

		// Then update registration status
		return prisma.registration.update({
			where: { id },
			data: {
				status: "CHECKED_IN",
				checkedInAt: new Date(),
				checkedInById,
			},
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
			},
		});
	}

	/**
	 * Search registrations by user name or email for a specific event
	 */
	static async searchRegistrations(eventId: string, searchTerm: string): Promise<RegistrationWithRelations[]> {
		return prisma.registration.findMany({
			where: {
				eventId,
				user: {
					OR: [{ name: { contains: searchTerm, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { email: { contains: searchTerm, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }],
				},
			},
			include: {
				event: true,
				user: true,
				checkedInBy: true,
				checkIns: true,
			},
			orderBy: { registeredAt: "desc" },
		});
	}
}

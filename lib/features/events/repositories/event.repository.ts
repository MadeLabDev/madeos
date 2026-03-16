/**
 * Event Repository
 * Database operations for Events
 */

import { prisma } from "@/lib/prisma";

import { CreateEventInput, EventFilters, EventWithRelations, UpdateEventInput } from "../types";

export class EventRepository {
	/**
	 * Find event by ID with relations
	 */
	static async findById(id: string): Promise<EventWithRelations | null> {
		return prisma.event.findUnique({
			where: { id },
			include: {
				sessions: true,
				ticketTypes: true,
				registrations: {
					include: {
						user: true,
						tickets: {
							include: {
								ticketType: true,
							},
						},
						checkedInBy: true,
						checkIns: true,
					},
				},
				knowledge: true,
				thumbnail: true,
				createdBy: true,
				updatedBy: true,
			},
		});
	}

	/**
	 * Find event by slug with relations
	 */
	static async findBySlug(slug: string): Promise<EventWithRelations | null> {
		return prisma.event.findUnique({
			where: { slug },
			include: {
				sessions: true,
				ticketTypes: true,
				registrations: {
					include: {
						user: true,
						tickets: {
							include: {
								ticketType: true,
							},
						},
						checkedInBy: true,
						checkIns: true,
					},
				},
				knowledge: true,
				thumbnail: true,
				createdBy: true,
				updatedBy: true,
			},
		});
	}

	/**
	 * Find multiple events with pagination and filters
	 */
	static async findMany(filters: EventFilters = {}, options: { skip?: number; take?: number } = {}): Promise<EventWithRelations[]> {
		const where: any = {};

		if (filters.status) where.status = filters.status;
		if (filters.eventType) where.eventType = filters.eventType;
		if (filters.ticketingMode) where.ticketingMode = filters.ticketingMode;
		if (filters.createdById) where.createdById = filters.createdById;

		if (filters.startDate || filters.endDate) {
			where.startDate = {};
			if (filters.startDate) where.startDate.gte = filters.startDate;
			if (filters.endDate) where.startDate.lte = filters.endDate;
		}

		return prisma.event.findMany({
			where,
			include: {
				sessions: true,
				ticketTypes: true,
				registrations: {
					include: {
						user: true,
						tickets: {
							include: {
								ticketType: true,
							},
						},
						checkedInBy: true,
						checkIns: true,
					},
				},
				knowledge: true,
				thumbnail: true,
				createdBy: true,
				updatedBy: true,
			},
			orderBy: { startDate: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Create new event
	 */
	static async create(data: CreateEventInput & { createdById: string; updatedById: string }): Promise<EventWithRelations> {
		return prisma.event.create({
			data,
			include: {
				sessions: true,
				ticketTypes: true,
				registrations: {
					include: {
						user: true,
						tickets: {
							include: {
								ticketType: true,
							},
						},
						checkedInBy: true,
						checkIns: true,
					},
				},
				knowledge: true,
				thumbnail: true,
				createdBy: true,
				updatedBy: true,
			},
		});
	}

	/**
	 * Update event
	 */
	static async update(id: string, data: UpdateEventInput & { updatedById: string }): Promise<EventWithRelations> {
		return prisma.event.update({
			where: { id },
			data,
			include: {
				sessions: true,
				ticketTypes: true,
				registrations: true,
				knowledge: true,
				thumbnail: true,
				createdBy: true,
				updatedBy: true,
			},
		});
	}

	/**
	 * Delete event
	 */
	static async delete(id: string): Promise<EventWithRelations> {
		return prisma.event.delete({
			where: { id },
			include: {
				sessions: true,
				ticketTypes: true,
				registrations: true,
				knowledge: true,
				thumbnail: true,
				createdBy: true,
				updatedBy: true,
			},
		});
	}

	/**
	 * Count events with filters
	 */
	static async count(filters: EventFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.status) where.status = filters.status;
		if (filters.eventType) where.eventType = filters.eventType;
		if (filters.ticketingMode) where.ticketingMode = filters.ticketingMode;
		if (filters.createdById) where.createdById = filters.createdById;

		if (filters.startDate || filters.endDate) {
			where.startDate = {};
			if (filters.startDate) where.startDate.gte = filters.startDate;
			if (filters.endDate) where.startDate.lte = filters.endDate;
		}

		return prisma.event.count({ where });
	}

	/**
	 * Check if slug exists
	 */
	static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
		const count = await prisma.event.count({
			where: {
				slug,
				...(excludeId && { id: { not: excludeId } }),
			},
		});
		return count > 0;
	}

	/**
	 * Create event session
	 */
	static async createSession(data: any): Promise<any> {
		return prisma.eventSession.create({
			data,
		});
	}

	/**
	 * Update event session
	 */
	static async updateSession(id: string, data: any): Promise<any> {
		return prisma.eventSession.update({
			where: { id },
			data,
		});
	}

	/**
	 * Delete event session
	 */
	static async deleteSession(id: string): Promise<any> {
		return prisma.eventSession.delete({
			where: { id },
		});
	}

	/**
	 * Create ticket type
	 */
	static async createTicketType(data: any): Promise<any> {
		return prisma.ticketType.create({
			data,
		});
	}

	/**
	 * Update ticket type
	 */
	static async updateTicketType(id: string, data: any): Promise<any> {
		return prisma.ticketType.update({
			where: { id },
			data,
		});
	}

	/**
	 * Delete ticket type
	 */
	static async deleteTicketType(id: string): Promise<any> {
		return prisma.ticketType.delete({
			where: { id },
		});
	}

	/**
	 * Bulk delete events
	 */
	static async bulkDelete(ids: string[]): Promise<number> {
		const result = await prisma.event.deleteMany({
			where: {
				id: {
					in: ids,
				},
			},
		});
		return result.count;
	}
}

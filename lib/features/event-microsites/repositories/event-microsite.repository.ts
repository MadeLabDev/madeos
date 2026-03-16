import { prisma } from "@/lib/prisma";

import type { CreateEventMicrositeInput, EventMicrositeWithRelations, GetEventMicrositesOptions, UpdateEventMicrositeInput } from "../types/event-microsite.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * EventMicrosite Repository
 * Direct database operations for event microsites
 */

export class EventMicrositeRepository {
	/**
	 * Get all event microsites with filters and pagination
	 */
	static async getAllEventMicrosites(options: GetEventMicrositesOptions = {}) {
		const { page = 1, pageSize = 10, eventId, isPublished, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (eventId) {
			where.eventId = eventId;
		}

		if (isPublished !== undefined) {
			where.isPublished = isPublished;
		}

		if (search) {
			where.OR = [{ heroTitle: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { heroSubtitle: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [microsites, total] = await Promise.all([
			prisma.eventMicrosite.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					event: {
						select: {
							id: true,
							title: true,
							eventType: true,
						},
					},
					heroImage: {
						select: {
							id: true,
							url: true,
						},
					},
					createdBy: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					updatedBy: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.eventMicrosite.count({ where }),
		]);

		return {
			microsites,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get event microsite by ID
	 */
	static async getEventMicrositeById(id: string): Promise<EventMicrositeWithRelations | null> {
		return prisma.eventMicrosite.findUnique({
			where: { id },
			include: {
				event: {
					select: {
						id: true,
						title: true,
						eventType: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						url: true,
					},
				},
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}

	/**
	 * Get event microsite by event ID
	 */
	static async getEventMicrositeByEvent(eventId: string): Promise<EventMicrositeWithRelations | null> {
		return prisma.eventMicrosite.findUnique({
			where: { eventId },
			include: {
				event: {
					select: {
						id: true,
						title: true,
						eventType: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						url: true,
					},
				},
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}

	/**
	 * Create a new event microsite
	 */
	static async createEventMicrosite(data: CreateEventMicrositeInput, userId: string): Promise<EventMicrositeWithRelations> {
		return prisma.eventMicrosite.create({
			data: {
				...data,
				createdById: userId,
				updatedById: userId,
			},
			include: {
				event: {
					select: {
						id: true,
						title: true,
						eventType: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						url: true,
					},
				},
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing event microsite
	 */
	static async updateEventMicrosite(id: string, data: UpdateEventMicrositeInput, userId: string): Promise<EventMicrositeWithRelations> {
		return prisma.eventMicrosite.update({
			where: { id },
			data: {
				...data,
				updatedById: userId,
			},
			include: {
				event: {
					select: {
						id: true,
						title: true,
						eventType: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						url: true,
					},
				},
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}

	/**
	 * Delete an event microsite
	 */
	static async deleteEventMicrosite(id: string): Promise<EventMicrositeWithRelations> {
		return prisma.eventMicrosite.delete({
			where: { id },
			include: {
				event: {
					select: {
						id: true,
						title: true,
						eventType: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						url: true,
					},
				},
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}

	/**
	 * Publish an event microsite
	 */
	static async publishEventMicrosite(id: string, userId: string): Promise<EventMicrositeWithRelations> {
		return prisma.eventMicrosite.update({
			where: { id },
			data: {
				isPublished: true,
				publishedAt: new Date(),
				updatedById: userId,
			},
			include: {
				event: {
					select: {
						id: true,
						title: true,
						eventType: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						url: true,
					},
				},
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}

	/**
	 * Unpublish an event microsite
	 */
	static async unpublishEventMicrosite(id: string, userId: string): Promise<EventMicrositeWithRelations> {
		return prisma.eventMicrosite.update({
			where: { id },
			data: {
				isPublished: false,
				updatedById: userId,
			},
			include: {
				event: {
					select: {
						id: true,
						title: true,
						eventType: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						url: true,
					},
				},
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				updatedBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}
}

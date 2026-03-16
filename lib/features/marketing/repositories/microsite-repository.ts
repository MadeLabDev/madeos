import { prisma } from "@/lib/prisma";

import { CreateEventMicrositeInput, EventMicrosite, UpdateEventMicrositeInput } from "../types/index";

export class EventMicrositeRepository {
	/**
	 * Create a new event microsite
	 */
	async createMicrosite(data: CreateEventMicrositeInput & { createdById: string; updatedById: string }): Promise<EventMicrosite> {
		console.log("Creating microsite with data:", data);
		return prisma.eventMicrosite.create({
			data: data as any,
		}) as any;
	}

	/**
	 * Get microsite by ID with relations
	 */
	async getMicrositeById(id: string): Promise<EventMicrosite | null> {
		return prisma.eventMicrosite.findUnique({
			where: { id },
			include: {
				event: {
					select: {
						id: true,
						title: true,
						startDate: true,
						endDate: true,
						location: true,
						status: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						name: true,
						url: true,
					},
				},
				createdBy: {
					select: { id: true, name: true, email: true },
				},
				updatedBy: {
					select: { id: true, name: true, email: true },
				},
			},
		}) as any;
	}

	/**
	 * Get microsite by event ID
	 */
	async getMicrositeByEventId(eventId: string): Promise<EventMicrosite | null> {
		return prisma.eventMicrosite.findUnique({
			where: { eventId },
			include: {
				event: {
					select: {
						id: true,
						title: true,
						startDate: true,
						endDate: true,
						location: true,
						status: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						name: true,
						url: true,
					},
				},
				createdBy: {
					select: { id: true, name: true, email: true },
				},
				updatedBy: {
					select: { id: true, name: true, email: true },
				},
			},
		}) as any;
	}

	/**
	 * Get all microsites with pagination
	 */
	async getMicrosites(page: number = 1, limit: number = 20): Promise<{ microsites: EventMicrosite[]; total: number }> {
		const skip = (page - 1) * limit;

		const [microsites, total] = await Promise.all([
			prisma.eventMicrosite.findMany({
				skip,
				take: limit,
				include: {
					event: {
						select: {
							id: true,
							title: true,
							startDate: true,
							endDate: true,
							location: true,
							status: true,
						},
					},
					heroImage: {
						select: {
							id: true,
							name: true,
							url: true,
						},
					},
					createdBy: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.eventMicrosite.count(),
		]);

		return { microsites: microsites as any, total };
	}

	/**
	 * Get published microsites for public access
	 */
	async getPublishedMicrosites(): Promise<EventMicrosite[]> {
		return prisma.eventMicrosite.findMany({
			where: { isPublished: true },
			include: {
				event: {
					select: {
						id: true,
						title: true,
						startDate: true,
						endDate: true,
						location: true,
						status: true,
					},
				},
				heroImage: {
					select: {
						id: true,
						name: true,
						url: true,
					},
				},
			},
			orderBy: { publishedAt: "desc" },
		}) as any;
	}

	/**
	 * Update microsite
	 */
	async updateMicrosite(id: string, data: UpdateEventMicrositeInput & { updatedById: string; publishedAt?: Date | null }): Promise<EventMicrosite> {
		return prisma.eventMicrosite.update({
			where: { id },
			data: data as any,
		}) as any;
	}

	/**
	 * Delete microsite
	 */
	async deleteMicrosite(id: string): Promise<EventMicrosite> {
		return prisma.eventMicrosite.delete({
			where: { id },
		}) as any;
	}

	/**
	 * Publish/unpublish microsite
	 */
	async updatePublishStatus(id: string, isPublished: boolean, updatedById: string): Promise<EventMicrosite> {
		const publishedAt = isPublished ? new Date() : null;
		return this.updateMicrosite(id, { isPublished, updatedById, publishedAt }) as any;
	}
}

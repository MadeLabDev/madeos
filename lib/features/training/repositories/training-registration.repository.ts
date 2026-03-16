/**
 * TrainingRegistration Repository
 * Database operations for TrainingRegistrations
 */

import { prisma } from "@/lib/prisma";

import { CreateTrainingRegistrationInput, TrainingRegistrationFilters, TrainingRegistrationWithRelations, UpdateTrainingRegistrationInput } from "../types";

export class TrainingRegistrationRepository {
	/**
	 * Find training registration by ID with relations
	 */
	static async findById(id: string): Promise<TrainingRegistrationWithRelations | null> {
		return prisma.trainingRegistration.findUnique({
			where: { id },
			include: {
				trainingEngagement: true,
				user: true,
				contact: true,
				checkedInBy: true,
				checkIns: {
					include: {
						trainingSession: true,
						checkedInBy: true,
					},
				},
			},
		});
	}

	/**
	 * Find multiple training registrations with pagination and filters
	 */
	static async findMany(filters: TrainingRegistrationFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TrainingRegistrationWithRelations[]> {
		const where: any = {};

		if (filters.trainingEngagementId) where.trainingEngagementId = filters.trainingEngagementId;
		if (filters.userId) where.userId = filters.userId;
		if (filters.contactId) where.contactId = filters.contactId;
		if (filters.status) where.status = filters.status;
		if (filters.registrationSource) where.registrationSource = filters.registrationSource;
		if (filters.checkedIn !== undefined) {
			where.checkedInAt = filters.checkedIn ? { not: null } : null;
		}

		if (filters.registeredAfter || filters.registeredBefore) {
			where.registeredAt = {};
			if (filters.registeredAfter) where.registeredAt.gte = filters.registeredAfter;
			if (filters.registeredBefore) where.registeredAt.lte = filters.registeredBefore;
		}

		if (filters.search) {
			where.OR = [{ user: { name: { contains: filters.search } } }, { user: { email: { contains: filters.search } } }, { contact: { firstName: { contains: filters.search } } }, { contact: { lastName: { contains: filters.search } } }, { contact: { email: { contains: filters.search } } }];
		}

		return prisma.trainingRegistration.findMany({
			where,
			include: {
				trainingEngagement: true,
				user: true,
				contact: true,
				checkedInBy: true,
				checkIns: {
					include: {
						trainingSession: true,
						checkedInBy: true,
					},
				},
			},
			skip: options.skip,
			take: options.take,
			orderBy: { registeredAt: "desc" },
		});
	}

	/**
	 * Count training registrations with filters
	 */
	static async count(filters: TrainingRegistrationFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.trainingEngagementId) where.trainingEngagementId = filters.trainingEngagementId;
		if (filters.userId) where.userId = filters.userId;
		if (filters.contactId) where.contactId = filters.contactId;
		if (filters.status) where.status = filters.status;
		if (filters.registrationSource) where.registrationSource = filters.registrationSource;
		if (filters.checkedIn !== undefined) {
			where.checkedInAt = filters.checkedIn ? { not: null } : null;
		}

		if (filters.registeredAfter || filters.registeredBefore) {
			where.registeredAt = {};
			if (filters.registeredAfter) where.registeredAt.gte = filters.registeredAfter;
			if (filters.registeredBefore) where.registeredAt.lte = filters.registeredBefore;
		}

		if (filters.search) {
			where.OR = [{ user: { name: { contains: filters.search } } }, { user: { email: { contains: filters.search } } }, { contact: { firstName: { contains: filters.search } } }, { contact: { lastName: { contains: filters.search } } }, { contact: { email: { contains: filters.search } } }];
		}

		return prisma.trainingRegistration.count({ where });
	}

	/**
	 * Create new training registration
	 */
	static async create(input: CreateTrainingRegistrationInput & { createdBy?: string }): Promise<TrainingRegistrationWithRelations> {
		return prisma.trainingRegistration.create({
			data: {
				trainingEngagementId: input.trainingEngagementId,
				userId: input.userId,
				contactId: input.contactId,
				registrationSource: input.registrationSource || "INTERNAL",
				externalRegistrationId: input.externalRegistrationId,
				customData: input.customData,
			},
			include: {
				trainingEngagement: true,
				user: true,
				contact: true,
				checkedInBy: true,
				checkIns: {
					include: {
						trainingSession: true,
						checkedInBy: true,
					},
				},
			},
		});
	}

	/**
	 * Update training registration
	 */
	static async update(id: string, input: UpdateTrainingRegistrationInput & { updatedBy?: string }): Promise<TrainingRegistrationWithRelations> {
		return prisma.trainingRegistration.update({
			where: { id },
			data: {
				status: input.status,
				registrationSource: input.registrationSource,
				externalRegistrationId: input.externalRegistrationId,
				customData: input.customData,
				checkedInAt: input.checkedInAt,
				checkedInById: input.checkedInById,
			},
			include: {
				trainingEngagement: true,
				user: true,
				contact: true,
				checkedInBy: true,
				checkIns: {
					include: {
						trainingSession: true,
						checkedInBy: true,
					},
				},
			},
		});
	}

	/**
	 * Delete training registration
	 */
	static async delete(id: string): Promise<TrainingRegistrationWithRelations> {
		return prisma.trainingRegistration.delete({
			where: { id },
			include: {
				trainingEngagement: true,
				user: true,
				contact: true,
				checkedInBy: true,
				checkIns: {
					include: {
						trainingSession: true,
						checkedInBy: true,
					},
				},
			},
		});
	}

	/**
	 * Check in a training registration
	 */
	static async checkIn(id: string, checkedInById: string): Promise<TrainingRegistrationWithRelations> {
		const now = new Date();

		return prisma.trainingRegistration.update({
			where: { id },
			data: {
				status: "CHECKED_IN",
				checkedInAt: now,
				checkedInById,
			},
			include: {
				trainingEngagement: true,
				user: true,
				contact: true,
				checkedInBy: true,
				checkIns: {
					include: {
						trainingSession: true,
						checkedInBy: true,
					},
				},
			},
		});
	}
}

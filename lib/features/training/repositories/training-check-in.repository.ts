/**
 * TrainingCheckIn Repository
 * Database operations for TrainingCheckIns
 */

import { prisma } from "@/lib/prisma";

import { CreateTrainingCheckInInput, TrainingCheckInWithRelations } from "../types";

export class TrainingCheckInRepository {
	/**
	 * Find training check-in by ID with relations
	 */
	static async findById(id: string): Promise<TrainingCheckInWithRelations | null> {
		return prisma.trainingCheckIn.findUnique({
			where: { id },
			include: {
				trainingRegistration: {
					include: {
						trainingEngagement: true,
						user: true,
						contact: true,
					},
				},
				trainingSession: true,
				checkedInBy: true,
			},
		});
	}

	/**
	 * Find multiple training check-ins with pagination and filters
	 */
	static async findMany(
		filters: {
			trainingRegistrationId?: string;
			trainingSessionId?: string;
			checkedInById?: string;
			checkedInAfter?: Date;
			checkedInBefore?: Date;
			search?: string;
		} = {},
		options: { skip?: number; take?: number } = {},
	): Promise<TrainingCheckInWithRelations[]> {
		const where: any = {};

		if (filters.trainingRegistrationId) where.trainingRegistrationId = filters.trainingRegistrationId;
		if (filters.trainingSessionId) where.trainingSessionId = filters.trainingSessionId;
		if (filters.checkedInById) where.checkedInById = filters.checkedInById;

		if (filters.checkedInAfter || filters.checkedInBefore) {
			where.checkedInAt = {};
			if (filters.checkedInAfter) where.checkedInAt.gte = filters.checkedInAfter;
			if (filters.checkedInBefore) where.checkedInAt.lte = filters.checkedInBefore;
		}

		return prisma.trainingCheckIn.findMany({
			where,
			include: {
				trainingRegistration: {
					include: {
						trainingEngagement: true,
						user: true,
						contact: true,
					},
				},
				trainingSession: true,
				checkedInBy: true,
			},
			skip: options.skip,
			take: options.take,
			orderBy: { checkedInAt: "desc" },
		});
	}

	/**
	 * Count training check-ins with filters
	 */
	static async count(
		filters: {
			trainingRegistrationId?: string;
			trainingSessionId?: string;
			checkedInById?: string;
			checkedInAfter?: Date;
			checkedInBefore?: Date;
			search?: string;
		} = {},
	): Promise<number> {
		const where: any = {};

		if (filters.trainingRegistrationId) where.trainingRegistrationId = filters.trainingRegistrationId;
		if (filters.trainingSessionId) where.trainingSessionId = filters.trainingSessionId;
		if (filters.checkedInById) where.checkedInById = filters.checkedInById;

		if (filters.checkedInAfter || filters.checkedInBefore) {
			where.checkedInAt = {};
			if (filters.checkedInAfter) where.checkedInAt.gte = filters.checkedInAfter;
			if (filters.checkedInBefore) where.checkedInAt.lte = filters.checkedInBefore;
		}

		return prisma.trainingCheckIn.count({ where });
	}

	/**
	 * Create new training check-in
	 */
	static async create(input: CreateTrainingCheckInInput & { checkedInById: string }): Promise<TrainingCheckInWithRelations> {
		return prisma.trainingCheckIn.create({
			data: {
				trainingRegistrationId: input.trainingRegistrationId,
				trainingSessionId: input.trainingSessionId,
				checkedInById: input.checkedInById,
				location: input.location,
				deviceInfo: input.deviceInfo,
			},
			include: {
				trainingRegistration: {
					include: {
						trainingEngagement: true,
						user: true,
						contact: true,
					},
				},
				trainingSession: true,
				checkedInBy: true,
			},
		});
	}

	/**
	 * Delete training check-in
	 */
	static async delete(id: string): Promise<TrainingCheckInWithRelations> {
		return prisma.trainingCheckIn.delete({
			where: { id },
			include: {
				trainingRegistration: {
					include: {
						trainingEngagement: true,
						user: true,
						contact: true,
					},
				},
				trainingSession: true,
				checkedInBy: true,
			},
		});
	}
}

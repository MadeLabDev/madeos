import { prisma } from "@/lib/prisma";

import type { CreateSampleInput, GetSamplesOptions, SampleStatus, SampleWithRelations, UpdateSampleInput } from "../types/sample.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * Sample Repository
 * Direct database operations for samples
 */

export class SampleRepository {
	/**
	 * Get all samples with filters and pagination
	 */
	static async getAllSamples(options: GetSamplesOptions = {}) {
		const { page = 1, pageSize = 10, testOrderId, type, status, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (testOrderId) {
			where.testOrderId = testOrderId;
		}

		if (type) {
			where.type = type;
		}

		if (status) {
			where.status = status;
		}

		if (search) {
			where.OR = [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { receivedFrom: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [samples, total] = await Promise.all([
			prisma.sample.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					testOrder: {
						select: {
							id: true,
							title: true,
							status: true,
						},
					},
					_count: {
						select: {
							tests: true,
						},
					},
				},
				orderBy: { receivedDate: "desc" },
			}),
			prisma.sample.count({ where }),
		]);

		return {
			samples,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get sample by ID
	 */
	static async getSampleById(id: string): Promise<SampleWithRelations | null> {
		return prisma.sample.findUnique({
			where: { id },
			include: {
				testOrder: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				tests: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
				_count: {
					select: {
						tests: true,
					},
				},
			},
		});
	}

	/**
	 * Get samples by test order
	 */
	static async getSamplesByTestOrder(testOrderId: string): Promise<SampleWithRelations[]> {
		return prisma.sample.findMany({
			where: { testOrderId },
			include: {
				_count: {
					select: {
						tests: true,
					},
				},
			},
			orderBy: { receivedDate: "desc" },
		});
	}

	/**
	 * Create a new sample
	 */
	static async createSample(data: CreateSampleInput, userId?: string): Promise<SampleWithRelations> {
		return prisma.sample.create({
			data: {
				...data,
				createdBy: userId,
			},
			include: {
				testOrder: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				_count: {
					select: {
						tests: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing sample
	 */
	static async updateSample(id: string, data: UpdateSampleInput, userId?: string): Promise<SampleWithRelations> {
		return prisma.sample.update({
			where: { id },
			data: {
				...data,
				updatedBy: userId,
			},
			include: {
				testOrder: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				_count: {
					select: {
						tests: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a sample
	 */
	static async deleteSample(id: string): Promise<SampleWithRelations> {
		return prisma.sample.delete({
			where: { id },
			include: {
				testOrder: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				_count: {
					select: {
						tests: true,
					},
				},
			},
		});
	}

	/**
	 * Get count of samples by status
	 */
	static async getSampleCountByStatus(): Promise<Record<SampleStatus, number>> {
		const counts = await prisma.sample.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<SampleStatus, number>;
	}
}

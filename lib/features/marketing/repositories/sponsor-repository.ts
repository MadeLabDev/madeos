import { prisma } from "@/lib/prisma";

import { CreateSponsorMaterialInput, SponsorMaterial, SponsorMaterialFilters, UpdateSponsorMaterialInput } from "../types/index";

export class SponsorMaterialRepository {
	/**
	 * Create a new sponsor material
	 */
	async createMaterial(data: CreateSponsorMaterialInput & { createdById: string; updatedById: string }): Promise<SponsorMaterial> {
		console.log("Creating sponsor material with data:", data);
		return prisma.sponsorMaterial.create({
			data: data as any,
		}) as any;
	}

	/**
	 * Get material by ID with relations
	 */
	async getMaterialById(id: string): Promise<SponsorMaterial | null> {
		return prisma.sponsorMaterial.findUnique({
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
				file: {
					select: {
						id: true,
						name: true,
						url: true,
						size: true,
					},
				},
				createdBy: {
					select: { id: true, name: true, email: true },
				},
				updatedBy: {
					select: { id: true, name: true, email: true },
				},
				approvedBy: {
					select: { id: true, name: true, email: true },
				},
			},
		}) as any;
	}

	/**
	 * Get materials by event ID
	 */
	async getMaterialsByEventId(eventId: string): Promise<SponsorMaterial[]> {
		return prisma.sponsorMaterial.findMany({
			where: { eventId },
			include: {
				file: {
					select: {
						id: true,
						name: true,
						url: true,
						size: true,
					},
				},
				createdBy: {
					select: { id: true, name: true, email: true },
				},
			},
			orderBy: { createdAt: "desc" },
		}) as any;
	}

	/**
	 * Get materials by sponsor ID
	 */
	async getMaterialsBySponsorId(sponsorId: string): Promise<SponsorMaterial[]> {
		return prisma.sponsorMaterial.findMany({
			where: { sponsorId },
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
				file: {
					select: {
						id: true,
						name: true,
						url: true,
						size: true,
					},
				},
				createdBy: {
					select: { id: true, name: true, email: true },
				},
			},
			orderBy: { createdAt: "desc" },
		}) as any;
	}

	/**
	 * Get all materials with pagination and filters
	 */
	async getMaterials(filters: SponsorMaterialFilters = {}, page: number = 1, limit: number = 20): Promise<{ materials: SponsorMaterial[]; total: number }> {
		const skip = (page - 1) * limit;
		const where: any = {};

		if (filters.eventId) where.eventId = filters.eventId;
		if (filters.sponsorId) where.sponsorId = filters.sponsorId;
		if (filters.status) where.status = filters.status;
		if (filters.dueBefore) where.dueDate = { lte: filters.dueBefore };
		if (filters.dueAfter) where.dueDate = { gte: filters.dueAfter };

		const [materials, total] = await Promise.all([
			prisma.sponsorMaterial.findMany({
				where,
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
					file: {
						select: {
							id: true,
							name: true,
							url: true,
							size: true,
						},
					},
					createdBy: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.sponsorMaterial.count({ where }),
		]);

		return { materials: materials as any, total };
	}

	/**
	 * Get overdue materials
	 */
	async getOverdueMaterials(): Promise<SponsorMaterial[]> {
		return prisma.sponsorMaterial.findMany({
			where: {
				dueDate: { lt: new Date() },
				status: { in: ["PENDING", "SUBMITTED"] },
			},
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
				file: {
					select: {
						id: true,
						name: true,
						url: true,
						size: true,
					},
				},
				createdBy: {
					select: { id: true, name: true, email: true },
				},
			},
			orderBy: { dueDate: "asc" },
		}) as any;
	}

	/**
	 * Update material
	 */
	async updateMaterial(id: string, data: UpdateSponsorMaterialInput & { updatedById: string; approvedById?: string | null }): Promise<SponsorMaterial> {
		return prisma.sponsorMaterial.update({
			where: { id },
			data: data as any,
		}) as any;
	}

	/**
	 * Delete material
	 */
	async deleteMaterial(id: string): Promise<SponsorMaterial> {
		return prisma.sponsorMaterial.delete({
			where: { id },
		}) as any;
	}

	/**
	 * Update material status
	 */
	async updateStatus(id: string, status: string, updatedById: string, approvedById?: string): Promise<SponsorMaterial> {
		const updateData: any = { status, updatedById };
		if (approvedById) updateData.approvedById = approvedById;
		return this.updateMaterial(id, updateData);
	}
}

import { TemplateType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import { CampaignTemplate, CreateCampaignTemplateInput, UpdateCampaignTemplateInput } from "../types";

export class CampaignTemplateRepository {
	// Create
	async createTemplate(data: CreateCampaignTemplateInput & { createdById: string; updatedById: string }): Promise<CampaignTemplate> {
		return prisma.campaignTemplate.create({
			data,
			include: {
				createdBy: { select: { id: true, name: true, email: true } },
				updatedBy: { select: { id: true, name: true, email: true } },
			},
		});
	}

	// Read
	async getTemplateById(id: string): Promise<CampaignTemplate | null> {
		return prisma.campaignTemplate.findUnique({
			where: { id },
			include: {
				createdBy: { select: { id: true, name: true, email: true } },
				updatedBy: { select: { id: true, name: true, email: true } },
				campaigns: { select: { id: true, title: true, status: true } },
			},
		});
	}

	async getTemplates(filters: any = {}, page: number = 1, limit: number = 20): Promise<{ templates: CampaignTemplate[]; total: number }> {
		const skip = (page - 1) * limit;
		const where = this.buildWhereClause(filters);

		const [templates, total] = await Promise.all([
			prisma.campaignTemplate.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					createdBy: { select: { id: true, name: true, email: true } },
					updatedBy: { select: { id: true, name: true, email: true } },
					campaigns: { select: { id: true }, take: 5 },
				},
			}),
			prisma.campaignTemplate.count({ where }),
		]);

		return { templates, total };
	}

	async getActiveTemplates(): Promise<CampaignTemplate[]> {
		return prisma.campaignTemplate.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
			include: {
				createdBy: { select: { id: true, name: true } },
				updatedBy: { select: { id: true, name: true } },
			},
		});
	}

	async getTemplatesByType(type: TemplateType): Promise<CampaignTemplate[]> {
		return prisma.campaignTemplate.findMany({
			where: { type, isActive: true },
			orderBy: { name: "asc" },
		});
	}

	// Update
	async updateTemplate(id: string, data: UpdateCampaignTemplateInput & { updatedById: string }): Promise<CampaignTemplate> {
		return prisma.campaignTemplate.update({
			where: { id },
			data,
			include: {
				createdBy: { select: { id: true, name: true, email: true } },
				updatedBy: { select: { id: true, name: true, email: true } },
			},
		});
	}

	async toggleActive(id: string, isActive: boolean, updatedById: string): Promise<CampaignTemplate> {
		return prisma.campaignTemplate.update({
			where: { id },
			data: { isActive, updatedById, updatedAt: new Date() },
			include: {
				createdBy: { select: { id: true, name: true } },
				updatedBy: { select: { id: true, name: true } },
			},
		});
	}

	// Delete
	async deleteTemplate(id: string): Promise<CampaignTemplate> {
		return prisma.campaignTemplate.delete({
			where: { id },
			include: {
				createdBy: { select: { id: true, name: true } },
				updatedBy: { select: { id: true, name: true } },
			},
		});
	}

	// Helper: Build where clause for filters
	private buildWhereClause(filters: any) {
		const where: any = {};

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, mode: "insensitive" } }, { subject: { contains: filters.search, mode: "insensitive" } }, { content: { contains: filters.search, mode: "insensitive" } }];
		}

		if (filters.type) {
			where.type = filters.type;
		}

		if (filters.isActive !== undefined) {
			where.isActive = filters.isActive;
		}

		return where;
	}
}

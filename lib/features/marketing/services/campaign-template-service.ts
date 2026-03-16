import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

import { CampaignTemplateRepository } from "../repositories";
import { CampaignTemplate, CampaignTemplateFilters, CreateCampaignTemplateInput, UpdateCampaignTemplateInput } from "../types";

export class CampaignTemplateService {
	private repository = new CampaignTemplateRepository();

	async createTemplate(data: CreateCampaignTemplateInput, userId: string): Promise<ActionResult<CampaignTemplate>> {
		try {
			// Validation
			if (!data.name?.trim()) {
				return { success: false, message: "Template name is required" };
			}
			if (!data.subject?.trim()) {
				return { success: false, message: "Template subject is required" };
			}
			if (!data.content?.trim()) {
				return { success: false, message: "Template content is required" };
			}

			// Check if name already exists
			const existing = await prisma.campaignTemplate.findFirst({
				where: { name: data.name.trim() },
			});
			if (existing) {
				return { success: false, message: "Template with this name already exists" };
			}

			const template = await this.repository.createTemplate({
				...data,
				createdById: userId,
				updatedById: userId,
			});

			return { success: true, message: "Template created successfully", data: template };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create template";
			return { success: false, message };
		}
	}

	async updateTemplate(id: string, data: UpdateCampaignTemplateInput, userId: string): Promise<ActionResult<CampaignTemplate>> {
		try {
			// Verify exists
			const existing = await this.repository.getTemplateById(id);
			if (!existing) {
				return { success: false, message: "Template not found" };
			}

			// Check name uniqueness if changing
			if (data.name && data.name.trim() !== existing.name) {
				const duplicate = await prisma.campaignTemplate.findFirst({
					where: { name: data.name.trim(), id: { not: id } },
				});
				if (duplicate) {
					return { success: false, message: "Template with this name already exists" };
				}
			}

			const template = await this.repository.updateTemplate(id, {
				...data,
				updatedById: userId,
			});
			return { success: true, message: "Template updated successfully", data: template };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update template";
			return { success: false, message };
		}
	}

	async deleteTemplate(id: string): Promise<ActionResult<CampaignTemplate>> {
		try {
			const existing = await this.repository.getTemplateById(id);
			if (!existing) {
				return { success: false, message: "Template not found" };
			}

			// Check if template is used in any campaigns
			const campaigns = await prisma.campaignTemplate.findUnique({
				where: { id },
				select: { _count: { select: { campaigns: true } } },
			});

			if ((campaigns?._count?.campaigns ?? 0) > 0) {
				return {
					success: false,
					message: "Cannot delete template that is being used in campaigns",
				};
			}

			const template = await this.repository.deleteTemplate(id);
			return { success: true, message: "Template deleted successfully", data: template };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete template";
			return { success: false, message };
		}
	}

	async getTemplateById(id: string): Promise<ActionResult<CampaignTemplate | null>> {
		try {
			const template = await this.repository.getTemplateById(id);
			return { success: true, message: "", data: template };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to fetch template";
			return { success: false, message };
		}
	}

	async getTemplates(filters: CampaignTemplateFilters = {}, page: number = 1, limit: number = 20): Promise<ActionResult<{ templates: CampaignTemplate[]; total: number }>> {
		try {
			const result = await this.repository.getTemplates(filters, page, limit);
			return { success: true, message: "", data: result };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to fetch templates";
			return { success: false, message };
		}
	}

	async getActiveTemplates(): Promise<ActionResult<CampaignTemplate[]>> {
		try {
			const templates = await this.repository.getActiveTemplates();
			return { success: true, message: "", data: templates };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to fetch active templates";
			return { success: false, message };
		}
	}

	async toggleActive(id: string, isActive: boolean, userId: string): Promise<ActionResult<CampaignTemplate>> {
		try {
			const existing = await this.repository.getTemplateById(id);
			if (!existing) {
				return { success: false, message: "Template not found" };
			}

			const template = await this.repository.toggleActive(id, isActive, userId);
			return {
				success: true,
				message: `Template ${isActive ? "activated" : "deactivated"} successfully`,
				data: template,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to toggle template status";
			return { success: false, message };
		}
	}
}

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { SponsorMaterialRepository } from "../repositories";
import { CreateSponsorMaterialInput, SponsorMaterial, SponsorMaterialFilters, UpdateSponsorMaterialInput } from "../types/index";

export class SponsorMaterialService {
	private repository = new SponsorMaterialRepository();
	/**
	 * Create a new sponsor material
	 */
	async createMaterial(data: CreateSponsorMaterialInput, userId: string): Promise<ActionResult<SponsorMaterial>> {
		try {
			await requirePermission("marketing", "create");

			const material = await this.repository.createMaterial({
				...data,
				createdById: userId,
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "sponsor_material_update", {
				action: "material_created",
				material: {
					id: material.id,
					eventId: material.eventId,
					sponsorId: material.sponsorId,
					title: material.title,
					status: material.status,
				},
			});

			revalidatePath("/marketing/sponsors");
			revalidatePath(`/marketing/sponsors/${data.eventId}`);

			return {
				success: true,
				message: "Sponsor material created successfully",
				data: material,
			};
		} catch (error) {
			console.error("Error creating sponsor material:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create sponsor material",
			};
		}
	}

	/**
	 * Get material by ID
	 */
	async getMaterialById(id: string): Promise<ActionResult<SponsorMaterial | null>> {
		try {
			await requirePermission("marketing", "read");

			const material = await this.repository.getMaterialById(id);

			return {
				success: true,
				message: "Sponsor material retrieved successfully",
				data: material,
			};
		} catch (error) {
			console.error("Error getting sponsor material:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get sponsor material",
			};
		}
	}

	/**
	 * Get materials by event ID
	 */
	async getMaterialsByEventId(eventId: string): Promise<ActionResult<SponsorMaterial[]>> {
		try {
			await requirePermission("marketing", "read");

			const materials = await this.repository.getMaterialsByEventId(eventId);

			return {
				success: true,
				message: "Sponsor materials retrieved successfully",
				data: materials,
			};
		} catch (error) {
			console.error("Error getting materials by event ID:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get materials",
			};
		}
	}

	/**
	 * Get materials by sponsor ID
	 */
	async getMaterialsBySponsorId(sponsorId: string): Promise<ActionResult<SponsorMaterial[]>> {
		try {
			await requirePermission("marketing", "read");

			const materials = await this.repository.getMaterialsBySponsorId(sponsorId);

			return {
				success: true,
				message: "Sponsor materials retrieved successfully",
				data: materials,
			};
		} catch (error) {
			console.error("Error getting materials by sponsor ID:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get materials",
			};
		}
	}

	/**
	 * Get all materials with pagination and filters
	 */
	async getMaterials(filters: SponsorMaterialFilters = {}, page: number = 1, limit: number = 20): Promise<ActionResult<{ materials: SponsorMaterial[]; total: number }>> {
		try {
			await requirePermission("marketing", "read");

			const result = await this.repository.getMaterials(filters, page, limit);

			return {
				success: true,
				message: "Sponsor materials retrieved successfully",
				data: result,
			};
		} catch (error) {
			console.error("Error getting sponsor materials:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get sponsor materials",
			};
		}
	}

	/**
	 * Get overdue materials
	 */
	async getOverdueMaterials(): Promise<ActionResult<SponsorMaterial[]>> {
		try {
			await requirePermission("marketing", "read");

			const materials = await this.repository.getOverdueMaterials();

			return {
				success: true,
				message: "Overdue materials retrieved successfully",
				data: materials,
			};
		} catch (error) {
			console.error("Error getting overdue materials:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get overdue materials",
			};
		}
	}

	/**
	 * Update material
	 */
	async updateMaterial(id: string, data: UpdateSponsorMaterialInput, userId: string): Promise<ActionResult<SponsorMaterial>> {
		try {
			await requirePermission("marketing", "update");

			const material = await this.repository.updateMaterial(id, {
				...data,
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "sponsor_material_update", {
				action: "material_updated",
				material: {
					id: material.id,
					eventId: material.eventId,
					sponsorId: material.sponsorId,
					title: material.title,
					status: material.status,
				},
			});

			revalidatePath("/marketing/sponsors");
			revalidatePath(`/marketing/sponsors/${material.eventId}`);

			return {
				success: true,
				message: "Sponsor material updated successfully",
				data: material,
			};
		} catch (error) {
			console.error("Error updating sponsor material:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update sponsor material",
			};
		}
	}

	/**
	 * Update material status
	 */
	async updateStatus(id: string, status: string, userId: string, approvedById?: string): Promise<ActionResult<SponsorMaterial>> {
		try {
			await requirePermission("marketing", "update");

			const material = await this.repository.updateStatus(id, status, userId, approvedById);

			// Real-time notification
			await getPusher().trigger("private-global", "sponsor_material_update", {
				action: "material_status_updated",
				material: {
					id: material.id,
					eventId: material.eventId,
					sponsorId: material.sponsorId,
					title: material.title,
					status: material.status,
				},
			});

			revalidatePath("/marketing/sponsors");
			revalidatePath(`/marketing/sponsors/${material.eventId}`);

			return {
				success: true,
				message: "Material status updated successfully",
				data: material,
			};
		} catch (error) {
			console.error("Error updating material status:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update material status",
			};
		}
	}

	/**
	 * Delete material
	 */
	async deleteMaterial(id: string): Promise<ActionResult<SponsorMaterial>> {
		try {
			await requirePermission("marketing", "delete");

			const material = await this.repository.getMaterialById(id);
			if (!material) {
				return {
					success: false,
					message: "Sponsor material not found",
				};
			}

			const deletedMaterial = await this.repository.deleteMaterial(id);

			// Real-time notification
			await getPusher().trigger("private-global", "sponsor_material_update", {
				action: "material_deleted",
				material: {
					id: deletedMaterial.id,
					eventId: deletedMaterial.eventId,
					sponsorId: deletedMaterial.sponsorId,
				},
			});

			revalidatePath("/marketing/sponsors");
			revalidatePath(`/marketing/sponsors/${material.eventId}`);

			return {
				success: true,
				message: "Sponsor material deleted successfully",
				data: deletedMaterial,
			};
		} catch (error) {
			console.error("Error deleting sponsor material:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete sponsor material",
			};
		}
	}
}

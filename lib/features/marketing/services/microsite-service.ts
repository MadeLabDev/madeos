import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { EventMicrositeRepository } from "../repositories";
import { CreateEventMicrositeInput, EventMicrosite, UpdateEventMicrositeInput } from "../types/index";

export class EventMicrositeService {
	private repository = new EventMicrositeRepository();
	/**
	 * Create a new event microsite
	 */
	async createMicrosite(data: CreateEventMicrositeInput, userId: string): Promise<ActionResult<EventMicrosite>> {
		try {
			await requirePermission("marketing", "create");

			// Check if microsite already exists for this event
			const existing = await this.repository.getMicrositeByEventId(data.eventId);
			if (existing) {
				return {
					success: false,
					message: "Microsite already exists for this event",
				};
			}

			const microsite = await this.repository.createMicrosite({
				...data,
				createdById: userId,
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "microsite_update", {
				action: "microsite_created",
				microsite: {
					id: microsite.id,
					eventId: microsite.eventId,
					heroTitle: microsite.heroTitle,
					isPublished: microsite.isPublished,
				},
			});

			revalidatePath("/marketing/microsites");
			revalidatePath(`/events/${data.eventId}`);

			return {
				success: true,
				message: "Event microsite created successfully",
				data: microsite,
			};
		} catch (error) {
			console.error("Error creating microsite:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create microsite",
			};
		}
	}

	/**
	 * Get microsite by ID
	 */
	async getMicrositeById(id: string): Promise<ActionResult<EventMicrosite | null>> {
		try {
			await requirePermission("marketing", "read");

			const microsite = await this.repository.getMicrositeById(id);

			return {
				success: true,
				message: "Microsite retrieved successfully",
				data: microsite,
			};
		} catch (error) {
			console.error("Error getting microsite:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get microsite",
			};
		}
	}

	/**
	 * Get microsite by event ID
	 */
	async getMicrositeByEventId(eventId: string): Promise<ActionResult<EventMicrosite | null>> {
		try {
			await requirePermission("marketing", "read");

			const microsite = await this.repository.getMicrositeByEventId(eventId);

			return {
				success: true,
				message: "Microsite retrieved successfully",
				data: microsite,
			};
		} catch (error) {
			console.error("Error getting microsite by event ID:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get microsite",
			};
		}
	}

	/**
	 * Get all microsites with pagination
	 */
	async getMicrosites(page: number = 1, limit: number = 20): Promise<ActionResult<{ microsites: EventMicrosite[]; total: number }>> {
		try {
			await requirePermission("marketing", "read");

			const result = await this.repository.getMicrosites(page, limit);

			return {
				success: true,
				message: "Microsites retrieved successfully",
				data: result,
			};
		} catch (error) {
			console.error("Error getting microsites:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get microsites",
			};
		}
	}

	/**
	 * Get published microsites for public access
	 */
	async getPublishedMicrosites(): Promise<ActionResult<EventMicrosite[]>> {
		try {
			const microsites = await this.repository.getPublishedMicrosites();

			return {
				success: true,
				message: "Published microsites retrieved successfully",
				data: microsites,
			};
		} catch (error) {
			console.error("Error getting published microsites:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to get published microsites",
			};
		}
	}

	/**
	 * Update microsite
	 */
	async updateMicrosite(id: string, data: UpdateEventMicrositeInput, userId: string): Promise<ActionResult<EventMicrosite>> {
		try {
			await requirePermission("marketing", "update");

			const microsite = await this.repository.updateMicrosite(id, {
				...data,
				updatedById: userId,
			});

			// Real-time notification
			await getPusher().trigger("private-global", "microsite_update", {
				action: "microsite_updated",
				microsite: {
					id: microsite.id,
					eventId: microsite.eventId,
					heroTitle: microsite.heroTitle,
					isPublished: microsite.isPublished,
				},
			});

			revalidatePath("/marketing/microsites");
			revalidatePath(`/marketing/microsites/${microsite.eventId}`);
			revalidatePath(`/events/${microsite.eventId}`);

			return {
				success: true,
				message: "Microsite updated successfully",
				data: microsite,
			};
		} catch (error) {
			console.error("Error updating microsite:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update microsite",
			};
		}
	}

	/**
	 * Publish/unpublish microsite
	 */
	async updatePublishStatus(id: string, isPublished: boolean, userId: string): Promise<ActionResult<EventMicrosite>> {
		try {
			await requirePermission("marketing", "update");

			const microsite = await this.repository.updatePublishStatus(id, isPublished, userId);

			// Real-time notification
			await getPusher().trigger("private-global", "microsite_update", {
				action: isPublished ? "microsite_published" : "microsite_unpublished",
				microsite: {
					id: microsite.id,
					eventId: microsite.eventId,
					heroTitle: microsite.heroTitle,
					isPublished: microsite.isPublished,
				},
			});

			revalidatePath("/marketing/microsites");
			revalidatePath(`/marketing/microsites/${microsite.eventId}`);

			return {
				success: true,
				message: `Microsite ${isPublished ? "published" : "unpublished"} successfully`,
				data: microsite,
			};
		} catch (error) {
			console.error("Error updating publish status:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update publish status",
			};
		}
	}

	/**
	 * Delete microsite
	 */
	async deleteMicrosite(id: string): Promise<ActionResult<EventMicrosite>> {
		try {
			await requirePermission("marketing", "delete");

			const microsite = await this.repository.getMicrositeById(id);
			if (!microsite) {
				return {
					success: false,
					message: "Microsite not found",
				};
			}

			const deletedMicrosite = await this.repository.deleteMicrosite(id);

			// Real-time notification
			await getPusher().trigger("private-global", "microsite_update", {
				action: "microsite_deleted",
				microsite: {
					id: deletedMicrosite.id,
					eventId: deletedMicrosite.eventId,
				},
			});

			revalidatePath("/marketing/microsites");
			revalidatePath(`/events/${microsite.eventId}`);

			return {
				success: true,
				message: "Microsite deleted successfully",
				data: deletedMicrosite,
			};
		} catch (error) {
			console.error("Error deleting microsite:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete microsite",
			};
		}
	}
}

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { EventMicrositeService } from "../services/event-microsite.service";
import type { CreateEventMicrositeInput, GetEventMicrositesOptions, UpdateEventMicrositeInput } from "../types/event-microsite.types";

/**
 * Get all event microsites with filters and pagination
 */
export async function listEventMicrositesAction(options: GetEventMicrositesOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("events", "read");
		const result = await EventMicrositeService.getAllEventMicrosites(options);
		return { success: true, message: "Event microsites retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single event microsite by ID
 */
export async function getEventMicrositeAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "read");
		const microsite = await EventMicrositeService.getEventMicrositeById(id);

		if (!microsite) {
			return { success: false, message: "Event microsite not found" };
		}

		return { success: true, message: "Event microsite retrieved", data: microsite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get event microsite by event ID
 */
export async function getEventMicrositeByEventAction(eventId: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "read");
		const microsite = await EventMicrositeService.getEventMicrositeByEvent(eventId);
		return { success: true, message: "Event microsite retrieved", data: microsite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new event microsite
 */
export async function createEventMicrositeAction(data: CreateEventMicrositeInput): Promise<ActionResult> {
	try {
		await requirePermission("events", "create");
		const session = await auth();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, message: "Unauthorized" };
		}

		const microsite = await EventMicrositeService.createEventMicrosite(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "event_microsite_update", {
			action: "microsite_created",
			microsite,
		});

		// Revalidate paths
		revalidatePath("/events-education/microsites");
		revalidatePath(`/events-education/events/${data.eventId}`);

		return { success: true, message: "Event microsite created", data: microsite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing event microsite
 */
export async function updateEventMicrositeAction(id: string, data: UpdateEventMicrositeInput): Promise<ActionResult> {
	try {
		await requirePermission("events", "update");
		const session = await auth();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, message: "Unauthorized" };
		}

		const microsite = await EventMicrositeService.updateEventMicrosite(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "event_microsite_update", {
			action: "microsite_updated",
			microsite,
		});

		// Revalidate paths
		revalidatePath("/events-education/microsites");
		revalidatePath(`/events-education/microsites/${id}`);
		if (microsite.eventId) {
			revalidatePath(`/events-education/events/${microsite.eventId}`);
		}

		return { success: true, message: "Event microsite updated", data: microsite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete an event microsite
 */
export async function deleteEventMicrositeAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "delete");

		const microsite = await EventMicrositeService.deleteEventMicrosite(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "event_microsite_update", {
			action: "microsite_deleted",
			micrositeId: id,
		});

		// Revalidate paths
		revalidatePath("/events-education/microsites");
		if (microsite.eventId) {
			revalidatePath(`/events-education/events/${microsite.eventId}`);
		}

		return { success: true, message: "Event microsite deleted", data: microsite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Publish an event microsite
 */
export async function publishEventMicrositeAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "update");
		const session = await auth();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, message: "Unauthorized" };
		}

		const microsite = await EventMicrositeService.publishEventMicrosite(id, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "event_microsite_update", {
			action: "microsite_published",
			microsite,
		});

		// Revalidate paths
		revalidatePath("/events-education/microsites");
		revalidatePath(`/events-education/microsites/${id}`);

		return { success: true, message: "Event microsite published", data: microsite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Unpublish an event microsite
 */
export async function unpublishEventMicrositeAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "update");
		const session = await auth();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, message: "Unauthorized" };
		}

		const microsite = await EventMicrositeService.unpublishEventMicrosite(id, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "event_microsite_update", {
			action: "microsite_unpublished",
			microsite,
		});

		// Revalidate paths
		revalidatePath("/events-education/microsites");
		revalidatePath(`/events-education/microsites/${id}`);

		return { success: true, message: "Event microsite unpublished", data: microsite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

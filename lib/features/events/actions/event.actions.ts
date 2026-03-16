/**
 * Event Actions
 * Server actions for Events
 */

"use server";

import { revalidatePath } from "next/cache";

import { deleteEntityVectors, indexEvent } from "@/lib/features/vector-search/actions";
import { requirePermission } from "@/lib/permissions";

import { EventService } from "../services";
import { CreateEventInput, CreateEventSessionInput, CreateTicketTypeInput, UpdateEventInput, UpdateEventSessionInput, UpdateTicketTypeInput } from "../types";

/**
 * Get events for selection (no permission required for basic listing)
 */
export async function getEvents(filters: Parameters<typeof EventService.getEvents>[0] = {}, options: Parameters<typeof EventService.getEvents>[1] = {}) {
	try {
		const events = await EventService.getEvents(filters, options);

		return {
			success: true,
			data: events,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch events: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get events list with filters for admin interface
 */
export async function getEventsList(filters: Parameters<typeof EventService.getEvents>[0] = {}, options: Parameters<typeof EventService.getEvents>[1] = {}) {
	try {
		const events = await EventService.getEvents(filters, options);

		return {
			success: true,
			data: events,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch events: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single event by ID
 */
export async function getEventById(id: string) {
	try {
		const event = await EventService.getEventById(id);

		return {
			success: true,
			data: event,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch event: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new event
 */
export async function createEvent(data: CreateEventInput) {
	try {
		const user = await requirePermission("events", "create");

		const result = await EventService.createEvent({
			...data,
			createdById: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/events");
			// Index for RAG search (non-blocking)
			try {
				await indexEvent(result.data.id, result.data.title, result.data.description, result.data.startDate, result.data.location || undefined);
			} catch (error) {
				console.warn("Failed to index event for RAG:", error);
			}
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create event: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update event
 */
export async function updateEvent(id: string, data: UpdateEventInput) {
	try {
		const user = await requirePermission("events", "update");

		const result = await EventService.updateEvent(id, {
			...data,
			updatedById: user.id,
		});

		if (result.success && result.data) {
			revalidatePath(`/events/${id}`);
			revalidatePath("/events");
			// Re-index for RAG search (non-blocking)
			try {
				await deleteEntityVectors("events", id);
				await indexEvent(result.data.id, result.data.title, result.data.description, result.data.startDate, result.data.location || undefined);
			} catch (error) {
				console.warn("Failed to re-index event for RAG:", error);
			}
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update event status
 */
export async function updateEventStatus(id: string, status: string) {
	try {
		const user = await requirePermission("events", "update");

		const result = await EventService.updateEvent(id, {
			status: status as any,
			updatedById: user.id,
		});

		if (result.success) {
			revalidatePath(`/events/${id}`);
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update event status: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete event
 */
export async function deleteEvent(id: string) {
	try {
		await requirePermission("events", "delete");

		const result = await EventService.deleteEvent(id);

		if (result.success) {
			revalidatePath("/events");
			// Remove from RAG search (non-blocking)
			try {
				await deleteEntityVectors("events", id);
			} catch (error) {
				console.warn("Failed to remove event from RAG:", error);
			}
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create event session
 */
export async function createEventSession(data: CreateEventSessionInput) {
	try {
		await requirePermission("events", "update");

		const result = await EventService.createEventSession(data);

		if (result.success) {
			revalidatePath(`/events/${data.eventId}`);
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create event session: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update event session
 */
export async function updateEventSession(id: string, data: UpdateEventSessionInput) {
	try {
		await requirePermission("events", "update");

		const result = await EventService.updateEventSession(id, data);

		if (result.success) {
			// Revalidate the event page that contains this session
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update event session: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete event session
 */
export async function deleteEventSession(id: string) {
	try {
		await requirePermission("events", "update");

		const result = await EventService.deleteEventSession(id);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete event session: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create ticket type
 */
export async function createTicketType(data: CreateTicketTypeInput) {
	try {
		await requirePermission("events", "update");

		const result = await EventService.createTicketType(data);

		if (result.success) {
			revalidatePath(`/events/${data.eventId}`);
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create ticket type: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update ticket type
 */
export async function updateTicketType(id: string, data: UpdateTicketTypeInput) {
	try {
		await requirePermission("events", "update");

		const result = await EventService.updateTicketType(id, data);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update ticket type: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete ticket type
 */
export async function deleteTicketType(id: string) {
	try {
		await requirePermission("events", "update");

		const result = await EventService.deleteTicketType(id);

		if (result.success) {
			revalidatePath("/events");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete ticket type: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete event
 */
export async function deleteEventAction(eventId: string) {
	try {
		await requirePermission("events", "delete");

		const result = await EventService.deleteEvent(eventId);

		if (result.success) {
			revalidatePath("/events");
			// Remove from RAG search (non-blocking)
			try {
				await deleteEntityVectors("events", eventId);
			} catch (error) {
				console.warn("Failed to remove event from RAG:", error);
			}
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Bulk delete events
 */
export async function bulkDeleteEventsAction(eventIds: string[]) {
	try {
		await requirePermission("events", "delete");

		if (!eventIds.length) {
			return {
				success: false,
				message: "No events selected",
			};
		}

		const result = await EventService.bulkDeleteEvents(eventIds);

		if (result.success) {
			revalidatePath("/events");
			// Remove from RAG search (non-blocking)
			try {
				for (const eventId of eventIds) {
					await deleteEntityVectors("events", eventId);
				}
			} catch (error) {
				console.warn("Failed to remove events from RAG:", error);
			}
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete events: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

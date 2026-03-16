/**
 * Event Service
 * Business logic for Events
 */

import type { ActionResult } from "@/lib/types";

import { EventRepository } from "../repositories";
import type { CreateEventInput, CreateEventSessionInput, CreateTicketTypeInput, EventFilters, EventWithRelations, UpdateEventInput, UpdateEventSessionInput, UpdateTicketTypeInput } from "../types";

export class EventService {
	/**
	 * Get all events with pagination and filtering
	 */
	static async getEvents(filters: EventFilters = {}, options: { skip?: number; take?: number } = {}): Promise<EventWithRelations[]> {
		try {
			return await EventRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch events: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single event by ID
	 */
	static async getEventById(id: string): Promise<EventWithRelations | null> {
		try {
			return await EventRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch event: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get event by slug
	 */
	static async getEventBySlug(slug: string): Promise<EventWithRelations | null> {
		try {
			return await EventRepository.findBySlug(slug);
		} catch (error) {
			throw new Error(`Failed to fetch event: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new event
	 */
	static async createEvent(input: CreateEventInput & { createdById: string }): Promise<ActionResult<EventWithRelations>> {
		try {
			// Validate slug is unique
			if (await EventRepository.slugExists(input.slug)) {
				return {
					success: false,
					message: "Event slug already exists",
				};
			}

			const event = await EventRepository.create({
				...input,
				updatedById: input.createdById,
			});

			return {
				success: true,
				message: "Event created successfully",
				data: event,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create event",
			};
		}
	}

	/**
	 * Update event
	 */
	static async updateEvent(id: string, input: UpdateEventInput & { updatedById: string }): Promise<ActionResult<EventWithRelations>> {
		try {
			// Check if event exists
			const existingEvent = await EventRepository.findById(id);
			if (!existingEvent) {
				return {
					success: false,
					message: "Event not found",
				};
			}

			// Validate slug uniqueness if changed
			if (input.slug && input.slug !== existingEvent.slug) {
				if (await EventRepository.slugExists(input.slug, id)) {
					return {
						success: false,
						message: "Event slug already exists",
					};
				}
			}

			const event = await EventRepository.update(id, input);

			return {
				success: true,
				message: "Event updated successfully",
				data: event,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update event",
			};
		}
	}

	/**
	 * Delete event
	 */
	static async deleteEvent(id: string): Promise<ActionResult<EventWithRelations>> {
		try {
			// Check if event exists
			const existingEvent = await EventRepository.findById(id);
			if (!existingEvent) {
				return {
					success: false,
					message: "Event not found",
				};
			}

			const event = await EventRepository.delete(id);

			return {
				success: true,
				message: "Event deleted successfully",
				data: event,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete event",
			};
		}
	}

	/**
	 * Bulk delete events
	 */
	static async bulkDeleteEvents(ids: string[]): Promise<ActionResult<number>> {
		try {
			if (!ids.length) {
				return {
					success: false,
					message: "No events selected",
				};
			}

			const deletedCount = await EventRepository.bulkDelete(ids);

			return {
				success: true,
				data: deletedCount,
				message: `${deletedCount} events deleted successfully`,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete events",
			};
		}
	}

	/**
	 * Count events with filters
	 */
	static async countEvents(filters: Parameters<typeof EventRepository.count>[0]): Promise<number> {
		try {
			return await EventRepository.count(filters);
		} catch (error) {
			throw new Error(`Failed to count events: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create event session
	 */
	static async createEventSession(input: CreateEventSessionInput): Promise<ActionResult<any>> {
		try {
			const session = await EventRepository.createSession(input);
			return {
				success: true,
				data: session,
				message: "Event session created successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create event session",
			};
		}
	}

	/**
	 * Update event session
	 */
	static async updateEventSession(id: string, input: UpdateEventSessionInput): Promise<ActionResult<any>> {
		try {
			const session = await EventRepository.updateSession(id, input);
			return {
				success: true,
				data: session,
				message: "Event session updated successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update event session",
			};
		}
	}

	/**
	 * Delete event session
	 */
	static async deleteEventSession(id: string): Promise<ActionResult<any>> {
		try {
			const session = await EventRepository.deleteSession(id);
			return {
				success: true,
				data: session,
				message: "Event session deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete event session",
			};
		}
	}

	/**
	 * Create ticket type
	 */
	static async createTicketType(input: CreateTicketTypeInput): Promise<ActionResult<any>> {
		try {
			const ticketType = await EventRepository.createTicketType(input);
			return {
				success: true,
				data: ticketType,
				message: "Ticket type created successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create ticket type",
			};
		}
	}

	/**
	 * Update ticket type
	 */
	static async updateTicketType(id: string, input: UpdateTicketTypeInput): Promise<ActionResult<any>> {
		try {
			const ticketType = await EventRepository.updateTicketType(id, input);
			return {
				success: true,
				data: ticketType,
				message: "Ticket type updated successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update ticket type",
			};
		}
	}

	/**
	 * Delete ticket type
	 */
	static async deleteTicketType(id: string): Promise<ActionResult<any>> {
		try {
			const ticketType = await EventRepository.deleteTicketType(id);
			return {
				success: true,
				data: ticketType,
				message: "Ticket type deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete ticket type",
			};
		}
	}
}

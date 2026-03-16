import { EventMicrositeRepository } from "../repositories/event-microsite.repository";
import type { CreateEventMicrositeInput, GetEventMicrositesOptions, UpdateEventMicrositeInput } from "../types/event-microsite.types";

/**
 * EventMicrosite Service
 * Business logic and validation for event microsites
 */

export class EventMicrositeService {
	/**
	 * Get all event microsites with filters
	 */
	static async getAllEventMicrosites(options: GetEventMicrositesOptions = {}) {
		return EventMicrositeRepository.getAllEventMicrosites(options);
	}

	/**
	 * Get event microsite by ID
	 */
	static async getEventMicrositeById(id: string) {
		return EventMicrositeRepository.getEventMicrositeById(id);
	}

	/**
	 * Get event microsite by event ID
	 */
	static async getEventMicrositeByEvent(eventId: string) {
		return EventMicrositeRepository.getEventMicrositeByEvent(eventId);
	}

	/**
	 * Create a new event microsite
	 */
	static async createEventMicrosite(data: CreateEventMicrositeInput, userId: string) {
		// Validation
		if (!data.heroTitle?.trim()) {
			throw new Error("Hero title is required");
		}

		if (!data.description?.trim()) {
			throw new Error("Description is required");
		}

		if (!data.eventId) {
			throw new Error("Event ID is required");
		}

		if (!userId) {
			throw new Error("User ID is required");
		}

		// Check if event already has a microsite
		const existing = await EventMicrositeRepository.getEventMicrositeByEvent(data.eventId);
		if (existing) {
			throw new Error("Event microsite already exists for this event");
		}

		return EventMicrositeRepository.createEventMicrosite(data, userId);
	}

	/**
	 * Update an existing event microsite
	 */
	static async updateEventMicrosite(id: string, data: UpdateEventMicrositeInput, userId: string) {
		// Validation
		if (data.heroTitle !== undefined && !data.heroTitle.trim()) {
			throw new Error("Hero title cannot be empty");
		}

		if (data.description !== undefined && !data.description.trim()) {
			throw new Error("Description cannot be empty");
		}

		if (!userId) {
			throw new Error("User ID is required");
		}

		return EventMicrositeRepository.updateEventMicrosite(id, data, userId);
	}

	/**
	 * Delete an event microsite
	 */
	static async deleteEventMicrosite(id: string) {
		return EventMicrositeRepository.deleteEventMicrosite(id);
	}

	/**
	 * Publish an event microsite
	 */
	static async publishEventMicrosite(id: string, userId: string) {
		if (!userId) {
			throw new Error("User ID is required");
		}

		return EventMicrositeRepository.publishEventMicrosite(id, userId);
	}

	/**
	 * Unpublish an event microsite
	 */
	static async unpublishEventMicrosite(id: string, userId: string) {
		if (!userId) {
			throw new Error("User ID is required");
		}

		return EventMicrositeRepository.unpublishEventMicrosite(id, userId);
	}
}

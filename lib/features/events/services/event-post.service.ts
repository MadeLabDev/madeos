import { ActionResult } from "@/lib/types";

import { eventPostRepository } from "../repositories/event-post.repository";

class EventPostService {
	async addSpeakerToEvent(eventId: string, postId: string): Promise<ActionResult> {
		try {
			// Check if the post exists and is of type "speaker"
			const post = await eventPostRepository.getPostById(postId);
			if (!post) {
				return { success: false, message: "Post not found" };
			}

			if (post.type !== "speaker") {
				return { success: false, message: "Post must be of type 'speaker'" };
			}

			// Check if the event exists
			const event = await eventPostRepository.getEventById(eventId);
			if (!event) {
				return { success: false, message: "Event not found" };
			}

			// Check if the relationship already exists
			const existing = await eventPostRepository.getEventSpeakerByIds(eventId, postId);
			if (existing) {
				return { success: false, message: "Speaker is already assigned to this event" };
			}

			await eventPostRepository.addSpeakerToEvent(eventId, postId);
			return { success: true, message: "Speaker added to event successfully" };
		} catch (error) {
			console.error("Error adding speaker to event:", error);
			return { success: false, message: "Failed to add speaker to event" };
		}
	}

	async removeSpeakerFromEvent(eventId: string, postId: string): Promise<ActionResult> {
		try {
			await eventPostRepository.removeSpeakerFromEvent(eventId, postId);
			return { success: true, message: "Speaker removed from event successfully" };
		} catch (error) {
			console.error("Error removing speaker from event:", error);
			return { success: false, message: "Failed to remove speaker from event" };
		}
	}

	async addSponsorToEvent(eventId: string, postId: string): Promise<ActionResult> {
		try {
			// Check if the post exists and is of type "sponsor"
			const post = await eventPostRepository.getPostById(postId);
			if (!post) {
				return { success: false, message: "Post not found" };
			}

			if (post.type !== "sponsor") {
				return { success: false, message: "Post must be of type 'sponsor'" };
			}

			// Check if the event exists
			const event = await eventPostRepository.getEventById(eventId);
			if (!event) {
				return { success: false, message: "Event not found" };
			}

			// Check if the relationship already exists
			const existing = await eventPostRepository.getEventSponsorByIds(eventId, postId);
			if (existing) {
				return { success: false, message: "Sponsor is already assigned to this event" };
			}

			await eventPostRepository.addSponsorToEvent(eventId, postId);
			return { success: true, message: "Sponsor added to event successfully" };
		} catch (error) {
			console.error("Error adding sponsor to event:", error);
			return { success: false, message: "Failed to add sponsor to event" };
		}
	}

	async removeSponsorFromEvent(eventId: string, postId: string): Promise<ActionResult> {
		try {
			await eventPostRepository.removeSponsorFromEvent(eventId, postId);
			return { success: true, message: "Sponsor removed from event successfully" };
		} catch (error) {
			console.error("Error removing sponsor from event:", error);
			return { success: false, message: "Failed to remove sponsor from event" };
		}
	}

	async getEventSpeakers(eventId: string): Promise<ActionResult<any[]>> {
		try {
			console.log("Service: Getting event speakers for eventId:", eventId);
			const speakers = await eventPostRepository.getEventSpeakers(eventId);
			console.log("Service: Retrieved speakers:", speakers);
			return { success: true, message: "Event speakers retrieved successfully", data: speakers };
		} catch (error) {
			console.error("Error getting event speakers:", error);
			return { success: false, message: "Failed to get event speakers" };
		}
	}

	async getEventSponsors(eventId: string): Promise<ActionResult<any[]>> {
		try {
			console.log("Service: Getting event sponsors for eventId:", eventId);
			const sponsors = await eventPostRepository.getEventSponsors(eventId);
			console.log("Service: Retrieved sponsors:", sponsors);
			return { success: true, message: "Event sponsors retrieved successfully", data: sponsors };
		} catch (error) {
			console.error("Error getting event sponsors:", error);
			return { success: false, message: "Failed to get event sponsors" };
		}
	}
}

export const eventPostService = new EventPostService();

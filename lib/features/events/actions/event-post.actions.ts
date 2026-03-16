"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import { ActionResult } from "@/lib/types";

import { eventPostService } from "../services/event-post.service";

export async function addSpeakerToEventAction(eventId: string, postId: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "update");

		const result = await eventPostService.addSpeakerToEvent(eventId, postId);

		if (result.success) {
			await getPusher().trigger("private-global", "event_speaker_update", { action: "speaker_added", eventId, postId });
			revalidatePath(`/events/${eventId}`);
		}

		return result;
	} catch (error) {
		console.error("Failed to add speaker to event:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to add speaker to event",
		};
	}
}

export async function removeSpeakerFromEventAction(eventId: string, postId: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "update");

		const result = await eventPostService.removeSpeakerFromEvent(eventId, postId);

		if (result.success) {
			await getPusher().trigger("private-global", "event_speaker_update", { action: "speaker_removed", eventId, postId });
			revalidatePath(`/events/${eventId}`);
		}

		return result;
	} catch (error) {
		console.error("Failed to remove speaker from event:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to remove speaker from event",
		};
	}
}

export async function addSponsorToEventAction(eventId: string, postId: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "update");

		const result = await eventPostService.addSponsorToEvent(eventId, postId);

		if (result.success) {
			await getPusher().trigger("private-global", "event_sponsor_update", { action: "sponsor_added", eventId, postId });
			revalidatePath(`/events/${eventId}`);
		}

		return result;
	} catch (error) {
		console.error("Failed to add sponsor to event:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to add sponsor to event",
		};
	}
}

export async function removeSponsorFromEventAction(eventId: string, postId: string): Promise<ActionResult> {
	try {
		await requirePermission("events", "update");

		const result = await eventPostService.removeSponsorFromEvent(eventId, postId);

		if (result.success) {
			await getPusher().trigger("private-global", "event_sponsor_update", { action: "sponsor_removed", eventId, postId });
			revalidatePath(`/events/${eventId}`);
		}

		return result;
	} catch (error) {
		console.error("Failed to remove sponsor from event:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to remove sponsor from event",
		};
	}
}

export async function getEventSpeakersAction(eventId: string): Promise<ActionResult<any[]>> {
	try {
		console.log("Checking permission for events read...");
		await requirePermission("events", "read");
		console.log("Permission granted, calling service...");

		const result = await eventPostService.getEventSpeakers(eventId);
		console.log("Service result:", result);
		return result;
	} catch (error) {
		console.error("Failed to get event speakers:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get event speakers",
		};
	}
}

export async function getEventSponsorsAction(eventId: string): Promise<ActionResult<any[]>> {
	try {
		console.log("Checking permission for events read...");
		await requirePermission("events", "read");
		console.log("Permission granted, calling service...");

		const result = await eventPostService.getEventSponsors(eventId);
		console.log("Service result:", result);
		return result;
	} catch (error) {
		console.error("Failed to get event sponsors:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get event sponsors",
		};
	}
}

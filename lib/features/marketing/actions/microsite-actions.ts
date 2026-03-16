"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

import { EventMicrositeService } from "../services";
import { CreateEventMicrositeInput, EventMicrosite, UpdateEventMicrositeInput } from "../types/index";

const eventMicrositeService = new EventMicrositeService();

/**
 * Create a new event microsite
 */
export async function createEventMicrositeAction(data: CreateEventMicrositeInput): Promise<ActionResult<EventMicrosite>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);

	// Validate that the user exists in the database
	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true },
	});

	if (!userExists) {
		console.error("User not found in database:", session.user.id);

		// In development mode, try to find a valid user as fallback
		if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
			console.log("Dev mode: trying to find a valid user as fallback");
			const fallbackUser = await prisma.user.findFirst({
				select: { id: true, email: true },
			});

			if (fallbackUser) {
				console.log("Using fallback user:", fallbackUser);
				return await eventMicrositeService.createMicrosite(data, fallbackUser.id);
			}
		}

		return {
			success: false,
			message: "User not found",
		};
	}

	return await eventMicrositeService.createMicrosite(data, session.user.id);
}

/**
 * Get microsite by ID
 */
export async function getEventMicrositeByIdAction(id: string): Promise<ActionResult<EventMicrosite | null>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return await eventMicrositeService.getMicrositeById(id);
}

/**
 * Get microsite by event ID
 */
export async function getEventMicrositeByEventIdAction(eventId: string): Promise<ActionResult<EventMicrosite | null>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return await eventMicrositeService.getMicrositeByEventId(eventId);
}

/**
 * Get all microsites with pagination
 */
export async function getEventMicrositesAction(page: number = 1, limit: number = 20): Promise<ActionResult<{ microsites: EventMicrosite[]; total: number }>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	return await eventMicrositeService.getMicrosites(page, limit);
}

/**
 * Get published microsites for public access
 */
export async function getPublishedEventMicrositesAction(): Promise<ActionResult<EventMicrosite[]>> {
	return await eventMicrositeService.getPublishedMicrosites();
}

/**
 * Update microsite
 */
export async function updateEventMicrositeAction(id: string, data: UpdateEventMicrositeInput): Promise<ActionResult<EventMicrosite>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);

	// Validate that the user exists in the database
	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true },
	});

	if (!userExists) {
		console.error("User not found in database:", session.user.id);

		// In development mode, try to find a valid user as fallback
		if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
			console.log("Dev mode: trying to find a valid user as fallback");
			const fallbackUser = await prisma.user.findFirst({
				select: { id: true, email: true },
			});

			if (fallbackUser) {
				console.log("Using fallback user:", fallbackUser);
				return await eventMicrositeService.updateMicrosite(id, data, fallbackUser.id);
			}
		}

		return {
			success: false,
			message: "User not found",
		};
	}

	return await eventMicrositeService.updateMicrosite(id, data, session.user.id);
}

/**
 * Publish/unpublish microsite
 */
export async function updateEventMicrositePublishStatusAction(id: string, isPublished: boolean): Promise<ActionResult<EventMicrosite>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);

	// Validate that the user exists in the database
	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true },
	});

	if (!userExists) {
		console.error("User not found in database:", session.user.id);

		// In development mode, try to find a valid user as fallback
		if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
			console.log("Dev mode: trying to find a valid user as fallback");
			const fallbackUser = await prisma.user.findFirst({
				select: { id: true, email: true },
			});

			if (fallbackUser) {
				console.log("Using fallback user:", fallbackUser);
				return await eventMicrositeService.updatePublishStatus(id, isPublished, fallbackUser.id);
			}
		}

		return {
			success: false,
			message: "User not found",
		};
	}

	return await eventMicrositeService.updatePublishStatus(id, isPublished, session.user.id);
}

/**
 * Delete microsite
 */
export async function deleteEventMicrositeAction(id: string): Promise<ActionResult<EventMicrosite>> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			success: false,
			message: "Authentication required",
		};
	}

	console.log("Session user ID:", session.user.id);

	// Validate that the user exists in the database
	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true },
	});

	if (!userExists) {
		console.error("User not found in database:", session.user.id);

		// In development mode, try to find a valid user as fallback
		if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
			console.log("Dev mode: trying to find a valid user as fallback");
			const fallbackUser = await prisma.user.findFirst({
				select: { id: true, email: true },
			});

			if (fallbackUser) {
				console.log("Using fallback user:", fallbackUser);
				return await eventMicrositeService.deleteMicrosite(id);
			}
		}

		return {
			success: false,
			message: "User not found",
		};
	}

	return await eventMicrositeService.deleteMicrosite(id);
}

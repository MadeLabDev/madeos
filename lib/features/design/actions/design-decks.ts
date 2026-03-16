"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";

import { addSlideService, createDesignDeckService, deleteDesignDeckService, getDesignDeckByIdService, getDesignDecksService, removeSlideService, updateDesignDeckService, updateSlideService } from "../services/design-deck-service";
import { ActionResult, DesignDeckSlide } from "../types";

export async function getDesignDecksAction(projectId: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getDesignDecksService(projectId);
		return {
			success: true,
			message: "Design decks fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch design decks",
		};
	}
}

export async function getDesignDeckAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getDesignDeckByIdService(id);
		return {
			success: true,
			message: "Design deck fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch design deck",
		};
	}
}

export async function createDesignDeckAction(input: Parameters<typeof createDesignDeckService>[0]): Promise<ActionResult> {
	try {
		await requirePermission("design", "create");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await createDesignDeckService({
			...input,
			createdBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "design_deck_created",
			data,
		});

		revalidatePath(`/design-projects/${input.designProjectId}/decks`);

		return {
			success: true,
			message: "Design deck created successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create design deck",
		};
	}
}

export async function updateDesignDeckAction(id: string, input: Parameters<typeof updateDesignDeckService>[1]): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await updateDesignDeckService(id, {
			...input,
			updatedBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "design_deck_updated",
			data,
		});

		revalidatePath(`/design-projects/${data.designProjectId}/decks`);
		revalidatePath(`/design-projects/${data.designProjectId}/decks/${id}`);

		return {
			success: true,
			message: "Design deck updated successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update design deck",
		};
	}
}

export async function deleteDesignDeckAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		const deck = await getDesignDeckByIdService(id);

		await deleteDesignDeckService(id);

		await getPusher().trigger("private-global", "design_update", {
			action: "design_deck_deleted",
			deckId: id,
		});

		revalidatePath(`/design-projects/${deck.designProjectId}/decks`);

		return {
			success: true,
			message: "Design deck deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete design deck",
		};
	}
}

export async function addDesignDeckSlideAction(deckId: string, slide: DesignDeckSlide): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");

		const data = await addSlideService(deckId, slide);

		await getPusher().trigger("private-global", "design_update", {
			action: "design_deck_slide_added",
			data,
		});

		revalidatePath(`/design-projects`);

		return {
			success: true,
			message: "Slide added successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to add slide",
		};
	}
}

export async function updateDesignDeckSlideAction(deckId: string, slideId: string, updates: Partial<DesignDeckSlide>): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");

		const data = await updateSlideService(deckId, slideId, updates);

		await getPusher().trigger("private-global", "design_update", {
			action: "design_deck_slide_updated",
			data,
		});

		revalidatePath(`/design-projects`);

		return {
			success: true,
			message: "Slide updated successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update slide",
		};
	}
}

export async function removeDesignDeckSlideAction(deckId: string, slideId: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		const data = await removeSlideService(deckId, slideId);

		await getPusher().trigger("private-global", "design_update", {
			action: "design_deck_slide_removed",
			data,
		});

		revalidatePath(`/design-projects`);

		return {
			success: true,
			message: "Slide removed successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to remove slide",
		};
	}
}

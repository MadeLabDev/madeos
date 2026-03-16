import { z } from "zod";

import { DesignDeckRepository } from "../repositories/design-deck.repository";
import type { CreateDesignDeckInput, DesignDeckSlide, UpdateDesignDeckInput } from "../types";

const slideSchema = z.object({
	id: z.string().optional(),
	deckId: z.string(),
	slideIndex: z.number().int().nonnegative(),
	title: z.string().min(1, "Slide title required"),
	description: z.string().optional(),
	imageUrl: z.string().optional(),
	notes: z.string().optional(),
	metaData: z.any().optional(),
});

const createDesignDeckSchema = z.object({
	designProjectId: z.string().min(1, "Design project ID required"),
	title: z.string().min(1, "Title required").max(255),
	description: z.string().optional(),
	status: z.enum(["DRAFT", "IN_PROGRESS", "IN_REVIEW", "APPROVED", "REJECTED"]).optional(),
});

const updateDesignDeckSchema = createDesignDeckSchema.partial();

export async function getDesignDecksService(designProjectId: string) {
	if (!designProjectId) throw new Error("Design project ID required");
	return DesignDeckRepository.findMany({ designProjectId });
}

export async function getDesignDeckByIdService(id: string) {
	if (!id) throw new Error("Design deck ID required");

	const deck = await DesignDeckRepository.findById(id);
	if (!deck) throw new Error("Design deck not found");

	return deck;
}

export async function createDesignDeckService(data: CreateDesignDeckInput) {
	const validated = createDesignDeckSchema.parse(data);
	return DesignDeckRepository.create(validated as CreateDesignDeckInput & { createdBy: string });
}

export async function updateDesignDeckService(id: string, data: UpdateDesignDeckInput) {
	if (!id) throw new Error("Design deck ID required");

	const deck = await DesignDeckRepository.findById(id);
	if (!deck) throw new Error("Design deck not found");

	const validated = updateDesignDeckSchema.parse(data);
	return DesignDeckRepository.update(id, validated as UpdateDesignDeckInput & { updatedBy: string });
}

export async function deleteDesignDeckService(id: string) {
	if (!id) throw new Error("Design deck ID required");

	const deck = await DesignDeckRepository.findById(id);
	if (!deck) throw new Error("Design deck not found");

	return DesignDeckRepository.delete(id);
}

export async function addSlideService(deckId: string, slide: DesignDeckSlide) {
	if (!deckId) throw new Error("Design deck ID required");

	const deck = await DesignDeckRepository.findById(deckId);
	if (!deck) throw new Error("Design deck not found");

	const validatedSlide = slideSchema.parse(slide);
	// TODO: Implement slide storage when backend supports it
	return validatedSlide;
}

export async function updateSlideService(deckId: string, slideId: string, updates: Partial<DesignDeckSlide>) {
	if (!deckId) throw new Error("Design deck ID required");
	if (!slideId) throw new Error("Slide ID required");

	const deck = await DesignDeckRepository.findById(deckId);
	if (!deck) throw new Error("Design deck not found");

	const validatedUpdates = slideSchema.partial().parse(updates);
	// TODO: Implement slide update when backend supports it
	return validatedUpdates;
}

export async function removeSlideService(deckId: string, slideId: string) {
	if (!deckId) throw new Error("Design deck ID required");
	if (!slideId) throw new Error("Slide ID required");

	const deck = await DesignDeckRepository.findById(deckId);
	if (!deck) throw new Error("Design deck not found");

	// TODO: Implement slide removal when backend supports it
	return { success: true };
}

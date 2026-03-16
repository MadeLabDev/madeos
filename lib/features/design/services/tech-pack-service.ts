import { z } from "zod";

import { TechPackRepository } from "../repositories/tech-pack.repository";
import type { CreateTechPackInput, UpdateTechPackInput } from "../types";

const createTechPackSchema = z.object({
	productDesignId: z.string().min(1, "Product design ID required"),
	title: z.string().min(1, "Title required").max(255),
	description: z.string().optional(),
	specifications: z.string().optional(),
	materials: z.string().optional(),
	manufacturing: z.string().optional(),
	pricing: z.string().optional(),
	status: z.enum(["DRAFT", "IN_PROGRESS", "IN_REVIEW", "APPROVED", "REJECTED"]).optional(),
	mediaId: z.string().optional(),
});

const updateTechPackSchema = createTechPackSchema.partial();

export async function getTechPacksService(productDesignId: string) {
	if (!productDesignId) throw new Error("Product design ID required");
	return TechPackRepository.findMany({ productDesignId });
}

export async function getTechPackByIdService(id: string) {
	if (!id) throw new Error("Tech pack ID required");

	const techPack = await TechPackRepository.findById(id);
	if (!techPack) throw new Error("Tech pack not found");

	return techPack;
}

export async function createTechPackService(data: CreateTechPackInput) {
	const validated = createTechPackSchema.parse(data);
	return TechPackRepository.create(validated as any);
}

export async function updateTechPackService(id: string, data: UpdateTechPackInput) {
	if (!id) throw new Error("Tech pack ID required");

	const techPack = await TechPackRepository.findById(id);
	if (!techPack) throw new Error("Tech pack not found");

	const validated = updateTechPackSchema.parse(data);
	return TechPackRepository.update(id, validated as UpdateTechPackInput & { updatedBy: string });
}

export async function deleteTechPackService(id: string) {
	if (!id) throw new Error("Tech pack ID required");

	const techPack = await TechPackRepository.findById(id);
	if (!techPack) throw new Error("Tech pack not found");

	return TechPackRepository.delete(id);
}

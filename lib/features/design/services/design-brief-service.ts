import { z } from "zod";

import { DesignBriefRepository } from "../repositories/design-brief.repository";
import type { CreateDesignBriefInput, UpdateDesignBriefInput } from "../types";

const createDesignBriefSchema = z.object({
	designProjectId: z.string().min(1, "Design project ID required"),
	title: z.string().min(1, "Title required").max(255),
	description: z.string().optional(),
	brandInfo: z.string().optional(),
	targetAudience: z.string().optional(),
	objectives: z.string().optional(),
	deliverables: z.string().optional(),
	status: z.enum(["DRAFT", "APPROVED", "REJECTED"]).optional(),
	requestedBy: z.string().optional(),
});

const updateDesignBriefSchema = createDesignBriefSchema.partial();

export async function getDesignBriefsService(designProjectId: string) {
	if (!designProjectId) throw new Error("Design project ID required");
	return DesignBriefRepository.findMany({ designProjectId });
}

export async function getDesignBriefByIdService(id: string) {
	if (!id) throw new Error("Design brief ID required");

	const brief = await DesignBriefRepository.findById(id);
	if (!brief) throw new Error("Design brief not found");

	return brief;
}

export async function createDesignBriefService(data: CreateDesignBriefInput) {
	const validated = createDesignBriefSchema.parse(data);
	return DesignBriefRepository.create(validated as any);
}

export async function updateDesignBriefService(id: string, data: UpdateDesignBriefInput) {
	if (!id) throw new Error("Design brief ID required");

	const brief = await DesignBriefRepository.findById(id);
	if (!brief) throw new Error("Design brief not found");

	const validated = updateDesignBriefSchema.parse(data);
	return DesignBriefRepository.update(id, validated as any);
}

export async function deleteDesignBriefService(id: string) {
	if (!id) throw new Error("Design brief ID required");

	const brief = await DesignBriefRepository.findById(id);
	if (!brief) throw new Error("Design brief not found");

	return DesignBriefRepository.delete(id);
}

import { z } from "zod";

import { DesignProjectRepository } from "../repositories/design-project.repository";
import type { CreateDesignProjectInput, DesignProjectListParams, UpdateDesignProjectInput } from "../types";

// Validation schemas
const createDesignProjectSchema = z.object({
	engagementId: z.string().min(1, "Engagement ID required"),
	customerId: z.string().min(1, "Customer ID required"),
	title: z.string().min(1, "Title required").max(255),
	description: z.string().optional(),
	status: z.enum(["DRAFT", "IN_PROGRESS", "REVIEW", "APPROVED", "COMPLETED"]).optional(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
	requestedBy: z.string().optional(),
	assignedTo: z.string().optional(),
	startDate: z.date().optional(),
	dueDate: z.date().optional(),
	budget: z.number().positive().optional(),
	notes: z.string().optional(),
	metaData: z.record(z.string(), z.any()).optional(),
});

const updateDesignProjectSchema = createDesignProjectSchema.partial();

export async function getDesignProjectsService(params: DesignProjectListParams) {
	try {
		return await DesignProjectRepository.findMany(params, {});
	} catch (error) {
		throw new Error(`Failed to fetch design projects: ${error}`);
	}
}

export async function getDesignProjectByIdService(id: string) {
	if (!id) throw new Error("Design project ID required");

	const project = await DesignProjectRepository.findById(id);
	if (!project) throw new Error("Design project not found");

	return project;
}

export async function createDesignProjectService(data: CreateDesignProjectInput) {
	const validated = createDesignProjectSchema.parse(data);

	if (validated.dueDate && validated.startDate) {
		if (validated.dueDate < validated.startDate) {
			throw new Error("Due date must be after start date");
		}
	}

	return DesignProjectRepository.create(validated as CreateDesignProjectInput & { createdBy: string });
}

export async function updateDesignProjectService(id: string, data: UpdateDesignProjectInput) {
	if (!id) throw new Error("Design project ID required");

	const project = await DesignProjectRepository.findById(id);
	if (!project) throw new Error("Design project not found");

	const validated = updateDesignProjectSchema.parse(data);

	if (validated.dueDate && validated.startDate) {
		if (validated.dueDate < validated.startDate) {
			throw new Error("Due date must be after start date");
		}
	}

	return DesignProjectRepository.update(id, validated as UpdateDesignProjectInput & { updatedBy: string });
}

export async function deleteDesignProjectService(id: string) {
	if (!id) throw new Error("Design project ID required");

	const project = await DesignProjectRepository.findById(id);
	if (!project) throw new Error("Design project not found");

	return DesignProjectRepository.delete(id);
}

export async function getDesignProjectsByEngagementService(engagementId: string) {
	if (!engagementId) throw new Error("Engagement ID required");
	return DesignProjectRepository.findMany({ engagementId });
}

export async function getDesignProjectsByCustomerService(customerId: string) {
	if (!customerId) throw new Error("Customer ID required");
	return DesignProjectRepository.findMany({ customerId });
}

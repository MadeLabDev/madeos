"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { SampleService } from "../services/sample.service";
import type { CreateSampleInput, GetSamplesOptions, UpdateSampleInput } from "../types/sample.types";

/**
 * Get all samples with filters and pagination
 */
export async function listSamplesAction(options: GetSamplesOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const result = await SampleService.getAllSamples(options);
		return { success: true, message: "Samples retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single sample by ID
 */
export async function getSampleAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const sample = await SampleService.getSampleById(id);

		if (!sample) {
			return { success: false, message: "Sample not found" };
		}

		return { success: true, message: "Sample retrieved", data: sample };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get samples by test order
 */
export async function getSamplesByTestOrderAction(testOrderId: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const samples = await SampleService.getSamplesByTestOrder(testOrderId);
		return { success: true, message: "Samples retrieved", data: samples };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new sample
 */
export async function createSampleAction(data: CreateSampleInput): Promise<ActionResult> {
	try {
		await requirePermission("testing", "create");
		const session = await auth();
		const userId = session?.user?.id;

		const sample = await SampleService.createSample(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "sample_update", {
			action: "sample_created",
			sample,
		});

		// Revalidate paths
		revalidatePath("/testing-development/samples");
		revalidatePath(`/testing-development/test-orders/${data.testOrderId}`);

		return { success: true, message: "Sample created", data: sample };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing sample
 */
export async function updateSampleAction(id: string, data: UpdateSampleInput): Promise<ActionResult> {
	try {
		await requirePermission("testing", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const sample = await SampleService.updateSample(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "sample_update", {
			action: "sample_updated",
			sample,
		});

		// Revalidate paths
		revalidatePath("/testing-development/samples");
		revalidatePath(`/testing-development/samples/${id}`);
		if (sample.testOrderId) {
			revalidatePath(`/testing-development/test-orders/${sample.testOrderId}`);
		}

		return { success: true, message: "Sample updated", data: sample };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a sample
 */
export async function deleteSampleAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "delete");

		const sample = await SampleService.deleteSample(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "sample_update", {
			action: "sample_deleted",
			sampleId: id,
		});

		// Revalidate paths
		revalidatePath("/testing-development/samples");
		if (sample.testOrderId) {
			revalidatePath(`/testing-development/test-orders/${sample.testOrderId}`);
		}

		return { success: true, message: "Sample deleted", data: sample };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get sample statistics
 */
export async function getSampleStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const statistics = await SampleService.getSampleStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

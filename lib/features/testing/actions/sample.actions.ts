/**
 * Sample Actions
 * Server actions for Samples
 */

"use server";

import { revalidatePath } from "next/cache";

import { SampleService } from "@/lib/features/testing/services";
import { CreateSampleInput, UpdateSampleInput } from "@/lib/features/testing/types";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

/**
 * Get samples for selection (no permission required for basic listing)
 */
export async function getSamples(filters: Parameters<typeof SampleService.getSamples>[0] = {}, options: Parameters<typeof SampleService.getSamples>[1] = {}) {
	try {
		const samples = await SampleService.getSamples(filters, options);

		return {
			success: true,
			data: samples,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch samples: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get samples list with filters for admin interface
 */
export async function getSamplesList(filters: Parameters<typeof SampleService.getSamples>[0] = {}, options: Parameters<typeof SampleService.getSamples>[1] = {}) {
	try {
		const samples = await SampleService.getSamples(filters, options);

		return {
			success: true,
			data: samples,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch samples: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single sample by ID
 */
export async function getSampleById(id: string) {
	try {
		const sample = await SampleService.getSampleById(id);

		return {
			success: true,
			data: sample,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch sample: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get samples by test order ID
 */
export async function getSamplesByTestOrderId(testOrderId: string) {
	try {
		const samples = await SampleService.getSamples({ testOrderId });

		return {
			success: true,
			data: samples,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch samples for test order: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new sample
 */
export async function createSample(data: CreateSampleInput) {
	try {
		const user = await requirePermission("testing", "create");

		const result = await SampleService.createSample({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			if (result.data) {
				await broadcastToAll("sample_update", {
					action: "sample_created",
					sample: result.data,
					timestamp: new Date().toISOString(),
				});
			}
			revalidatePath("/test-management");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create sample: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update sample
 */
export async function updateSample(id: string, data: UpdateSampleInput) {
	try {
		const user = await requirePermission("testing", "update");

		const result = await SampleService.updateSample(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			if (result.data) {
				await broadcastToAll("sample_update", {
					action: "sample_updated",
					sample: result.data,
					timestamp: new Date().toISOString(),
				});
			}
			revalidatePath("/test-management");
			revalidatePath(`/testing/samples/${id}`);
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update sample: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete sample
 */
export async function deleteSample(id: string) {
	try {
		await requirePermission("testing", "delete");

		const result = await SampleService.deleteSample(id);

		if (result.success) {
			await broadcastToAll("sample_update", {
				action: "sample_deleted",
				sample: { id },
				timestamp: new Date().toISOString(),
			});
			revalidatePath("/test-management");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete sample: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

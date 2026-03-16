"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { TrainingReportService } from "../services/training-report.service";
import type { CreateTrainingReportInput, GetTrainingReportsOptions, UpdateTrainingReportInput } from "../types/training-report.types";

export async function listTrainingReportsAction(options: GetTrainingReportsOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");
		const result = await TrainingReportService.getAllTrainingReports(options);
		return { success: true, message: "Training reports retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

export async function getTrainingReportAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");
		const trainingReport = await TrainingReportService.getTrainingReportById(id);

		if (!trainingReport) {
			return { success: false, message: "Training report not found" };
		}

		return { success: true, message: "Training report retrieved", data: trainingReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

export async function getTrainingReportByEngagementAction(trainingEngagementId: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");
		const trainingReport = await TrainingReportService.getTrainingReportByEngagement(trainingEngagementId);

		return { success: true, message: "Training report retrieved", data: trainingReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

export async function createTrainingReportAction(data: CreateTrainingReportInput): Promise<ActionResult> {
	try {
		await requirePermission("training", "create");
		const session = await auth();
		const userId = session?.user?.id;

		const trainingReport = await TrainingReportService.createTrainingReport(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "training_report_update", {
			action: "report_created",
			trainingReport,
		});

		// Revalidate paths
		revalidatePath("/training-support/training-reports");
		revalidatePath(`/training-support/engagements/${data.trainingEngagementId}`);

		return { success: true, message: "Training report created", data: trainingReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

export async function updateTrainingReportAction(id: string, data: UpdateTrainingReportInput): Promise<ActionResult> {
	try {
		await requirePermission("training", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const trainingReport = await TrainingReportService.updateTrainingReport(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "training_report_update", {
			action: "report_updated",
			trainingReport,
		});

		// Revalidate paths
		revalidatePath("/training-support/training-reports");
		revalidatePath(`/training-support/training-reports/${id}`);
		if (trainingReport.trainingEngagementId) {
			revalidatePath(`/training-support/engagements/${trainingReport.trainingEngagementId}`);
		}

		return { success: true, message: "Training report updated", data: trainingReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

export async function deleteTrainingReportAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "delete");

		const trainingReport = await TrainingReportService.deleteTrainingReport(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "training_report_update", {
			action: "report_deleted",
			trainingReportId: id,
		});

		// Revalidate paths
		revalidatePath("/training-support/training-reports");
		if (trainingReport.trainingEngagementId) {
			revalidatePath(`/training-support/engagements/${trainingReport.trainingEngagementId}`);
		}

		return { success: true, message: "Training report deleted", data: trainingReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

export async function publishTrainingReportAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("training", "update");
		const session = await auth();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, message: "User not authenticated" };
		}

		const trainingReport = await TrainingReportService.publishTrainingReport(id, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "training_report_update", {
			action: "report_published",
			trainingReport,
		});

		// Revalidate paths
		revalidatePath("/training-support/training-reports");
		revalidatePath(`/training-support/training-reports/${id}`);
		if (trainingReport.trainingEngagementId) {
			revalidatePath(`/training-support/engagements/${trainingReport.trainingEngagementId}`);
		}

		return { success: true, message: "Training report published", data: trainingReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

export async function getTrainingReportStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("training", "read");
		const statistics = await TrainingReportService.getTrainingReportStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

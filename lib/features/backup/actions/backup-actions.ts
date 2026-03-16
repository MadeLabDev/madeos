"use server";

/**
 * Backup server actions - Thin wrapper around service layer with permission checks
 */

import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import { backupService } from "../services/backup-service";
import type { BackupRecord, BackupResult, BackupStats } from "../types/backup.types";

/**
 * Create manual backup (admin only)
 */
export async function createManualBackupAction(): Promise<ActionResult<BackupResult>> {
	try {
		await requirePermission("backup", "create");

		const result = await backupService.createBackup("manual");

		if (result.success) {
			return {
				success: true,
				message: `Backup created successfully: ${result.fileName}`,
				data: result,
			};
		} else {
			return {
				success: false,
				message: `Backup failed: ${result.error}`,
			};
		}
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create backup",
		};
	}
}

/**
 * Get backup statistics (admin only)
 */
export async function getBackupStatsAction(): Promise<ActionResult<BackupStats>> {
	try {
		await requirePermission("backup", "read");

		const stats = await backupService.getBackupStats();

		return {
			success: true,
			message: "Backup statistics retrieved successfully",
			data: stats,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get backup statistics",
		};
	}
}

/**
 * List backup files (admin only)
 */
export async function listBackupsAction(): Promise<ActionResult<BackupRecord[]>> {
	try {
		await requirePermission("backup", "read");

		const backups = await backupService.listBackups();

		return {
			success: true,
			message: "Backup list retrieved successfully",
			data: backups,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to list backups",
		};
	}
}

/**
 * Cleanup old backups (admin only)
 */
export async function cleanupOldBackupsAction(): Promise<ActionResult<void>> {
	try {
		await requirePermission("backup", "delete");

		await backupService.cleanupOldBackups();

		return {
			success: true,
			message: "Old backups cleaned up successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to cleanup old backups",
		};
	}
}

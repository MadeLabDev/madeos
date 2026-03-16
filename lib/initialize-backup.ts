/**
 * Backup Service Initializer
 * Initializes scheduled backup when app starts
 * Called once during app initialization
 */

import { backupService } from "@/lib/features/backup/services/backup-service";

let isInitialized = false;

/**
 * Initialize backup service with scheduled backups
 */
export async function initializeBackup(): Promise<void> {
	if (isInitialized) {
		return; // Already initialized
	}

	try {
		// Initialize scheduled backup
		backupService.initializeScheduledBackup();

		isInitialized = true;
		console.log("[Backup] Backup service initialized successfully");
	} catch (error) {
		console.error("[Backup] Failed to initialize backup service:", error);
		// Don't throw - backup failure shouldn't crash the app
	}
}

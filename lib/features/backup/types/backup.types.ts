/**
 * Backup types and interfaces
 */

import { BackupType as PrismaBackupType, ProcessStatus as PrismaProcessStatus } from "@/generated/prisma/enums";

// Re-export shared types

export interface BackupRecord {
	id: string;
	fileName: string;
	fileSize: number;
	status: PrismaProcessStatus;
	createdAt: Date;
	completedAt?: Date;
	errorMessage?: string;
	uploadedBy: string;
	r2Url?: string;
	backupType: PrismaBackupType;
	retentionDays: number;
}

export type BackupStatus = PrismaProcessStatus;
export type BackupType = PrismaBackupType;

export interface BackupStats {
	totalBackups: number;
	successfulBackups: number;
	failedBackups: number;
	totalSize: number;
	lastBackupDate?: Date;
}

export interface CreateBackupInput {
	type: "manual" | "scheduled";
	description?: string;
}

export interface BackupConfig {
	retentionDays: number;
	scheduleHour: number;
	enabled: boolean;
}

// ActionResult is now imported from @/lib/types

/**
 * Backup service response
 */
export interface BackupResult {
	success: boolean;
	fileName?: string;
	fileSize?: number;
	r2Url?: string;
	error?: string;
}

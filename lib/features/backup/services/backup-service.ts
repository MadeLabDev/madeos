/**
 * Backup service - Handles database backup operations
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import cron from "node-cron";
import { join } from "path";

import { BackupType, ProcessStatus } from "@/generated/prisma/enums";
import { getStorageProvider } from "@/lib/features/upload/services/upload-storage.service";
import { prisma } from "@/lib/prisma";

import { BackupRecord, BackupResult, BackupStats } from "../types/backup.types";

export class BackupService {
	private s3Client: S3Client | null = null;
	private isInitialized = false;

	private initializeS3Client(): void {
		if (this.s3Client) return;

		const endpoint = process.env.R2_ENDPOINT;
		if (!endpoint) {
			throw new Error("R2_ENDPOINT not configured");
		}
		if (!endpoint.startsWith("https://")) {
			throw new Error("R2_ENDPOINT must start with https://");
		}

		this.s3Client = new S3Client({
			region: "auto",
			endpoint,
			credentials: {
				accessKeyId: process.env.R2_ACCESS_KEY_ID!,
				secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
			},
			forcePathStyle: true, // Required for R2
		});
	}

	/**
	 * Save backup data to local storage
	 */
	private async saveBackupToLocal(backupData: Buffer, fileName: string): Promise<string> {
		// Get upload directory from environment or use default
		const uploadDir = process.env.UPLOAD_DIR || "/public/uploads";
		const baseUploadPath = join(process.cwd(), uploadDir);

		// Create backups/database subdirectory
		const backupFolder = join(baseUploadPath, "backups", "database");
		if (!existsSync(backupFolder)) {
			await mkdir(backupFolder, { recursive: true });
		}

		// Create full file path
		const fullFilePath = join(backupFolder, fileName);

		// Write backup data to file
		await writeFile(fullFilePath, backupData);

		// Generate URL for serving the file
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
		const fileUrl = `${baseUrl}/uploads/backups/database/${fileName}`;

		return fileUrl;
	}

	/**
	 * Initialize scheduled backup
	 */
	initializeScheduledBackup(): void {
		if (this.isInitialized) return;

		const scheduleHour = parseInt(process.env.BACKUP_SCHEDULE_HOUR || "2");

		// Schedule daily backup at specified hour
		cron.schedule(`0 ${scheduleHour} * * *`, async () => {
			console.log(`[Backup] Starting scheduled backup at ${new Date().toISOString()}`);

			try {
				const result = await this.createBackup("scheduled");
				if (result.success) {
					console.log(`[Backup] Scheduled backup completed: ${result.fileName}`);
				} else {
					console.error(`[Backup] Scheduled backup failed: ${result.error}`);
				}
			} catch (error) {
				console.error(`[Backup] Scheduled backup error:`, error);
			}
		});

		this.isInitialized = true;
		console.log(`[Backup] Scheduled backup initialized for ${scheduleHour}:00 daily`);
	}

	/**
	 * Create database backup
	 */
	async createBackup(type: "manual" | "scheduled" = "manual", userId: string = "system"): Promise<BackupResult> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const fileName = `backup-${type}-${timestamp}.sql`;

		// Create backup record in database
		const backupRecord = await prisma.backupRecord.create({
			data: {
				fileName,
				status: ProcessStatus.IN_PROGRESS,
				uploadedBy: userId,
				backupType: type === "manual" ? BackupType.MANUAL : BackupType.SCHEDULED,
			},
		});

		try {
			console.log(`[Backup] Starting ${type} backup: ${fileName}`);

			// Stream mysqldump directly to R2 without creating local file
			const { stdout, stderr } = await this.execMysqldumpStream();

			// Collect all data from stdout
			const chunks: Uint8Array[] = [];
			let totalSize = 0;

			for await (const chunk of stdout) {
				const bufferChunk = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
				chunks.push(bufferChunk);
				totalSize += bufferChunk.length;
			}

			// Check for mysqldump errors (stderr contains both warnings and errors)
			const stderrData = await this.streamToString(stderr);

			// Filter out harmless warnings, keep only actual errors
			const errorLines = stderrData
				.split("\n")
				.filter((line) => {
					const lower = line.toLowerCase();
					// Ignore warnings, only check for actual errors
					return line.trim() && !lower.includes("[warning]") && !lower.includes("can be insecure") && !lower.includes("gtid") && lower.includes("error");
				})
				.join("\n")
				.trim();

			if (errorLines) {
				throw new Error(`mysqldump error: ${errorLines}`);
			}

			// Log warnings for debugging (don't fail on them)
			if (stderrData && process.env.NODE_ENV === "development") {
				console.log("[Backup] mysqldump warnings:", stderrData);
			}

			// Combine chunks into single buffer
			const backupData = Buffer.concat(chunks);

			// Get storage provider
			const storageProvider = await getStorageProvider();
			let fileUrl: string;

			if (storageProvider === "local") {
				// Save to local storage
				fileUrl = await this.saveBackupToLocal(backupData, fileName);
				console.log(`[Backup] Saved to local storage: ${fileUrl}`);
			} else {
				// Upload directly to R2
				const r2Key = `backups/database/${fileName}`;
				this.initializeS3Client();
				await this.uploadToR2Stream(backupData, r2Key);

				// Generate R2 URL
				fileUrl = `${process.env.R2_BUCKET_PUBLIC}/${r2Key}`;
				console.log(`[Backup] Uploaded to R2: ${fileUrl}`);
			}

			// Update backup record as completed
			await prisma.backupRecord.update({
				where: { id: backupRecord.id },
				data: {
					status: ProcessStatus.COMPLETED,
					fileSize: totalSize,
					completedAt: new Date(),
					r2Url: fileUrl,
				},
			});

			// Update backup stats
			await this.updateBackupStats();

			console.log(`[Backup] ${type} backup completed: ${fileName} (${this.formatBytes(totalSize)})`);

			return {
				success: true,
				fileName,
				fileSize: totalSize,
				r2Url: fileUrl,
			};
		} catch (error) {
			console.error(`[Backup] ${type} backup failed:`, error);

			// Update backup record as failed
			await prisma.backupRecord.update({
				where: { id: backupRecord.id },
				data: {
					status: ProcessStatus.FAILED,
					errorMessage: error instanceof Error ? error.message : "Unknown backup error",
					completedAt: new Date(),
				},
			});

			// Update backup stats
			await this.updateBackupStats();

			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown backup error",
			};
		}
	}

	/**
	 * Get backup statistics
	 */
	async getBackupStats(): Promise<BackupStats> {
		try {
			const stats = await prisma.backupStats.findUnique({
				where: { id: "default" },
			});

			if (stats) {
				return {
					totalBackups: stats.totalBackups,
					successfulBackups: stats.successfulBackups,
					failedBackups: stats.failedBackups,
					totalSize: Number(stats.totalSize),
					lastBackupDate: stats.lastBackupDate || undefined,
				};
			}
		} catch (error) {
			console.error("[Backup] Failed to get backup stats:", error);
		}

		// Return default stats if not found or error
		return {
			totalBackups: 0,
			successfulBackups: 0,
			failedBackups: 0,
			totalSize: 0,
			lastBackupDate: undefined,
		};
	}

	/**
	 * List backup files from database
	 */
	async listBackups(limit: number = 50): Promise<BackupRecord[]> {
		try {
			const backups = await prisma.backupRecord.findMany({
				orderBy: {
					createdAt: "desc",
				},
				take: limit,
			});

			return backups.map((backup) => ({
				id: backup.id,
				fileName: backup.fileName,
				fileSize: Number(backup.fileSize),
				status: backup.status,
				createdAt: backup.createdAt,
				completedAt: backup.completedAt || undefined,
				errorMessage: backup.errorMessage || undefined,
				uploadedBy: backup.uploadedBy,
				r2Url: backup.r2Url || undefined,
				backupType: backup.backupType,
				retentionDays: backup.retentionDays,
			}));
		} catch (error) {
			console.error("[Backup] Failed to list backups:", error);
			return [];
		}
	}

	/**
	 * Cleanup old backups based on retention policy
	 */
	async cleanupOldBackups(): Promise<void> {
		try {
			const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || "30");
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

			console.log(`[Backup] Cleaning up backups older than ${retentionDays} days`);

			// Delete old backup records from database
			const deletedRecords = await prisma.backupRecord.findMany({
				where: {
					createdAt: {
						lt: cutoffDate,
					},
				},
				select: {
					id: true,
					r2Url: true,
				},
			});

			// Delete from R2 storage before removing database records
			for (const record of deletedRecords) {
				if (record.r2Url) {
					try {
						// Use R2 client to delete from storage
						const { deleteFromR2 } = await import("@/lib/storage/r2-client");
						const result = await deleteFromR2(record.r2Url);

						if (result.success) {
							console.log(`[Backup] Deleted from R2: ${record.r2Url}`);
						} else {
							console.warn(`[Backup] R2 deletion failed: ${result.error}`);
						}
					} catch (deleteError) {
						console.error(`[Backup] Failed to delete from R2: ${record.r2Url}`, deleteError);
						// Continue with next record even if deletion fails
					}
				}
			}

			// Delete from database
			await prisma.backupRecord.deleteMany({
				where: {
					createdAt: {
						lt: cutoffDate,
					},
				},
			});

			console.log(`[Backup] Cleaned up ${deletedRecords.length} old backup records`);
		} catch (error) {
			console.error("[Backup] Failed to cleanup old backups:", error);
		}
	}

	private async execMysqldumpStream(): Promise<{ stdout: NodeJS.ReadableStream; stderr: NodeJS.ReadableStream }> {
		// Parse DATABASE_URL to extract connection details
		const databaseUrl = process.env.DATABASE_URL;
		if (!databaseUrl) {
			throw new Error("DATABASE_URL not configured");
		}

		// Parse mysql://user:password@host:port/database format
		const urlMatch = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
		if (!urlMatch) {
			throw new Error("Invalid DATABASE_URL format");
		}

		const [, user, password, host, port, database] = urlMatch;
		if (!user || !password || !host || !port || !database) {
			throw new Error("Invalid DATABASE_URL format - missing connection details");
		}

		// Determine mysqldump path - use environment variable or default to system path
		const mysqldumpPath = process.env.MYSQLDUMP_PATH || "mysqldump";

		// Spawn mysqldump process with proper flags for GTID and avoiding PROCESS privilege requirement
		const mysqldump = spawn(mysqldumpPath, [
			"-h",
			host,
			"-P",
			port,
			"-u",
			user,
			`-p${password}`, // Note: no space between -p and password
			"--single-transaction", // Consistent snapshot without locking
			"--set-gtid-purged=OFF", // Don't include GTID statements
			"--no-tablespaces", // Don't dump tablespaces (requires PROCESS privilege)
			"--skip-lock-tables", // Don't lock tables
			"--quick", // Retrieve rows from table one at a time
			"--create-options", // Include CREATE TABLE options
			database,
		]);

		return {
			stdout: mysqldump.stdout!,
			stderr: mysqldump.stderr!,
		};
	}

	private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
		const chunks: Uint8Array[] = [];
		for await (const chunk of stream) {
			chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
		}
		return Buffer.concat(chunks).toString("utf8");
	}

	private async uploadToR2Stream(data: Buffer, key: string): Promise<void> {
		this.initializeS3Client();
		await this.s3Client!.send(
			new PutObjectCommand({
				Bucket: process.env.R2_BUCKET_PROD!,
				Key: key,
				Body: data,
				ContentType: "application/sql",
				ContentLength: data.length,
				Metadata: {
					"backup-type": "database",
					"created-at": new Date().toISOString(),
				},
			}),
		);
	}

	/**
	 * Update backup statistics
	 */
	private async updateBackupStats(): Promise<void> {
		try {
			const stats = await prisma.backupRecord.aggregate({
				_count: {
					id: true,
				},
				_sum: {
					fileSize: true,
				},
				where: {
					status: ProcessStatus.COMPLETED,
				},
			});

			const failedCount = await prisma.backupRecord.count({
				where: {
					status: ProcessStatus.FAILED,
				},
			});

			const lastBackup = await prisma.backupRecord.findFirst({
				where: {
					status: ProcessStatus.COMPLETED,
				},
				orderBy: {
					completedAt: "desc",
				},
				select: {
					completedAt: true,
				},
			});

			await prisma.backupStats.upsert({
				where: { id: "default" },
				update: {
					totalBackups: stats._count.id + failedCount,
					successfulBackups: stats._count.id,
					failedBackups: failedCount,
					totalSize: stats._sum.fileSize || BigInt(0),
					lastBackupDate: lastBackup?.completedAt || null,
				},
				create: {
					id: "default",
					totalBackups: stats._count.id + failedCount,
					successfulBackups: stats._count.id,
					failedBackups: failedCount,
					totalSize: stats._sum.fileSize || BigInt(0),
					lastBackupDate: lastBackup?.completedAt || null,
				},
			});
		} catch (error) {
			console.error("[Backup] Failed to update backup stats:", error);
		}
	}

	private formatBytes(bytes: number): string {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}
}

// Export singleton instance
export const backupService = new BackupService();

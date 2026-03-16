/**
 * Upload Storage Configuration Types
 */

export type StorageProvider = "local" | "r2";

export interface UploadStorageSettings {
	provider: StorageProvider;
	enabled: boolean;
}

export interface R2StorageConfig {
	accountId: string;
	accessKeyId: string;
	accessKeySecret: string;
	bucketName: string;
	publicUrl: string;
	region?: string;
}

export interface LocalStorageConfig {
	uploadDir: string;
	maxFileSizeMb: number;
}

export interface StorageConfig {
	provider: StorageProvider;
	r2?: R2StorageConfig;
	local?: LocalStorageConfig;
}

export interface UploadResult {
	success: boolean;
	url?: string;
	fileName?: string;
	fileSize?: number;
	provider: StorageProvider;
	message?: string;
	error?: string;
}

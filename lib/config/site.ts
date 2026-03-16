/**
 * Unified Site Configuration
 * Combines pagination, media, and company info settings
 * All values are loaded from database at app startup
 * Components use synchronous access to cached values
 */

// ============================================================================
// TYPES
// ============================================================================

export type PaginationResource = "pagesize" | "media_pagesize";
export type MediaVisibility = "PUBLIC" | "PRIVATE";

export interface AllowedFileType {
	extensions: string[];
	mimeTypes: string[];
	label: string;
}

export interface SiteInfoType {
	companyName: string;
	companyEmail: string;
	companyPhone: string;
	companyAddress: string;
	companyWebsite?: string;
	companyLogo?: string;
	companyDescription?: string;
}

export interface SiteConfigType {
	pagination: {
		pagesize: number;
		media_pagesize: number;
	};
	media: {
		max_file_size_mb: number;
		allowedTypes: Record<string, AllowedFileType>;
		visibility: Record<string, string>;
		uploadDir: string;
	};
	siteinfo: SiteInfoType;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_PAGINATION = {
	pagesize: 20,
	media_pagesize: 12,
};

const ALLOWED_FILE_TYPES: Record<string, AllowedFileType> = {
	images: {
		extensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
		mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
		label: "Images",
	},
	documents: {
		extensions: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
		mimeTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain"],
		label: "Documents",
	},
	videos: {
		extensions: ["mp4", "avi", "mov", "mkv", "webm"],
		mimeTypes: ["video/mp4", "video/x-msvideo", "video/quicktime", "video/x-matroska", "video/webm"],
		label: "Videos",
	},
	archives: {
		extensions: ["zip", "rar", "7z", "tar", "gz"],
		mimeTypes: ["application/zip", "application/x-rar-compressed", "application/x-7z-compressed", "application/x-tar", "application/gzip"],
		label: "Archives",
	},
};

const DEFAULT_MEDIA = {
	max_file_size_mb: 10,
	allowedTypes: ALLOWED_FILE_TYPES,
	visibility: {
		PUBLIC: "PUBLIC",
		PRIVATE: "PRIVATE",
	},
	uploadDir: "public/uploads/media",
};

const DEFAULT_SITE_INFO: SiteInfoType = {
	companyName: "MADE Laboratory",
	companyEmail: "info@printshop.local",
	companyPhone: "+1-000-000-0000",
	companyAddress: "Your Company Address",
	companyWebsite: "https://printshop.local",
	companyLogo: undefined,
	companyDescription: "Professional Print Shop Management System",
};

// ============================================================================
// RUNTIME CACHE
// ============================================================================

let siteConfigCache: SiteConfigType = {
	pagination: { ...DEFAULT_PAGINATION },
	media: { ...DEFAULT_MEDIA },
	siteinfo: { ...DEFAULT_SITE_INFO },
};

// ============================================================================
// UPDATE FUNCTIONS (Called at app startup)
// ============================================================================

/**
 * Update pagination configuration cache
 */
export function setPaginationCache(values: Record<PaginationResource, number>): void {
	siteConfigCache.pagination = {
		...DEFAULT_PAGINATION,
		...values,
	};
}

/**
 * Update media configuration cache
 */
export function setMediaCache(values: { max_file_size_mb: number }): void {
	siteConfigCache.media = {
		...DEFAULT_MEDIA,
		...values,
	};
}

/**
 * Update site info cache
 */
export function setSiteInfoCache(values: Partial<SiteInfoType>): void {
	siteConfigCache.siteinfo = {
		...DEFAULT_SITE_INFO,
		...siteConfigCache.siteinfo,
		...values,
	};
}

/**
 * Get full site config (mainly for debugging)
 */
function getFullConfig(): SiteConfigType {
	return JSON.parse(JSON.stringify(siteConfigCache));
}

/**
 * Get page size for a specific resource
 */
function getPageSize(resource: PaginationResource): number {
	return siteConfigCache.pagination[resource] ?? DEFAULT_PAGINATION[resource] ?? 20;
}

/**
 * Get all pagination sizes
 */
function getAllPageSizes(): Record<PaginationResource, number> {
	return { ...siteConfigCache.pagination };
}

/**
 * Get max file size in bytes
 */
function getMaxFileSizeBytes(): number {
	return siteConfigCache.media.max_file_size_mb * 1024 * 1024;
}

/**
 * Get max file size in MB
 */
function getMaxFileSizeMB(): number {
	return siteConfigCache.media.max_file_size_mb;
}

/**
 * Get company info
 */
function getSiteInfo(): SiteInfoType {
	return { ...siteConfigCache.siteinfo };
}

/**
 * Get specific company info field
 */
function getSiteInfoField<K extends keyof SiteInfoType>(field: K): SiteInfoType[K] {
	return siteConfigCache.siteinfo[field];
}

// ============================================================================
// PUBLIC API
// ============================================================================

export const SITE_CONFIG = {
	// Pagination config
	pagination: {
		DEFAULT: DEFAULT_PAGINATION,
		getPageSize,
		getAllPageSizes,
	},

	// Media config
	media: {
		DEFAULT_MAX_FILE_SIZE_MB: DEFAULT_MEDIA.max_file_size_mb,
		getMaxFileSizeBytes,
		getMaxFileSizeMB,

		// Allowed file types
		allowedTypes: ALLOWED_FILE_TYPES,

		// Get all allowed MIME types
		getAllowedMimeTypes(): string[] {
			return Object.values(ALLOWED_FILE_TYPES).flatMap((type) => type.mimeTypes);
		},

		// Get all allowed extensions
		getAllowedExtensions(): string[] {
			return Object.values(ALLOWED_FILE_TYPES).flatMap((type) => type.extensions);
		},

		// Check if file type is allowed
		isAllowedType(mimeType: string): boolean {
			return this.getAllowedMimeTypes().includes(mimeType);
		},

		// Check if extension is allowed
		isAllowedExtension(filename: string): boolean {
			const ext = filename.split(".").pop()?.toLowerCase();
			return ext ? this.getAllowedExtensions().includes(ext) : false;
		},

		// Get file category by MIME type
		getCategory(mimeType: string): string {
			for (const [category, config] of Object.entries(ALLOWED_FILE_TYPES)) {
				if (config.mimeTypes.includes(mimeType)) {
					return category;
				}
			}
			return "other";
		},

		// Visibility options
		visibility: DEFAULT_MEDIA.visibility,

		// Upload directory
		uploadDir: DEFAULT_MEDIA.uploadDir,

		// For backward compatibility
		get maxFileSize(): number {
			return getMaxFileSizeBytes();
		},
	},

	// Site info config
	siteinfo: {
		DEFAULT: DEFAULT_SITE_INFO,
		getSiteInfo,
		getSiteInfoField,
	},

	// Debug helpers
	getFullConfig,
};

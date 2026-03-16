/**
 * Application Settings Initializer
 * Loads settings from database at app startup and caches them
 * Called once during app initialization
 */

import { setMediaCache, setPaginationCache, setSiteInfoCache } from "@/lib/config/site";
import * as settingsRepository from "@/lib/features/settings/repositories/settings-repository";

let isInitialized = false;

/**
 * Load settings from database and populate caches
 */
async function initializeSettings(): Promise<void> {
	if (isInitialized) {
		return; // Already initialized
	}

	try {
		const settingsMap = await settingsRepository.findAllSettingsAsRecord();

		// Update pagination cache (pagesize and media_pagesize)
		const paginationSizes = {
			pagesize: parseInt(settingsMap["pagesize"] || "20", 10),
			media_pagesize: parseInt(settingsMap["media_pagesize"] || "12", 10),
		};
		setPaginationCache(paginationSizes);

		// Update media cache with max file size from settings (in MB)
		const mediaMaxSizeMB = parseInt(settingsMap["media_max_file_size_mb"] || "10", 10);
		setMediaCache({ max_file_size_mb: mediaMaxSizeMB });

		// Update site info cache with company settings
		const siteInfo = {
			companyName: settingsMap["company_name"] || "MADE Laboratory",
			companyEmail: settingsMap["company_email"] || "info@printshop.local",
			companyPhone: settingsMap["company_phone"] || "+1-000-000-0000",
			companyAddress: settingsMap["company_address"] || "Your Company Address",
			companyWebsite: settingsMap["company_website"],
			companyLogo: settingsMap["company_logo"],
			companyDescription: settingsMap["company_description"],
		};
		setSiteInfoCache(siteInfo);

		isInitialized = true;
	} catch (error) {
		// During build time, database might not be available - use defaults silently
		if (process.env.NEXT_PHASE?.includes("phase-production-build")) {
			console.log("[Settings] 🔄 Using default settings during build");
		} else {
			console.error("[Settings] ⚠️  Failed to initialize settings:", error);
		}
		// Continue with defaults if initialization fails
		isInitialized = true;
	}
}

export { initializeSettings };

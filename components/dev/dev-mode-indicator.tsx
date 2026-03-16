"use client";

import { DEV_MODE_MESSAGE, isDevMode } from "@/lib/utils/dev-mode";

/**
 * Dev Mode Indicator Banner
 * Shows when NEXT_PUBLIC_DEV_MODE=true
 */
export function DevModeIndicator() {
	if (!isDevMode()) return null;

	return <div className="fixed right-4 bottom-4 z-50 rounded-lg border border-yellow-500 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800 shadow-lg dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-300">{DEV_MODE_MESSAGE}</div>;
}

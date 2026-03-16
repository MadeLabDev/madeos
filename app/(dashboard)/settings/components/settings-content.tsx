"use client";

import { useCallback, useState } from "react";

import { toast } from "sonner";

import { getSettingsAction } from "@/lib/features/settings/actions";
import type { SettingsContentProps } from "@/lib/features/settings/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

import { SettingsTabs } from "./settings-tabs";

export function SettingsContent({ initialSettings }: SettingsContentProps) {
	const [settingsObj, setSettingsObj] = useState<Record<string, string>>(initialSettings);

	const loadSettings = useCallback(async () => {
		try {
			const result = await getSettingsAction();
			if (result.success && result.data) {
				setSettingsObj(result.data as Record<string, string>);
			}
		} catch (error) {
			console.error("Error loading settings:", error);
			toast.error("Failed to load settings");
		}
	}, []);

	// Initialize Pusher connection
	usePusher();

	// Subscribe to settings updates
	const handleSettingsUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "settings_updated") {
				loadSettings();
			} else if (data.action === "settings_changed") {
				setSettingsObj((prev) => ({
					...prev,
					[data.key]: data.value,
				}));
			}
		},
		[loadSettings],
	);

	useChannelEvent("private-global", "settings_update", handleSettingsUpdate);

	return (
		<div className="space-y-4">
			<SettingsTabs
				settingsObj={settingsObj}
				onSuccess={loadSettings}
			/>
		</div>
	);
}

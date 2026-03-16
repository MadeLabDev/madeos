"use client";

import { useCallback, useState } from "react";

import { Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSystemSettingsAction } from "@/lib/features/settings/actions";
import type { SystemSettingsFormProps } from "@/lib/features/settings/types";

const DATETIME_FORMATS = ["DD/MM/YYYY HH:mm:ss", "MM/DD/YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY HH:mm", "MM/DD/YYYY", "YYYY-MM-DD"];

export function SystemSettingsForm({ settingsObj, onSuccess, hideButtons = false, onLoadingChange }: SystemSettingsFormProps) {
	const [pagesize, setPagesize] = useState(settingsObj.pagesize || "20");
	const [mediaPagesize, setMediaPagesize] = useState(settingsObj.media_pagesize || "12");
	const [datetimeFormat, setDatetimeFormat] = useState(settingsObj.datetime_format || "DD/MM/YYYY HH:mm:ss");
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = useCallback(async () => {
		try {
			setIsLoading(true);
			onLoadingChange?.(true);

			// Validate pagesize
			const pagesizeNum = parseInt(pagesize, 10);
			if (isNaN(pagesizeNum) || pagesizeNum < 1 || pagesizeNum > 100) {
				toast.error("Pagesize must be between 1 and 100");
				return;
			}

			// Validate media pagesize
			const mediaPagesizeNum = parseInt(mediaPagesize, 10);
			if (isNaN(mediaPagesizeNum) || mediaPagesizeNum < 1 || mediaPagesizeNum > 100) {
				toast.error("Media page size must be between 1 and 100");
				return;
			}

			// Validate datetime format
			if (!datetimeFormat.trim()) {
				toast.error("Date & Time Format is required");
				return;
			}

			// Optional: Check against common formats (allow custom but warn if not standard)
			const isValidFormat = DATETIME_FORMATS.includes(datetimeFormat) || /^[^\s]+/.test(datetimeFormat);
			if (!isValidFormat) {
				toast.error("Please select a valid date & time format or enter a custom one");
				return;
			}

			// Update system settings (both at once)
			const result = await updateSystemSettingsAction({
				pagesize: pagesizeNum,
				media_pagesize: mediaPagesizeNum,
				datetime_format: datetimeFormat,
			});

			if (!result.success) {
				toast.error(result.message || "Failed to update system settings");
				return;
			}

			toast.success("System settings updated successfully");
			onSuccess?.();
		} catch (error) {
			console.error("Error saving system settings:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save system settings");
		} finally {
			setIsLoading(false);
			onLoadingChange?.(false);
		}
	}, [pagesize, mediaPagesize, datetimeFormat, onSuccess, onLoadingChange]);

	const handleCancel = useCallback(() => {
		setPagesize(settingsObj.pagesize || "20");
		setMediaPagesize(settingsObj.media_pagesize || "12");
		setDatetimeFormat(settingsObj.datetime_format || "DD/MM/YYYY HH:mm:ss");
	}, [settingsObj]);

	return (
		<Card>
			<CardContent className="space-y-6">
				<form
					data-settings-system-form
					onSubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
					className="gap-4 space-y-6">
					{/* Page Size Setting */}
					<div>
						<Label htmlFor="pagesize">Page Size</Label>
						<Input
							id="pagesize"
							type="number"
							min="1"
							max="100"
							step="1"
							value={pagesize}
							onChange={(e) => setPagesize(e.target.value)}
							placeholder="10"
							className="mt-2 max-w-xs"
						/>
						<p className="text-muted-foreground mt-1 text-xs">Default number of items to display per page (1-100)</p>
					</div>

					{/* Media Page Size Setting */}
					<div>
						<Label htmlFor="media-pagesize">Media Page Size</Label>
						<Input
							id="media-pagesize"
							type="number"
							min="1"
							max="100"
							step="1"
							value={mediaPagesize}
							onChange={(e) => setMediaPagesize(e.target.value)}
							placeholder="12"
							className="mt-2 max-w-xs"
						/>
						<p className="text-muted-foreground mt-1 text-xs">Number of media items to display per page in gallery (1-100)</p>
					</div>

					{/* Datetime Format Setting */}
					<div className="space-y-2">
						<Label htmlFor="datetime-format">Date & Time Format</Label>
						<div className="flex gap-2">
							<Input
								id="datetime-format"
								type="text"
								value={datetimeFormat}
								onChange={(e) => setDatetimeFormat(e.target.value)}
								placeholder="DD/MM/YYYY HH:mm:ss"
								className="flex-1"
							/>
						</div>
						<p className="text-muted-foreground mb-3 text-sm">Format for displaying dates and times throughout the application</p>
						<div className="space-y-2">
							<p className="text-sm font-medium">Common formats:</p>
							<div className="grid grid-cols-2 gap-2">
								{DATETIME_FORMATS.map((format) => (
									<button
										type="button"
										key={format}
										onClick={() => setDatetimeFormat(format)}
										className={`rounded border px-3 py-2 text-left text-sm transition-colors ${datetimeFormat === format ? "border-primary bg-primary/10 font-medium" : "border-border hover:bg-muted"}`}>
										{format}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					{!hideButtons && (
						<div className="flex gap-3 border-t pt-6">
							<Button
								onClick={handleSave}
								disabled={isLoading}
								className="min-w-32">
								<Save className="mr-2 h-4 w-4" />
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
							<Button
								variant="outline"
								data-action="cancel"
								onClick={handleCancel}
								disabled={isLoading}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
						</div>
					)}
					{hideButtons && (
						<div className="hidden">
							<Button
								type="submit"
								disabled={isLoading}
								className="min-w-32">
								<Save className="mr-2 h-4 w-4" />
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
							<Button
								type="button"
								variant="outline"
								data-action="cancel"
								onClick={handleCancel}
								disabled={isLoading}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}

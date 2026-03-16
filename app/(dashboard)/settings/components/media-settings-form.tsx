"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FILE_TYPE_OPTIONS, STORAGE_TYPES } from "@/lib/config/module-types";
import { updateMediaSettingsAction } from "@/lib/features/settings/actions";
import type { MediaSettingsFormProps } from "@/lib/features/settings/types";
import { getStorageProviderAction, setStorageProviderAction } from "@/lib/features/upload/actions";
import type { StorageProvider } from "@/lib/features/upload/types";

export function MediaSettingsForm({ settingsObj, onSuccess, hideButtons = false, onLoadingChange }: MediaSettingsFormProps) {
	const [maxFileSizeMB, setMaxFileSizeMB] = useState(settingsObj.media_max_file_size_mb || "10");
	const [isLoading, setIsLoading] = useState(false);
	const [storageProvider, setStorageProvider] = useState<StorageProvider>("local");
	const [loadingProvider, setLoadingProvider] = useState(true);

	// Load storage provider on mount
	useEffect(() => {
		loadStorageProvider();
	}, []);

	async function loadStorageProvider() {
		try {
			const result = await getStorageProviderAction();
			if (result.success && result.data) {
				setStorageProvider(result.data);
			}
		} catch (error) {
			console.error("Failed to load storage provider:", error);
		} finally {
			setLoadingProvider(false);
		}
	}

	async function handleStorageProviderChange(newProvider: StorageProvider) {
		try {
			const result = await setStorageProviderAction(newProvider);
			if (result.success) {
				setStorageProvider(newProvider);
				toast.success("Storage provider updated successfully");
			} else {
				toast.error(result.message || "Failed to update storage provider");
			}
		} catch (error) {
			console.error("Failed to change storage provider:", error);
			toast.error("Error updating storage provider");
		}
	}

	// Parse allowed types from comma-separated string
	const allowedTypesStr = settingsObj.media_allowed_types || "images,documents,videos,archives";
	const allowedTypes = useMemo(() => new Set(allowedTypesStr.split(",").map((t) => t.trim())), [allowedTypesStr]);
	const [selectedTypes, setSelectedTypes] = useState<Set<string>>(allowedTypes);

	const toggleFileType = useCallback(
		(typeId: string) => {
			const newTypes = new Set(selectedTypes);
			if (newTypes.has(typeId)) {
				newTypes.delete(typeId);
			} else {
				newTypes.add(typeId);
			}
			setSelectedTypes(newTypes);
		},
		[selectedTypes],
	);

	const handleSave = useCallback(async () => {
		try {
			setIsLoading(true);
			onLoadingChange?.(true);

			// Validate max file size
			const maxFileSizeNum = parseInt(maxFileSizeMB, 10);
			if (isNaN(maxFileSizeNum) || maxFileSizeNum < 1 || maxFileSizeNum > 1000) {
				toast.error("Max file size must be between 1 and 1000 MB");
				return;
			}

			// Validate at least one file type selected
			if (selectedTypes.size === 0) {
				toast.error("At least one file type must be selected");
				return;
			}

			// Update media settings (both at once)
			const typesString = Array.from(selectedTypes).join(",");
			const result = await updateMediaSettingsAction({
				media_max_file_size_mb: maxFileSizeNum,
				media_allowed_types: typesString,
			});

			if (!result.success) {
				toast.error(result.message || "Failed to update media settings");
				return;
			}

			toast.success("Media settings updated successfully");
			onSuccess?.();
		} catch (error) {
			console.error("Error saving media settings:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save media settings");
		} finally {
			setIsLoading(false);
			onLoadingChange?.(false);
		}
	}, [maxFileSizeMB, selectedTypes, onSuccess, onLoadingChange]);

	const handleCancel = useCallback(() => {
		setMaxFileSizeMB(settingsObj.media_max_file_size_mb || "10");
		setSelectedTypes(allowedTypes);
	}, [settingsObj, allowedTypes]);

	return (
		<Card>
			<CardContent className="space-y-6">
				<form
					data-settings-media-form
					onSubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
					className="gap-4 space-y-6">
					{/* Max File Size */}
					<div>
						<Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
						<Input
							id="max-file-size"
							type="number"
							min="1"
							max="1000"
							step="1"
							value={maxFileSizeMB}
							onChange={(e) => setMaxFileSizeMB(e.target.value)}
							placeholder="10"
							className="mt-2 max-w-xs"
						/>
						<p className="text-muted-foreground mt-1 text-xs">Maximum size for individual file uploads in megabytes (1-1000 MB)</p>
					</div>

					{/* Allowed File Types */}
					<div className="space-y-3">
						<Label>Allowed File Types</Label>
						<div className="mt-2 space-y-1">
							{FILE_TYPE_OPTIONS.map((type) => (
								<div
									key={type.id}
									className="flex items-center space-x-2">
									<Checkbox
										id={type.id}
										checked={selectedTypes.has(type.id)}
										onCheckedChange={() => toggleFileType(type.id)}
									/>
									<Label
										htmlFor={type.id}
										className="cursor-pointer font-normal">
										{type.label}
									</Label>
								</div>
							))}
						</div>
						<p className="text-muted-foreground mt-1 text-xs">Select which file types users are allowed to upload</p>
					</div>

					{/* Upload Storage Provider */}
					<div className="space-y-3 border-t pt-4">
						<Label htmlFor="storage-provider">Upload Storage Provider</Label>
						<Select
							value={storageProvider}
							onValueChange={handleStorageProviderChange}
							disabled={loadingProvider}>
							<SelectTrigger
								id="storage-provider"
								className="w-full max-w-xs">
								<SelectValue placeholder="Select storage provider" />
							</SelectTrigger>
							<SelectContent>
								{STORAGE_TYPES.map((type) => (
									<SelectItem
										key={type.value}
										value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-muted-foreground mt-1 text-xs">{STORAGE_TYPES.find((type) => type.value === storageProvider)?.description || "Select a storage provider for file uploads"}</p>
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

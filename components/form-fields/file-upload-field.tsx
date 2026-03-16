"use client";

import { useState } from "react";

import { Download, File, X } from "lucide-react";
import { toast } from "sonner";

import { MediaPickerModal } from "@/components/dialogs/media-picker-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMediaPickerModal } from "@/lib/hooks/use-media-picker-modal";

interface FileUploadFieldProps {
	label?: string;
	value: string[] | null | undefined; // Array of file URLs/paths
	onChange: (urls: string[] | null) => void;
	description?: string;
	disabled?: boolean;
	accept?: string; // File type restrictions
	maxFiles?: number;
}

export function FileUploadField({ label = "Files", value = [], onChange, description, disabled = false, maxFiles = 10 }: FileUploadFieldProps) {
	const [files, setFiles] = useState<string[]>(value || []);

	const mediaPickerModal = useMediaPickerModal(
		(selectedUrls: string[] | string) => {
			const urls = Array.isArray(selectedUrls) ? selectedUrls : [selectedUrls];
			const newFiles = [...files, ...urls];
			setFiles(newFiles);
			onChange(newFiles);
			toast.success(`Added ${urls.length} existing file(s)`);
		},
		{
			title: "Select Existing Files",
			description: "Choose files from your media library to add to this tech pack",
		},
	);

	const handleRemoveFile = (index: number) => {
		const newFiles = files.filter((_, i) => i !== index);
		setFiles(newFiles);
		onChange(newFiles.length > 0 ? newFiles : null);
	};

	const handleDownloadFile = (url: string, filename?: string) => {
		const link = document.createElement("a");
		link.href = url;
		link.download = filename || url.split("/").pop() || "download";
		link.target = "_blank";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const getFileName = (url: string) => {
		return url.split("/").pop() || "Unknown file";
	};

	const getFileExtension = (filename: string) => {
		return filename.split(".").pop()?.toLowerCase() || "";
	};

	return (
		<div className="space-y-2">
			{label && <Label>{label}</Label>}

			{/* File Selection Area */}
			<div className="space-y-4">
				<Card className="p-6">
					<div className="space-y-4">
						<div>
							<p className="text-muted-foreground text-sm">Select files from your media library for this tech pack</p>
						</div>
						<div className="flex justify-center">
							<Button
								type="button"
								variant="outline"
								disabled={disabled || files.length >= maxFiles}
								className="px-6 py-3"
								onClick={() => mediaPickerModal.open()}>
								<File className="mr-2 h-4 w-4" />
								Select Existing Files
								{files.length >= maxFiles && <span className="ml-2 text-xs">(Max {maxFiles} reached)</span>}
							</Button>
						</div>
					</div>
				</Card>
			</div>

			{/* Selected Files List */}
			{files.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm font-medium">Selected Files ({files.length})</p>
					<div className="space-y-2">
						{files.map((url, index) => {
							const filename = getFileName(url);
							const extension = getFileExtension(filename);

							return (
								<Card
									key={index}
									className="p-3">
									<div className="flex items-center justify-between gap-3">
										<div className="flex min-w-0 flex-1 items-center gap-3">
											<File className="text-muted-foreground h-4 w-4 shrink-0" />
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium">{filename}</p>
												<p className="text-muted-foreground text-xs uppercase">{extension}</p>
											</div>
										</div>
										<div className="flex shrink-0 items-center gap-1">
											<Button
												type="button"
												size="sm"
												variant="ghost"
												onClick={() => handleDownloadFile(url, filename)}
												className="h-8 w-8 p-0">
												<Download className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												size="sm"
												variant="ghost"
												onClick={() => handleRemoveFile(index)}
												disabled={disabled}
												className="text-destructive hover:text-destructive h-8 w-8 p-0">
												<X className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{description && <p className="text-muted-foreground text-xs">{description}</p>}

			<MediaPickerModal
				isOpen={mediaPickerModal.isOpen}
				onClose={mediaPickerModal.onClose}
				onSelect={mediaPickerModal.onSelect}
				title={mediaPickerModal.title}
				description={mediaPickerModal.description}
				multiple={true}
			/>
		</div>
	);
}

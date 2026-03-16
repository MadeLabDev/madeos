"use client";

import { useRef, useState } from "react";

import { toast } from "sonner";

import { SITE_CONFIG } from "@/lib";
import type { MediaPageWrapperProps } from "@/lib/features/media/types";

export function MediaPageWrapper({ children, uploadMediaAction }: MediaPageWrapperProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const dragCounterRef = useRef(0);

	const validateFiles = (files: File[]) => {
		const validated: File[] = [];

		for (const file of files) {
			if (!SITE_CONFIG.media.isAllowedType(file.type)) {
				toast.error(`File ${file.name} has unsupported type`);
				continue;
			}

			if (file.size > SITE_CONFIG.media.getMaxFileSizeBytes()) {
				toast.error(`File ${file.name} exceeds maximum size of ${SITE_CONFIG.media.getMaxFileSizeMB()}MB`);
				continue;
			}

			validated.push(file);
		}

		return validated;
	};

	const performUpload = async (files: File[]) => {
		if (files.length === 0 || !uploadMediaAction) return;

		setIsUploading(true);

		try {
			// Create FormData with validated files
			const formData = new FormData();
			files.forEach((file) => {
				formData.append("files", file);
			});
			formData.append("visibility", "PRIVATE");

			// Call Server Action
			const result = await uploadMediaAction(formData);

			if (result.success) {
				toast.success("Upload successful", {
					description: result.message,
				});
			} else {
				toast.error("Upload failed", {
					description: result.message,
				});
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Upload error", {
				description: error instanceof Error ? error.message : "Failed to upload files",
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current++;
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current--;
		if (dragCounterRef.current === 0) {
			setIsDragging(false);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounterRef.current = 0;
		setIsDragging(false);

		const files = Array.from(e.dataTransfer.files);
		const validated = validateFiles(files);

		if (validated.length > 0) {
			await performUpload(validated);
		}
	};

	return (
		<div
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			className={`relative min-h-[calc(100vh-200px)] transition-colors ${isDragging ? "bg-primary/5 border-primary rounded-lg border-2 border-dashed" : ""}`}>
			{/* Drag overlay */}
			{isDragging && (
				<div className="bg-primary/10 pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
					<div className="space-y-2 text-center">
						<p className="text-primary text-lg font-semibold">Drop files here to upload</p>
						<p className="text-muted-foreground text-sm">{isUploading ? "Uploading..." : "Release to upload your media files"}</p>
					</div>
				</div>
			)}

			{/* Page content */}
			<div className="relative z-10">{children}</div>
		</div>
	);
}

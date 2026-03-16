"use client";

import { useRef, useState } from "react";

import { Search, Upload, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_CONFIG } from "@/lib";
import type { MediaPageHeaderProps } from "@/lib/features/media/types";

export function MediaPageHeader({ title, description, searchPlaceholder = "Search by name...", search = "", showUploadButton = false, uploadMediaAction }: MediaPageHeaderProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

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
			// Reset input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;

		const files = Array.from(e.target.files);
		const validated = validateFiles(files);

		if (validated.length > 0) {
			await performUpload(validated);
		}
	};

	return (
		<div className="flex items-center justify-between">
			<div className="mr-auto">
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>
			<div className="flex items-center gap-2">
				<form className="flex items-center gap-2">
					<div className="relative w-64">
						<Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
						<Input
							name="search"
							placeholder={searchPlaceholder}
							className="pl-8"
							defaultValue={search}
						/>
					</div>
					{search && (
						<Link href="/medias">
							<Button
								type="button"
								variant="outline"
								size="sm">
								<X className="mr-1 h-4 w-4" />
								Clear
							</Button>
						</Link>
					)}
				</form>

				{showUploadButton && uploadMediaAction && (
					<>
						<input
							ref={fileInputRef}
							type="file"
							multiple
							onChange={handleFileChange}
							disabled={isUploading}
							className="hidden"
							accept={SITE_CONFIG.media
								.getAllowedExtensions()
								.map((ext) => `.${ext}`)
								.join(",")}
						/>
						<Button
							size="sm"
							variant="outline"
							onClick={() => !isUploading && fileInputRef.current?.click()}
							disabled={isUploading}>
							<Upload className="mr-1 h-4 w-4" />
							{isUploading ? "Uploading..." : "Upload"}
						</Button>
					</>
				)}
			</div>
		</div>
	);
}

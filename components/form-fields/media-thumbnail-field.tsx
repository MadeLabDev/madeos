"use client";

import React, { useState } from "react";

import { ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";

import { MediaPickerModal } from "@/components/dialogs/media-picker-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMediaPickerModal } from "@/lib/hooks/use-media-picker-modal";

interface MediaThumbnailFieldProps {
	label?: string;
	value: string | null | undefined;
	onChange: (url: string | null) => void;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	pickerTitle?: string;
	pickerDescription?: string;
}

/**
 * MediaThumbnailField - Reusable thumbnail picker component
 * Features:
 * - Display thumbnail preview
 * - Click to open media picker modal
 * - Upload new media files
 * - Search existing media
 * - Remove thumbnail
 */
export function MediaThumbnailField({
	label = "Thumbnail",
	value,
	onChange,
	placeholder = "No image selected",
	//   description = 'Click the image to select or upload a thumbnail',
	disabled = false,
	pickerTitle = "Select Thumbnail",
	pickerDescription = "Choose an image from your media library or upload a new one",
}: MediaThumbnailFieldProps) {
	const [isLoading, setIsLoading] = useState(false);

	const mediaPickerModal = useMediaPickerModal(
		(urls: string | string[]) => {
			const url = Array.isArray(urls) ? urls[0] : urls;
			setIsLoading(true);
			onChange(url || null);
			setTimeout(() => setIsLoading(false), 200);
		},
		{
			title: pickerTitle,
			description: pickerDescription,
		},
	);

	const handleOpenPicker = () => {
		mediaPickerModal.open(value || undefined);
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(null);
	};

	return (
		<>
			<div className="space-y-2">
				{label && <Label>{label}</Label>}

				<Card
					className="group hover:border-primary/50 relative cursor-pointer overflow-hidden border-2 p-0 transition-all"
					onClick={handleOpenPicker}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							handleOpenPicker();
						}
					}}>
					<div className="bg-muted relative aspect-video w-full">
						{value ? (
							<Image
								src={value}
								alt="Thumbnail preview"
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
							/>
						) : (
							<div className="flex h-full items-center justify-center">
								<div className="text-center">
									<ImageIcon className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
									<p className="text-muted-foreground text-sm">{placeholder}</p>
								</div>
							</div>
						)}

						{/* Hover Overlay */}
						<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
							{value && (
								<Button
									type="button"
									size="sm"
									variant="destructive"
									onClick={handleRemove}
									disabled={disabled || isLoading}
									className="gap-2">
									<Trash2 className="h-4 w-4" />
									Remove
								</Button>
							)}
							<Button
								type="button"
								size="sm"
								variant="default"
								onClick={(e) => {
									e.stopPropagation();
									handleOpenPicker();
								}}
								disabled={disabled || isLoading}>
								{value ? "Change" : "Select"}
							</Button>
						</div>
					</div>
				</Card>

				{/* {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )} */}

				{/* {value && (
          <p className="text-xs text-muted-foreground break-all">
            <span className="font-semibold">Selected:</span> {value}
          </p>
        )} */}
			</div>

			<MediaPickerModal
				isOpen={mediaPickerModal.isOpen}
				onClose={mediaPickerModal.onClose}
				onSelect={mediaPickerModal.onSelect}
				title={mediaPickerModal.title}
				description={mediaPickerModal.description}
				multiple={false}
			/>
		</>
	);
}

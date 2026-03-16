"use client";

import { useEffect, useState } from "react";

import { Upload, X } from "lucide-react";
import Image from "next/image";

import { FileUploadModal } from "@/components/dialogs/file-upload-modal";
import { Button } from "@/components/ui/button";

interface ImageUploadInputProps {
	value?: string | File;
	onChange: (url: string | null) => void;
	maxFileSize?: number;
	disabled?: boolean;
	placeholder?: string;
}

export function ImageUploadInput({
	value,
	onChange,
	maxFileSize = 5 * 1024 * 1024, // 5MB default
	disabled = false,
	placeholder = "Choose image...",
}: ImageUploadInputProps) {
	const [preview, setPreview] = useState<string>("");
	const [fileName, setFileName] = useState<string>("");
	const [modalOpen, setModalOpen] = useState(false);

	// If value is a string URL, use it as preview
	useEffect(() => {
		if (typeof value === "string") {
			setPreview(value);
		}
	}, [value]);

	const handleUploadComplete = (url: string, name: string, _file: File) => {
		setPreview(url);
		setFileName(name);
		onChange(url);
		setModalOpen(false);
	};

	return (
		<>
			<div className="space-y-2">
				{preview && (
					<div className="h-32 w-32 overflow-hidden rounded-lg border">
						<Image
							src={preview}
							alt="Preview"
							fill
							className="object-cover"
						/>
					</div>
				)}

				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => setModalOpen(true)}
						disabled={disabled}
						className="flex items-center gap-2">
						<Upload size={16} />
						{fileName || placeholder}
					</Button>

					{preview && (
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								setPreview("");
								setFileName("");
								onChange(null as any);
							}}
							disabled={disabled}
							size="sm">
							<X size={16} />
						</Button>
					)}
				</div>

				<p className="text-xs text-gray-500">Max size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB</p>
			</div>

			<FileUploadModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				onUploadComplete={handleUploadComplete}
				type="image"
				maxFileSize={maxFileSize}
			/>
		</>
	);
}

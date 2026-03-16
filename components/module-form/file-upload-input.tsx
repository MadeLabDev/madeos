"use client";

import { useEffect, useState } from "react";

import { Download, Upload, X } from "lucide-react";

import { FileUploadModal } from "@/components/dialogs/file-upload-modal";
import { Button } from "@/components/ui/button";

interface FileUploadInputProps {
	value?: string | File | null;
	onChange: (url: string | null) => void;
	acceptedFileTypes?: string;
	maxFileSize?: number;
	disabled?: boolean;
	placeholder?: string;
}

export function FileUploadInput({
	value,
	onChange,
	acceptedFileTypes,
	maxFileSize = 10 * 1024 * 1024, // 10MB default
	disabled = false,
	placeholder = "Choose file...",
}: FileUploadInputProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [fileName, setFileName] = useState<string>("");

	// Initialize with existing file value
	useEffect(() => {
		if (value && typeof value === "string") {
			// Extract file name from URL if it's a URL, otherwise use the string as is
			const name = value.includes("/") ? value.split("/").pop() || value : value;
			setFileName(name);
		} else if (value instanceof File) {
			setFileName(value.name);
		}
	}, [value]);

	const handleUploadComplete = (url: string, name: string, _file: File) => {
		setFileName(name);
		onChange(url);
		setModalOpen(false);
	};

	const getDownloadLink = () => {
		if (typeof value === "string") {
			return value;
		}
		return null;
	};

	return (
		<>
			<div className="space-y-2">
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => setModalOpen(true)}
						disabled={disabled}
						className="flex items-center gap-2">
						<Upload size={16} />
						{fileName || placeholder}
					</Button>

					{fileName && (
						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								setFileName("");
								onChange(null);
							}}
							disabled={disabled}
							size="sm"
							title="Remove file">
							<X size={16} />
						</Button>
					)}

					{/* Download button for existing file */}
					{getDownloadLink() && (
						<a
							href={getDownloadLink() as string}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={disabled}
								className="flex items-center gap-2"
								title="Download file">
								<Download size={16} />
								Download
							</Button>
						</a>
					)}
				</div>

				{acceptedFileTypes && <p className="text-xs text-gray-500">Accepted: {acceptedFileTypes}</p>}
				{maxFileSize && <p className="text-xs text-gray-500">Max size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB</p>}
			</div>

			<FileUploadModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				onUploadComplete={handleUploadComplete}
				type="file"
				acceptedFileTypes={acceptedFileTypes}
				maxFileSize={maxFileSize}
			/>
		</>
	);
}

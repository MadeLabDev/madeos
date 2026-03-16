"use client";

import { useRef, useState } from "react";

import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FileUploadModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUploadComplete: (url: string, fileName: string, file: File) => void;
	type: "image" | "file";
	acceptedFileTypes?: string;
	maxFileSize?: number;
}

export function FileUploadModal({
	open,
	onOpenChange,
	onUploadComplete,
	type = "file",
	acceptedFileTypes,
	maxFileSize = type === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024, // 5MB for images, 10MB for files
}: FileUploadModalProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string>("");
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string>("");

	const handleFileSelect = (file: File | null) => {
		setError("");
		setUploadProgress(0);

		if (!file) {
			setSelectedFile(null);
			setPreview("");
			return;
		}

		// Check file size
		if (file.size > maxFileSize) {
			setError(`File size exceeds ${(maxFileSize / 1024 / 1024).toFixed(1)}MB limit`);
			return;
		}

		// Check file type
		if (type === "image" && !file.type.startsWith("image/")) {
			setError("Please select an image file");
			return;
		}

		if (acceptedFileTypes) {
			const types = acceptedFileTypes.split(",").map((t) => t.trim());
			const isValidType = types.some((fileType) => {
				if (fileType.startsWith(".")) {
					return file.name.toLowerCase().endsWith(fileType.toLowerCase());
				}
				if (fileType.includes("*")) {
					const pattern = fileType.replace("*", ".*");
					return new RegExp(`^${pattern}$`).test(file.type);
				}
				return file.type === fileType;
			});

			if (!isValidType) {
				setError(`File type not accepted. Allowed: ${acceptedFileTypes}`);
				return;
			}
		}

		setSelectedFile(file);

		// Create preview for images
		if (type === "image") {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			setError("Please select a file");
			return;
		}

		setUploading(true);
		setError("");
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append("files", selectedFile);
			formData.append("visibility", "PRIVATE");

			const xhr = new XMLHttpRequest();

			// Track upload progress
			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable) {
					const percentComplete = (event.loaded / event.total) * 100;
					setUploadProgress(percentComplete);
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					const response = JSON.parse(xhr.responseText);
					if (response.success && response.data && response.data.length > 0) {
						const uploadedFile = response.data[0];
						toast.success(`${selectedFile.name} uploaded successfully!`);
						onUploadComplete(uploadedFile.url, uploadedFile.name, selectedFile);
						handleClose();
					} else {
						setError(response.message || "Upload failed");
					}
				} else {
					const response = JSON.parse(xhr.responseText);
					setError(response.message || `Upload failed with status ${xhr.status}`);
				}
				setUploading(false);
			});

			xhr.addEventListener("error", () => {
				setError("Network error during upload");
				setUploading(false);
			});

			xhr.addEventListener("abort", () => {
				setError("Upload cancelled");
				setUploading(false);
			});

			xhr.open("POST", "/api/upload");
			xhr.send(formData);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
			setUploading(false);
		}
	};

	const handleClose = () => {
		setSelectedFile(null);
		setPreview("");
		setError("");
		setUploadProgress(0);
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{type === "image" ? "Upload Image" : "Upload File"}</DialogTitle>
					<DialogDescription>{type === "image" ? "Select an image to upload to your profile" : "Select a file to upload to your profile"}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* File Input */}
					<input
						ref={fileInputRef}
						type="file"
						onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
						accept={type === "image" ? "image/*" : acceptedFileTypes}
						disabled={uploading}
						className="hidden"
					/>

					{/* Drop Zone */}
					<div
						onClick={() => !uploading && fileInputRef.current?.click()}
						className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${uploading ? "cursor-not-allowed border-gray-300 bg-gray-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}
						onDragOver={(e) => !uploading && e.preventDefault()}
						onDrop={(e) => {
							if (uploading) return;
							e.preventDefault();
							handleFileSelect(e.dataTransfer.files?.[0] || null);
						}}>
						{selectedFile ? (
							<div className="space-y-2">
								{type === "image" && preview ? (
									<div className="mb-2 flex justify-center">
										<div className="h-24 w-24 overflow-hidden rounded-lg border">
											<Image
												src={preview}
												alt="Preview"
												fill
												className="object-cover"
											/>
										</div>
									</div>
								) : (
									<Upload className="mx-auto h-8 w-8 text-gray-400" />
								)}
								<div>
									<p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
									<p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
								</div>
							</div>
						) : (
							<div className="space-y-2">
								<Upload className="mx-auto h-8 w-8 text-gray-400" />
								<p className="text-sm text-gray-600">Click to upload or drag and drop</p>
								<p className="text-xs text-gray-500">Max size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB</p>
							</div>
						)}
					</div>

					{/* Preview for images */}
					{type === "image" && preview && (
						<div className="h-40 w-full overflow-hidden rounded-lg border">
							<Image
								src={preview}
								alt="Preview"
								fill
								className="object-cover"
							/>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
							<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					{/* Progress Bar */}
					{uploading && (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600">Uploading...</span>
								<span className="font-medium text-gray-600">{Math.round(uploadProgress)}%</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-gray-200">
								<div
									className="h-full bg-blue-500 transition-all duration-300"
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}

					{/* Success Message */}
					{!uploading && selectedFile && !error && uploadProgress > 0 && (
						<div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
							<CheckCircle2 className="h-4 w-4 text-green-600" />
							<p className="text-sm text-green-600">Upload complete!</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							onClick={() => {
								setSelectedFile(null);
								setPreview("");
								setError("");
								setUploadProgress(0);
							}}
							disabled={uploading}
							className="flex-1">
							Clear
						</Button>
						<Button
							onClick={handleUpload}
							disabled={!selectedFile || uploading}
							className="flex-1">
							{uploading ? "Uploading..." : "Upload"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

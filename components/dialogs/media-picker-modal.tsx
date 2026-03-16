"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Check, Search, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { SITE_CONFIG } from "@/lib";
import { getMediaList, uploadMedia } from "@/lib/features/media/actions";
import type { MediaWithUploader } from "@/lib/features/media/types";

interface MediaPickerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (urls: string[] | string) => void;
	title?: string;
	description?: string;
	multiple?: boolean;
}

export function MediaPickerModal({ isOpen, onClose, onSelect, title = "Select Media", description = "Choose an image from your media library or upload a new one", multiple = true }: MediaPickerModalProps) {
	const [mediaList, setMediaList] = useState<MediaWithUploader[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);
	const pageSize = SITE_CONFIG.pagination.getPageSize("media_pagesize");
	const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);

	// Load media list
	const loadMedia = useCallback(
		async (page: number = 1, search: string = "") => {
			setLoading(true);
			try {
				const result = await getMediaList(page, search, pageSize);
				if (result.success && result.data) {
					setMediaList(result.data.items || []);
					setTotal(result.data.total || 0);
					setCurrentPage(page);
					console.log("📸 Media loaded:", {
						count: result.data.items?.length,
						total: result.data.total,
						items: result.data.items?.map((m) => ({ id: m.id, name: m.name, url: m.url })),
					});
				} else {
					console.warn("⚠️ Failed to load media:", result.message);
					toast.error(result.message || "Failed to load media");
				}
			} catch (error) {
				console.error("❌ Error loading media:", error);
				toast.error("Failed to load media");
			} finally {
				setLoading(false);
			}
		},
		[pageSize],
	);

	// Initial load when modal opens
	useEffect(() => {
		if (isOpen) {
			console.log("🎬 Modal opened, loading media...");
			setSearchQuery("");
			setCurrentPage(1);
			loadMedia(1, "");
		}
	}, [isOpen, loadMedia]);

	// Handle search with debounce
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchQuery.trim()) {
				console.log("🔍 Searching for:", searchQuery);
				loadMedia(1, searchQuery);
			} else if (isOpen) {
				console.log("🔄 Clearing search");
				loadMedia(1, "");
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery, loadMedia, isOpen]);

	// Handle file upload
	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files;
		if (!files || files.length === 0) return;

		setUploading(true);
		try {
			const formData = new FormData();
			Array.from(files).forEach((file) => {
				formData.append("files", file);
			});
			formData.append("visibility", "PRIVATE");

			// Use the Server Action to upload media
			const result = await uploadMedia(formData);

			if (result.success && result.data) {
				toast.success(`Uploaded ${result.data.length} file(s)`);
				// Reload media list to show newly uploaded file
				await loadMedia(1, "");
				// Reset input after successful upload (safe check)
				if (e.currentTarget) {
					e.currentTarget.value = "";
				}
			} else {
				toast.error(result.message || "Upload failed");
			}
		} catch (error) {
			toast.error("Upload failed");
			console.error(error);
		} finally {
			setUploading(false);
		}
	};
	// Handle media selection (toggle selection)
	const handleSelectMedia = (media: MediaWithUploader) => {
		if (!multiple) {
			// Single selection mode
			setSelectedMediaUrls([media.url]);
		} else {
			// Multiple selection mode
			setSelectedMediaUrls((prev) => {
				const isSelected = prev.includes(media.url);
				if (isSelected) {
					// Remove from selection
					return prev.filter((url) => url !== media.url);
				} else {
					// Add to selection
					return [...prev, media.url];
				}
			});
		}
	};

	// Handle confirm selection
	const handleConfirm = () => {
		if (selectedMediaUrls.length > 0) {
			if (!multiple && selectedMediaUrls[0]) {
				// Single selection mode - return first URL as string
				onSelect(selectedMediaUrls[0]);
			} else if (multiple) {
				// Multiple selection mode - return array
				onSelect(selectedMediaUrls);
			}
			setSelectedMediaUrls([]);
		}
	};

	// Handle close
	const handleClose = () => {
		setSelectedMediaUrls([]);
		onClose();
	};

	const pageCount = Math.ceil(total / pageSize);
	const hasNextPage = currentPage < pageCount;
	const hasPrevPage = currentPage > 1;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={handleClose}>
			<DialogContent className="flex max-h-[90vh] !max-w-4xl flex-col overflow-hidden">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 space-y-4 overflow-y-auto px-2">
					{/* Search Bar */}
					<div className="bg-background sticky top-0 z-10 flex gap-2 pt-2 pb-4">
						<div className="relative flex-1">
							<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								placeholder="Search media..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
								disabled={loading}
							/>
						</div>
					</div>

					{/* Upload Section */}
					<Card className="border-dashed p-0">
						<CardContent className="p-6">
							<div className="space-y-4">
								<div>
									<Label
										htmlFor="media-upload"
										className="text-base font-semibold">
										Upload New Media
									</Label>
									<p className="text-muted-foreground mt-1 text-sm">Drag and drop or click to select files</p>
								</div>
								<div className="relative">
									<input
										id="media-upload"
										type="file"
										multiple
										accept="image/*"
										onChange={handleFileUpload}
										disabled={uploading}
										className="hidden"
									/>
									<label
										htmlFor="media-upload"
										className="border-muted-foreground/25 hover:border-muted-foreground/50 flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors">
										{uploading ? (
											<div className="flex flex-col items-center gap-2">
												<Loader size="lg" />
												<p className="text-muted-foreground text-sm">Uploading...</p>
											</div>
										) : (
											<div className="flex flex-col items-center gap-2">
												<Upload className="text-muted-foreground h-8 w-8" />
												<p className="text-foreground text-sm font-medium">Click to upload or drag files</p>
												<p className="text-muted-foreground text-xs">PNG, JPG, GIF up to 10MB</p>
											</div>
										)}
									</label>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Media Grid */}
					<div>
						<h3 className="mb-3 text-sm font-semibold">Media Library {total > 0 && <span className="text-muted-foreground">({total})</span>}</h3>

						{loading && mediaList.length === 0 ? (
							<div className="flex items-center justify-center py-12">
								<Loader size="lg" />
							</div>
						) : mediaList.length === 0 ? (
							<div className="py-12 text-center">
								<p className="text-muted-foreground">No media files found</p>
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
								{mediaList.map((media) => (
									<div
										key={media.id}
										onClick={() => handleSelectMedia(media)}
										className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${selectedMediaUrls.includes(media.url) ? "border-primary shadow-lg" : "border-border hover:border-primary/50"}`}>
										{/* Image */}
										<div className="bg-muted relative aspect-square w-full">
											<Image
												src={media.url}
												alt={media.name}
												fill
												className="object-cover"
												sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
											/>
										</div>

										{/* Hover Overlay */}
										<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
											<div className="text-center">
												<p className="truncate px-2 text-xs font-medium text-white">{media.name}</p>
											</div>
										</div>

										{/* Selection Indicator */}
										{selectedMediaUrls.includes(media.url) && (
											<div className="bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1">
												<Check className="h-4 w-4" />
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Pagination */}
					{pageCount > 1 && (
						<div className="flex items-center justify-between border-t pt-4">
							<p className="text-muted-foreground text-sm">
								Page {currentPage} of {pageCount}
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => loadMedia(currentPage - 1, searchQuery)}
									disabled={!hasPrevPage || loading}>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => loadMedia(currentPage + 1, searchQuery)}
									disabled={!hasNextPage || loading}>
									Next
								</Button>
							</div>
						</div>
					)}
				</div>

				{/* Footer Actions */}
				<div className="flex justify-end gap-3 border-t pt-4">
					<Button
						variant="outline"
						onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={selectedMediaUrls.length === 0 || uploading}>
						{uploading ? (
							<>
								<Loader
									size="sm"
									className="mr-2"
								/>
								Uploading...
							</>
						) : (
							`Select Media${selectedMediaUrls.length > 0 ? ` (${selectedMediaUrls.length})` : ""}`
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

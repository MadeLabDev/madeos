"use client";

import { useCallback, useState } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteMediaBulk } from "@/lib/features/media/actions";
import type { MediaGridItemsProps } from "@/lib/features/media/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

import { MediaGridItem } from "./media-grid-item";

/**
 * Client component for rendering media grid items with Pusher real-time updates
 */
export function MediaGridItems({ items: initialItems }: MediaGridItemsProps) {
	const [items, setItems] = useState(() => initialItems);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
	const [isDeleting, setIsDeleting] = useState(false);

	// Initialize Pusher connection
	usePusher();

	// Handle media updates from Pusher
	const handleMediaUpdate = useCallback((eventData: any) => {
		const data = eventData.data || eventData;

		if (data.action === "media_visibility_updated") {
			// Update item visibility in local state
			setItems((prev) => prev.map((item) => (item.id === data.mediaId ? { ...item, visibility: data.media.visibility } : item)));
			console.log("📸 Media visibility updated:", data.mediaId);
		} else if (data.action === "media_deleted") {
			// Remove deleted item from list
			setItems((prev) => prev.filter((item) => item.id !== data.mediaId));
			// Also remove from selected items
			setSelectedIds((prev) => {
				const updated = new Set(prev);
				updated.delete(data.mediaId);
				return updated;
			});
		}
	}, []);

	// Subscribe to media update events
	useChannelEvent("private-global", "media:updated", handleMediaUpdate);

	// Handle individual item selection
	const handleSelectItem = useCallback((id: string, selected: boolean) => {
		setSelectedIds((prev) => {
			const updated = new Set(prev);
			if (selected) {
				updated.add(id);
			} else {
				updated.delete(id);
			}
			return updated;
		});
	}, []);

	// Handle select all
	const handleSelectAll = useCallback(
		(checked: boolean) => {
			if (checked) {
				setSelectedIds(new Set(items.map((item) => item.id)));
			} else {
				setSelectedIds(new Set());
			}
		},
		[items],
	);

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedIds.size === 0) {
			toast.error("No files selected");
			return;
		}

		if (!window.confirm(`Delete ${selectedIds.size} file(s)? This action cannot be undone.`)) {
			return;
		}

		setIsDeleting(true);
		const ids = Array.from(selectedIds);
		const result = await deleteMediaBulk(ids);

		if (result.success) {
			toast.success(result.message);
			setSelectedIds(new Set());
			// Items will be removed via Pusher events
		} else {
			toast.error(result.message);
		}
		setIsDeleting(false);
	};

	// Show selection toolbar if items are selected
	const showSelectionToolbar = selectedIds.size > 0;
	const allSelected = selectedIds.size === items.length && items.length > 0;
	const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

	return (
		<>
			{/* Selection Toolbar */}
			{showSelectionToolbar && (
				<div className="bg-primary/10 border-primary/20 mb-4 flex items-center justify-between rounded-lg border p-4">
					<div className="flex items-center gap-4">
						<Checkbox
							checked={allSelected || someSelected}
							onCheckedChange={handleSelectAll}
							className="h-5 w-5"
						/>
						<span className="text-sm font-medium">{selectedIds.size} file(s) selected</span>
					</div>
					<Button
						variant="destructive"
						size="sm"
						onClick={handleBulkDelete}
						disabled={isDeleting}>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Selected
					</Button>
				</div>
			)}

			{/* Grid Header with Select All when no items selected */}
			{items.length > 0 && !showSelectionToolbar && (
				<div className="mb-4 flex items-center gap-2">
					<Checkbox
						checked={false}
						onCheckedChange={handleSelectAll}
						className="h-5 w-5"
					/>
					<span className="text-muted-foreground text-xs">Select all</span>
				</div>
			)}

			{/* Media Grid */}
			<div className="4xl:grid-cols-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
				{items.map((media: any) => (
					<MediaGridItem
						key={media.id}
						id={media.id}
						name={media.name}
						url={media.url}
						type={media.type}
						size={media.size}
						visibility={media.visibility}
						uploadedBy={media.uploadedBy}
						isSelected={selectedIds.has(media.id)}
						onSelect={handleSelectItem}
					/>
				))}
			</div>
		</>
	);
}

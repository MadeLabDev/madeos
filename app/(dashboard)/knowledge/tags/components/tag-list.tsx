"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteTagAction } from "@/lib/features/knowledge-tags/actions";
import type { KnowledgeTag } from "@/lib/features/knowledge-tags/types";
import { TagListProps } from "@/lib/features/knowledge-tags/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function TagList({ tags: initialTags, total, page, pageSize, search = "" }: TagListProps) {
	const [tags, setTags] = useState<KnowledgeTag[]>(initialTags);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [tagToDelete, setTagToDelete] = useState<KnowledgeTag | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Update local tags when props change
	useEffect(() => {
		setTags(initialTags);
		setSelectedIds([]);
	}, [initialTags]);

	// Pusher subscription for realtime updates
	usePusher();
	const handleTagUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "tag_created") {
				if (page === 1) {
					setTags((prev) => {
						if (prev.find((t) => t.id === data.tag.id)) return prev;
						return [data.tag, ...prev];
					});
				}
			} else if (data.action === "tag_updated") {
				setTags((prev) => prev.map((t) => (t.id === data.tag.id ? { ...t, ...data.tag } : t)));
			} else if (data.action === "tag_deleted") {
				setTags((prev) => prev.filter((t) => t.id !== data.tag?.id));
				setSelectedIds((prev) => prev.filter((id) => id !== data.tag?.id));
			}
		},
		[page],
	);

	useChannelEvent("private-global", "tag_update", handleTagUpdate);

	const handleDeleteTag = useCallback(async () => {
		if (!tagToDelete) return;

		try {
			setDeleting(true);
			const result = await deleteTagAction(tagToDelete.id);

			if (result.success) {
				toast.success("Tag deleted successfully");
				setDeleteDialogOpen(false);
				setTagToDelete(null);
				window.location.reload();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete tag");
		} finally {
			setDeleting(false);
		}
	}, [tagToDelete]);

	const toggleSelectTag = (tagId: string) => {
		setSelectedIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
	};

	const handleBulkDelete = async () => {
		if (selectedIds.length === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedIds.length} tag(s)?`)) {
			return;
		}

		setBulkActionLoading(true);
		try {
			for (const id of selectedIds) {
				await deleteTagAction(id);
			}
			toast.success(`${selectedIds.length} tag(s) deleted successfully`);
			setSelectedIds([]);
			window.location.reload();
		} catch (error) {
			toast.error("Failed to delete tags");
		} finally {
			setBulkActionLoading(false);
		}
	};

	if (tags.length === 0) {
		return <NoItemFound text="No tags found" />;
	}

	return (
		<>
			{/* Bulk Actions Bar */}
			<BulkActionsBar
				selectedCount={selectedIds.length}
				itemName="tag"
				isLoading={bulkActionLoading}
				actions={[
					{
						label: "Delete Selected",
						icon: Trash2,
						onClick: handleBulkDelete,
						variant: "destructive",
					},
				]}
				onClear={() => setSelectedIds([])}
			/>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12.5">
								<Checkbox
									checked={selectedIds.length === tags.length}
									onCheckedChange={() => {
										if (selectedIds.length === tags.length) {
											setSelectedIds([]);
										} else {
											setSelectedIds(tags.map((t) => t.id));
										}
									}}
									aria-label="Select all"
								/>
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Color</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{tags.map((tag) => (
							<TableRow key={tag.id}>
								<TableCell>
									<Checkbox
										checked={selectedIds.includes(tag.id)}
										onCheckedChange={() => toggleSelectTag(tag.id)}
										aria-label={`Select ${tag.name}`}
									/>
								</TableCell>
								<TableCell>{tag.name}</TableCell>
								<TableCell>{tag.slug}</TableCell>
								<TableCell>
									{tag.color && (
										<div className="flex items-center gap-2">
											<div
												className="h-4 w-4 rounded border"
												style={{ backgroundColor: tag.color }}
											/>
											<span className="text-muted-foreground text-xs">{tag.color}</span>
										</div>
									)}
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link href={`/knowledge/tags/${tag.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/knowledge/tags/${tag.id}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => {
													setTagToDelete(tag);
													setDeleteDialogOpen(true);
												}}>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="tags"
					baseUrl="/knowledge/tags"
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Tag"
				description={`Are you sure you want to delete "${tagToDelete?.name}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDeleteTag}
			/>
		</>
	);
}

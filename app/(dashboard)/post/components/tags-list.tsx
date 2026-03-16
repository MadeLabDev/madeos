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
import { bulkDeleteTagsAction, deleteTagAction } from "@/lib/features/post-tags/actions";
import type { PostTag } from "@/lib/features/post-tags/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface TagListProps {
	tags: PostTag[];
	total: number;
	page: number;
	pageSize: number;
	search?: string;
	type?: string;
}

export function TagList({ tags: initialTags, total, page, pageSize, search = "", type = "blog" }: TagListProps) {
	const [tags, setTags] = useState<PostTag[]>(initialTags);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [tagToDelete, setTagToDelete] = useState<PostTag | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [bulkDeleting, setBulkDeleting] = useState(false);

	const typePath = "post";

	// Initialize Pusher
	usePusher();

	// Subscribe to post tag updates
	useChannelEvent("private-global", "post_tag_update", (data: any) => {
		const { action } = data;
		if (action === "tag_created" || action === "tag_updated" || action === "tag_deleted") {
			window.location.reload();
		}
	});

	// Update local tags when props change
	useEffect(() => {
		setTags(initialTags);
		setSelectedIds([]);
	}, [initialTags]);

	const handleDeleteTag = useCallback(async () => {
		if (!tagToDelete) return;

		try {
			setIsDeleting(true);
			const result = await deleteTagAction(tagToDelete.id);

			if (result.success) {
				toast.success("Tag deleted successfully");
				setDeleteDialogOpen(false);
				setTagToDelete(null);
				// Reload the list
				window.location.reload();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete tag");
		} finally {
			setIsDeleting(false);
		}
	}, [tagToDelete]);

	const toggleSelectAll = () => {
		if (selectedIds.length === tags.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(tags.map((t) => t.id));
		}
	};

	const toggleSelectTag = (tagId: string) => {
		setSelectedIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
	};

	const handleBulkDelete = async () => {
		if (selectedIds.length === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedIds.length} tag(s)?`)) {
			return;
		}

		setBulkDeleting(true);
		try {
			const result = await bulkDeleteTagsAction(selectedIds);
			if (result.success) {
				toast.success(`${selectedIds.length} tag(s) deleted successfully`);
				setSelectedIds([]);
				window.location.reload();
			} else {
				toast.error(result.message || "Failed to delete tags");
			}
		} catch (error) {
			toast.error("Failed to delete tags");
		} finally {
			setBulkDeleting(false);
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
				isLoading={bulkDeleting}
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
							<TableHead className="w-[50px]">
								<Checkbox
									checked={selectedIds.length === tags.length}
									onCheckedChange={toggleSelectAll}
									aria-label="Select all"
								/>
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Color</TableHead>
							<TableHead>Post Count</TableHead>
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
									<div className="flex items-center gap-2">
										<div
											className="h-4 w-4 rounded border"
											style={{ backgroundColor: tag.color || "#666666" }}
										/>
										<span className="text-muted-foreground text-sm">{tag.color || "#666666"}</span>
									</div>
								</TableCell>
								<TableCell>{tag._count?.posts || 0}</TableCell>
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
												<Link href={`/${typePath}/tags/${tag.id}?type=${type}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/${typePath}/tags/${tag.id}/edit?type=${type}`}>
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
					baseUrl="/post/tags"
					type={type}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Tag"
				description={`Are you sure you want to delete "${tagToDelete?.name}"? This action cannot be undone.`}
				isDeleting={isDeleting}
				onConfirm={handleDeleteTag}
			/>
		</>
	);
}

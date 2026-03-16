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
import type { PostCategory } from "@/lib/features/post/types";
import { bulkDeleteCategoriesAction, deleteCategoryAction } from "@/lib/features/post-categories/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface CategoryListProps {
	categories: PostCategory[];
	total: number;
	page: number;
	pageSize: number;
	search?: string;
	type?: string;
}

export function CategoryList({ categories: initialCategories, total, page, pageSize, search = "", type = "blog" }: CategoryListProps) {
	const [categories, setCategories] = useState<PostCategory[]>(initialCategories);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<PostCategory | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [bulkDeleting, setBulkDeleting] = useState(false);

	const typePath = "post";

	// Initialize Pusher
	usePusher();

	// Subscribe to post category updates
	useChannelEvent("private-global", "post_category_update", (data: any) => {
		const { action } = data;
		if (action === "category_created" || action === "category_updated" || action === "category_deleted") {
			window.location.reload();
		}
	});

	// Update local categories when props change
	useEffect(() => {
		setCategories(initialCategories);
		setSelectedIds([]);
	}, [initialCategories]);

	const handleDeleteCategory = useCallback(async () => {
		if (!categoryToDelete) return;

		try {
			setIsDeleting(true);
			const result = await deleteCategoryAction(categoryToDelete.id);

			if (result.success) {
				toast.success("Category deleted successfully");
				setDeleteDialogOpen(false);
				setCategoryToDelete(null);
				// Reload the list
				window.location.reload();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete category");
		} finally {
			setIsDeleting(false);
		}
	}, [categoryToDelete]);

	const toggleSelectAll = () => {
		if (selectedIds.length === categories.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(categories.map((c) => c.id));
		}
	};

	const toggleSelectCategory = (categoryId: string) => {
		setSelectedIds((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
	};

	const handleBulkDelete = async () => {
		if (selectedIds.length === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedIds.length} categor(ies)?`)) {
			return;
		}

		setBulkDeleting(true);
		try {
			const result = await bulkDeleteCategoriesAction(selectedIds);
			if (result.success) {
				toast.success(`${selectedIds.length} categor(ies) deleted successfully`);
				setSelectedIds([]);
				window.location.reload();
			} else {
				toast.error(result.message || "Failed to delete categories");
			}
		} catch (error) {
			toast.error("Failed to delete categories");
		} finally {
			setBulkDeleting(false);
		}
	};

	if (categories.length === 0) {
		return <NoItemFound text="No categories found" />;
	}

	return (
		<>
			{/* Bulk Actions Bar */}
			<BulkActionsBar
				selectedCount={selectedIds.length}
				itemName="category"
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
									checked={selectedIds.length === categories.length}
									onCheckedChange={toggleSelectAll}
									aria-label="Select all"
								/>
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Color</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Post Count</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{categories.map((category) => (
							<TableRow key={category.id}>
								<TableCell>
									<Checkbox
										checked={selectedIds.includes(category.id)}
										onCheckedChange={() => toggleSelectCategory(category.id)}
										aria-label={`Select ${category.name}`}
									/>
								</TableCell>
								<TableCell>{category.name}</TableCell>
								<TableCell>{category.slug}</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<div
											className="h-4 w-4 rounded border"
											style={{ backgroundColor: category.color || "#000000" }}
										/>
										<span className="text-muted-foreground text-sm">{category.color || "#000000"}</span>
									</div>
								</TableCell>
								<TableCell className="text-muted-foreground max-w-xs truncate text-sm">{category.description || "-"}</TableCell>
								<TableCell>{category._count?.posts || 0}</TableCell>
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
												<Link href={`/${typePath}/categories/${category.id}?type=${type}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/${typePath}/categories/${category.id}/edit?type=${type}`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => {
													setCategoryToDelete(category);
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
					itemName="categories"
					baseUrl="/post/categories"
					type={type}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Category"
				description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
				isDeleting={isDeleting}
				onConfirm={handleDeleteCategory}
			/>
		</>
	);
}

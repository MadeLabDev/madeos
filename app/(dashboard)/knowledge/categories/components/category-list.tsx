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
import { deleteCategoryAction } from "@/lib/features/knowledge-categories/actions";
import type { KnowledgeCategory } from "@/lib/features/knowledge-categories/types";
import type { CategoryListProps } from "@/lib/features/knowledge-categories/types/category-ui.types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function CategoryList({ categories: initialCategories, total, page, pageSize, search = "" }: CategoryListProps) {
	const [categories, setCategories] = useState<KnowledgeCategory[]>(initialCategories);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<KnowledgeCategory | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Update local categories when props change
	useEffect(() => {
		setCategories(initialCategories);
		setSelectedIds([]);
	}, [initialCategories]);

	// Pusher subscription for realtime updates
	usePusher();
	const handleCategoryUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "category_created") {
				if (page === 1) {
					setCategories((prev) => {
						if (prev.find((c) => c.id === data.category.id)) return prev;
						return [data.category, ...prev];
					});
				}
			} else if (data.action === "category_updated") {
				setCategories((prev) => prev.map((c) => (c.id === data.category.id ? { ...c, ...data.category } : c)));
			} else if (data.action === "category_deleted") {
				setCategories((prev) => prev.filter((c) => c.id !== data.category?.id));
				setSelectedIds((prev) => prev.filter((id) => id !== data.category?.id));
			}
		},
		[page],
	);

	useChannelEvent("private-global", "category_update", handleCategoryUpdate);

	const handleDeleteCategory = useCallback(async () => {
		if (!categoryToDelete) return;

		try {
			setDeleting(true);
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
			setDeleting(false);
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

		setBulkActionLoading(true);
		try {
			// Delete each category
			for (const id of selectedIds) {
				await deleteCategoryAction(id);
			}
			toast.success(`${selectedIds.length} categor(ies) deleted successfully`);
			setSelectedIds([]);
			window.location.reload();
		} catch (error) {
			toast.error("Failed to delete categories");
		} finally {
			setBulkActionLoading(false);
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
							<TableHead className="w-[50px]">
								<Checkbox
									checked={selectedIds.length === categories.length}
									onCheckedChange={toggleSelectAll}
									aria-label="Select all"
								/>
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Color</TableHead>
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
								<TableCell className="text-muted-foreground max-w-xs truncate text-sm">{category.description || "-"}</TableCell>
								<TableCell>
									{category.color && (
										<div className="flex items-center gap-2">
											<div
												className="h-4 w-4 rounded border"
												style={{ backgroundColor: category.color }}
											/>
											<span className="text-muted-foreground text-xs">{category.color}</span>
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
												<Link href={`/knowledge/categories/${category.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/knowledge/categories/${category.id}/edit`}>
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
					baseUrl="/knowledge/categories"
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Category"
				description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDeleteCategory}
			/>
		</>
	);
}

"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, FileText, MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { TechPackStatus } from "@/generated/prisma/enums";
import { useInfoModal } from "@/lib/contexts/info-modal-context";
import { deleteTechPack, getTechPacks } from "@/lib/features/design/actions";
import { TechPack } from "@/lib/features/design/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface TechPackListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function TechPackList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: TechPackListProps) {
	const { showInfo } = useInfoModal();
	const [techPacks, setTechPacks] = useState<TechPack[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [selectedTechPack, setSelectedTechPack] = useState<TechPack | null>(null);

	// Checkbox selection state
	const [selectedTechPackIds, setSelectedTechPackIds] = useState<string[]>([]);

	// Initialize Pusher
	usePusher();

	// Subscribe to tech pack updates
	useChannelEvent("private-global", "tech_pack_update", (data: any) => {
		const { action } = data;
		if (action === "tech_pack_created" || action === "tech_pack_updated" || action === "tech_pack_deleted") {
			loadTechPacks();
		}
	});

	// Load tech packs function
	const loadTechPacks = useCallback(async () => {
		setLoading(true);
		try {
			const filters = {
				...(statusFilter !== "ALL" && { status: statusFilter as TechPackStatus }),
			};
			const result = await getTechPacks(filters, { take: 1000 }); // Get all for client-side filtering
			if (result.success && result.data) {
				let filteredTechPacks = result.data;

				// Client-side search filtering
				if (search) {
					filteredTechPacks = filteredTechPacks.filter((techPack) => techPack.name.toLowerCase().includes(search.toLowerCase()) || techPack.description?.toLowerCase().includes(search.toLowerCase()) || techPack.decorationMethod.toLowerCase().includes(search.toLowerCase()) || techPack.productionNotes?.toLowerCase().includes(search.toLowerCase()));
				}

				// Set total for pagination
				setTotal(filteredTechPacks.length);

				// Client-side pagination
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedTechPacks = filteredTechPacks.slice(startIndex, endIndex);

				setTechPacks(paginatedTechPacks);
			} else {
				toast.error("Failed to load tech packs");
				setTechPacks([]);
				setTotal(0);
			}
		} catch (error) {
			toast.error("Failed to load tech packs");
			setTechPacks([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	// Load data on mount and when filters change
	useEffect(() => {
		loadTechPacks();
	}, [loadTechPacks]);

	const handleDelete = async () => {
		if (!selectedTechPack) return;

		setDeleting(true);
		try {
			const result = await deleteTechPack(selectedTechPack.id);
			if (result.success) {
				toast.success("Tech pack deleted successfully");
				loadTechPacks();
			} else {
				toast.error(result.message || "Failed to delete tech pack");
			}
		} catch (error) {
			toast.error("Failed to delete tech pack");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setSelectedTechPack(null);
		}
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedTechPackIds.length === 0) return;

		// For now, delete one by one (can be optimized later)
		let successCount = 0;
		let errorCount = 0;

		for (const techPackId of selectedTechPackIds) {
			try {
				const result = await deleteTechPack(techPackId);
				if (result.success) {
					successCount++;
				} else {
					errorCount++;
				}
			} catch (error) {
				errorCount++;
			}
		}

		if (successCount > 0) {
			toast.success(`Successfully deleted ${successCount} tech pack(s)`);
			setSelectedTechPackIds([]);
			loadTechPacks();
		}

		if (errorCount > 0) {
			toast.error(`Failed to delete ${errorCount} tech pack(s)`);
		}
	};

	// Bulk actions
	const toggleSelectTechPack = (techPackId: string) => {
		setSelectedTechPackIds((prev) => (prev.includes(techPackId) ? prev.filter((id) => id !== techPackId) : [...prev, techPackId]));
	};

	const toggleSelectAll = () => {
		if (selectedTechPackIds.length === techPacks.length) {
			setSelectedTechPackIds([]);
		} else {
			setSelectedTechPackIds(techPacks.map((techPack) => techPack.id));
		}
	};

	const handleDownloadFiles = async (techPack: TechPack) => {
		if (!techPack.outputFiles) {
			toast.error("No files available for download");
			return;
		}

		try {
			// Parse outputFiles from string to array
			let files: string[] = [];
			try {
				const parsed = JSON.parse(techPack.outputFiles);
				files = Array.isArray(parsed) ? parsed : [techPack.outputFiles];
			} catch {
				files = [techPack.outputFiles];
			}

			if (files.length === 0) {
				toast.error("No files available for download");
				return;
			}

			// Download each file
			files.forEach((url, index) => {
				setTimeout(() => {
					const link = document.createElement("a");
					link.href = url;
					link.download = url.split("/").pop() || `file-${index + 1}`;
					link.target = "_blank";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}, index * 500); // Stagger downloads to avoid browser blocking
			});

			toast.success(`Downloading ${files.length} file(s)`);
		} catch (error) {
			toast.error("Failed to download files");
			console.error(error);
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedTechPackIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedTechPackIds.length}
					itemName="tech pack"
					isLoading={false}
					onClear={() => setSelectedTechPackIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{/* Tech Packs Grid */}
			{techPacks.length === 0 ? (
				<NoItemFound
					title="No tech packs found"
					description="Get started by creating your first tech pack from an approved design."
					action={
						<Button asChild>
							<Link href="/design-projects/tech-packs/new">Create Tech Pack</Link>
						</Button>
					}
				/>
			) : (
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={selectedTechPackIds.length === techPacks.length && techPacks.length > 0}
							onCheckedChange={toggleSelectAll}
						/>
						<span className="text-muted-foreground text-sm">Select all</span>
					</div>

					{techPacks.map((techPack) => (
						<Card
							key={techPack.id}
							className="m-0 gap-0 rounded-none border-0 border-b py-0 shadow-none">
							<CardContent className="p-0">
								<div className="flex min-h-14 items-center justify-between gap-3">
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<Checkbox
											checked={selectedTechPackIds.includes(techPack.id)}
											onCheckedChange={() => toggleSelectTechPack(techPack.id)}
											aria-label={`Select ${techPack.name}`}
											className="mt-0"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-1">
												<h3 className="truncate text-sm font-semibold">
													<Link
														href={`/design-projects/designs/${techPack.productDesignId}`}
														className="hover:underline">
														{techPack.name}
													</Link>
												</h3>
												<Badge
													variant="outline"
													className="px-1.5 py-0 text-xs">
													{techPack.decorationMethod}
												</Badge>
												<Badge
													variant={techPack.status === "APPROVED" ? "default" : techPack.status === "REVIEW" ? "secondary" : techPack.status === "REJECTED" ? "destructive" : techPack.status === "FINALIZED" ? "outline" : "secondary"}
													className="px-1.5 py-0 text-xs">
													{techPack.status}
												</Badge>
											</div>
										</div>
									</div>

									{/* Status Badge and Actions */}
									<div className="flex shrink-0 items-center gap-1">
										{techPack.productionNotes && (
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0"
												onClick={() => {
													showInfo({
														title: "Production Notes",
														content: techPack.productionNotes,
													});
												}}>
												<MessageSquare className="text-muted-foreground h-4 w-4" />
											</Button>
										)}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem asChild>
													<Link href={`/design-projects/designs/${techPack.productDesignId}`}>
														<Eye className="mr-2 h-4 w-4" />
														View Design
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/design-projects/tech-packs/${techPack.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit Tech Pack
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleDownloadFiles(techPack)}>
													<FileText className="mr-2 h-4 w-4" />
													Download Files
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setSelectedTechPack(techPack);
														setDeleteDialogOpen(true);
													}}>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="tech packs"
					baseUrl="/design-projects/tech-packs"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Tech Pack"
				description={`Are you sure you want to delete "${selectedTechPack?.name}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Eye, MessageSquare, MoreHorizontal, Pencil, Presentation, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { useInfoModal } from "@/lib/contexts/info-modal-context";
import { getDesignDecks } from "@/lib/features/design/actions";
import { DesignDeck } from "@/lib/features/design/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function DesignDeckList({
	page: initialPage = 1,
	pageSize: initialPageSize = 20,
	search: initialSearch = "",
	status: initialStatus = "",
}: {
	page?: number;
	pageSize?: number;
	search?: string;
	status?: string;
} = {}) {
	const { showInfo } = useInfoModal();
	const searchParams = useSearchParams();
	const [designDecks, setDesignDecks] = useState<DesignDeck[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [selectedDesignDeck, setSelectedDesignDeck] = useState<DesignDeck | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [total, setTotal] = useState(0);

	// Initialize Pusher
	usePusher();

	// Subscribe to design deck updates
	useChannelEvent("private-global", "design_deck_update", (data: any) => {
		const { action } = data;
		if (action === "design_deck_created" || action === "design_deck_updated" || action === "design_deck_deleted") {
			window.location.reload();
		}
	});

	const search = initialSearch || searchParams.get("search") || "";
	const status = initialStatus || searchParams.get("status") || "";
	const page = initialPage > 0 ? initialPage : parseInt(searchParams.get("page") || "1");
	const pageSize = initialPageSize > 0 ? initialPageSize : 20;

	const filters = useMemo(() => {
		const result: any = {};
		if (search) result.search = search;
		if (status) result.status = status;
		return result;
	}, [search, status]);

	const loadDesignDecks = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getDesignDecks(filters, { skip: (page - 1) * pageSize, take: pageSize });
			if (result.success && result.data) {
				setDesignDecks(result.data);
				// TODO: Get total count from API
				setTotal(result.data.length);
			} else {
				toast.error("Failed to load design decks");
			}
		} catch (error) {
			toast.error("Failed to load design decks");
		} finally {
			setLoading(false);
		}
	}, [filters, page, pageSize, setLoading, setDesignDecks, setTotal]);

	useEffect(() => {
		loadDesignDecks();
	}, [filters, page, loadDesignDecks]);

	const handleDelete = async () => {
		if (!selectedDesignDeck) return;

		setDeleting(true);
		try {
			// TODO: Implement delete action
			toast.success("Design deck deleted successfully");
			loadDesignDecks();
		} catch (error) {
			toast.error("Failed to delete design deck");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setSelectedDesignDeck(null);
		}
	};

	const handleBulkDelete = async () => {
		try {
			// TODO: Implement bulk delete
			toast.success(`${selectedIds.length} design decks deleted successfully`);
			setSelectedIds([]);
			loadDesignDecks();
		} catch (error) {
			toast.error("Failed to delete design decks");
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(designDecks.map((deck) => deck.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectItem = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedIds((prev) => [...prev, id]);
		} else {
			setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-6">
			{selectedIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedIds.length}
					onClear={() => setSelectedIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{designDecks.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<div className="text-center">
							<h3 className="text-lg font-medium">No design decks yet</h3>
							<p className="text-muted-foreground mb-4">Create your first design deck to present concepts to clients.</p>
							<Button asChild>
								<Link href="/design-projects/design-decks/new">
									<Presentation className="mr-2 h-4 w-4" />
									Create Design Deck
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={selectedIds.length === designDecks.length && designDecks.length > 0}
							onCheckedChange={handleSelectAll}
						/>
						<span className="text-muted-foreground text-sm">Select all</span>
					</div>

					{designDecks.map((designDeck) => (
						<Card
							key={designDeck.id}
							className="m-0 gap-0 rounded-none border-0 border-b py-0 shadow-none">
							<CardContent className="p-0">
								<div className="flex min-h-14 items-center justify-between gap-3">
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<Checkbox
											checked={selectedIds.includes(designDeck.id)}
											onCheckedChange={(checked) => handleSelectItem(designDeck.id, checked as boolean)}
											className="mt-0"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-1">
												<h3 className="truncate text-sm font-semibold">
													<Link
														href={`/design-projects/projects/${designDeck.designProjectId}`}
														className="hover:underline">
														{designDeck.title}
													</Link>
												</h3>
												<Badge
													variant="outline"
													className="px-1.5 py-0 text-xs">
													{designDeck.status}
												</Badge>
											</div>
										</div>
									</div>

									{/* Status Badge and Actions */}
									<div className="flex shrink-0 items-center gap-1">
										{designDeck.notes && (
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0"
												onClick={() => {
													showInfo({
														title: "Design Deck Notes",
														content: designDeck.notes,
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
													<Link href={`/design-projects/projects/${designDeck.designProjectId}`}>
														<Eye className="mr-2 h-4 w-4" />
														View Project
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/design-projects/design-decks/${designDeck.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit Deck
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Presentation className="mr-2 h-4 w-4" />
													Present Deck
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setSelectedDesignDeck(designDeck);
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
					itemName="design decks"
					baseUrl="/design-projects/design-decks"
					type={status}
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Design Deck"
				description={`Are you sure you want to delete "${selectedDesignDeck?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}

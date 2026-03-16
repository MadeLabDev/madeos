"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { Eye, MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/page-loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bulkDeleteInteractionsAction, deleteInteractionAction, getInteractionsAction } from "@/lib/features/interactions/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

// Define InteractionType enum locally to avoid importing from Prisma
enum InteractionType {
	MEETING = "MEETING",
	CALL = "CALL",
	EMAIL = "EMAIL",
	NOTE = "NOTE",
}

interface InteractionListProps {
	page: number;
	search: string;
	pageSize: number;
	customerId?: string;
	contactId?: string;
	type?: string;
}

const typeColors = {
	[InteractionType.MEETING]: "bg-blue-100 text-blue-800",
	[InteractionType.CALL]: "bg-green-100 text-green-800",
	[InteractionType.EMAIL]: "bg-yellow-100 text-yellow-800",
	[InteractionType.NOTE]: "bg-gray-100 text-gray-800",
};

export function InteractionList({ page, search, pageSize, customerId, contactId, type }: InteractionListProps) {
	const [interactions, setInteractions] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [interactionToDelete, setInteractionToDelete] = useState<any | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Bulk selection state
	const [selectedInteractionIds, setSelectedInteractionIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load interactions function
	const loadInteractions = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getInteractionsAction({ page, search, pageSize, customerId, contactId, type: type ? (type as InteractionType) : undefined });
			if (result.success && result.data) {
				const data = result.data as any;
				setInteractions(data.interactions || []);
				setTotal(data.total || 0);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load interactions");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize, customerId, contactId, type]);

	// Load on mount and when filters change
	useEffect(() => {
		loadInteractions();
		setSelectedInteractionIds([]);
	}, [loadInteractions]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleInteractionUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "interaction_created") {
				setInteractions((prev) => {
					if (prev.find((i) => i.id === data.interaction.id)) return prev;
					return page === 1 ? [data.interaction, ...prev] : prev;
				});
			} else if (data.action === "interaction_updated") {
				setInteractions((prev) => prev.map((i) => (i.id === data.interaction.id ? { ...i, ...data.interaction } : i)));
			} else if (data.action === "interaction_deleted") {
				setInteractions((prev) => prev.filter((i) => i.id !== data.interactionId));
			} else {
				loadInteractions();
			}
		},
		[page, loadInteractions],
	);

	useChannelEvent("private-global", "interaction_update", handleInteractionUpdate);

	async function handleDeleteInteraction() {
		if (!interactionToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteInteractionAction(interactionToDelete.id);
			if (result.success) {
				toast.success("Interaction deleted");
				setInteractionToDelete(null);
				await loadInteractions();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete interaction");
		} finally {
			setDeleting(false);
		}
	}

	async function handleBulkDelete() {
		if (selectedInteractionIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteInteractionsAction(selectedInteractionIds);
			if (result.success) {
				toast.success(`${selectedInteractionIds.length} interactions deleted`);
				setSelectedInteractionIds([]);
				await loadInteractions();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete interactions");
		} finally {
			setBulkActionLoading(false);
		}
	}

	function handleSelectAll(checked: boolean) {
		if (checked) {
			setSelectedInteractionIds(interactions.map((i) => i.id));
		} else {
			setSelectedInteractionIds([]);
		}
	}

	function handleSelectInteraction(id: string, checked: boolean) {
		if (checked) {
			setSelectedInteractionIds((prev) => [...prev, id]);
		} else {
			setSelectedInteractionIds((prev) => prev.filter((iid) => iid !== id));
		}
	}

	if (loading) {
		return <PageLoading />;
	}

	if (interactions.length === 0) {
		return (
			<NoItemFound
				icon={MessageSquare}
				title="No interactions found"
				description={search ? "Try adjusting your search criteria" : "Get started by adding your first interaction"}
				action={
					<Button asChild>
						<Link href="/interactions/new">Add Interaction</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions */}
			<BulkActionsBar
				selectedCount={selectedInteractionIds.length}
				itemName="interaction"
				isLoading={bulkActionLoading}
				actions={[
					{
						label: "Delete Selected",
						icon: Trash2,
						onClick: handleBulkDelete,
						variant: "destructive",
					},
				]}
				onClear={() => setSelectedInteractionIds([])}
			/>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={selectedInteractionIds.length === interactions.length && interactions.length > 0}
									onCheckedChange={handleSelectAll}
								/>
							</TableHead>
							<TableHead>Subject</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Duration</TableHead>
							<TableHead>Outcome</TableHead>
							<TableHead className="w-12"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{interactions.map((interaction) => (
							<TableRow key={interaction.id}>
								<TableCell>
									<Checkbox
										checked={selectedInteractionIds.includes(interaction.id)}
										onCheckedChange={(checked) => handleSelectInteraction(interaction.id, checked as boolean)}
									/>
								</TableCell>
								<TableCell className="font-medium">
									<Link
										href={`/interactions/${interaction.id}`}
										className="hover:underline">
										{interaction.subject}
									</Link>
								</TableCell>
								<TableCell>
									<Badge className={typeColors[interaction.type as InteractionType] || "bg-gray-100 text-gray-800"}>{interaction.type}</Badge>
								</TableCell>
								<TableCell>{format(new Date(interaction.date), "MMM dd, yyyy HH:mm")}</TableCell>
								<TableCell>{interaction.duration ? `${interaction.duration} min` : "-"}</TableCell>
								<TableCell>{interaction.outcome || "-"}</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuItem asChild>
												<Link href={`/interactions/${interaction.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/interactions/${interaction.id}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => setInteractionToDelete(interaction)}
												className="text-destructive">
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
					itemName="interactions"
					baseUrl="/interactions"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={!!interactionToDelete}
				onOpenChange={() => setInteractionToDelete(null)}
				onConfirm={handleDeleteInteraction}
				isDeleting={deleting}
				title="Delete Interaction"
				description={`Are you sure you want to delete "${interactionToDelete?.subject}"? This action cannot be undone.`}
			/>
		</div>
	);
}

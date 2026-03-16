"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
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
import { bulkDeleteEngagementsAction, deleteEngagementAction, getEngagementsAction } from "@/lib/features/customers/actions";
import { EngagementListParams } from "@/lib/features/customers/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function EngagementList({ page = 1, search, pageSize = 20, customerId, status }: EngagementListParams) {
	const [engagements, setEngagements] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [engagementToDelete, setEngagementToDelete] = useState<any | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Bulk selection state
	const [selectedEngagementIds, setSelectedEngagementIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load engagements function
	const loadEngagements = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getEngagementsAction({ page, search, pageSize, customerId, status });
			if (result.success && result.data) {
				const data = result.data as any;
				setEngagements(data.engagements || []);
				setTotal(data.total || 0);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load engagements");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize, customerId, status]);

	// Load on mount and when filters change
	useEffect(() => {
		loadEngagements();
		setSelectedEngagementIds([]);
	}, [loadEngagements]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleEngagementUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "engagement_created") {
				setEngagements((prev) => {
					if (prev.find((e) => e.id === data.engagement.id)) return prev;
					return page === 1 ? [data.engagement, ...prev] : prev;
				});
			} else if (data.action === "engagement_updated") {
				setEngagements((prev) => prev.map((e) => (e.id === data.engagement.id ? { ...e, ...data.engagement } : e)));
			} else if (data.action === "engagement_deleted") {
				setEngagements((prev) => prev.filter((e) => e.id !== data.engagementId));
			} else {
				loadEngagements();
			}
		},
		[page, loadEngagements],
	);

	useChannelEvent("private-global", "engagement_update", handleEngagementUpdate);

	async function handleDeleteEngagement() {
		if (!engagementToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteEngagementAction(engagementToDelete.id);
			if (result.success) {
				toast.success("Engagement deleted");
				setEngagementToDelete(null);
				await loadEngagements();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete engagement");
		} finally {
			setDeleting(false);
		}
	}

	const handleBulkDelete = async () => {
		if (selectedEngagementIds.length === 0) return;
		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteEngagementsAction(selectedEngagementIds);
			if (result.success) {
				toast.success(result.message);
				setSelectedEngagementIds([]);
				await loadEngagements();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete engagements");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const toggleSelectAll = (checked: boolean) => {
		setSelectedEngagementIds(checked ? engagements.map((e) => e.id) : []);
	};

	const toggleSelect = (id: string) => {
		setSelectedEngagementIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
	};

	// Status badge
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "DRAFT":
				return <Badge variant="outline">Draft</Badge>;
			case "ACTIVE":
				return <Badge variant="default">Active</Badge>;
			case "ON_HOLD":
				return <Badge variant="secondary">On Hold</Badge>;
			case "COMPLETED":
				return (
					<Badge
						variant="default"
						className="bg-green-500">
						Completed
					</Badge>
				);
			case "CANCELLED":
				return <Badge variant="destructive">Cancelled</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	// Type badge
	const getTypeBadge = (type: string) => {
		switch (type) {
			case "DESIGN":
				return <Badge variant="default">Design</Badge>;
			case "TESTING":
				return <Badge variant="secondary">Testing</Badge>;
			case "TRAINING":
				return <Badge variant="outline">Training</Badge>;
			case "EVENT":
				return <Badge variant="outline">Event</Badge>;
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

	return (
		<>
			{selectedEngagementIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedEngagementIds.length}
					itemName="engagement"
					isLoading={bulkActionLoading}
					actions={[
						{
							label: "Delete Selected",
							icon: Trash2,
							onClick: handleBulkDelete,
							variant: "destructive",
						},
					]}
					onClear={() => setSelectedEngagementIds([])}
				/>
			)}

			{loading ? (
				<PageLoading />
			) : engagements.length === 0 ? (
				<NoItemFound text="No engagements found" />
			) : (
				<>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">
										<Checkbox
											checked={selectedEngagementIds.length === engagements.length}
											onCheckedChange={toggleSelectAll}
											aria-label="Select all engagements"
										/>
									</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Priority</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead>Assigned To</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{engagements.map((engagement) => (
									<TableRow key={engagement.id}>
										<TableCell>
											<Checkbox
												checked={selectedEngagementIds.includes(engagement.id)}
												onCheckedChange={() => toggleSelect(engagement.id)}
												aria-label={`Select ${engagement.title}`}
											/>
										</TableCell>
										<TableCell className="font-medium">{engagement.title}</TableCell>
										<TableCell className="text-muted-foreground text-sm">{engagement.customer?.companyName || "N/A"}</TableCell>
										<TableCell>{getTypeBadge(engagement.type)}</TableCell>
										<TableCell>{getStatusBadge(engagement.status)}</TableCell>
										<TableCell>
											<Badge variant={engagement.priority === "HIGH" ? "destructive" : engagement.priority === "MEDIUM" ? "default" : "secondary"}>{engagement.priority || "MEDIUM"}</Badge>
										</TableCell>
										<TableCell className="text-sm">{engagement.dueDate ? new Date(engagement.dueDate).toLocaleDateString() : "-"}</TableCell>
										<TableCell className="text-sm">
											{engagement.assignedTo ? (
												<div className="flex items-center gap-1">
													<User className="text-muted-foreground h-4 w-4" />
													<span>{engagement.assignedTo}</span>
												</div>
											) : (
												<span className="text-muted-foreground">-</span>
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
														<Link href={`/engagements/${engagement.id}`}>
															<Eye className="mr-2 h-4 w-4" />
															View
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link href={`/engagements/${engagement.id}/edit`}>
															<Pencil className="mr-2 h-4 w-4" />
															Edit
														</Link>
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => setEngagementToDelete(engagement)}>
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
					<Pagination
						page={page}
						total={total}
						pageSize={pageSize}
						itemName="engagements"
						baseUrl="/engagements"
						search={search}
						customerId={customerId}
						status={status}
					/>
				</>
			)}

			<DeleteDialog
				open={!!engagementToDelete}
				title="Delete Engagement"
				description={`Are you sure you want to delete "${engagementToDelete?.title}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDeleteEngagement}
				onOpenChange={(open) => !open && setEngagementToDelete(null)}
			/>
		</>
	);
}

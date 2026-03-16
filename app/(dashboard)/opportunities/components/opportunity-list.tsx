"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Save, Trash2, TrendingUp } from "lucide-react";
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
import { OpportunityStage } from "@/generated/prisma/enums";
import { bulkDeleteOpportunitiesAction, deleteOpportunityAction, getOpportunitiesAction } from "@/lib/features/opportunities/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface OpportunityListProps {
	page: number;
	search: string;
	pageSize: number;
	customerId?: string;
	stage?: string;
}

const stageColors = {
	[OpportunityStage.PROSPECTING]: "bg-gray-100 text-gray-800",
	[OpportunityStage.QUALIFIED]: "bg-blue-100 text-blue-800",
	[OpportunityStage.PROPOSAL]: "bg-yellow-100 text-yellow-800",
	[OpportunityStage.NEGOTIATION]: "bg-orange-100 text-orange-800",
	[OpportunityStage.CLOSED_WON]: "bg-green-100 text-green-800",
	[OpportunityStage.CLOSED_LOST]: "bg-red-100 text-red-800",
};

export function OpportunityList({ page, search, pageSize, customerId, stage }: OpportunityListProps) {
	const [opportunities, setOpportunities] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [opportunityToDelete, setOpportunityToDelete] = useState<any | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Bulk selection state
	const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load opportunities function
	const loadOpportunities = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getOpportunitiesAction({ page, search, pageSize, customerId, stage: stage ? (stage as OpportunityStage) : undefined });
			if (result.success && result.data) {
				const data = result.data as any;
				setOpportunities(data.opportunities || []);
				setTotal(data.total || 0);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load opportunities");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize, customerId, stage]);

	// Load on mount and when filters change
	useEffect(() => {
		loadOpportunities();
		setSelectedOpportunityIds([]);
	}, [loadOpportunities]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleOpportunityUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "opportunity_created") {
				setOpportunities((prev) => {
					if (prev.find((o) => o.id === data.opportunity.id)) return prev;
					return page === 1 ? [data.opportunity, ...prev] : prev;
				});
			} else if (data.action === "opportunity_updated") {
				setOpportunities((prev) => prev.map((o) => (o.id === data.opportunity.id ? { ...o, ...data.opportunity } : o)));
			} else if (data.action === "opportunity_deleted") {
				setOpportunities((prev) => prev.filter((o) => o.id !== data.opportunityId));
			} else {
				loadOpportunities();
			}
		},
		[page, loadOpportunities],
	);

	useChannelEvent("private-global", "opportunity_update", handleOpportunityUpdate);

	async function handleDeleteOpportunity() {
		if (!opportunityToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteOpportunityAction(opportunityToDelete.id);
			if (result.success) {
				toast.success("Opportunity deleted");
				setOpportunityToDelete(null);
				await loadOpportunities();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete opportunity");
		} finally {
			setDeleting(false);
		}
	}

	async function handleBulkDelete() {
		if (selectedOpportunityIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteOpportunitiesAction(selectedOpportunityIds);
			if (result.success) {
				toast.success(`${selectedOpportunityIds.length} opportunities deleted`);
				setSelectedOpportunityIds([]);
				await loadOpportunities();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete opportunities");
		} finally {
			setBulkActionLoading(false);
		}
	}

	function handleSelectAll(checked: boolean) {
		if (checked) {
			setSelectedOpportunityIds(opportunities.map((o) => o.id));
		} else {
			setSelectedOpportunityIds([]);
		}
	}

	function handleSelectOpportunity(id: string, checked: boolean) {
		if (checked) {
			setSelectedOpportunityIds((prev) => [...prev, id]);
		} else {
			setSelectedOpportunityIds((prev) => prev.filter((oid) => oid !== id));
		}
	}

	if (loading) {
		return <PageLoading />;
	}

	if (opportunities.length === 0) {
		return (
			<NoItemFound
				icon={TrendingUp}
				title="No opportunities found"
				description={search ? "Try adjusting your search criteria" : "Get started by adding your first opportunity"}
				action={
					<Button asChild>
						<Link href="/opportunities/new">
							<Save className="mr-2 h-4 w-4" />
							Add Opportunity
						</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions */}
			<BulkActionsBar
				selectedCount={selectedOpportunityIds.length}
				itemName="opportunity"
				isLoading={bulkActionLoading}
				actions={[
					{
						label: "Delete Selected",
						icon: Trash2,
						onClick: handleBulkDelete,
						variant: "destructive",
					},
				]}
				onClear={() => setSelectedOpportunityIds([])}
			/>

			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={selectedOpportunityIds.length === opportunities.length && opportunities.length > 0}
									onCheckedChange={handleSelectAll}
								/>
							</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Stage</TableHead>
							<TableHead>Value</TableHead>
							<TableHead>Probability</TableHead>
							<TableHead className="w-12"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{opportunities.map((opportunity) => (
							<TableRow key={opportunity.id}>
								<TableCell>
									<Checkbox
										checked={selectedOpportunityIds.includes(opportunity.id)}
										onCheckedChange={(checked) => handleSelectOpportunity(opportunity.id, checked as boolean)}
									/>
								</TableCell>
								<TableCell className="font-medium">
									<Link
										href={`/opportunities/${opportunity.id}`}
										className="hover:underline">
										{opportunity.title}
									</Link>
								</TableCell>
								<TableCell>
									<Link
										href={`/customers/${opportunity.customer.id}`}
										className="hover:underline">
										{opportunity.customer.companyName}
									</Link>
								</TableCell>
								<TableCell>
									<Badge className={stageColors[opportunity.stage as OpportunityStage] || "bg-gray-100 text-gray-800"}>{opportunity.stage.replace("_", " ")}</Badge>
								</TableCell>
								<TableCell>${opportunity.value?.toLocaleString() || "-"}</TableCell>
								<TableCell>{opportunity.probability ? `${opportunity.probability}%` : "-"}</TableCell>
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
												<Link href={`/opportunities/${opportunity.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/opportunities/${opportunity.id}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => setOpportunityToDelete(opportunity)}
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
					itemName="opportunities"
					baseUrl="/opportunities"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={!!opportunityToDelete}
				onOpenChange={() => setOpportunityToDelete(null)}
				onConfirm={handleDeleteOpportunity}
				isDeleting={deleting}
				title="Delete Opportunity"
				description={`Are you sure you want to delete "${opportunityToDelete?.title}"? This action cannot be undone.`}
			/>
		</div>
	);
}

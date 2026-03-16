"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteMarketingCampaignAction, getMarketingCampaignsAction, sendMarketingCampaignNowAction } from "@/lib/features/marketing/actions";
import { MarketingCampaign, MarketingCampaignFilters } from "@/lib/features/marketing/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { formatDate } from "@/lib/utils";

interface MarketingCampaignListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function MarketingCampaignList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: MarketingCampaignListProps) {
	const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [campaignToDelete, setCampaignToDelete] = useState<MarketingCampaign | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Load campaigns function
	const loadCampaigns = useCallback(async () => {
		setLoading(true);
		try {
			const filters: MarketingCampaignFilters = {};
			if (statusFilter !== "ALL") {
				filters.status = statusFilter as any;
			}
			const result = await getMarketingCampaignsAction(filters, page, pageSize);

			if (result.campaigns) {
				let filteredCampaigns = result.campaigns;

				// Client-side search filtering
				if (search) {
					filteredCampaigns = filteredCampaigns.filter((campaign) => campaign.title.toLowerCase().includes(search.toLowerCase()) || (campaign.description && campaign.description.toLowerCase().includes(search.toLowerCase())));
				}

				// Set total for pagination
				setTotal(result.total);

				setCampaigns(filteredCampaigns);
			} else {
				toast.error("Failed to load campaigns");
				setCampaigns([]);
				setTotal(0);
			}
		} catch (error) {
			toast.error("Failed to load campaigns");
			setCampaigns([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	// Load data on mount and when filters change
	useEffect(() => {
		loadCampaigns();
	}, [loadCampaigns]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleMarketingCampaignUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "marketing_campaign_created") {
				setCampaigns((prev) => {
					if (prev.find((c) => c.id === data.campaign.id)) return prev;
					return page === 1 ? [data.campaign, ...prev] : prev;
				});
			} else if (data.action === "marketing_campaign_updated") {
				setCampaigns((prev) => prev.map((c) => (c.id === data.campaign.id ? { ...c, ...data.campaign } : c)));
			} else if (data.action === "marketing_campaign_deleted") {
				setCampaigns((prev) => prev.filter((c) => c.id !== data.campaignId));
			} else {
				loadCampaigns();
			}
		},
		[loadCampaigns, page],
	);

	// Listen for marketing campaign update events
	useChannelEvent("private-global", "marketing_campaign_update", handleMarketingCampaignUpdate);

	const handleDelete = async () => {
		if (!campaignToDelete) return;

		try {
			setDeleting(true);
			const result = await deleteMarketingCampaignAction(campaignToDelete.id);
			if (result.success) {
				setDeleteDialogOpen(false);
				setCampaignToDelete(null);
				await loadCampaigns();
				toast.success("Campaign deleted successfully");
			} else {
				toast.error(result.message || "Failed to delete campaign");
			}
		} catch (error) {
			toast.error("Failed to delete campaign");
		} finally {
			setDeleting(false);
		}
	};

	const handleSendNow = async (campaign: MarketingCampaign) => {
		try {
			const result = await sendMarketingCampaignNowAction(campaign.id);
			if (result.success) {
				await loadCampaigns();
				toast.success("Campaign sent successfully");
			} else {
				toast.error(result.message || "Failed to send campaign");
			}
		} catch (error) {
			toast.error("Failed to send campaign");
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			DRAFT: { variant: "secondary" as const, label: "Draft" },
			SCHEDULED: { variant: "default" as const, label: "Scheduled" },
			SENDING: { variant: "default" as const, label: "Sending" },
			SENT: { variant: "default" as const, label: "Sent" },
			CANCELLED: { variant: "outline" as const, label: "Cancelled" },
			FAILED: { variant: "destructive" as const, label: "Failed" },
		};

		const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline" as const, label: status };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const getTypeBadge = (type: string) => {
		return <Badge variant="outline">{type}</Badge>;
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			{/* Campaigns Grid */}
			{campaigns.length === 0 ? (
				<NoItemFound
					title="No campaigns found"
					description="Get started by creating your first marketing campaign."
					action={
						<Button asChild>
							<Link href="/marketing/campaigns/new">
								<Send className="mr-2 h-4 w-4" />
								Create Campaign
							</Link>
						</Button>
					}
				/>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Emails</TableHead>
								<TableHead>Scheduled</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{campaigns.map((campaign) => (
								<TableRow key={campaign.id}>
									<TableCell className="font-medium">
										<div>
											<p className="font-medium">{campaign.title}</p>
											{campaign.description && <p className="text-muted-foreground max-w-xs truncate text-sm">{campaign.description}</p>}
										</div>
									</TableCell>
									<TableCell>{getTypeBadge(campaign.type)}</TableCell>
									<TableCell>{getStatusBadge(campaign.status)}</TableCell>
									<TableCell>{(campaign as any)._count?.emails || 0}</TableCell>
									<TableCell>{campaign.scheduledAt ? formatDate(campaign.scheduledAt) : "Not scheduled"}</TableCell>
									<TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
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
													<Link href={`/marketing/campaigns/${campaign.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/marketing/campaigns/${campaign.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												{campaign.status === "DRAFT" && (
													<DropdownMenuItem onClick={() => handleSendNow(campaign)}>
														<Send className="mr-2 h-4 w-4" />
														Send Now
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setCampaignToDelete(campaign);
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
			)}

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="campaigns"
					baseUrl="/marketing/campaigns"
					type={statusFilter !== "ALL" ? statusFilter : undefined}
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Campaign"
				description={`Are you sure you want to delete "${campaignToDelete?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}

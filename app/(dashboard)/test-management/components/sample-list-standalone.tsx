"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Package, Pencil, Save, Trash2 } from "lucide-react";
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
import { SampleStatus } from "@/generated/prisma/enums";
import { deleteSample, getSamplesList } from "@/lib/features/testing/actions";
import { SampleWithRelations } from "@/lib/features/testing/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface SampleListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function SampleList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: SampleListProps) {
	const [samples, setSamples] = useState<SampleWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sampleToDelete, setSampleToDelete] = useState<SampleWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load samples function
	const loadSamples = useCallback(async () => {
		setLoading(true);
		try {
			const filters = {
				...(statusFilter !== "ALL" && { status: statusFilter as SampleStatus }),
			};
			const result = await getSamplesList(filters);
			if (result.success && result.data) {
				let filteredSamples = result.data;

				// Apply search filter
				if (search) {
					filteredSamples = filteredSamples.filter((sample) => sample.name.toLowerCase().includes(search.toLowerCase()) || sample.description?.toLowerCase().includes(search.toLowerCase()) || sample.testOrder?.title?.toLowerCase().includes(search.toLowerCase()));
				}

				setSamples(filteredSamples);
				setTotal(filteredSamples.length);
			} else {
				toast.error("Failed to load samples");
			}
		} catch (error) {
			toast.error("Failed to load samples");
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter]);

	const handleSampleUpdate = useCallback(
		(eventData: any) => {
			const data = eventData?.data || eventData;
			if (["sample_created", "sample_updated", "sample_deleted"].includes(data?.action)) {
				loadSamples();
			}
		},
		[loadSamples],
	);

	usePusher();
	useChannelEvent("private-global", "sample_update", handleSampleUpdate);

	useEffect(() => {
		loadSamples();
	}, [loadSamples]);

	// Handle delete
	const handleDelete = async () => {
		if (!sampleToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteSample(sampleToDelete.id);
			if (result.success) {
				toast.success("Sample deleted successfully");
				loadSamples();
				setSelectedSampleIds(selectedSampleIds.filter((id) => id !== sampleToDelete.id));
			} else {
				toast.error(result.message || "Failed to delete sample");
			}
		} catch (error) {
			toast.error("Failed to delete sample");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setSampleToDelete(null);
		}
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedSampleIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const deletePromises = selectedSampleIds.map((id) => deleteSample(id));
			const results = await Promise.all(deletePromises);

			const successCount = results.filter((result) => result.success).length;
			const failCount = results.length - successCount;

			if (successCount > 0) {
				toast.success(`${successCount} sample${successCount > 1 ? "s" : ""} deleted successfully`);
			}
			if (failCount > 0) {
				toast.error(`Failed to delete ${failCount} sample${failCount > 1 ? "s" : ""}`);
			}

			loadSamples();
			setSelectedSampleIds([]);
		} catch (error) {
			toast.error("Failed to delete samples");
		} finally {
			setBulkActionLoading(false);
		}
	};

	// Status badge
	const getStatusBadge = (status: SampleStatus) => {
		const variants = {
			PENDING: "secondary",
			RECEIVED: "secondary",
			IN_PROCESSING: "default",
			PROCESSED: "default",
			TESTING: "default",
			COMPLETED: "default",
			FAILED: "destructive",
			RETURNED: "outline",
			DISPOSED: "destructive",
			ARCHIVED: "outline",
		} as const;
		return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
	};

	// Type badge

	// Handle checkbox selection
	const handleSelectSample = (sampleId: string, checked: boolean) => {
		if (checked) {
			setSelectedSampleIds([...selectedSampleIds, sampleId]);
		} else {
			setSelectedSampleIds(selectedSampleIds.filter((id) => id !== sampleId));
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedSampleIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedSampleIds.length}
					itemName="sample"
					isLoading={bulkActionLoading}
					actions={[
						{
							label: "Delete Selected",
							variant: "destructive" as const,
							onClick: handleBulkDelete,
						},
					]}
					onClear={() => setSelectedSampleIds([])}
				/>
			)}

			{/* Samples List */}
			{samples.length === 0 ? (
				<NoItemFound
					icon={Package}
					title="No samples found"
					description={search ? "Try adjusting your search criteria" : "Get started by creating your first sample"}
					action={
						<Button asChild>
							<Link href="/test-management/new">
								<Save className="mr-2 h-4 w-4" />
								Create Test Order
							</Link>
						</Button>
					}
				/>
			) : (
				<div className="space-y-2">
					{samples.map((sample) => (
						<Card
							key={sample.id}
							className="py-0 transition-shadow hover:shadow-md">
							<CardContent className="px-3 py-0">
								<div className="flex min-h-14 items-center justify-between gap-3">
									<div className="flex min-w-0 flex-1 items-center gap-2">
										{/* Checkbox */}
										<Checkbox
											checked={selectedSampleIds.includes(sample.id)}
											onCheckedChange={(checked) => handleSelectSample(sample.id, checked as boolean)}
											className="mt-0"
										/>

										{/* Sample Info */}
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-1">
												<h3 className="truncate text-sm font-semibold">{sample.name}</h3>
												{sample.type && (
													<Badge
														variant="outline"
														className="px-1.5 py-0 text-xs">
														{sample.type}
													</Badge>
												)}
											</div>
										</div>
									</div>

									{/* Status Badge and Actions */}
									<div className="flex shrink-0 items-center gap-1">
										{getStatusBadge(sample.status)}

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
													<Link href={`/test-management/samples/${sample.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/test-management/samples/${sample.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit Sample
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setSampleToDelete(sample);
														setDeleteDialogOpen(true);
													}}>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete Sample
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</CardContent>
						</Card>
					))}

					{/* Pagination */}
					{total > 0 && (
						<Pagination
							page={page}
							total={total}
							pageSize={pageSize}
							search={search}
							itemName="samples"
							baseUrl="/test-management/samples"
							type={statusFilter}
						/>
					)}
				</div>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Sample"
				description={`Are you sure you want to delete "${sampleToDelete?.name}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDelete}
			/>
		</div>
	);
}

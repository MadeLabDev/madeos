"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MessageSquare, MoreHorizontal, Pencil, Save, TestTube, Trash2 } from "lucide-react";
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
import { TEST_STATUS_OPTIONS } from "@/lib/config/module-types";
import { useInfoModal } from "@/lib/contexts/info-modal-context";
import { deleteTest, getTestsList } from "@/lib/features/testing/actions";
import { TestStatus, TestWithRelations } from "@/lib/features/testing/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface TestListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function TestList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: TestListProps) {
	const { showInfo } = useInfoModal();
	const [tests, setTests] = useState<TestWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [testToDelete, setTestToDelete] = useState<TestWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load tests function
	const loadTests = useCallback(async () => {
		setLoading(true);
		try {
			const filters = {
				...(statusFilter !== "ALL" && { status: statusFilter as TestStatus }),
			};
			const result = await getTestsList(filters);
			if (result.success && result.data) {
				let filteredTests = result.data;

				// Apply search filter
				if (search) {
					filteredTests = filteredTests.filter((test) => test.name.toLowerCase().includes(search.toLowerCase()) || test.description?.toLowerCase().includes(search.toLowerCase()) || test.testOrder?.title?.toLowerCase().includes(search.toLowerCase()));
				}

				setTests(filteredTests);
				setTotal(filteredTests.length);
			} else {
				toast.error("Failed to load tests");
			}
		} catch (error) {
			toast.error("Failed to load tests");
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter]);

	useEffect(() => {
		loadTests();
	}, [loadTests]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleTestUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "test_created" || data.action === "test_updated" || data.action === "test_deleted") {
				loadTests();
			}
		},
		[loadTests],
	);

	// Listen for test update events
	useChannelEvent("private-global", "test_update", handleTestUpdate);

	// Handle delete
	const handleDelete = async () => {
		if (!testToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteTest(testToDelete.id);
			if (result.success) {
				toast.success("Test deleted successfully");
				loadTests();
				setSelectedTestIds(selectedTestIds.filter((id) => id !== testToDelete.id));
			} else {
				toast.error(result.message || "Failed to delete test");
			}
		} catch (error) {
			toast.error("Failed to delete test");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setTestToDelete(null);
		}
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedTestIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const deletePromises = selectedTestIds.map((id) => deleteTest(id));
			const results = await Promise.all(deletePromises);

			const successCount = results.filter((result: { success: boolean }) => result.success).length;
			const failCount = results.length - successCount;

			if (successCount > 0) {
				toast.success(`${successCount} test${successCount > 1 ? "s" : ""} deleted successfully`);
			}
			if (failCount > 0) {
				toast.error(`Failed to delete ${failCount} test${failCount > 1 ? "s" : ""}`);
			}

			loadTests();
			setSelectedTestIds([]);
		} catch (error) {
			toast.error("Failed to delete tests");
		} finally {
			setBulkActionLoading(false);
		}
	};

	// Status badge
	const getStatusBadge = (status: TestStatus) => {
		// Map database status to UI status for display
		const statusMapping: Record<string, string> = {
			COMPLETED: "PASSED",
			CANCELLED: "SKIPPED",
		};
		const displayStatus = statusMapping[status] || status;
		const config = TEST_STATUS_OPTIONS.find((option) => option.value === displayStatus);
		return <Badge variant={config?.badgeVariant || "secondary"}>{config?.label || displayStatus.replace("_", " ")}</Badge>;
	};

	// Handle checkbox selection
	const handleSelectTest = (testId: string, checked: boolean) => {
		if (checked) {
			setSelectedTestIds([...selectedTestIds, testId]);
		} else {
			setSelectedTestIds(selectedTestIds.filter((id) => id !== testId));
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedTestIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedTestIds.length}
					itemName="test"
					isLoading={bulkActionLoading}
					actions={[
						{
							label: "Delete Selected",
							variant: "destructive" as const,
							onClick: handleBulkDelete,
						},
					]}
					onClear={() => setSelectedTestIds([])}
				/>
			)}

			{/* Tests List */}
			{tests.length === 0 ? (
				<NoItemFound
					icon={TestTube}
					title="No tests found"
					description={search ? "Try adjusting your search criteria" : "Get started by creating your first test"}
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
					{tests.map((test) => (
						<Card
							key={test.id}
							className="py-0 transition-shadow hover:shadow-md">
							<CardContent className="px-3 py-0">
								<div className="flex min-h-14 items-center justify-between gap-3">
									<div className="flex min-w-0 flex-1 items-center gap-2">
										{/* Checkbox */}
										<Checkbox
											checked={selectedTestIds.includes(test.id)}
											onCheckedChange={(checked) => handleSelectTest(test.id, checked as boolean)}
											className="mt-0"
										/>

										{/* Test Name */}
										<div className="min-w-0 flex-1">
											<h3 className="truncate text-sm font-semibold">{test.name}</h3>
										</div>
									</div>

									{/* Status Badge and Actions */}
									<div className="flex shrink-0 items-center gap-1">
										{/* Notes Icon */}
										{test.notes && (
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0"
												onClick={() => {
													showInfo({
														title: "Test Notes",
														content: test.notes,
													});
												}}>
												<MessageSquare className="text-muted-foreground h-4 w-4" />
											</Button>
										)}

										{/* Status Badge */}
										{getStatusBadge(test.status)}

										{/* Dropdown Menu */}
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
													<Link href={`/test-management/tests/${test.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/test-management/tests/${test.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit Test
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setTestToDelete(test);
														setDeleteDialogOpen(true);
													}}>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete Test
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
					itemName="tests"
					baseUrl="/test-management/tests"
					type={statusFilter}
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Test"
				description={`Are you sure you want to delete "${testToDelete?.name}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDelete}
			/>
		</div>
	);
}

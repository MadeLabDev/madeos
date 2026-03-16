"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Save, Trash2 } from "lucide-react";
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
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteTestOrder, getTestOrdersList } from "@/lib/features/testing/actions";
import { TestOrderStatus, TestOrderWithRelations } from "@/lib/features/testing/types";
import { getUsersAction } from "@/lib/features/users/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { formatDate } from "@/lib/utils";

interface TestOrderListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function TestOrderList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: TestOrderListProps) {
	const [testOrders, setTestOrders] = useState<TestOrderWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [testOrderToDelete, setTestOrderToDelete] = useState<TestOrderWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedTestOrderIds, setSelectedTestOrderIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);
	const [users, setUsers] = useState<any[]>([]);

	// Load test orders function
	const loadTestOrders = useCallback(async () => {
		setLoading(true);
		try {
			const filters = {
				...(statusFilter !== "ALL" && { status: statusFilter as TestOrderStatus }),
			};
			const result = await getTestOrdersList(filters);
			if (result.success && result.data) {
				let filteredTestOrders = result.data;

				// Client-side search filtering
				if (search) {
					filteredTestOrders = filteredTestOrders.filter((testOrder) => testOrder.title.toLowerCase().includes(search.toLowerCase()) || (testOrder.description && testOrder.description.toLowerCase().includes(search.toLowerCase())));
				}

				// Set total for pagination
				setTotal(filteredTestOrders.length);

				// Client-side pagination
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedTestOrders = filteredTestOrders.slice(startIndex, endIndex);

				setTestOrders(paginatedTestOrders);
			} else {
				toast.error("Failed to load test orders");
				setTestOrders([]);
				setTotal(0);
			}
		} catch (error) {
			toast.error("Failed to load test orders");
			setTestOrders([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	// Load users function
	const loadUsers = useCallback(async () => {
		try {
			const result = await getUsersAction({ pageSize: 100 });
			if (result.success && result.data) {
				setUsers((result.data as any).users || []);
			}
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	}, []);

	const getUserName = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		return user ? user.name : "Unknown User";
	};

	// Load data on mount and when filters change
	useEffect(() => {
		loadTestOrders();
		loadUsers();
	}, [loadTestOrders, loadUsers]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleTestOrderUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "test_order_created") {
				setTestOrders((prev) => {
					if (prev.find((o) => o.id === data.testOrder.id)) return prev;
					return page === 1 ? [data.testOrder, ...prev] : prev;
				});
			} else if (data.action === "test_order_updated") {
				setTestOrders((prev) => prev.map((o) => (o.id === data.testOrder.id ? { ...o, ...data.testOrder } : o)));
			} else if (data.action === "test_order_deleted") {
				setTestOrders((prev) => prev.filter((o) => o.id !== data.testOrderId));
			} else {
				loadTestOrders();
			}
		},
		[loadTestOrders, page],
	);

	// Listen for test order update events
	useChannelEvent("private-global", "test_order_update", handleTestOrderUpdate);

	// Handle delete
	const handleDelete = async () => {
		if (!testOrderToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteTestOrder(testOrderToDelete.id);
			if (result.success) {
				toast.success("Test order deleted successfully");
				loadTestOrders();
				setDeleteDialogOpen(false);
				setTestOrderToDelete(null);
			} else {
				toast.error(result.message || "Failed to delete test order");
			}
		} catch (error) {
			toast.error("Failed to delete test order");
		} finally {
			setDeleting(false);
		}
	};

	// Bulk actions
	const toggleSelectAll = () => {
		if (selectedTestOrderIds.length === testOrders.length) {
			setSelectedTestOrderIds([]);
		} else {
			setSelectedTestOrderIds(testOrders.map((order) => order.id));
		}
	};

	const toggleSelectTestOrder = (testOrderId: string) => {
		setSelectedTestOrderIds((prev) => (prev.includes(testOrderId) ? prev.filter((id) => id !== testOrderId) : [...prev, testOrderId]));
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedTestOrderIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			// Note: bulk delete action not implemented yet
			toast.error("Bulk delete not implemented yet");
		} catch (error) {
			toast.error("Failed to delete test orders");
		} finally {
			setBulkActionLoading(false);
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedTestOrderIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedTestOrderIds.length}
					itemName="test order"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedTestOrderIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{/* Test Orders Grid */}
			{testOrders.length === 0 ? (
				<NoItemFound
					title="No test orders found"
					description="Get started by creating your first test order."
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
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]">
									<Checkbox
										checked={selectedTestOrderIds.length === testOrders.length}
										onCheckedChange={toggleSelectAll}
										aria-label="Select all"
									/>
								</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Requested By</TableHead>
								<TableHead>Assigned To</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{testOrders.map((testOrder) => (
								<TableRow key={testOrder.id}>
									<TableCell>
										<Checkbox
											checked={selectedTestOrderIds.includes(testOrder.id)}
											onCheckedChange={() => toggleSelectTestOrder(testOrder.id)}
											aria-label={`Select ${testOrder.title}`}
										/>
									</TableCell>
									<TableCell className="font-medium">{testOrder.title}</TableCell>
									<TableCell>
										<Badge variant={testOrder.status === "ACTIVE" ? "default" : testOrder.status === "DRAFT" ? "secondary" : "outline"}>{testOrder.status}</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={testOrder.priority === "HIGH" ? "destructive" : testOrder.priority === "MEDIUM" ? "default" : "secondary"}>{testOrder.priority || "LOW"}</Badge>
									</TableCell>
									<TableCell>{testOrder.requestedBy ? getUserName(testOrder.requestedBy) : "Unknown"}</TableCell>
									<TableCell>{testOrder.assignedTo ? getUserName(testOrder.assignedTo) : "Unassigned"}</TableCell>
									<TableCell>{testOrder.dueDate ? formatDate(testOrder.dueDate) : "No due date"}</TableCell>
									<TableCell>{new Date(testOrder.createdAt).toLocaleDateString()}</TableCell>
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
													<Link href={`/test-management/${testOrder.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/test-management/${testOrder.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setTestOrderToDelete(testOrder);
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
					itemName="test orders"
					baseUrl="/testing"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Test Order"
				description={`Are you sure you want to delete "${testOrderToDelete?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}

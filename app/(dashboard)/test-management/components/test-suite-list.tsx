"use client";

import { useCallback, useEffect, useState } from "react";

import { CheckCircle, Clock, Eye, Filter, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TEST_SUITE_STATUS_OPTIONS } from "@/lib/config/module-types";
import { deleteTestSuite, getTestSuites } from "@/lib/features/testing/actions";
import { getUsersAction } from "@/lib/features/users/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface TestSuiteListProps {
	search?: string;
	page?: number;
	pageSize?: number;
}

export function TestSuiteList({ search = "", page = 1, pageSize = 20 }: TestSuiteListProps) {
	const [loading, setLoading] = useState(true);
	const [suites, setSuites] = useState<any[]>([]);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [users, setUsers] = useState<any[]>([]);

	// Bulk selection state
	const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [suiteToDelete, setSuiteToDelete] = useState<any>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		loadSuites();
		loadUsers();
	}, []);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleTestSuiteUpdate = useCallback((eventData: any) => {
		const data = eventData.data || eventData;

		if (data.action === "test_suite_created") {
			loadSuites();
		} else if (data.action === "test_suite_updated") {
			loadSuites();
		} else if (data.action === "test_suite_deleted") {
			loadSuites();
		} else {
			loadSuites();
		}
	}, []);

	// Listen for test suite update events
	useChannelEvent("private-global", "test_suite_update", handleTestSuiteUpdate);

	const loadSuites = async () => {
		try {
			setLoading(true);
			const result = await getTestSuites();
			if (result.success) {
				setSuites(result.data || []);
			} else {
				toast.error("Failed to load test suites");
			}
		} catch (error) {
			toast.error("Failed to load test suites");
		} finally {
			setLoading(false);
		}
	};

	const loadUsers = async () => {
		try {
			const result = await getUsersAction({ pageSize: 100 });
			if (result.success && result.data) {
				setUsers((result.data as any).users || []);
			}
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	};

	const handleDelete = async () => {
		if (!suiteToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteTestSuite(suiteToDelete.id);
			if (result.success) {
				toast.success("Test suite deleted successfully");
				loadSuites();
				setSelectedSuiteIds(selectedSuiteIds.filter((id) => id !== suiteToDelete.id));
			} else {
				toast.error(result.message || "Failed to delete test suite");
			}
		} catch (error) {
			toast.error("Failed to delete test suite");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setSuiteToDelete(null);
		}
	};

	// Bulk actions
	const toggleSelectAll = () => {
		if (selectedSuiteIds.length === filteredSuites.length) {
			setSelectedSuiteIds([]);
		} else {
			setSelectedSuiteIds(filteredSuites.map((suite) => suite.id));
		}
	};

	const toggleSelectSuite = (suiteId: string) => {
		setSelectedSuiteIds((prev) => (prev.includes(suiteId) ? prev.filter((id) => id !== suiteId) : [...prev, suiteId]));
	};

	const handleBulkDelete = async () => {
		if (selectedSuiteIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const deletePromises = selectedSuiteIds.map((id) => deleteTestSuite(id));
			const results = await Promise.all(deletePromises);

			const successCount = results.filter((result) => result.success).length;
			const failCount = results.length - successCount;

			if (successCount > 0) {
				toast.success(`${successCount} test suite${successCount > 1 ? "s" : ""} deleted successfully`);
			}
			if (failCount > 0) {
				toast.error(`Failed to delete ${failCount} test suite${failCount > 1 ? "s" : ""}`);
			}

			loadSuites();
			setSelectedSuiteIds([]);
		} catch (error) {
			toast.error("Failed to delete test suites");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const getUserName = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		return user ? user.name : "Unknown User";
	};

	const getUniqueCategories = () => {
		const categories = suites
			.map((suite) => suite.category)
			.filter(Boolean)
			.filter((value, index, self) => self.indexOf(value) === index);
		return categories;
	};

	const filteredSuites = suites.filter((suite) => {
		const matchesSearch = suite.name.toLowerCase().includes(search.toLowerCase()) || suite.description?.toLowerCase().includes(search.toLowerCase()) || suite.category?.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = statusFilter === "all" || (statusFilter === "active" && suite.isActive) || (statusFilter === "inactive" && !suite.isActive);
		const matchesCategory = categoryFilter === "all" || suite.category === categoryFilter;
		return matchesSearch && matchesStatus && matchesCategory;
	});

	// Pagination
	const totalSuites = filteredSuites.length;
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedSuites = filteredSuites.slice(startIndex, endIndex);

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader size="lg" />
			</div>
		);
	}

	return (
		<>
			{/* Bulk Actions Bar */}
			{selectedSuiteIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedSuiteIds.length}
					itemName="test suite"
					isLoading={bulkActionLoading}
					actions={[
						{
							label: "Delete Selected",
							variant: "destructive" as const,
							onClick: handleBulkDelete,
						},
					]}
					onClear={() => setSelectedSuiteIds([])}
				/>
			)}
			{/* Filters */}
			<div className="mb-6 flex flex-col gap-4 sm:flex-row">
				<div className="sm:w-32">
					<Select
						value={statusFilter}
						onValueChange={setStatusFilter}>
						<SelectTrigger>
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							{TEST_SUITE_STATUS_OPTIONS.map((status) => (
								<SelectItem
									key={status.value}
									value={status.value}>
									{status.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="sm:w-40">
					<Select
						value={categoryFilter}
						onValueChange={setCategoryFilter}>
						<SelectTrigger>
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{getUniqueCategories().map((category) => (
								<SelectItem
									key={category}
									value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>{" "}
			{/* Suites Table */}
			{filteredSuites.length === 0 ? (
				<NoItemFound text="No test suites found" />
			) : (
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]">
									<Checkbox
										checked={selectedSuiteIds.length === filteredSuites.length && filteredSuites.length > 0}
										onCheckedChange={toggleSelectAll}
										aria-label="Select all"
									/>
								</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Tests</TableHead>
								<TableHead>Duration</TableHead>
								<TableHead>Created By</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedSuites.map((suite) => (
								<TableRow key={suite.id}>
									<TableCell>
										<Checkbox
											checked={selectedSuiteIds.includes(suite.id)}
											onCheckedChange={() => toggleSelectSuite(suite.id)}
											aria-label={`Select ${suite.name}`}
										/>
									</TableCell>
									<TableCell className="font-medium">
										<div>
											<p className="font-medium">{suite.name}</p>
											{suite.version && <p className="text-muted-foreground text-sm">v{suite.version}</p>}
										</div>
									</TableCell>
									<TableCell>{suite.category ? <Badge variant="outline">{suite.category}</Badge> : <span className="text-muted-foreground">No category</span>}</TableCell>
									<TableCell>
										{suite.isActive ? (
											<Badge
												variant="default"
												className="bg-green-500">
												<CheckCircle className="mr-1 h-3 w-3" />
												Active
											</Badge>
										) : (
											<Badge variant="secondary">
												<XCircle className="mr-1 h-3 w-3" />
												Inactive
											</Badge>
										)}
									</TableCell>
									<TableCell>
										<span className="font-medium">{suite.tests?.length || 0}</span>
										<span className="text-muted-foreground ml-1 text-sm">tests</span>
									</TableCell>
									<TableCell>
										{suite.estimatedDuration ? (
											<div className="flex items-center text-sm">
												<Clock className="text-muted-foreground mr-1 h-4 w-4" />
												{suite.estimatedDuration} min
											</div>
										) : (
											<span className="text-muted-foreground">Not set</span>
										)}
									</TableCell>
									<TableCell>{suite.createdBy ? getUserName(suite.createdBy) : "Unknown"}</TableCell>
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
													<Link
														href={`/test-management/suites/${suite.id}`}
														className="flex items-center">
														<Eye className="mr-2 h-4 w-4" />
														View
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														href={`/test-management/suites/${suite.id}/edit`}
														className="flex items-center">
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setSuiteToDelete(suite);
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
			{totalSuites > 0 && (
				<Pagination
					page={page}
					total={totalSuites}
					pageSize={pageSize}
					search={search}
					itemName="test suites"
					baseUrl="/test-management/suites"
				/>
			)}
			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Test Suite"
				description={`Are you sure you want to delete "${suiteToDelete?.name}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDelete}
			/>
		</>
	);
}

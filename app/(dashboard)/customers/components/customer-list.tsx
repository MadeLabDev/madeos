"use client";

import { useCallback, useEffect, useState } from "react";

import { Building2, Download, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { bulkDeleteCustomersAction, deleteCustomerAction, exportVCardAction, getCustomersAction } from "@/lib/features/customers/actions";
import { CustomerListProps } from "@/lib/features/customers/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { getCustomerTypeLabels } from "@/lib/utils/metadata";

export function CustomerList({ page, search, pageSize, type = "customer" }: CustomerListProps) {
	const [customers, setCustomers] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Bulk selection state
	const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	const labels = getCustomerTypeLabels(type);

	// Load customers function
	const loadCustomers = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getCustomersAction({ page, search, pageSize, type });
			if (result.success && result.data) {
				const data = result.data as any;
				setCustomers(data.customers || []);
				setTotal(data.total || 0);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load customers");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize, type]);

	// Load on mount and when filters change
	useEffect(() => {
		loadCustomers();
		setSelectedCustomerIds([]);
	}, [loadCustomers]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleCustomerUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "customer_created") {
				setCustomers((prev) => {
					if (prev.find((c) => c.id === data.customer.id)) return prev;
					return page === 1 ? [data.customer, ...prev] : prev;
				});
			} else if (data.action === "customer_updated") {
				setCustomers((prev) => prev.map((c) => (c.id === data.customer.id ? { ...c, ...data.customer } : c)));
			} else if (data.action === "customer_deleted") {
				setCustomers((prev) => prev.filter((c) => c.id !== data.customerId));
			} else {
				loadCustomers();
			}
		},
		[page, loadCustomers],
	);

	useChannelEvent("private-global", "customer_update", handleCustomerUpdate);

	async function handleDeleteCustomer() {
		if (!customerToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteCustomerAction(customerToDelete.id);
			if (result.success) {
				toast.success("Customer deleted");
				setCustomerToDelete(null);
				await loadCustomers();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete customer");
		} finally {
			setDeleting(false);
		}
	}

	const handleExportVCard = async (customerId: string) => {
		try {
			const result = await exportVCardAction(customerId);
			if (result.success && result.data) {
				const data = result.data as { vCard: string; filename: string };
				const blob = new Blob([data.vCard], { type: "text/vcard" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = data.filename;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast.success("vCard exported successfully");
			} else {
				toast.error(result.message || "Failed to export vCard");
			}
		} catch (error) {
			toast.error("Failed to export vCard");
		}
	};

	const handleBulkDelete = async () => {
		if (selectedCustomerIds.length === 0) return;
		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteCustomersAction(selectedCustomerIds);
			if (result.success) {
				toast.success(result.message);
				setSelectedCustomerIds([]);
				await loadCustomers();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete customers");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const toggleSelectAll = (checked: boolean) => {
		setSelectedCustomerIds(checked ? customers.map((c) => c.id) : []);
	};

	const toggleSelect = (id: string) => {
		setSelectedCustomerIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
	};

	// Type badge
	const getTypeBadge = (type: string) => {
		switch (type) {
			case "customer":
				return <Badge variant="default">Customer</Badge>;
			case "partner":
				return <Badge variant="secondary">Partner</Badge>;
			case "vendor":
				return <Badge variant="outline">Vendor</Badge>;
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

	return (
		<>
			{selectedCustomerIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedCustomerIds.length}
					itemName="customer"
					isLoading={bulkActionLoading}
					actions={[
						{
							label: "Delete Selected",
							icon: Trash2,
							onClick: handleBulkDelete,
							variant: "destructive",
						},
					]}
					onClear={() => setSelectedCustomerIds([])}
				/>
			)}

			{loading ? (
				<PageLoading />
			) : customers.length === 0 ? (
				<NoItemFound text="No customers found" />
			) : (
				<>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">
										<Checkbox
											checked={selectedCustomerIds.length === customers.length}
											onCheckedChange={toggleSelectAll}
											aria-label="Select all customers"
										/>
									</TableHead>
									<TableHead>Company Name</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Locations</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{customers.map((customer) => (
									<TableRow key={customer.id}>
										<TableCell>
											<Checkbox
												checked={selectedCustomerIds.includes(customer.id)}
												onCheckedChange={() => toggleSelect(customer.id)}
												aria-label={`Select ${customer.companyName}`}
											/>
										</TableCell>
										<TableCell className="font-medium">{customer.companyName}</TableCell>
										<TableCell className="text-muted-foreground text-sm">{customer.contactName}</TableCell>
										<TableCell className="text-sm">{customer.email}</TableCell>
										<TableCell className="text-sm">{customer.phone || "-"}</TableCell>
										<TableCell>{getTypeBadge(customer.type)}</TableCell>
										<TableCell className="text-sm">
											{customer.locations && customer.locations.length > 0 ? (
												<div className="flex items-center gap-1">
													<Building2 className="text-muted-foreground h-4 w-4" />
													<span>{customer.locations.length}</span>
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
														<Link href={`/customers/${customer.id}?type=${type}`}>
															<Eye className="mr-2 h-4 w-4" />
															View
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link href={`/customers/${customer.id}/edit?type=${type}`}>
															<Pencil className="mr-2 h-4 w-4" />
															Edit
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleExportVCard(customer.id)}>
														<Download className="mr-2 h-4 w-4" />
														Export vCard
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => setCustomerToDelete(customer)}>
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
						itemName={labels.customersTitle.toLowerCase()}
						baseUrl="/customers"
						search={search}
						type={type}
					/>
				</>
			)}

			<DeleteDialog
				open={!!customerToDelete}
				title="Delete Customer"
				description={`Are you sure you want to delete "${customerToDelete?.companyName}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDeleteCustomer}
				onOpenChange={(open) => !open && setCustomerToDelete(null)}
			/>
		</>
	);
}

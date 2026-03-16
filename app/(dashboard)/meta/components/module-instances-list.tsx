"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteModuleInstanceAction, getModuleInstancesAction } from "@/lib/features/meta/actions";
import type { ModuleInstancesListProps } from "@/lib/features/meta/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function ModuleInstancesList({ page, search = "", pageSize }: ModuleInstancesListProps) {
	const [instances, setInstances] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [instanceToDelete, setInstanceToDelete] = useState<any | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Bulk selection state
	const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load instances function
	const loadInstances = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getModuleInstancesAction({ page, pageSize, entityName: search });
			if (result.success && result.data) {
				const data = result.data as any;
				setInstances(data.instances || []);
				setTotal(data.total || 0);
			} else {
				toast.error(result.message || "Failed to load module instances");
			}
		} catch (error) {
			toast.error("Failed to load module instances");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize]);

	// Load on mount and when filters change
	useEffect(() => {
		loadInstances();
		setSelectedInstanceIds([]);
	}, [loadInstances]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleModuleInstanceUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "module_instance_created") {
				setInstances((prev) => {
					if (prev.find((m) => m.id === data.instance.id)) return prev;
					return page === 1 ? [data.instance, ...prev] : prev;
				});
			} else if (data.action === "module_instance_updated") {
				setInstances((prev) => prev.map((m) => (m.id === data.instance.id ? { ...m, ...data.instance } : m)));
			} else if (data.action === "module_instance_deleted") {
				setInstances((prev) => prev.filter((m) => m.id !== data.instanceId));
			} else {
				loadInstances();
			}
		},
		[page, loadInstances],
	);

	useChannelEvent("private-global", "module_instance_update", handleModuleInstanceUpdate);

	async function handleDeleteInstance() {
		if (!instanceToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteModuleInstanceAction(instanceToDelete.id);
			if (result.success) {
				toast.success("Module instance deleted");
				setInstanceToDelete(null);
				await loadInstances();
			} else {
				toast.error(result.message || "Failed to delete module instance");
			}
		} catch (error) {
			toast.error("Failed to delete module instance");
		} finally {
			setDeleting(false);
		}
	}

	const handleBulkDelete = async () => {
		if (selectedInstanceIds.length === 0) return;
		setBulkActionLoading(true);
		try {
			// Delete each instance
			const deletePromises = selectedInstanceIds.map((id) => deleteModuleInstanceAction(id));
			const results = await Promise.all(deletePromises);

			const allSuccess = results.every((r) => r.success);
			if (allSuccess) {
				toast.success("Module instances deleted");
				setSelectedInstanceIds([]);
				await loadInstances();
			} else {
				toast.error("Some instances failed to delete");
			}
		} catch (error) {
			toast.error("Failed to delete module instances");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const toggleSelectAll = (checked: boolean) => {
		setSelectedInstanceIds(checked ? instances.map((m) => m.id) : []);
	};

	const toggleSelect = (id: string) => {
		setSelectedInstanceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
	};

	return (
		<>
			{selectedInstanceIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedInstanceIds.length}
					itemName="module instance"
					isLoading={bulkActionLoading}
					actions={[
						{
							label: "Delete Selected",
							icon: Trash2,
							onClick: handleBulkDelete,
							variant: "destructive",
						},
					]}
					onClear={() => setSelectedInstanceIds([])}
				/>
			)}

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Loader size="lg" />
				</div>
			) : instances.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-muted-foreground">No module instances found</p>
					{search && (
						<Link href="/meta/module-instances">
							<Button variant="link">
								<X className="mr-2 h-4 w-4" />
								Clear search
							</Button>
						</Link>
					)}
				</div>
			) : (
				<>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">
										<Checkbox
											checked={selectedInstanceIds.length === instances.length}
											onCheckedChange={toggleSelectAll}
											aria-label="Select all module instances"
										/>
									</TableHead>
									<TableHead>Entity Name</TableHead>
									<TableHead>Entity ID</TableHead>
									<TableHead>Module Type</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{instances.map((instance: any) => (
									<TableRow key={instance.id}>
										<TableCell>
											<Checkbox
												checked={selectedInstanceIds.includes(instance.id)}
												onCheckedChange={() => toggleSelect(instance.id)}
												aria-label={`Select ${instance.entityName}`}
											/>
										</TableCell>
										<TableCell className="font-medium">{instance.entityName}</TableCell>
										<TableCell className="text-muted-foreground font-mono text-sm">{instance.entityId}</TableCell>
										<TableCell className="text-sm">{instance.moduleType?.name || instance.moduleTypeId}</TableCell>
										<TableCell>
											<Badge variant={instance.isActive ? "default" : "secondary"}>{instance.isActive ? "Active" : "Inactive"}</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">{instance.createdAt ? new Date(instance.createdAt).toLocaleDateString() : "-"}</TableCell>
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
														<Link href={`/meta/module-instances/${instance.id}`}>
															<Eye className="mr-2 h-4 w-4" />
															View
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link href={`/meta/module-instances/${instance.id}/edit`}>
															<Pencil className="mr-2 h-4 w-4" />
															Edit
														</Link>
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => setInstanceToDelete(instance)}>
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
						itemName="module instances"
						baseUrl="/meta/module-instances"
						search={search}
					/>
				</>
			)}

			<DeleteDialog
				open={!!instanceToDelete}
				title="Delete Module Instance"
				description={`Are you sure you want to delete the instance for "${instanceToDelete?.entityName}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDeleteInstance}
				onOpenChange={(open) => !open && setInstanceToDelete(null)}
			/>
		</>
	);
}

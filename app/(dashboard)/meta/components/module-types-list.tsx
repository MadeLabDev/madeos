"use client";

import { useCallback, useEffect, useState } from "react";

import { Download, Eye, MoreHorizontal, Pencil, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { PageLoading } from "@/components/ui/page-loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bulkDeleteModuleTypesAction, deleteModuleTypeAction, exportModuleTypeAction, getModuleTypesAction, importModuleTypeAction } from "@/lib/features/meta/actions";
import { isProtectedModuleType } from "@/lib/features/meta/config/protected-types";
import type { ModuleTypesListProps } from "@/lib/features/meta/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function ModuleTypesList({ page, search = "", pageSize }: ModuleTypesListProps) {
	const [moduleTypes, setModuleTypes] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [moduleTypeToDelete, setModuleTypeToDelete] = useState<any | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Import dialog state
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [importing, setImporting] = useState(false);

	// Overwrite confirmation dialog state
	const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);
	const [pendingImportData, setPendingImportData] = useState<any>(null);

	// Bulk selection state
	const [selectedModuleTypeIds, setSelectedModuleTypeIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load module types function
	const loadModuleTypes = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getModuleTypesAction({ page, search, pageSize });
			if (result.success && result.data) {
				const data = result.data as any;
				setModuleTypes(data.moduleTypes || []);
				setTotal(data.total || 0);
			} else {
				toast.error(result.message || "Failed to load module types");
			}
		} catch (error) {
			toast.error("Failed to load module types");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize]);

	// Load on mount and when filters change
	useEffect(() => {
		loadModuleTypes();
		setSelectedModuleTypeIds([]);
	}, [loadModuleTypes]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleModuleTypeUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "module_type_created") {
				setModuleTypes((prev) => {
					if (prev.find((m) => m.id === data.moduleType.id)) return prev;
					return page === 1 ? [data.moduleType, ...prev] : prev;
				});
			} else if (data.action === "module_type_updated") {
				setModuleTypes((prev) => prev.map((m) => (m.id === data.moduleType.id ? { ...m, ...data.moduleType } : m)));
			} else if (data.action === "module_type_deleted") {
				setModuleTypes((prev) => prev.filter((m) => m.id !== data.moduleTypeId));
			} else {
				loadModuleTypes();
			}
		},
		[page, loadModuleTypes],
	);

	useChannelEvent("private-global", "module_type_update", handleModuleTypeUpdate);

	async function handleDeleteModuleType() {
		if (!moduleTypeToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteModuleTypeAction(moduleTypeToDelete.id);
			if (result.success) {
				toast.success("Module type deleted");
				setModuleTypeToDelete(null);
				await loadModuleTypes();
			} else {
				toast.error(result.message || "Failed to delete module type");
			}
		} catch (error) {
			toast.error("Failed to delete module type");
		} finally {
			setDeleting(false);
		}
	}

	const handleBulkDelete = async () => {
		if (selectedModuleTypeIds.length === 0) return;

		// Filter out protected types - only delete custom types
		const deletableIds = selectedModuleTypeIds.filter((id) => {
			const moduleType = moduleTypes.find((m) => m.id === id);
			return !isProtected(moduleType);
		});

		if (deletableIds.length === 0) {
			toast.error("Cannot delete protected system module types");
			return;
		}

		if (deletableIds.length < selectedModuleTypeIds.length) {
			toast.info(`${selectedModuleTypeIds.length - deletableIds.length} protected type(s) cannot be deleted`);
		}

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteModuleTypesAction(deletableIds);
			if (result.success) {
				toast.success(result.message || "Module types deleted");
				setSelectedModuleTypeIds([]);
				await loadModuleTypes();
			} else {
				toast.error(result.message || "Failed to delete module types");
			}
		} catch (error) {
			toast.error("Failed to delete module types");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleExport = async (id: string) => {
		try {
			const result = await exportModuleTypeAction(id);
			if (result.success && result.data) {
				const dataStr = JSON.stringify(result.data, null, 2);
				const blob = new Blob([dataStr], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${(result.data as any).key}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast.success("Module type exported");
			} else {
				toast.error(result.message || "Failed to export");
			}
		} catch (error) {
			toast.error("Failed to export");
		}
	};

	const handleImport = async (file: File) => {
		setImporting(true);
		try {
			const text = await file.text();
			const data = JSON.parse(text);
			// First try to import without overwrite
			const result = await importModuleTypeAction(data, false);
			if (result.success) {
				toast.success("Module type imported");
				setImportDialogOpen(false);
				await loadModuleTypes();
			} else if (result.message === "Module type with this key already exists") {
				// Prompt for overwrite
				setPendingImportData(data);
				setOverwriteDialogOpen(true);
			} else {
				toast.error(result.message || "Failed to import");
			}
		} catch (error) {
			toast.error("Invalid file or failed to import");
		} finally {
			setImporting(false);
		}
	};

	const handleConfirmOverwrite = async () => {
		if (!pendingImportData) return;

		setOverwriteDialogOpen(false);
		setImporting(true);
		try {
			const result = await importModuleTypeAction(pendingImportData, true);
			if (result.success) {
				toast.success("Module type updated");
				setImportDialogOpen(false);
				await loadModuleTypes();
			} else {
				toast.error(result.message || "Failed to update");
			}
		} catch (error) {
			toast.error("Failed to update");
		} finally {
			setImporting(false);
			setPendingImportData(null);
		}
	};

	const toggleSelectAll = (checked: boolean) => {
		if (checked) {
			// Only select non-protected (custom) module types
			const selectableIds = moduleTypes.filter((m) => !isProtected(m)).map((m) => m.id);
			setSelectedModuleTypeIds(selectableIds);
		} else {
			setSelectedModuleTypeIds([]);
		}
	};

	const toggleSelect = (id: string) => {
		setSelectedModuleTypeIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
	};

	// Field count badge
	const getFieldCountBadge = (fieldSchema: any) => {
		const count = Array.isArray(fieldSchema?.fields) ? fieldSchema.fields.length : 0;
		return <Badge variant="secondary">{count} fields</Badge>;
	};

	// Check if module type is protected (system type)
	const isProtected = (moduleType: any) => {
		return isProtectedModuleType(moduleType.key);
	};

	return (
		<>
			{selectedModuleTypeIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedModuleTypeIds.length}
					itemName="module type"
					isLoading={bulkActionLoading}
					actions={[
						{
							label: "Delete Selected",
							icon: Trash2,
							onClick: handleBulkDelete,
							variant: "destructive",
						},
					]}
					onClear={() => setSelectedModuleTypeIds([])}
				/>
			)}

			{/* Import Button */}
			<div className="mb-4 flex justify-end">
				<Button
					onClick={() => setImportDialogOpen(true)}
					variant="outline">
					<Upload className="mr-2 h-4 w-4" />
					Import Module Type
				</Button>
			</div>

			{loading && <PageLoading />}

			{!loading && moduleTypes.length === 0 && <NoItemFound text="No module types found" />}

			{!loading && moduleTypes.length > 0 && (
				<>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">
										{(() => {
											const selectableIds = moduleTypes.filter((m) => !isProtected(m)).map((m) => m.id);
											const allSelectableSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedModuleTypeIds.includes(id));

											return (
												<Checkbox
													checked={allSelectableSelected}
													onCheckedChange={toggleSelectAll}
													aria-label="Select all module types"
												/>
											);
										})()}
									</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>System</TableHead>
									<TableHead>Key</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Fields</TableHead>
									<TableHead>Order</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{moduleTypes.map((moduleType: any) => (
									<TableRow
										key={moduleType.id}
										className={isProtected(moduleType) ? "opacity-75" : ""}>
										<TableCell>
											<Checkbox
												checked={selectedModuleTypeIds.includes(moduleType.id)}
												onCheckedChange={() => toggleSelect(moduleType.id)}
												aria-label={`Select ${moduleType.name}`}
												disabled={isProtected(moduleType)}
											/>
										</TableCell>
										<TableCell className="font-medium">
											{moduleType.name}
											{isProtected(moduleType) ? (
												<Badge
													variant="destructive"
													className="ml-2">
													System
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className="ml-2">
													{moduleType.system === "profile" ? "Profile" : moduleType.system}
												</Badge>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">{moduleType.system || "-"}</TableCell>
										<TableCell className="text-muted-foreground text-sm">{moduleType.key || "-"}</TableCell>
										<TableCell className="text-muted-foreground text-sm">{moduleType.description || "-"}</TableCell>
										<TableCell>{getFieldCountBadge(moduleType.fieldSchema)}</TableCell>
										<TableCell className="text-muted-foreground text-sm">{moduleType.order || 0}</TableCell>
										<TableCell className="text-muted-foreground text-sm">{moduleType.createdAt ? new Date(moduleType.createdAt).toLocaleDateString() : "-"}</TableCell>
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
														<Link href={`/meta/module-types/${moduleType.id}`}>
															<Eye className="mr-2 h-4 w-4" />
															View
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleExport(moduleType.id)}>
														<Download className="mr-2 h-4 w-4" />
														Export
													</DropdownMenuItem>
													<DropdownMenuItem asChild>
														<Link href={`/meta/module-types/${moduleType.id}/edit`}>
															<Pencil className="mr-2 h-4 w-4" />
															Edit
														</Link>
													</DropdownMenuItem>
													{!isProtected(moduleType) && (
														<>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																className="text-red-600"
																onClick={() => setModuleTypeToDelete(moduleType)}>
																<Trash2 className="mr-2 h-4 w-4" />
																Delete
															</DropdownMenuItem>
														</>
													)}
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
						itemName="module types"
						baseUrl="/meta/module-types"
						search={search}
					/>
				</>
			)}

			<DeleteDialog
				open={!!moduleTypeToDelete}
				title="Delete Module Type"
				description={`Are you sure you want to delete "${moduleTypeToDelete?.name}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDeleteModuleType}
				onOpenChange={(open) => !open && setModuleTypeToDelete(null)}
			/>

			{/* Import Dialog */}
			<Dialog
				open={importDialogOpen}
				onOpenChange={setImportDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Import Module Type</DialogTitle>
						<DialogDescription>Select a JSON file exported from this system to import a module type.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<input
							type="file"
							accept=".json"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									handleImport(file);
								}
							}}
							disabled={importing}
							className="text-muted-foreground file:border-input file:bg-background file:text-foreground hover:file:bg-accent hover:file:text-accent-foreground block w-full text-sm file:mr-4 file:rounded-md file:border file:px-4 file:py-2 file:text-sm file:font-medium"
						/>
						{importing && (
							<div className="flex items-center justify-center">
								<Loader size="sm" />
								<span className="ml-2">Importing...</span>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setImportDialogOpen(false)}
							disabled={importing}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Overwrite Confirmation Dialog */}
			<Dialog
				open={overwriteDialogOpen}
				onOpenChange={setOverwriteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Overwrite Module Type</DialogTitle>
						<DialogDescription>A module type with key "{pendingImportData?.key}" already exists. Do you want to overwrite it?</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setOverwriteDialogOpen(false)}
							disabled={importing}>
							<X className="mr-2 h-4 w-4" />
							Cancel
						</Button>
						<Button
							onClick={handleConfirmOverwrite}
							disabled={importing}>
							{importing ? (
								<>
									<Loader
										size="sm"
										className="mr-2"
									/>
									Updating...
								</>
							) : (
								"Overwrite"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

"use client";

import React, { useState } from "react";

import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Column definition for GenericListTable
 */
export interface ColumnDef<T> {
	/** Header text to display */
	header: string;
	/** Field name from data object or function to render value */
	accessor: keyof T | ((item: T) => React.ReactNode);
	/** Optional CSS width (e.g., "20%", "200px") */
	width?: string;
}

/**
 * Props for GenericListTable component
 */
export interface GenericListTableProps<T> {
	/** Array of data items to display */
	data: T[];
	/** Column definitions */
	columns: ColumnDef<T>[];
	/** Name of the ID field in T */
	idField: keyof T;
	/** Base path for view/edit links (e.g., "/contacts") */
	basePath: string;
	/** Show view/detail link button */
	viewable?: boolean;
	/** Show edit link button */
	editable?: boolean;
	/** Show delete button */
	deletable?: boolean;
	/** Callback when delete button clicked */
	onDelete?: (id: string) => Promise<void>;
	/** Show checkboxes for row selection */
	selectable?: boolean;
	/** Callback when selection changes */
	onSelectChange?: (selected: string[]) => void;
	/** Loading state for delete operations */
	isDeleting?: boolean;
}

/**
 * Reusable table component for all list pages
 * Eliminates table duplication across features
 *
 * @example
 * <GenericListTable
 *   data={contacts}
 *   columns={[
 *     { header: "Name", accessor: "name" },
 *     { header: "Email", accessor: "email" },
 *     { header: "Status", accessor: (item) => <Badge>{item.status}</Badge> }
 *   ]}
 *   idField="id"
 *   basePath="/contacts"
 *   viewable
 *   editable
 *   deletable
 *   onDelete={handleDelete}
 * />
 */
export function GenericListTable<T extends Record<string, any>>({ data, columns, idField, basePath, viewable = false, editable = true, deletable = false, onDelete, selectable = true, onSelectChange, isDeleting = false }: GenericListTableProps<T>) {
	const [selected, setSelected] = useState<string[]>([]);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const allIds = data.map((item) => String(item[idField]));
			setSelected(allIds);
			onSelectChange?.(allIds);
		} else {
			setSelected([]);
			onSelectChange?.([]);
		}
	};

	const handleSelectOne = (id: string, checked: boolean) => {
		let newSelected: string[];
		if (checked) {
			newSelected = [...selected, id];
		} else {
			newSelected = selected.filter((sid) => sid !== id);
		}
		setSelected(newSelected);
		onSelectChange?.(newSelected);
	};

	const handleDelete = async (id: string) => {
		if (!onDelete) return;
		try {
			setDeletingId(id);
			await onDelete(id);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="bg-background overflow-hidden rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/50">
						{selectable && (
							<TableHead className="w-[50px]">
								<Checkbox
									checked={selected.length === data.length && data.length > 0}
									onCheckedChange={handleSelectAll}
								/>
							</TableHead>
						)}
						{columns.map((col, idx) => (
							<TableHead
								key={`${String(col.accessor)}-${idx}`}
								style={{ width: col.width }}>
								{col.header}
							</TableHead>
						))}
						{(viewable || editable || deletable) && <TableHead className="w-[120px] text-right">Actions</TableHead>}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={(selectable ? 1 : 0) + columns.length + (viewable || editable || deletable ? 1 : 0)}
								className="text-muted-foreground py-8 text-center">
								No data found
							</TableCell>
						</TableRow>
					) : (
						data.map((item) => (
							<TableRow key={String(item[idField])}>
								{selectable && (
									<TableCell>
										<Checkbox
											checked={selected.includes(String(item[idField]))}
											onCheckedChange={(checked) => handleSelectOne(String(item[idField]), checked as boolean)}
										/>
									</TableCell>
								)}
								{columns.map((col, idx) => (
									<TableCell key={`${String(col.accessor)}-${idx}`}>{typeof col.accessor === "function" ? col.accessor(item) : String(item[col.accessor] || "-")}</TableCell>
								))}
								{(viewable || editable || deletable) && (
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											{viewable && (
												<Link href={`${basePath}/${item[idField]}`}>
													<Button
														variant="ghost"
														size="sm"
														title="View"
														className="h-8 w-8 p-0">
														<Eye className="h-4 w-4" />
													</Button>
												</Link>
											)}
											{editable && (
												<Link href={`${basePath}/${item[idField]}/edit`}>
													<Button
														variant="ghost"
														size="sm"
														title="Edit"
														className="h-8 w-8 p-0">
														<Pencil className="h-4 w-4" />
													</Button>
												</Link>
											)}
											{deletable && onDelete && (
												<Button
													variant="ghost"
													size="sm"
													title="Delete"
													className="h-8 w-8 p-0"
													onClick={() => handleDelete(String(item[idField]))}
													disabled={isDeleting || deletingId === String(item[idField])}>
													<Trash2 className="text-destructive h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								)}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}

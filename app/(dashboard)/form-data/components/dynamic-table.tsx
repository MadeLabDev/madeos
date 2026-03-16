"use client";

import { useState } from "react";

import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DynamicTableProps } from "@/lib/features/form-data/types";

export function DynamicTable({ data }: DynamicTableProps) {
	const [selectedRow, setSelectedRow] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const extractValue = (jsonValue: any, index: number): string => {
		if (!jsonValue || typeof jsonValue !== "object") return "-";

		let array: any[] | null = null;
		if (Array.isArray(jsonValue)) {
			array = jsonValue;
		} else if ("field" in jsonValue && Array.isArray((jsonValue as any).field)) {
			array = (jsonValue as any).field;
		}

		if (array && index < array.length) {
			const val = array[index];
			return val === null || val === undefined ? "-" : String(val);
		}
		return "-";
	};

	const handleViewDetails = (row: any) => {
		setSelectedRow(row);
		setIsModalOpen(true);
	};

	if (!data || data.length === 0) {
		return <div className="text-muted-foreground py-8 text-center">No data available</div>;
	}

	return (
		<>
			<div className="overflow-x-auto rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted">
							<TableHead className="font-semibold">First Name</TableHead>
							<TableHead className="font-semibold">Last Name</TableHead>
							<TableHead className="font-semibold">Email</TableHead>
							<TableHead className="w-24 font-semibold">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((row) => (
							<TableRow
								key={row.id}
								className="hover:bg-muted/50">
								<TableCell className="text-sm">{extractValue(row.data, 0)}</TableCell>
								<TableCell className="text-sm">{extractValue(row.data, 1)}</TableCell>
								<TableCell className="text-sm">{extractValue(row.data, 2)}</TableCell>
								<TableCell className="text-sm">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleViewDetails(row)}>
										<Eye className="h-4 w-4" />
										View
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Modal to display JSON */}
			<Dialog
				open={isModalOpen}
				onOpenChange={setIsModalOpen}>
				<DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Submission Details</DialogTitle>
						<DialogDescription>Full data for this submission</DialogDescription>
					</DialogHeader>
					{selectedRow && (
						<div className="bg-muted rounded-lg p-4">
							<pre className="overflow-x-auto text-xs break-words whitespace-pre-wrap">{JSON.stringify(selectedRow.data, null, 2)}</pre>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

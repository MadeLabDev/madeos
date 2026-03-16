"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ParentCompanySearchProps, ParentCustomer } from "@/lib/features/customers/types";

export function ParentCompanySearch({ value, onSelect, currentCustomerId, allCustomers }: ParentCompanySearchProps) {
	const [search, setSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [filteredCustomers, setFilteredCustomers] = useState<ParentCustomer[]>([]);

	// Initialize selected customer when value changes (for edit page)
	const selectedCustomer = useMemo(() => {
		if (value) {
			return allCustomers.find((c) => c.id === value) || null;
		}
		return null;
	}, [value, allCustomers]);

	// Filter customers based on search
	const computedFilteredCustomers = useMemo(() => {
		if (!search.trim()) {
			return [];
		}

		const searchLower = search.toLowerCase();
		return allCustomers.filter((c) => c.companyName.toLowerCase().includes(searchLower) && (!currentCustomerId || c.id !== currentCustomerId)).slice(0, 10);
	}, [search, allCustomers, currentCustomerId]);

	// Update filteredCustomers when computed value changes
	useEffect(() => {
		setFilteredCustomers(computedFilteredCustomers);
	}, [computedFilteredCustomers]);

	const handleSelect = useCallback(
		(customerId: string) => {
			onSelect(customerId);
			setSearch("");
			setIsOpen(false);
		},
		[onSelect],
	);

	const handleClear = useCallback(() => {
		onSelect(null);
		setSearch("");
		setIsOpen(false);
	}, [onSelect]);

	return (
		<div className="relative">
			<Label
				htmlFor="parentCompanySearch"
				className="text-sm font-medium">
				Parent Company (Location/Branch)
			</Label>

			{selectedCustomer ? (
				// Show selected value with clear button
				<div className="border-input bg-background mt-2 flex items-center justify-between rounded-md border px-3 py-2">
					<span className="text-sm">{selectedCustomer.companyName}</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-5 w-5 p-0 hover:bg-transparent"
						onClick={handleClear}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			) : (
				// Show search input
				<div className="relative mt-2">
					<Input
						id="parentCompanySearch"
						placeholder="Search for parent company..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setIsOpen(true);
						}}
						onFocus={() => setIsOpen(search.length > 0)}
						onBlur={() => setTimeout(() => setIsOpen(false), 200)}
						className="text-sm"
					/>

					{/* Dropdown with search results */}
					{isOpen && filteredCustomers.length > 0 && (
						<div className="border-input bg-background absolute top-full right-0 left-0 z-50 mt-1 rounded-md border shadow-md">
							<ScrollArea className="h-auto max-h-[200px]">
								<div className="p-1">
									{/* "None" option */}
									<button
										type="button"
										onClick={() => {
											onSelect(null);
											setSearch("");
											setIsOpen(false);
										}}
										className="hover:bg-accent hover:text-accent-foreground relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none">
										None - Standalone Customer
									</button>

									{/* Search results */}
									{filteredCustomers.map((customer) => (
										<button
											key={customer.id}
											type="button"
											onClick={() => handleSelect(customer.id)}
											className="hover:bg-accent hover:text-accent-foreground relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none">
											{customer.companyName}
										</button>
									))}
								</div>
							</ScrollArea>
						</div>
					)}

					{/* Empty state */}
					{isOpen && search.length > 0 && filteredCustomers.length === 0 && <div className="border-input bg-background text-muted-foreground absolute top-full right-0 left-0 z-50 mt-1 rounded-md border px-2 py-1.5 text-sm shadow-md">No customers found</div>}

					{/* Help text */}
					<p className="text-muted-foreground mt-1 text-xs">Leave empty for main customer. Search and select a parent to make this a location/branch.</p>
				</div>
			)}
		</div>
	);
}

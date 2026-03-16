"use client";

import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMON_STATUS_OPTIONS, EVENT_TYPES } from "@/lib/config/module-types";

export interface ListPageHeaderProps {
	title: string;
	description: string;
	searchPlaceholder?: string;
	addButtonLabel?: string;
	addButtonHref?: string;
	secondaryButtonLabel?: string;
	secondaryButtonHref?: string;
	search?: string;
	clearHref?: string;
	showSearch?: boolean;
	onSearchChange?: (value: string) => void;
	type?: string;
	// Event-specific filters
	statusFilter?: string;
	typeFilter?: string;
	showFilters?: boolean;
	statusOptions?: { value: string; label: string }[];
	typeOptions?: { value: string; label: string }[];
}

export function ListPageHeader({ title, description, searchPlaceholder = "Search...", addButtonLabel = "Add", addButtonHref, secondaryButtonLabel, secondaryButtonHref, search = "", clearHref, showSearch = true, type, statusFilter, typeFilter, showFilters = false, statusOptions, typeOptions }: ListPageHeaderProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleFilterChange = (filterType: string, value: string) => {
		const params = new URLSearchParams(searchParams);
		if (type) params.set("type", type);
		if (value && value !== "ALL") {
			params.set(filterType, value);
		} else {
			params.delete(filterType);
		}
		params.set("page", "1"); // Reset to page 1 when filtering
		router.push(`?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const searchValue = formData.get("search") as string;

		// Build URL with all existing params + search
		const params = new URLSearchParams(searchParams);
		if (type) params.set("type", type);
		if (searchValue) {
			params.set("search", searchValue);
			params.set("page", "1"); // Reset to page 1 when searching
		} else {
			params.delete("search");
			params.set("page", "1");
		}

		router.push(`?${params.toString()}`);
	};

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0 flex-1">
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
				<p className="text-muted-foreground text-sm sm:text-base">{description}</p>
			</div>
			<div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
				{showSearch && (
					<form
						className="flex flex-1 items-center gap-2 sm:flex-initial"
						onSubmit={handleSearch}>
						<div className="relative flex-1 sm:w-64">
							<Input
								name="search"
								placeholder={searchPlaceholder}
								className="pr-10"
								defaultValue={search}
							/>
							<Button
								type="submit"
								variant="secondary"
								className="absolute top-1/2 right-px -translate-y-1/2 transform bg-transparent p-1">
								<Search className="h-4 w-4" />
							</Button>
						</div>
						{search && clearHref && (
							<Link href={clearHref}>
								<Button
									type="button"
									variant="destructive">
									<X className="h-4 w-4" />
								</Button>
							</Link>
						)}
					</form>
				)}
				{showFilters && (
					<div className="flex gap-2">
						{statusFilter !== undefined && (
							<Select
								value={statusFilter}
								onValueChange={(value) => handleFilterChange("status", value)}>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									{!statusOptions?.some((option) => option.value === "ALL") && <SelectItem value="ALL">All Status</SelectItem>}
									{statusOptions
										? statusOptions.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value}>
													{option.label}
												</SelectItem>
											))
										: COMMON_STATUS_OPTIONS.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value}>
													{option.label}
												</SelectItem>
											))}
								</SelectContent>
							</Select>
						)}
						{typeFilter !== undefined && (
							<Select
								value={typeFilter}
								onValueChange={(value) => handleFilterChange("type", value)}>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									{!typeOptions?.some((option) => option.value === "ALL") && <SelectItem value="ALL">All Types</SelectItem>}
									{typeOptions
										? typeOptions.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value}>
													{option.label}
												</SelectItem>
											))
										: EVENT_TYPES.map((type) => (
												<SelectItem
													key={type.value}
													value={type.value}>
													{type.label}
												</SelectItem>
											))}
								</SelectContent>
							</Select>
						)}
					</div>
				)}
				{secondaryButtonHref && (
					<Link
						href={secondaryButtonHref}
						className="w-full sm:w-auto">
						<Button
							variant="outline"
							className="w-full sm:w-auto">
							{secondaryButtonLabel}
						</Button>
					</Link>
				)}
				{addButtonHref && (
					<Link
						href={addButtonHref}
						className="w-full sm:w-auto">
						<Button className="w-full sm:w-auto">
							<Plus className="mr-1 h-4 w-4" />
							{addButtonLabel}
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
}

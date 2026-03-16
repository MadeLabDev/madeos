"use client";

import { useEffect, useState } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SearchSelectOption {
	value: string;
	label: string;
	description?: string;
}

export type { SearchSelectOption };

interface AsyncSearchSelectProps {
	value?: string;
	onValueChange: (value: string) => void;
	fetchOptions: (query: string) => Promise<SearchSelectOption[]>;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	disabled?: boolean;
	className?: string;
	initialOptions?: SearchSelectOption[];
}

export function AsyncSearchSelect({ value, onValueChange, fetchOptions, placeholder = "Select option...", searchPlaceholder = "Search options...", emptyMessage = "No options found.", disabled = false, className, initialOptions = [] }: AsyncSearchSelectProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [options, setOptions] = useState<SearchSelectOption[]>(initialOptions);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Only load options when dropdown opens or search query changes (with debounce)
		if (!open) return;

		let timeoutId: NodeJS.Timeout | undefined;

		// Add delay to prevent rapid re-triggering
		timeoutId = setTimeout(async () => {
			setLoading(true);
			try {
				const fetchedOptions = await fetchOptions(searchQuery);
				// Merge with initialOptions to ensure selected value is always available
				const mergedOptions = [...initialOptions];
				fetchedOptions.forEach((option) => {
					if (!mergedOptions.some((existing) => existing.value === option.value)) {
						mergedOptions.push(option);
					}
				});
				setOptions(mergedOptions);
			} catch (error) {
				console.error("Failed to fetch options:", error);
				setOptions(initialOptions);
			} finally {
				setLoading(false);
			}
		}, 100);

		return () => {
			if (timeoutId !== undefined) clearTimeout(timeoutId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, searchQuery]);

	const selectedOption = options.find((option) => option.value === value);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					disabled={disabled}>
					{selectedOption ? selectedOption.label : placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-full p-0"
				align="start">
				<Command>
					<CommandInput
						placeholder={searchPlaceholder}
						value={searchQuery}
						onValueChange={setSearchQuery}
					/>
					<CommandList>
						{loading ? (
							<div className="py-6 text-center text-sm">Loading...</div>
						) : (
							<>
								<CommandEmpty>{emptyMessage}</CommandEmpty>
								<CommandGroup>
									{options.map((option) => (
										<CommandItem
											key={option.value}
											value={option.value}
											onSelect={() => {
												onValueChange(option.value === value ? "" : option.value);
												setOpen(false);
											}}>
											<Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
											<div className="flex flex-col">
												<span>{option.label}</span>
												{option.description && <span className="text-muted-foreground text-sm">{option.description}</span>}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

"use client";

import { useCallback, useEffect, useState } from "react";

import { Loader2, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MultiSelectOption {
	value: string;
	label: string;
	description?: string;
}

interface MultiSelectFieldProps {
	label?: string;
	value: string[]; // Array of selected values
	onChange: (values: string[]) => void;
	fetchOptions: (query: string) => Promise<MultiSelectOption[]>;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	disabled?: boolean;
	maxItems?: number;
	description?: string;
	loadSelectedOptions?: (ids: string[]) => Promise<MultiSelectOption[]>;
}

export function MultiSelectField({ label, value = [], onChange, fetchOptions, placeholder = "Select items...", searchPlaceholder = "Search items...", emptyMessage = "No items found.", disabled = false, maxItems, description, loadSelectedOptions }: MultiSelectFieldProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [options, setOptions] = useState<MultiSelectOption[]>([]);
	const [loading, setLoading] = useState(false);

	const loadOptions = useCallback(
		async (query: string) => {
			setLoading(true);
			try {
				const fetchedOptions = await fetchOptions(query);
				setOptions(fetchedOptions);
			} catch (error) {
				console.error("Failed to fetch options:", error);
				setOptions([]);
			} finally {
				setLoading(false);
			}
		},
		[fetchOptions],
	);

	useEffect(() => {
		if (open) {
			loadOptions(searchQuery);
		}
	}, [open, searchQuery, loadOptions]);

	// Load options for selected values when value changes
	useEffect(() => {
		const loadSelectedOptionsEffect = async () => {
			if (value.length > 0 && loadSelectedOptions) {
				try {
					const selectedOpts = await loadSelectedOptions(value);
					setOptions((prev) => {
						const combined = [...prev, ...selectedOpts];
						return combined.filter((v, i, a) => a.findIndex((o) => o.value === v.value) === i);
					});
				} catch (error) {
					console.error("Failed to load selected options:", error);
				}
			}
		};
		loadSelectedOptionsEffect();
	}, [value, loadSelectedOptions]);

	const handleSelect = (optionValue: string) => {
		if (value.includes(optionValue)) {
			// Remove if already selected
			onChange(value.filter((v) => v !== optionValue));
		} else {
			// Add if not selected and under max limit
			if (!maxItems || value.length < maxItems) {
				onChange([...value, optionValue]);
			}
		}
	};

	const handleRemove = (optionValue: string) => {
		onChange(value.filter((v) => v !== optionValue));
	};

	const selectedOptions = options.filter((option) => value.includes(option.value));
	const availableOptions = options.filter((option) => !value.includes(option.value));

	return (
		<div className="space-y-2">
			{label && <Label>{label}</Label>}

			{/* Add Button */}
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						className="w-full justify-start"
						disabled={disabled || (maxItems !== undefined && value.length >= maxItems)}>
						<Plus className="mr-2 h-4 w-4" />
						{value.length === 0 ? placeholder : `Add more... (${value.length}${maxItems ? `/${maxItems}` : ""} selected)`}
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
								<div className="flex items-center justify-center py-6">
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									<span className="text-sm">Loading...</span>
								</div>
							) : (
								<>
									<CommandEmpty className="p-3">{emptyMessage}</CommandEmpty>
									{availableOptions.length > 0 && (
										<CommandGroup>
											{availableOptions.map((option) => (
												<CommandItem
													key={option.value}
													value={option.value}
													onSelect={() => handleSelect(option.value)}>
													<div className="flex flex-col">
														<span>{option.label}</span>
														{option.description && <span className="text-muted-foreground text-sm">{option.description}</span>}
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									)}
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{/* Selected Items Display */}
			{value.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{selectedOptions.map((option) => (
						<Badge
							key={option.value}
							variant="secondary"
							className="flex items-center gap-1">
							<span className="max-w-32 truncate">{option.label}</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-4 w-4 p-0 hover:bg-transparent"
								onClick={() => handleRemove(option.value)}
								disabled={disabled}>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					))}
				</div>
			)}

			{description && <p className="text-muted-foreground text-xs">{description}</p>}
		</div>
	);
}

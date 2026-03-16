"use client";

import { useMemo, useState } from "react";

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

interface SearchSelectProps {
	value?: string;
	onValueChange: (value: string) => void;
	options: SearchSelectOption[];
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	disabled?: boolean;
	className?: string;
}

export function SearchSelect({ value, onValueChange, options, placeholder = "Select option...", searchPlaceholder = "Search options...", emptyMessage = "No options found.", disabled = false, className }: SearchSelectProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const computedFilteredOptions = useMemo(() => {
		if (searchQuery.trim() === "") {
			return options;
		} else {
			return options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()) || option.description?.toLowerCase().includes(searchQuery.toLowerCase()));
		}
	}, [searchQuery, options]);

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
						<CommandEmpty>{emptyMessage}</CommandEmpty>
						<CommandGroup>
							{computedFilteredOptions.map((option) => (
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
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

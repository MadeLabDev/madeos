"use client";

import React, { useEffect, useRef, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagsInputWithAutocompleteProps {
	value: string[];
	onChange: (tags: string[]) => void;
	availableTags: string[]; // List of existing tags in system
	placeholder?: string;
	disabled?: boolean;
	onCreateNewTag?: (tagName: string) => void; // Callback when new tag is created
}

export function TagsInputWithAutocomplete({ value = [], onChange, availableTags = [], placeholder = "Type to search tags...", disabled = false, onCreateNewTag }: TagsInputWithAutocompleteProps) {
	const [input, setInput] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const suggestionsRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Filter suggestions based on input
	useEffect(() => {
		if (input.trim()) {
			const filtered = availableTags.filter((tag) => tag.toLowerCase().includes(input.toLowerCase()) && !value.includes(tag));
			setSuggestions(filtered);
			setShowSuggestions(filtered.length > 0 || input.trim().length > 0);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	}, [input, availableTags, value]);

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const addTag = (tagName: string = input.trim()) => {
		if (tagName && !value.includes(tagName)) {
			onChange([...value, tagName]);
			// Call callback if it's a new tag (not in availableTags)
			if (!availableTags.includes(tagName)) {
				onCreateNewTag?.(tagName);
			}
			setInput("");
			setShowSuggestions(false);
		}
	};

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter((tag) => tag !== tagToRemove));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (suggestions.length > 0) {
				// If there are suggestions, add the first one
				addTag(suggestions[0]);
			} else if (input.trim()) {
				// Otherwise add as new tag
				addTag();
			}
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
		}
	};

	const handleSuggestionClick = (tag: string) => {
		addTag(tag);
	};

	return (
		<div className="space-y-2">
			<div className="relative">
				<div className="flex gap-2">
					<Input
						ref={inputRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => input.trim() && setShowSuggestions(true)}
						placeholder={placeholder}
						disabled={disabled}
					/>
					<Button
						type="button"
						onClick={() => addTag()}
						disabled={disabled || !input.trim()}
						variant="outline">
						Add
					</Button>
				</div>

				{/* Autocomplete Suggestions Dropdown */}
				{showSuggestions && (
					<div
						ref={suggestionsRef}
						className="border-input absolute top-full right-12 left-0 z-50 mt-1 rounded-md border bg-white shadow-md dark:bg-slate-950">
						{suggestions.length > 0 ? (
							<div className="max-h-48 overflow-y-auto">
								{suggestions.map((tag) => (
									<button
										key={tag}
										type="button"
										onClick={() => handleSuggestionClick(tag)}
										className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm">
										{tag}
									</button>
								))}
							</div>
						) : input.trim() ? (
							<div className="text-muted-foreground px-3 py-2 text-sm">
								<button
									type="button"
									onClick={() => addTag()}
									className="hover:text-foreground w-full text-left hover:font-medium">
									Create new tag: <strong>&quot;{input.trim()}&quot;</strong>
								</button>
							</div>
						) : null}
					</div>
				)}
			</div>

			{/* Selected Tags */}
			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((tag) => (
						<div
							key={tag}
							className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm">
							<span>{tag}</span>
							<button
								type="button"
								onClick={() => removeTag(tag)}
								disabled={disabled}
								className="text-current hover:opacity-70">
								<X size={14} />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

"use client";

import React, { useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagsInputProps {
	value: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
}

export function TagsInput({ value = [], onChange, placeholder = "Add tag and press Enter...", disabled = false }: TagsInputProps) {
	const [input, setInput] = useState("");

	const addTag = () => {
		if (input.trim() && !value.includes(input.trim())) {
			onChange([...value, input.trim()]);
			setInput("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter((tag) => tag !== tagToRemove));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addTag();
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex gap-2">
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
				/>
				<Button
					type="button"
					onClick={addTag}
					disabled={disabled || !input.trim()}
					variant="outline">
					Add
				</Button>
			</div>
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

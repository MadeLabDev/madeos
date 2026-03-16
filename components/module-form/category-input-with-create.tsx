"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface Category {
	id: string;
	name: string;
}

interface CategoryInputWithCreateProps {
	value: string[]; // Selected category IDs
	onChange: (categoryIds: string[]) => void;
	categories: Category[]; // Existing categories
	disabled?: boolean;
	onCreateNew?: (categoryName: string) => Promise<Category | null>;
}

export function CategoryInputWithCreate({ value = [], onChange, categories = [], disabled = false, onCreateNew }: CategoryInputWithCreateProps) {
	const [newCategoryInput, setNewCategoryInput] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [createdCategories, setCreatedCategories] = useState<Map<string, Category>>(new Map());

	const allCategories = [...categories, ...Array.from(createdCategories.values())];

	const handleToggleCategory = (categoryId: string) => {
		onChange(value.includes(categoryId) ? value.filter((id) => id !== categoryId) : [...value, categoryId]);
	};

	const handleCreateCategory = async () => {
		if (!newCategoryInput.trim()) return;

		setIsCreating(true);
		try {
			const newCategory = await onCreateNew?.(newCategoryInput.trim());

			if (newCategory) {
				// Track newly created category
				setCreatedCategories((prev) => {
					const updated = new Map(prev);
					updated.set(newCategory.id, newCategory);
					return updated;
				});

				// Auto-select the newly created category
				onChange([...value, newCategory.id]);

				setNewCategoryInput("");
			}
		} finally {
			setIsCreating(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleCreateCategory();
		}
	};

	return (
		<div className="space-y-3">
			{/* Existing Categories */}
			<div className="space-y-2">
				{allCategories.map((cat) => (
					<div
						key={cat.id}
						className="flex items-center space-x-2">
						<Checkbox
							id={`category-${cat.id}`}
							checked={value.includes(cat.id)}
							onCheckedChange={() => handleToggleCategory(cat.id)}
							disabled={disabled}
						/>
						<label
							htmlFor={`category-${cat.id}`}
							className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							{cat.name}
						</label>
						{createdCategories.has(cat.id) && <span className="text-xs text-green-600 dark:text-green-400">(new)</span>}
					</div>
				))}
			</div>

			{/* Create New Category */}
			<div className="space-y-2 border-t pt-2">
				<div className="flex gap-2">
					<Input
						value={newCategoryInput}
						onChange={(e) => setNewCategoryInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Create new category..."
						disabled={disabled || isCreating}
					/>
					<Button
						type="button"
						onClick={handleCreateCategory}
						disabled={disabled || isCreating || !newCategoryInput.trim()}
						variant="outline"
						size="sm">
						{isCreating ? "Creating..." : "Add"}
					</Button>
				</div>
			</div>

			{/* Validation */}
			{value.length === 0 && <p className="text-destructive text-xs">Please select at least one category</p>}
		</div>
	);
}

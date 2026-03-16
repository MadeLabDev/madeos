"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import type { PostCategory } from "@/lib/features/post/types";

import { CategoryForm } from "../../components";

interface EditCategoryFormProps {
	category: PostCategory;
	type?: string;
}

export function EditCategoryForm({ category, type = "blog" }: EditCategoryFormProps) {
	const router = useRouter();
	const [isSubmitting] = useState(false);

	function handleCancel() {
		router.back();
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-category-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
					<p className="text-muted-foreground">Update {category.name} details</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isSubmitting}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleHeaderSubmit}
						disabled={isSubmitting}>
						{isSubmitting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						<Save className="mr-2 h-4 w-4" />
						Update Category
					</Button>
				</div>
			</div>

			{/* Form */}
			<CategoryForm
				category={category}
				isEditing
				hideButtons
				type={type}
			/>
		</div>
	);
}

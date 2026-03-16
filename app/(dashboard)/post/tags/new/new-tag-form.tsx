"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { TagForm } from "../components";

interface NewTagFormProps {
	type?: string;
}

export function NewTagForm({ type = "blog" }: NewTagFormProps) {
	const router = useRouter();
	const [isSubmitting] = useState(false);

	function handleCancel() {
		router.push(`/post/tags${type === "blog" ? "" : `?type=${type}`}`);
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-tag-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Create New Tag</h1>
					<p className="text-muted-foreground">Add a new {type} tag</p>
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
						{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
						Create Tag
					</Button>
				</div>
			</div>

			{/* Form */}
			<TagForm
				isEditing={false}
				hideButtons
				type={type}
			/>
		</div>
	);
}

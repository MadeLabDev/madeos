"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { NewPostFormProps } from "@/lib/features/post/types";
import { getPostTypeLabels } from "@/lib/utils/metadata";

import { PostForm } from "../components";

export function NewPostForm({ categories, tags, type = "blog", moduleTypes }: NewPostFormProps) {
	const router = useRouter();
	const [isSubmitting] = useState(false);
	const labels = getPostTypeLabels(type);

	function handleCancel() {
		router.push(`/post${type === "blog" ? "" : `?type=${type}`}`);
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-post-form] button[type="submit"]') as HTMLButtonElement | null;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{labels.createTitle}</h1>
					<p className="text-muted-foreground">{labels.createDescription}</p>
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
						{labels.createButton}
					</Button>
				</div>
			</div>

			{/* Form */}
			<PostForm
				post={undefined}
				categories={categories}
				tags={tags}
				hideButtons={true}
				type={type}
				moduleTypes={moduleTypes}
			/>
		</div>
	);
}

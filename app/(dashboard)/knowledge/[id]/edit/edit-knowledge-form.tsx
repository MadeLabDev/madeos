"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { EditKnowledgeFormProps } from "@/lib/features/knowledge/types";

import { KnowledgeForm } from "../../components/knowledge-form";

export function EditKnowledgeForm({ article, categories, tags, moduleTypes }: EditKnowledgeFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCancel = () => {
		router.back();
	};

	const handleHeaderSubmit = () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-knowledge-form] button[type="submit"]') as HTMLButtonElement | null;
			submitBtn?.click();
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			// Reset submitting state after a short delay to allow form to handle submission
			setTimeout(() => setIsSubmitting(false), 1000);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Edit Article</h1>
					<p className="text-muted-foreground mt-1">
						Updating: <span className="font-semibold">{article.title}</span>
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						onClick={handleCancel}
						disabled={isSubmitting}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						onClick={handleHeaderSubmit}
						disabled={isSubmitting}>
						{isSubmitting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
						Update Article
					</Button>
				</div>
			</div>

			<KnowledgeForm
				article={article}
				categories={categories}
				tags={tags}
				moduleTypes={moduleTypes}
				hideButtons={true}
			/>
		</div>
	);
}

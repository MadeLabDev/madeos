"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { EditPostFormProps } from "@/lib/features/post/types";
import { getPostTypeLabels } from "@/lib/utils/metadata";

import { PostForm } from "../../components/post-form";

export function EditPostForm({ post, categories, tags, type = "blog", moduleTypes }: EditPostFormProps) {
	const router = useRouter();
	const labels = getPostTypeLabels(type);

	const handleCancel = () => {
		router.back();
	};

	const handleHeaderSubmit = () => {
		const submitBtn = document.querySelector('form[data-post-form] button[type="submit"]') as HTMLButtonElement | null;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">{labels.editTitle}</h1>
					<p className="text-muted-foreground mt-1">{labels.editDescription(post.title)}</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						onClick={handleCancel}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button onClick={handleHeaderSubmit}>
						<Save className="mr-2 h-4 w-4" />
						{labels.updateButton}
					</Button>
				</div>
			</div>

			<PostForm
				post={post}
				categories={categories}
				tags={tags}
				hideButtons={true}
				type={type}
				moduleTypes={moduleTypes}
			/>
		</div>
	);
}

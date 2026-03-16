"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { EditTagFormProps } from "@/lib/features/knowledge-tags";

import { TagForm } from "../../components";

export function EditTagForm({ tag }: EditTagFormProps) {
	const router = useRouter();

	const handleCancel = () => {
		router.back();
	};

	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-tag-form] button[type="submit"]') as HTMLButtonElement | null;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Tag</h1>
					<p className="text-muted-foreground mt-1 text-sm">{tag.name}</p>
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
						Update Tag
					</Button>
				</div>
			</div>
			<TagForm
				tag={tag}
				hideButtons={true}
				isEditing={true}
			/>
		</div>
	);
}

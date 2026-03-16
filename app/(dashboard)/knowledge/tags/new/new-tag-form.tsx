"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { TagForm } from "../components";

export function NewTagForm() {
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
					<h1 className="text-3xl font-bold tracking-tight">Create New Tag</h1>
					<p className="text-muted-foreground mt-1 text-sm">Add a new tag to organize your knowledge base content</p>
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
						Create Tag
					</Button>
				</div>
			</div>
			<TagForm
				hideButtons={true}
				isEditing={false}
			/>
		</div>
	);
}

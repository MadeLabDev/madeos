"use client";

import { useState } from "react";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import type { PostCategory } from "@/lib/features/post/types";
import { createCategoryAction, updateCategoryAction } from "@/lib/features/post-categories/actions";
import { generateSlug } from "@/lib/utils/slug-generator";

interface CategoryFormProps {
	category?: PostCategory;
	isEditing?: boolean;
	hideButtons?: boolean;
	type?: string;
}

export function CategoryForm({ category, isEditing = false, hideButtons = false, type = "blog" }: CategoryFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: category?.name || "",
		slug: category?.slug || "",
		description: category?.description || "",
		color: category?.color || "#000000",
	});
	const isEdit = !!category?.id;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		// Auto-generate slug from title (only when creating, not editing)
		if (name === "name" && !isEdit) {
			const newSlug = generateSlug(value);
			setFormData((prev) => ({
				...prev,
				[name]: value,
				slug: newSlug,
			}));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Validation Error", { description: "Category name is required" });
			return;
		}

		if (!formData.slug.trim()) {
			toast.error("Validation Error", { description: "Category slug is required" });
			return;
		}

		try {
			setIsLoading(true);

			const result =
				isEditing && category
					? await updateCategoryAction(category.id, {
							name: formData.name,
							slug: formData.slug,
							description: formData.description || undefined,
							color: formData.color || undefined,
						})
					: await createCategoryAction({
							name: formData.name,
							slug: formData.slug,
							description: formData.description || undefined,
							type,
							color: formData.color || undefined,
						});

			if (result.success) {
				toast.success(isEditing ? "Category updated" : "Category created", {
					description: result.message,
				});
				router.push(`/post/categories${type === "blog" ? "" : `?type=${type}`}`);
			} else {
				toast.error("Error", { description: result.message });
			}
		} catch (error) {
			toast.error("Error", {
				description: error instanceof Error ? error.message : "Something went wrong",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardContent className="space-y-6">
				<form
					onSubmit={handleSubmit}
					data-category-form
					className="space-y-6">
					{/* Name */}
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="e.g., Getting Started"
							disabled={isLoading}
						/>
					</div>

					{/* Slug */}
					<div className="space-y-2">
						<Label htmlFor="slug">Slug</Label>
						<Input
							id="slug"
							name="slug"
							value={formData.slug}
							onChange={handleInputChange}
							placeholder="e.g., getting-started"
							disabled={isLoading}
						/>
						<p className="text-muted-foreground text-xs">Used in URLs. Lowercase letters, numbers, and hyphens only.</p>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							placeholder="Optional description..."
							disabled={isLoading}
							rows={3}
						/>
					</div>

					{/* Color */}
					<div className="space-y-2">
						<Label htmlFor="color">Color</Label>
						<div className="flex gap-2">
							<Input
								id="color"
								name="color"
								type="color"
								value={formData.color}
								onChange={handleInputChange}
								disabled={isLoading}
								className="h-10 w-20"
							/>
							<Input
								type="text"
								value={formData.color}
								onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
								placeholder="#000000"
								disabled={isLoading}
								className="flex-1"
							/>
						</div>
						<p className="text-muted-foreground text-xs">Choose a color for the category badge</p>
					</div>

					{/* Buttons - shown when not in hideButtons mode */}
					{!hideButtons && (
						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
								disabled={isLoading}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}>
								{isLoading && (
									<Loader
										size="sm"
										className="mr-2"
									/>
								)}
							</Button>
						</div>
					)}

					{/* Hidden buttons for wrapper to trigger */}
					{hideButtons && (
						<div className="hidden">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
								disabled={isLoading}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}>
								{isLoading && (
									<Loader
										size="sm"
										className="mr-2"
									/>
								)}
								{isEditing ? "Update Category" : "Create Category"}
							</Button>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}

"use client";

import { useCallback, useState } from "react";

import { Pencil } from "lucide-react";
import Link from "next/link";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PostCategory } from "@/lib/features/post/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface CategoryDetailWrapperProps {
	categoryId: string;
	initialCategory: PostCategory;
	type?: string;
}

export function CategoryDetailWrapper({ categoryId, initialCategory, type = "blog" }: CategoryDetailWrapperProps) {
	const [category, setCategory] = useState(initialCategory);

	// Subscribe to Pusher
	usePusher();

	// Handle real-time category updates
	const handleCategoryUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			// Only update if this event is for the current category
			if (data.category?.id === categoryId) {
				setCategory((prev) => {
					if (data.category) {
						// Merge updated category data with existing data
						return { ...prev, ...data.category };
					}
					return prev;
				});
			}
		},
		[categoryId],
	);

	// Listen for category update events
	useChannelEvent("private-global", "category_update", handleCategoryUpdate);

	return (
		<>
			<SetBreadcrumb
				segment="post"
				label={type === "blog" ? "Blog Posts" : `${type.charAt(0).toUpperCase() + type.slice(1)} Posts`}
			/>
			<SetBreadcrumb
				segment="categories"
				label={type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`}
			/>
			<SetBreadcrumb
				segment={categoryId}
				label={category.name}
			/>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
						<p className="text-muted-foreground">{category.slug}</p>
					</div>
					<div className="flex gap-2">
						<Link href={`/post/categories/${categoryId}/edit?type=${type}`}>
							<Button>
								<Pencil className="mr-2 h-4 w-4" />
								Edit Category
							</Button>
						</Link>
					</div>
				</div>

				{/* Details Card */}
				<Card>
					<CardHeader>
						<CardTitle>Category Details</CardTitle>
						<CardDescription>Information about this category</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Details Grid */}
						<div className="grid grid-cols-2 gap-6">
							<div>
								<h3 className="text-muted-foreground text-sm font-semibold">ID</h3>
								<p className="mt-1 font-mono text-sm">{category.id}</p>
							</div>
							<div>
								<h3 className="text-muted-foreground text-sm font-semibold">Slug</h3>
								<p className="mt-1 font-mono text-sm">{category.slug}</p>
							</div>
							<div>
								<h3 className="text-muted-foreground text-sm font-semibold">Post Count</h3>
								<p className="mt-1">{category._count?.posts || 0} posts</p>
							</div>
						</div>

						{/* Description */}
						{category.description && (
							<div>
								<h3 className="text-muted-foreground text-sm font-semibold">Description</h3>
								<p className="mt-2 text-sm leading-relaxed">{category.description}</p>
							</div>
						)}

						{/* Dates */}
						<div className="text-muted-foreground grid grid-cols-2 gap-6 border-t pt-4 text-sm">
							<div>
								<p className="font-semibold">Created</p>
								<p className="mt-1">{new Date(category.createdAt).toLocaleString()}</p>
							</div>
							<div>
								<p className="font-semibold">Updated</p>
								<p className="mt-1">{new Date(category.updatedAt).toLocaleString()}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

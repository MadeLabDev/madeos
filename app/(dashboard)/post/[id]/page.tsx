import { Suspense } from "react";

import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReadOnlyEditor } from "@/components/blocks/editor-x/read-only-editor";
import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { ModuleDisplayField } from "@/components/module-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getPostAction, getPostSystemModuleTypesAction } from "@/lib/features/post/actions";
import type { FieldDefinition } from "@/lib/features/profile/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "blog";
	const typeTitle = type === "blog" ? "Blog Posts" : `${type.charAt(0).toUpperCase() + type.slice(1)} Posts`;

	return generateCrudMetadata(typeTitle);
}

export default async function PostDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
	const { id } = await params;
	const { type = "blog" } = await searchParams;
	const [postResult, moduleTypesResult] = await Promise.all([getPostAction(id), getPostSystemModuleTypesAction(type)]);

	if (!postResult.success || !postResult.data) {
		notFound();
	}

	const post = postResult.data as any;
	const moduleTypes = moduleTypesResult.success && moduleTypesResult.data ? (moduleTypesResult.data as any[]) : [];

	// Process additional fields for display
	const additionalFields: Array<{ moduleType: any; fields: FieldDefinition[] }> = [];
	const existingMetaData = typeof post?.metaData === "object" && post?.metaData && !Array.isArray(post.metaData) ? (post.metaData as Record<string, any>) : {};

	if (moduleTypes && moduleTypes.length > 0) {
		// Sort module types by order
		const sortedModuleTypes = [...moduleTypes].sort((a, b) => (a.order || 0) - (b.order || 0));

		for (const moduleType of sortedModuleTypes) {
			if (moduleType.fieldSchema && "fields" in moduleType.fieldSchema) {
				// Normalize field orders
				let fieldsWithOrder = (moduleType.fieldSchema.fields as any[]).map((field, idx) => {
					if (!field.order || field.order <= 0) {
						return { ...field, order: idx + 1 };
					}
					return field;
				});

				const fields = fieldsWithOrder.sort((a, b) => (a.order || 0) - (b.order || 0));

				// Check if any field has a value
				const hasValues = fields.some((field) => {
					const value = existingMetaData[field.name];
					return value !== null && value !== undefined && value !== "";
				});

				if (hasValues) {
					additionalFields.push({
						moduleType,
						fields,
					});
				}
			}
		}
	}

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="post"
					label={type === "blog" ? "Blog Posts" : `${type.charAt(0).toUpperCase() + type.slice(1)} Posts`}
				/>
				<SetBreadcrumb
					segment={id}
					label={post.title}
				/>

				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">{post.title}</h1>
					</div>
					<Link href={`/post/${post.id}/edit${type === "blog" ? "" : `?type=${type}`}`}>
						<Button className="gap-2">
							<Pencil className="h-4 w-4" />
							Edit
						</Button>
					</Link>
				</div>

				{/* Main content - 2 columns */}
				<div className="grid grid-cols-3 gap-6">
					{/* Left column - Content (2/3 width) */}
					<div className="col-span-2 space-y-6">
						{/* Description/Excerpt */}
						{post.excerpt && (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-semibold">Description</h3>
								</CardHeader>
								<CardContent className="py-0">
									<p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
								</CardContent>
							</Card>
						)}

						{/* Main post content */}
						<Card>
							<CardContent
								className="py-0"
								id="postcontent">
								<ReadOnlyEditor editorSerializedState={post.content} />
							</CardContent>
						</Card>

						{/* Additional Fields */}
						{additionalFields.length > 0 && (
							<Card>
								<CardHeader>
									<h3 className="text-lg font-semibold">Additional Fields</h3>
								</CardHeader>
								<CardContent className="space-y-6">
									{additionalFields.map((group) => (
										<div
											key={group.moduleType.id}
											className="space-y-4">
											{group.moduleType.description && <p className="text-muted-foreground text-sm">{group.moduleType.description}</p>}
											<div className="grid gap-4">
												{group.fields.map((field) => {
													const value = existingMetaData[field.name];
													if (value === null || value === undefined || value === "") {
														return null;
													}
													return (
														<ModuleDisplayField
															key={field.id}
															field={field}
															value={value}
														/>
													);
												})}
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right column - Sidebar (1/3 width) */}
					<div className="col-span-1 space-y-6">
						{/* Thumbnail */}
						{post.thumbnail && (
							<Card className="p-0">
								<CardContent className="p-0">
									<div className="relative h-48 w-full">
										<Image
											src={post.thumbnail}
											alt={post.title}
											fill
											className="rounded-lg object-cover"
										/>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Categories */}
						{post.categories && post.categories.length > 0 && (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-semibold">Categories</h3>
								</CardHeader>
								<CardContent className="space-y-2 py-0">
									<div className="flex flex-col gap-2">
										{post.categories.map((category: any) => (
											<Badge
												key={category.id}
												variant="outline"
												className="w-fit">
												{category.name}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Tags */}
						{post.tags && post.tags.length > 0 && (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-semibold">Tags</h3>
								</CardHeader>
								<CardContent className="space-y-2 py-0">
									<div className="flex flex-col gap-2">
										{post.tags.map((tag: any) => (
											<Badge
												key={tag.id}
												variant="secondary"
												className="w-fit">
												{tag.name}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Status & Info */}
						<Card>
							<CardHeader>
								<h3 className="text-sm font-semibold">Information</h3>
							</CardHeader>
							<CardContent className="space-y-4 py-0">
								{/* Status */}
								<div>
									<p className="text-muted-foreground mb-1 text-xs">Status</p>
									<Badge
										variant={post.isPublished ? "default" : "secondary"}
										className="w-fit">
										{post.isPublished ? "Published" : "Draft"}
									</Badge>
								</div>

								{/* Views */}
								<div>
									<p className="text-muted-foreground mb-1 text-xs">Views</p>
									<p className="text-sm font-medium">{post.viewCount || 0}</p>
								</div>

								{/* Created Date */}
								{post.createdAt && (
									<div>
										<p className="text-muted-foreground mb-1 text-xs">Created</p>
										<p className="text-sm font-medium">
											{new Date(post.createdAt).toLocaleDateString("vi-VN", {
												year: "numeric",
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								)}

								{/* Updated Date */}
								{post.updatedAt && (
									<div>
										<p className="text-muted-foreground mb-1 text-xs">Updated</p>
										<p className="text-sm font-medium">
											{new Date(post.updatedAt).toLocaleDateString("vi-VN", {
												year: "numeric",
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								)}

								{/* Slug */}
								<div>
									<p className="text-muted-foreground mb-1 text-xs">Slug</p>
									<p className="text-muted-foreground font-mono text-xs break-all">{post.slug}</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</>
		</Suspense>
	);
}

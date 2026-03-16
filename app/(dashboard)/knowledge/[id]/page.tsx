import { Suspense } from "react";

import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReadOnlyEditor } from "@/components/blocks/editor-x/read-only-editor";
import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getArticleAction } from "@/lib/features/knowledge/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Knowledge Base");

export const revalidate = 0;

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getArticleAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const article = result.data as any;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={article.title}
				/>

				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">{article.title}</h1>
					</div>
					<Link href={`/knowledge/${article.id}/edit`}>
						<Button>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Button>
					</Link>
				</div>

				{/* Main content - 2 columns */}
				<div className="grid grid-cols-3 gap-6">
					{/* Left column - Content (2/3 width) */}
					<div className="col-span-2 space-y-6">
						{/* Description/Excerpt */}
						{article.excerpt && (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-semibold">Description</h3>
								</CardHeader>
								<CardContent className="py-0">
									<p className="text-muted-foreground text-sm leading-relaxed">{article.excerpt}</p>
								</CardContent>
							</Card>
						)}

						{/* Main article content */}
						<Card>
							<CardContent
								className="py-0"
								id="coursecontent">
								<ReadOnlyEditor editorSerializedState={article.content} />
							</CardContent>
						</Card>
					</div>

					{/* Right column - Sidebar (1/3 width) */}
					<div className="col-span-1 space-y-6">
						{/* Thumbnail */}
						{article.thumbnail && (
							<Card className="p-0">
								<CardContent className="p-0">
									<div className="relative h-48 w-full">
										<Image
											src={article.thumbnail}
											alt={article.title}
											fill
											className="rounded-lg object-cover"
										/>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Categories */}
						{article.categories && article.categories.length > 0 && (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-semibold">Categories</h3>
								</CardHeader>
								<CardContent className="space-y-2 py-0">
									<div className="flex flex-col gap-2">
										{article.categories.map((category: any) => (
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
						{article.tags && article.tags.length > 0 && (
							<Card>
								<CardHeader>
									<h3 className="text-sm font-semibold">Tags</h3>
								</CardHeader>
								<CardContent className="space-y-2 py-0">
									<div className="flex flex-col gap-2">
										{article.tags.map((tag: any) => (
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
										variant={article.isPublished ? "default" : "secondary"}
										className="w-fit">
										{article.isPublished ? "Published" : "Draft"}
									</Badge>
								</div>

								{/* Views */}
								<div>
									<p className="text-muted-foreground mb-1 text-xs">Views</p>
									<p className="text-sm font-medium">{article.viewCount || 0}</p>
								</div>

								{/* Created Date */}
								{article.createdAt && (
									<div>
										<p className="text-muted-foreground mb-1 text-xs">Created</p>
										<p className="text-sm font-medium">
											{new Date(article.createdAt).toLocaleDateString("vi-VN", {
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
								{article.updatedAt && (
									<div>
										<p className="text-muted-foreground mb-1 text-xs">Updated</p>
										<p className="text-sm font-medium">
											{new Date(article.updatedAt).toLocaleDateString("vi-VN", {
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
									<p className="text-muted-foreground font-mono text-xs break-all">{article.slug}</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</>
		</Suspense>
	);
}

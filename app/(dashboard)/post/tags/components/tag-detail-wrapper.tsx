"use client";

import { useCallback, useState } from "react";

import { Pencil } from "lucide-react";
import Link from "next/link";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PostTag } from "@/lib/features/post/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface TagDetailWrapperProps {
	tagId: string;
	initialTag: PostTag;
	type?: string;
}

export function TagDetailWrapper({ tagId, initialTag, type = "blog" }: TagDetailWrapperProps) {
	const [tag, setTag] = useState(initialTag);

	// Subscribe to Pusher
	usePusher();

	// Handle real-time tag updates
	const handleTagUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			// Only update if this event is for the current tag
			if (data.tag?.id === tagId) {
				setTag((prev) => {
					if (data.tag) {
						// Merge updated tag data with existing data
						return { ...prev, ...data.tag };
					}
					return prev;
				});
			}
		},
		[tagId],
	);

	// Listen for tag update events
	useChannelEvent("private-global", "tag_update", handleTagUpdate);

	return (
		<>
			<SetBreadcrumb
				segment="post"
				label={type === "blog" ? "Blog Posts" : `${type.charAt(0).toUpperCase() + type.slice(1)} Posts`}
			/>
			<SetBreadcrumb
				segment="tags"
				label={type === "blog" ? "Blog Tags" : `${type.charAt(0).toUpperCase() + type.slice(1)} Tags`}
			/>
			<SetBreadcrumb
				segment={tagId}
				label={tag.name}
			/>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{tag.name}</h1>
						<p className="text-muted-foreground">{tag.slug}</p>
					</div>
					<div className="flex gap-2">
						<Link href={`/post/tags/${tagId}/edit?type=${type}`}>
							<Button>
								<Pencil className="mr-2 h-4 w-4" />
								Edit Tag
							</Button>
						</Link>
					</div>
				</div>

				{/* Details Card */}
				<Card>
					<CardHeader>
						<CardTitle>Tag Details</CardTitle>
						<CardDescription>Information about this tag</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Details Grid */}
						<div className="grid grid-cols-2 gap-6">
							<div>
								<h3 className="text-muted-foreground text-sm font-semibold">ID</h3>
								<p className="mt-1 font-mono text-sm">{tag.id}</p>
							</div>
							<div>
								<h3 className="text-muted-foreground text-sm font-semibold">Slug</h3>
								<p className="mt-1 font-mono text-sm">{tag.slug}</p>
							</div>
							<div>
								<h3 className="text-muted-foreground text-sm font-semibold">Post Count</h3>
								<p className="mt-1">{tag._count?.posts || 0} posts</p>
							</div>
						</div>

						{/* Dates */}
						<div className="text-muted-foreground grid grid-cols-2 gap-6 border-t pt-4 text-sm">
							<div>
								<p className="font-semibold">Created</p>
								<p className="mt-1">{new Date(tag.createdAt).toLocaleString()}</p>
							</div>
							<div>
								<p className="font-semibold">Updated</p>
								<p className="mt-1">{new Date(tag.updatedAt).toLocaleString()}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

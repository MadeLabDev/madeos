"use client";

import { useCallback, useEffect, useState } from "react";

import { ArrowLeft, Edit, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { getEventMicrositeByEventIdAction, updateEventMicrositePublishStatusAction } from "@/lib/features/marketing/actions";
import { EventMicrosite } from "@/lib/features/marketing/types";
import { formatDate } from "@/lib/utils";

interface EventMicrositeDetailProps {
	eventId: string;
}

export function EventMicrositeDetail({ eventId }: EventMicrositeDetailProps) {
	const [microsite, setMicrosite] = useState<EventMicrosite | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	const loadMicrosite = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getEventMicrositeByEventIdAction(eventId);
			if (result.success) {
				setMicrosite(result.data || null);
			} else {
				toast.error(result.message || "Failed to load microsite");
			}
		} catch (error) {
			console.error("Error loading microsite:", error);
			toast.error("Failed to load microsite");
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	useEffect(() => {
		loadMicrosite();
	}, [eventId, loadMicrosite]);

	const handleTogglePublish = async () => {
		if (!microsite) return;

		try {
			const result = await updateEventMicrositePublishStatusAction(microsite.id, !microsite.isPublished);
			if (result.success) {
				toast.success(`Microsite ${!microsite.isPublished ? "published" : "unpublished"} successfully`);
				setMicrosite(result.data || null);
			} else {
				toast.error(result.message || "Failed to update publish status");
			}
		} catch (error) {
			console.error("Error updating publish status:", error);
			toast.error("Failed to update publish status");
		}
	};

	if (loading) {
		return <Loader />;
	}

	if (!microsite) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						onClick={() => router.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
				</div>
				<Card>
					<CardContent className="pt-6">
						<div className="py-8 text-center">
							<p className="text-muted-foreground">No microsite found for this event.</p>
							<Button
								asChild
								className="mt-4">
								<Link href={`/marketing/microsites/new?eventId=${eventId}`}>Create Microsite</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						onClick={() => router.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{microsite.heroTitle}</h1>
						{microsite.heroSubtitle && <p className="text-muted-foreground">{microsite.heroSubtitle}</p>}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={microsite.isPublished ? "default" : "secondary"}>{microsite.isPublished ? "Published" : "Draft"}</Badge>
					<Button
						variant="outline"
						onClick={handleTogglePublish}>
						{microsite.isPublished ? "Unpublish" : "Publish"}
					</Button>
					<Button asChild>
						<Link href={`/marketing/microsites/${eventId}/edit`}>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</Link>
					</Button>
					{microsite.isPublished && (
						<Button
							variant="outline"
							asChild>
							<Link
								href={`/public/events/${eventId}`}
								target="_blank">
								<Globe className="mr-2 h-4 w-4" />
								View Public
							</Link>
						</Button>
					)}
				</div>
			</div>

			{/* Microsite Content */}
			<div className="grid gap-6">
				{/* Hero Section */}
				<Card>
					<CardHeader>
						<CardTitle>Hero Section</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{microsite.heroImage && (
							<div>
								<label className="text-sm font-medium">Hero Image</label>
								<div className="mt-1">
									<div className="relative h-48 w-full max-w-md">
										<Image
											src={microsite.heroImage.url}
											alt={microsite.heroTitle}
											fill
											className="rounded-lg border object-cover"
										/>
									</div>
								</div>
							</div>
						)}
						<div>
							<label className="text-sm font-medium">Title</label>
							<p className="mt-1 text-lg font-semibold">{microsite.heroTitle}</p>
						</div>
						{microsite.heroSubtitle && (
							<div>
								<label className="text-sm font-medium">Subtitle</label>
								<p className="mt-1">{microsite.heroSubtitle}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Content Section */}
				<Card>
					<CardHeader>
						<CardTitle>Content</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium">Description</label>
							<div
								className="prose mt-1 max-w-none"
								dangerouslySetInnerHTML={{ __html: microsite.description }}
							/>
						</div>
						{microsite.agenda && (
							<div>
								<label className="text-sm font-medium">Agenda</label>
								<div
									className="prose mt-1 max-w-none"
									dangerouslySetInnerHTML={{ __html: microsite.agenda }}
								/>
							</div>
						)}
						{microsite.speakers && (
							<div>
								<label className="text-sm font-medium">Speakers</label>
								<div
									className="prose mt-1 max-w-none"
									dangerouslySetInnerHTML={{ __html: microsite.speakers }}
								/>
							</div>
						)}
						{microsite.sponsors && (
							<div>
								<label className="text-sm font-medium">Sponsors</label>
								<div
									className="prose mt-1 max-w-none"
									dangerouslySetInnerHTML={{ __html: microsite.sponsors }}
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Call to Action */}
				{(microsite.ctaText || microsite.ctaUrl) && (
					<Card>
						<CardHeader>
							<CardTitle>Call to Action</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{microsite.ctaText && (
								<div>
									<label className="text-sm font-medium">Button Text</label>
									<p className="mt-1">{microsite.ctaText}</p>
								</div>
							)}
							{microsite.ctaUrl && (
								<div>
									<label className="text-sm font-medium">Button URL</label>
									<p className="mt-1">
										<a
											href={microsite.ctaUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline">
											{microsite.ctaUrl}
										</a>
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Metadata */}
				<Card>
					<CardHeader>
						<CardTitle>Metadata</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium">Created</label>
								<p className="mt-1">{formatDate(microsite.createdAt)}</p>
							</div>
							<div>
								<label className="text-sm font-medium">Last Updated</label>
								<p className="mt-1">{formatDate(microsite.updatedAt)}</p>
							</div>
							{microsite.publishedAt && (
								<div>
									<label className="text-sm font-medium">Published At</label>
									<p className="mt-1">{formatDate(microsite.publishedAt)}</p>
								</div>
							)}
							<div>
								<label className="text-sm font-medium">Status</label>
								<p className="mt-1">
									<Badge variant={microsite.isPublished ? "default" : "secondary"}>{microsite.isPublished ? "Published" : "Draft"}</Badge>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

"use client";

import { useEffect, useState } from "react";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { DesignDeckStatus } from "@/generated/prisma/enums";
import { deleteDesignDeck, getDesignDeck } from "@/lib/features/design/actions";

interface DesignDeckDetailProps {
	id: string;
}

export function DesignDeckDetail({ id }: DesignDeckDetailProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(false);
	const [data, setData] = useState<any>(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const result = await getDesignDeck(id);
				if (result.success && result.data) {
					setData(result.data);
				} else {
					toast.error("Failed to load design deck");
					router.push("/design-projects/design-decks");
				}
			} catch (error) {
				toast.error("Failed to load design deck");
				router.push("/design-projects/design-decks");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [id, router]);

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this design deck?")) {
			return;
		}

		try {
			setDeleting(true);
			const result = await deleteDesignDeck(id);
			if (result.success) {
				toast.success("Design deck deleted successfully");
				router.push("/design-projects/design-decks");
			} else {
				toast.error(result.message || "Failed to delete design deck");
			}
		} catch (error) {
			toast.error("Failed to delete design deck");
		} finally {
			setDeleting(false);
		}
	};

	const getStatusColor = (status: DesignDeckStatus) => {
		switch (status) {
			case DesignDeckStatus.DRAFT:
				return "secondary";
			case DesignDeckStatus.IN_PROGRESS:
				return "default";
			case DesignDeckStatus.REVIEW:
				return "outline";
			case DesignDeckStatus.PUBLISHED:
				return "default";
			case DesignDeckStatus.ARCHIVED:
				return "secondary";
			default:
				return "secondary";
		}
	};
	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader className="h-8 w-8" />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">Design deck not found</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{data.title}</h1>
						<p className="text-muted-foreground">Design Deck Details</p>
					</div>
				</div>
				<div className="flex space-x-2">
					<Button
						asChild
						variant="outline"
						size="sm">
						<Link href={`/design-projects/design-decks/${id}/edit`}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Link>
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDelete}
						disabled={deleting}>
						<Trash2 className="mr-2 h-4 w-4" />
						{deleting ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-muted-foreground text-sm font-medium">Title</label>
							<p className="text-sm">{data.title}</p>
						</div>

						<div>
							<label className="text-muted-foreground text-sm font-medium">Status</label>
							<div className="mt-1">
								<Badge variant={getStatusColor(data.status)}>{data.status}</Badge>
							</div>
						</div>

						{data.description && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Description</label>
								<p className="text-sm">{data.description}</p>
							</div>
						)}

						{data.coverUrl && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Cover URL</label>
								<p className="text-sm">
									<a
										href={data.coverUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:underline">
										{data.coverUrl}
									</a>
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Project & Assets</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-muted-foreground text-sm font-medium">Design Project ID</label>
							<p className="font-mono text-sm">{data.designProjectId}</p>
						</div>

						{data.designIds && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Design</label>
								<p className="font-mono text-sm">{data.designIds}</p>
							</div>
						)}

						{data.deckUrl && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Deck URL</label>
								<p className="text-sm">
									<a
										href={data.deckUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:underline">
										{data.deckUrl}
									</a>
								</p>
							</div>
						)}

						{data.mediaIds && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Media</label>
								<p className="font-mono text-sm">{data.mediaIds}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{data.notes && (
				<Card>
					<CardHeader>
						<CardTitle>Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{data.notes}</p>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Timestamps</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="text-muted-foreground text-sm font-medium">Created</label>
							<p className="text-sm">{new Date(data.createdAt).toLocaleString()}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">Updated</label>
							<p className="text-sm">{new Date(data.updatedAt).toLocaleString()}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

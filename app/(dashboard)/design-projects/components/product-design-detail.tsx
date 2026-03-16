import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProductDesign } from "@/lib/features/design/actions";

interface ProductDesignDetailProps {
	designId: string;
}

export async function ProductDesignDetail({ designId }: ProductDesignDetailProps) {
	const result = await getProductDesign(designId);

	if (!result.success || !result.data) {
		notFound();
	}

	const design = result.data;

	const getStatusColor = (status: string) => {
		switch (status) {
			case "DRAFT":
				return "secondary";
			case "IN_PROGRESS":
				return "default";
			case "REVIEW":
				return "outline";
			case "APPROVED":
				return "default";
			case "REJECTED":
				return "destructive";
			case "COMPLETED":
				return "default";
			default:
				return "secondary";
		}
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Button
						variant="outline"
						size="sm"
						asChild>
						<Link href="/design/designs">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Designs
						</Link>
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{design.name}</h1>
						<p className="text-muted-foreground">Product Design Details</p>
					</div>
				</div>
				<Button asChild>
					<Link href={`/design/designs/${designId}/edit`}>
						<Edit className="mr-2 h-4 w-4" />
						Edit Design
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="space-y-6 md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Design Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Status</label>
									<div className="mt-1">
										<Badge variant={getStatusColor(design.status)}>{design.status.replace("_", " ")}</Badge>
									</div>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Version</label>
									<p className="mt-1">{design.version}</p>
								</div>
							</div>

							{design.designType && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Design Type</label>
									<p className="mt-1">{design.designType}</p>
								</div>
							)}

							{design.description && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Description</label>
									<p className="mt-1 whitespace-pre-wrap">{design.description}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Project Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-muted-foreground text-sm font-medium">Design Project</label>
								<p className="mt-1">
									<Link
										href={`/design/projects/${design.designProjectId}`}
										className="text-primary hover:underline">
										{design.designProject?.title || `Project ${design.designProjectId}`}
									</Link>
								</p>
							</div>

							<Separator />

							<div>
								<label className="text-muted-foreground text-sm font-medium">Created</label>
								<p className="mt-1 text-sm">{new Date(design.createdAt).toLocaleDateString()}</p>
							</div>

							{design.updatedAt !== design.createdAt && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Last Updated</label>
									<p className="mt-1 text-sm">{new Date(design.updatedAt).toLocaleDateString()}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

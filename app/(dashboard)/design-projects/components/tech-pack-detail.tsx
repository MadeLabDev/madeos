import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTechPackById } from "@/lib/features/design/actions";

interface TechPackDetailProps {
	techPackId: string;
}

export async function TechPackDetail({ techPackId }: TechPackDetailProps) {
	const result = await getTechPackById(techPackId);

	if (!result.success || !result.data) {
		notFound();
	}

	const techPack = result.data;

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
						<Link href="/design/tech-packs">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Tech Packs
						</Link>
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{techPack.name}</h1>
						<p className="text-muted-foreground">Tech Pack Details</p>
					</div>
				</div>
				<Button asChild>
					<Link href={`/design/tech-packs/${techPackId}/edit`}>
						<Edit className="mr-2 h-4 w-4" />
						Edit Tech Pack
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="space-y-6 md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Tech Pack Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Status</label>
									<div className="mt-1">
										<Badge variant={getStatusColor(techPack.status)}>{techPack.status.replace("_", " ")}</Badge>
									</div>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Decoration Method</label>
									<p className="mt-1">{techPack.decorationMethod}</p>
								</div>
							</div>

							{techPack.description && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Description</label>
									<p className="mt-1 whitespace-pre-wrap">{techPack.description}</p>
								</div>
							)}

							{techPack.productionNotes && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Production Notes</label>
									<p className="mt-1 whitespace-pre-wrap">{techPack.productionNotes}</p>
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
								<label className="text-muted-foreground text-sm font-medium">Product Design</label>
								<p className="mt-1">
									<Link
										href={`/design/designs/${techPack.productDesignId}`}
										className="text-primary hover:underline">
										{`Design ${techPack.productDesignId}`}
									</Link>
								</p>
							</div>

							<Separator />

							<div>
								<label className="text-muted-foreground text-sm font-medium">Created</label>
								<p className="mt-1 text-sm">{new Date(techPack.createdAt).toLocaleDateString()}</p>
							</div>

							{techPack.updatedAt !== techPack.createdAt && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Last Updated</label>
									<p className="mt-1 text-sm">{new Date(techPack.updatedAt).toLocaleDateString()}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

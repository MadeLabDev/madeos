import { Suspense } from "react";

import { Plus } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getDesignBriefsAction } from "@/lib/features/design";

interface DesignBriefsPageProps {
	params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
	DRAFT: "bg-gray-100 text-gray-800",
	APPROVED: "bg-green-100 text-green-800",
	REJECTED: "bg-red-100 text-red-800",
};

async function BriefsContent({ projectId }: { projectId: string }) {
	const result = await getDesignBriefsAction(projectId);

	if (!result.success) {
		return (
			<div className="py-12 text-center">
				<h2 className="text-xl font-semibold">Failed to load briefs</h2>
				<p className="text-muted-foreground">{result.message}</p>
			</div>
		);
	}

	const briefs = Array.isArray(result.data) ? result.data : [];

	return (
		<div className="space-y-4">
			{briefs.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<p className="text-muted-foreground mb-4">No design briefs yet</p>
						<Link href={`/design-projects/${projectId}/briefs/new`}>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create First Brief
							</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{briefs.map((brief) => (
						<Card key={brief.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<CardTitle className="text-lg">{brief.title}</CardTitle>
									<Badge className={statusColors[brief.status] || ""}>{brief.status}</Badge>
								</div>
								<CardDescription>{brief.description}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{brief.brandInfo && (
									<div>
										<h4 className="mb-1 text-sm font-semibold">Brand Info</h4>
										<p className="text-muted-foreground line-clamp-2 text-sm">{brief.brandInfo}</p>
									</div>
								)}
								<div className="flex gap-2">
									<Link
										href={`/design-projects/${projectId}/briefs/${brief.id}`}
										className="flex-1">
										<Button
											variant="outline"
											size="sm"
											className="w-full">
											View
										</Button>
									</Link>
									<Link
										href={`/design-projects/${projectId}/briefs/${brief.id}/edit`}
										className="flex-1">
										<Button
											variant="outline"
											size="sm"
											className="w-full">
											Edit
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

export default async function DesignBriefsPage({ params }: DesignBriefsPageProps) {
	const { id } = await params;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Design Briefs</h1>
					<p className="text-muted-foreground mt-2">Manage creative briefs for this project</p>
				</div>
				<Link href={`/design-projects/${id}/briefs/new`}>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						New Brief
					</Button>
				</Link>
			</div>

			<Suspense fallback={<PageLoading />}>
				<BriefsContent projectId={id} />
			</Suspense>
		</div>
	);
}

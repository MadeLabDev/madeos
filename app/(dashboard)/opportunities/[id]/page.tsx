import { Suspense } from "react";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getOpportunityByIdAction } from "@/lib/features/opportunities";
import type { OpportunityDetailPageProps } from "@/lib/features/opportunities/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Opportunities");

export const revalidate = 0;

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
	const { id } = await params;
	const result = await getOpportunityByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const opportunity = result.data as any;

	// Stage badge helper
	const getStageBadge = (stage: string) => {
		const stageColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
			PROSPECTING: "outline",
			QUALIFIED: "secondary",
			PROPOSAL: "default",
			NEGOTIATION: "default",
			CLOSED_WON: "default",
			CLOSED_LOST: "destructive",
		};
		return <Badge variant={stageColors[stage] || "outline"}>{stage.replace("_", " ")}</Badge>;
	};

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={opportunity.title}
			/>

			<div className="space-y-6">
				<Suspense fallback={<PageLoading />}>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold">{opportunity.title}</h1>
							<div className="mt-2 flex items-center gap-2">
								{getStageBadge(opportunity.stage)}
								{opportunity.probability && <Badge variant="outline">{opportunity.probability}% probability</Badge>}
							</div>
						</div>
						<div className="flex gap-2">
							<Link href={`/opportunities/${id}/edit`}>
								<Button>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>
							</Link>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						{/* Opportunity Information */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Opportunity Details</h2>
							<div className="space-y-3">
								<div>
									<p className="text-muted-foreground text-sm">Description</p>
									<p className="font-medium">{opportunity.description || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Value</p>
									<p className="font-medium">{opportunity.value ? `$${opportunity.value.toLocaleString()}` : "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Expected Close Date</p>
									<p className="font-medium">{opportunity.expectedClose ? new Date(opportunity.expectedClose).toLocaleDateString() : "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Source</p>
									<p className="font-medium">{opportunity.source || "-"}</p>
								</div>
							</div>
						</Card>

						{/* Customer & Owner Information */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Customer & Owner</h2>
							<div className="space-y-3">
								<div>
									<p className="text-muted-foreground text-sm">Customer</p>
									<Link
										href={`/customers/${opportunity.customer.id}`}
										className="font-medium underline">
										{opportunity.customer.companyName}
									</Link>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Owner</p>
									<p className="font-medium">{opportunity.owner.name || opportunity.owner.email}</p>
								</div>
							</div>
						</Card>

						{/* Engagements */}
						{opportunity.engagements && opportunity.engagements.length > 0 && (
							<Card className="p-6">
								<h2 className="mb-2 text-lg font-semibold">Engagements ({opportunity.engagements.length})</h2>
								<div className="space-y-2 text-sm">
									{opportunity.engagements.slice(0, 5).map((engagement: any) => (
										<div
											key={engagement.id}
											className="border-b py-2 last:border-0">
											<div className="flex justify-between">
												<span className="font-medium">{engagement.title}</span>
												<Badge variant="outline">{engagement.type}</Badge>
											</div>
											<p className="text-muted-foreground mt-1">{engagement.status}</p>
										</div>
									))}
								</div>
							</Card>
						)}
					</div>
				</Suspense>
			</div>
		</>
	);
}

import { Suspense } from "react";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getInteractionByIdAction } from "@/lib/features/interactions";
import type { InteractionDetailPageProps } from "@/lib/features/interactions/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Interaction");

export const revalidate = 0;

export default async function InteractionDetailPage({ params }: InteractionDetailPageProps) {
	const { id } = await params;
	const result = await getInteractionByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const interaction = result.data as any;

	// Type badge helper
	const getTypeBadge = (type: string) => {
		const typeColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
			MEETING: "default",
			CALL: "secondary",
			EMAIL: "outline",
			NOTE: "outline",
		};
		return <Badge variant={typeColors[type] || "outline"}>{type}</Badge>;
	};

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={interaction.subject}
			/>

			<div className="space-y-6">
				<Suspense fallback={<PageLoading />}>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold">{interaction.subject}</h1>
							<div className="mt-2 flex items-center gap-2">
								{getTypeBadge(interaction.type)}
								<Badge variant="outline">{new Date(interaction.date).toLocaleDateString()}</Badge>
							</div>
						</div>
						<div className="flex gap-2">
							<Link href={`/interactions/${id}/edit`}>
								<Button>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>
							</Link>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						{/* Interaction Information */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Interaction Details</h2>
							<div className="space-y-3">
								<div>
									<p className="text-muted-foreground text-sm">Description</p>
									<p className="font-medium">{interaction.description || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Duration</p>
									<p className="font-medium">{interaction.duration ? `${interaction.duration} minutes` : "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Outcome</p>
									<p className="font-medium">{interaction.outcome || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Participants</p>
									<p className="font-medium">{interaction.participants || "-"}</p>
								</div>
							</div>
						</Card>

						{/* Customer & Contact Information */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Related Records</h2>
							<div className="space-y-3">
								{interaction.customer && (
									<div>
										<p className="text-muted-foreground text-sm">Customer</p>
										<Link
											href={`/customers/${interaction.customer.id}`}
											className="font-medium underline">
											{interaction.customer.companyName}
										</Link>
									</div>
								)}
								{interaction.contact && (
									<div>
										<p className="text-muted-foreground text-sm">Contact</p>
										<Link
											href={`/contacts/${interaction.contact.id}`}
											className="font-medium underline">
											{interaction.contact.firstName} {interaction.contact.lastName}
										</Link>
									</div>
								)}
								{!interaction.customer && !interaction.contact && <p className="text-muted-foreground text-sm">No related records</p>}
							</div>
						</Card>
					</div>
				</Suspense>
			</div>
		</>
	);
}

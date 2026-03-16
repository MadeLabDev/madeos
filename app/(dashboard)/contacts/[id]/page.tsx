import { Suspense } from "react";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getContactByIdAction } from "@/lib/features/contacts";
import type { ContactDetailPageProps } from "@/lib/features/contacts/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Contacts");

export const revalidate = 0;

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
	const { id } = await params;
	const result = await getContactByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const contact = result.data as any;

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={`${contact.firstName} ${contact.lastName}`}
			/>

			<div className="space-y-6">
				<Suspense fallback={<PageLoading />}>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold">
								{contact.firstName} {contact.lastName}
							</h1>
							<div className="mt-2 flex items-center gap-2">
								{contact.isPrimary && <Badge variant="default">Primary Contact</Badge>}
								{contact.tags && (
									<div className="flex gap-1">
										{contact.tags.split(",").map((tag: string) => (
											<Badge
												key={tag.trim()}
												variant="outline">
												{tag.trim()}
											</Badge>
										))}
									</div>
								)}
							</div>
						</div>
						<div className="flex gap-2">
							<Link href={`/contacts/${id}/edit`}>
								<Button>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>
							</Link>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						{/* Contact Information */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Contact Information</h2>
							<div className="space-y-3">
								<div>
									<p className="text-muted-foreground text-sm">Email</p>
									<p className="font-medium">{contact.email}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Phone</p>
									<p className="font-medium">{contact.phone || "-"}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Title</p>
									<p className="font-medium">{contact.title || "-"}</p>
								</div>
							</div>
						</Card>

						{/* Customer Association */}
						<Card className="p-6">
							<h2 className="mb-2 text-lg font-semibold">Customer Association</h2>
							<div className="space-y-3">
								<div>
									<p className="text-muted-foreground text-sm">Customer</p>
									<Link
										href={`/customers/${contact.customer.id}`}
										className="font-medium underline">
										{contact.customer.companyName}
									</Link>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Customer Email</p>
									<p className="font-medium">{contact.customer.email}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-sm">Customer Phone</p>
									<p className="font-medium">{contact.customer.phone || "-"}</p>
								</div>
							</div>
						</Card>

						{/* Opportunities */}
						{contact.opportunities && contact.opportunities.length > 0 && (
							<Card className="p-6">
								<h2 className="mb-2 text-lg font-semibold">Opportunities ({contact.opportunities.length})</h2>
								<div className="space-y-2 text-sm">
									{contact.opportunities.slice(0, 5).map((opportunity: any) => (
										<Link
											key={opportunity.id}
											href={`/opportunities/${opportunity.id}`}
											className="block border-b py-2 underline last:border-0">
											{opportunity.name} • {opportunity.stage}
										</Link>
									))}
								</div>
							</Card>
						)}

						{/* Interactions */}
						{contact.interactions && contact.interactions.length > 0 && (
							<Card className="p-6">
								<h2 className="mb-2 text-lg font-semibold">Recent Interactions ({contact.interactions.length})</h2>
								<div className="space-y-2 text-sm">
									{contact.interactions.slice(0, 3).map((interaction: any) => (
										<div
											key={interaction.id}
											className="border-b py-2 last:border-0">
											<div className="flex justify-between">
												<span className="text-muted-foreground">{interaction.type}</span>
												<span className="text-xs">{new Date(interaction.createdAt).toLocaleDateString()}</span>
											</div>
											<p className="mt-1">{interaction.notes?.slice(0, 100)}...</p>
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

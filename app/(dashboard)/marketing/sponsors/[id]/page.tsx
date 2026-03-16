import { Suspense } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import { getSponsorMaterialByIdAction } from "@/lib/features/marketing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

interface SponsorMaterialDetailPageProps {
	params: Promise<{ id: string }>;
}

export const metadata = generateCrudMetadata("Sponsor Material");

export default async function SponsorMaterialDetailPage({ params }: SponsorMaterialDetailPageProps) {
	const { id } = await params;

	const materialResult = await getSponsorMaterialByIdAction(id);

	if (!materialResult.success || !materialResult.data) {
		notFound();
	}

	const material = materialResult.data;

	return (
		<div className="space-y-6">
			<SetBreadcrumb
				segment={id}
				label={material.title}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{material.title}</h1>
					{material.event && (
						<p className="text-muted-foreground">
							Event: <strong>{material.event.title}</strong>
						</p>
					)}
				</div>
				<Link href={`/marketing/sponsors/${id}/edit`}>
					<Button variant="default">Edit</Button>
				</Link>
			</div>

			<Suspense fallback={<PageLoading />}>
				<div className="bg-card rounded-lg border p-6">
					<div className="space-y-4">
						<div>
							<h3 className="font-semibold">Type</h3>
							<p className="text-muted-foreground">{material.type}</p>
						</div>

						<div>
							<h3 className="font-semibold">Status</h3>
							<p className="text-muted-foreground">{material.status}</p>
						</div>

						{material.description && (
							<div>
								<h3 className="font-semibold">Description</h3>
								<p className="text-muted-foreground">{material.description}</p>
							</div>
						)}

						{material.url && (
							<div>
								<h3 className="font-semibold">URL</h3>
								<a
									href={material.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline">
									{material.url}
								</a>
							</div>
						)}

						{material.file && (
							<div>
								<h3 className="font-semibold">File</h3>
								<a
									href={material.file.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline">
									{material.file.name}
								</a>
							</div>
						)}

						{material.dueDate && (
							<div>
								<h3 className="font-semibold">Due Date</h3>
								<p className="text-muted-foreground">{new Date(material.dueDate).toLocaleDateString()}</p>
							</div>
						)}

						{material.notes && (
							<div>
								<h3 className="font-semibold">Notes</h3>
								<p className="text-muted-foreground">{material.notes}</p>
							</div>
						)}

						<div className="border-t pt-4">
							<p className="text-muted-foreground text-sm">Created: {new Date(material.createdAt).toLocaleDateString()}</p>
							{material.updatedAt && <p className="text-muted-foreground text-sm">Last updated: {new Date(material.updatedAt).toLocaleDateString()}</p>}
							{material.approvedBy && <p className="text-muted-foreground text-sm">Approved by: {material.approvedBy.name}</p>}
						</div>
					</div>
				</div>
			</Suspense>
		</div>
	);
}

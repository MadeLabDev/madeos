import { Suspense } from "react";

import { notFound } from "next/navigation";

import SponsorMaterialForm from "@/app/(dashboard)/marketing/components/sponsor-material-form";
import { PageLoading } from "@/components/ui/page-loading";
import { getSponsorMaterialByIdAction } from "@/lib/features/marketing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

interface EditSponsorMaterialPageProps {
	params: Promise<{ id: string }>;
}

export const metadata = generateCrudMetadata("Sponsor Material");

export default async function EditSponsorMaterialPage({ params }: EditSponsorMaterialPageProps) {
	const { id } = await params;

	const materialResult = await getSponsorMaterialByIdAction(id);

	if (!materialResult.success || !materialResult.data) {
		notFound();
	}

	return (
		<Suspense fallback={<PageLoading />}>
			{materialResult.data.event ? (
				<SponsorMaterialForm
					event={materialResult.data.event}
					material={materialResult.data}
				/>
			) : (
				<div>Event not found</div>
			)}
		</Suspense>
	);
}

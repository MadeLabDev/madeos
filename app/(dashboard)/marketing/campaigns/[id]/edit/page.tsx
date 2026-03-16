import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getMarketingCampaignAction } from "@/lib/features/marketing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditCampaignForm } from "./edit-campaign-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Marketing Campaign");

export const revalidate = 0;

export default async function EditMarketingCampaignPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const campaign = await getMarketingCampaignAction(id);

	if (!campaign) {
		notFound();
	}

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={campaign.title}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditCampaignForm campaign={campaign} />
			</>
		</Suspense>
	);
}
